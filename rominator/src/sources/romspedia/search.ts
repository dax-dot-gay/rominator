import parse from "node-html-parser";
import { PlatformIDs } from "../../util/platforms";
import { PluginSearchResult } from "../../util/plugins/pluginTypes";
import { ResponseType, fetch } from "@tauri-apps/api/http";
import { invert, range, startCase } from "lodash";
import { sleep } from "../../util/functions";

const PLATFORM_MAP: Omit<{ [key in PlatformIDs]: string }, "xboxone"> = {
    psp: "playstation-portable",
    gba: "gameboy-advance",
    ps2: "playstation-2",
    nds: "nintendo-ds",
    "3ds": "nintendo-3ds",
    wii: "nintendo-wii",
    gamecube: "nintendo-gamecube",
    n64: "nintendo-64",
    snes: "super-nintendo",
    ps3: "playstation-3",
    ps1: "playstation-1",
    nes: "nintendo",
    gbc: "gameboy-color",
    genesis: "sega-genesis",
    dreamcast: "sega-dreamcast",
    gameboy: "gameboy",
    famicom: "famicom",
    xbox: "xbox",
    xbox360: "xboxone",
};

const REVERSE_PLATFORMS = invert(PLATFORM_MAP);

type ParsedRomItem = {
    id: string;
    name: string;
    platform: PlatformIDs;
    tags: string[];
    rating?: number;
    image?: string;
    detail_page: string;
};

function parsePage(html: string): ParsedRomItem[] {
    const root = parse(html);
    const rom_items = root.querySelectorAll("div.single-rom");
    const results: ParsedRomItem[] = rom_items
        .map((item) => {
            const rom_ref = item.closest("a") as unknown as HTMLElement;
            const name_ref = item.querySelector(
                ".roms-title",
            ) as unknown as HTMLElement;
            const rating_ref = item.querySelector(
                ".single-rom-header .list-rom-rating",
            ) as unknown as HTMLElement;
            const img_ref = item.querySelector(
                ".roms-img img",
            ) as unknown as HTMLElement;
            const tags_ref = item.querySelectorAll(".roms-ftr .tagBtns a.btn");
            const platform_ref = item.querySelector(
                ".roms-ftr .tagBtns a.btn.emulator",
            ) as unknown as HTMLElement;

            if (
                [rom_ref, rating_ref, img_ref, platform_ref, name_ref].some(
                    (v) => v === null,
                )
            ) {
                return null;
            }

            const rom_link = rom_ref.getAttribute("href");
            if (!rom_link) {
                return null;
            }

            const id =
                "romspedia-" +
                rom_link.split("/")[2] +
                "-" +
                rom_link.split("/")[3];
            const name = name_ref.innerText ?? startCase(id);
            const platform =
                platform_ref.getAttribute("href")?.split("/")[2] ?? null;
            if (!platform) {
                return null;
            }

            const rating = rating_ref.hasAttribute("data-rating")
                ? Number(rating_ref.getAttribute("data-rating"))
                : 0;
            const tags = tags_ref.map((el) => el.innerText);
            const image =
                img_ref.getAttribute("data-src") ??
                img_ref.getAttribute("src") ??
                null;

            return {
                id,
                name,
                platform: REVERSE_PLATFORMS[platform],
                tags,
                rating: rating / 5,
                image:
                    image && !image.includes("image-unavailable-cover")
                        ? image
                        : undefined,
                detail_page: `https://www.romspedia.com${rom_link}`,
            };
        })
        .filter((v) => v !== null) as ParsedRomItem[];
    return results;
}

async function getPageCount(query: string): Promise<number | null> {
    const result = await fetch<string>(
        `https://www.romspedia.com/search.php?currentpage=1&search_term_string=${encodeURIComponent(query)}`,
        { responseType: ResponseType.Text, method: "GET", timeout: 5 },
    );
    if (result.ok) {
        const parsed = parse(result.data);
        const last_link = parsed
            .querySelectorAll(".pagination li.page-item a.page-link")
            .pop();
        if (last_link) {
            try {
                const query_string = new URLSearchParams(
                    last_link.attrs.href.split("?", 2)[1] ?? "",
                );
                return Number(query_string.get("currentpage")) ?? null;
            } catch {
                return null;
            }
        }
    }
    return null;
}

export async function search_romspedia(
    query: string,
    platforms: (string | PlatformIDs)[],
    tags: string[],
    onResult: (...results: PluginSearchResult[]) => void,
): Promise<void> {
    const pages = await getPageCount(query);
    if (pages === null || pages < 1) {
        console.warn("Search error: ROMSPEDIA: Page count failure.");
        return;
    }

    await Promise.all(
        range(1, pages + 1).map(async (page) => {
            await sleep(Math.random() * 2);
            const result = await fetch<string>(
                `https://www.romspedia.com/search.php?currentpage=${page}&search_term_string=${encodeURIComponent(query)}`,
                { responseType: ResponseType.Text, method: "GET", timeout: 5 },
            );
            if (result.ok) {
                const parsed = parsePage(result.data);
                onResult(
                    ...parsed
                        .map((v) => ({
                            id: v.id,
                            plugin: "romspedia",
                            name: v.name,
                            tags: v.tags,
                            meta: {
                                rating: v.rating,
                            },
                            image: v.image,
                            platform: v.platform,
                            extra: {
                                detail_page: v.detail_page,
                            },
                        }))
                        .filter(
                            (v) =>
                                (platforms.length === 0 ||
                                    platforms.includes(v.platform)) &&
                                (tags.length === 0 ||
                                    v.tags.some((t) => tags.includes(t))),
                        ),
                );
            }
        }),
    );

    return;
}

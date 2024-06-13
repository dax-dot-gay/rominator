import parse from "node-html-parser";
import { PlatformIDs } from "../../util/platforms";
import { PluginSearchResult } from "../../util/plugins/pluginTypes";
import { ResponseType, fetch } from "@tauri-apps/api/http";

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

type ParsedRomItem = {
    name: string;
    platform: PlatformIDs;
    tags: string[];
    rating?: number;
    image?: string;
};

function parsePage(html: string): ParsedRomItem[] {
    return [];
}

async function getPageCount(query: string): number | null {
    const result = await fetch<string>(
        `https://www.romspedia.com/search.php?currentpage=1&search_term_string=${encodeURIComponent(query)}`,
        { responseType: ResponseType.Text, method: "GET" },
    );
    if (result.ok) {
        const parsed = parse(result.data);
        const last_link = parsed
            .querySelectorAll(".pagination li.page-item a.page-link")
            .pop();
        if (last_link) {
            const query_string = new URLSearchParams(
                last_link.attrs.href.split("?", 2)[1] ?? "",
            );
            return Number(query_string.get("currentpage")) ?? null;
        }
    }
    return null;
}

export async function search_romspedia(
    query: string,
    platforms: (string | PlatformIDs)[],
    tags: string[],
): Promise<PluginSearchResult[]> {
    console.log(await getPageCount(query));

    return [];
}

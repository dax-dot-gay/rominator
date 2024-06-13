import { ResponseType, fetch } from "@tauri-apps/api/http";
import { PluginSearchResult } from "../../util/plugins/pluginTypes";
import parse from "node-html-parser";
import { trim } from "lodash";

export async function downloadRomsPedia(
    item: PluginSearchResult,
): Promise<{
    url: string;
    filename: string;
    headers?: Map<string, string>;
} | null> {
    const result = await fetch<string>(item.extra.detail_page, {
        method: "GET",
        responseType: ResponseType.Text,
    });
    if (result.ok) {
        const parsed = parse(result.data);
        const detail_fields = parsed.querySelectorAll(".view-emulator-detail");
        const detail_map: { [key: string]: string } = detail_fields.reduce(
            (prev, current) => ({
                ...prev,
                [trim(
                    (
                        current.querySelector(".view-emulator-detail-name")
                            ?.innerText ?? ""
                    ).toLowerCase(),
                    ":",
                )]: current.querySelector(".view-emulator-detail-value")
                    ?.innerText,
            }),
            {},
        );
        console.log(detail_map, Object.keys(detail_map).includes("file name"));

        if (Object.keys(detail_map).includes("file name")) {
            return {
                url: `https://downloads.romspedia.com/roms/${encodeURIComponent(detail_map["file name"])}`,
                filename: detail_map["file name"],
            };
        }
    }
    return null;
}

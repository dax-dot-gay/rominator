import { PlatformIDs } from "../../util/platforms";
import { PluginSearchResult } from "../../util/plugins/pluginTypes";

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

export async function search_romspedia(
    query: string,
    platforms: (string | PlatformIDs)[],
    tags: string[],
): Promise<PluginSearchResult[]> {
    return [];
}

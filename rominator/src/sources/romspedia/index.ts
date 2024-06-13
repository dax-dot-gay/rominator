import { Plugin } from "../../util/plugins/pluginTypes";
import platforms, { PlatformIDs } from "../../util/platforms";

export const sourceRomsPedia: Plugin = {
    id: "romspedia",
    name: "RomsPedia",
    icon: "https://www.romspedia.com/favicon.ico",
    search: async () => [],
    platforms: [
        PlatformIDs.DREAMCAST,
        PlatformIDs.FAMICOM,
        PlatformIDs.GAMEBOY,
        PlatformIDs.GAMECUBE,
        PlatformIDs.GBA,
        PlatformIDs.GBC,
        PlatformIDs.GENESIS,
        PlatformIDs.N64,
        PlatformIDs.NDS,
        PlatformIDs.NES,
        PlatformIDs.PS2,
        PlatformIDs.PS3,
        PlatformIDs.PSP,
        PlatformIDs.SNES,
        PlatformIDs.THREEDS,
        PlatformIDs.WII,
    ],
};

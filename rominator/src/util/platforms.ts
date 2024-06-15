type Platform = {
    name: string;
    vendor: string;

    // Resolves to capitalized ID if not specified.
    shortName?: string;

    /*
    Icon path relative to /assets/platform.
    If not specified, will attempt to resolve "{vendor} - {name}.svg"
    */
    icon?: string;
};

type ResolvedPlatform = {
    id: string;
    name: string;
    vendor: string;
    shortName: string;
    icon: string;
};



class Platforms {
    private platforms_int: { [key: string]: Platform };
    public constructor() {
        this.platforms_int = {};
    }

    public add(
        id: string | PlatformIDs,
        name: string,
        vendor: string,
        shortName?: string | null,
        icon?: string | null,
    ): void {
        this.platforms_int[id] = {
            name,
            vendor,
            shortName: shortName ?? undefined,
            icon: icon ?? undefined,
        };
    }

    public get(id: string | PlatformIDs): ResolvedPlatform | null {
        if (Object.keys(this.platforms_int).includes(id)) {
            const platform = this.platforms_int[id];
            return {
                id,
                name: platform.name,
                vendor: platform.vendor,
                shortName: platform.shortName ?? id.toUpperCase(),
                icon:
                    platform.icon ??
                    `${platform.vendor} - ${platform.name}.svg`,
            };
        } else {
            return null;
        }
    }

    get platforms(): ResolvedPlatform[] {
        return Object.entries(this.platforms_int).map(([id, platform]) => ({
            id,
            name: platform.name,
            vendor: platform.vendor,
            shortName: platform.shortName ?? id.toUpperCase(),
            icon: platform.icon ?? `${platform.vendor} - ${platform.name}.svg`,
        }));
    }
}

const platforms = new Platforms();

platforms.add("psp", "PlayStation Portable", "Sony");
platforms.add("gba", "Game Boy Advance", "Nintendo");
platforms.add("ps2", "PlayStation 2", "Sony");
platforms.add("nds", "Nintendo DS", "Nintendo");
platforms.add("3ds", "Nintendo 3DS", "Nintendo");
platforms.add("wii", "Wii", "Nintendo", "Wii");
platforms.add("gamecube", "GameCube", "Nintendo", "GameCube");
platforms.add("n64", "Nintendo 64", "Nintendo");
platforms.add("snes", "Super Nintendo Entertainment System", "Nintendo");
platforms.add("psx", "PlayStation 1", "Sony", null, "Sony - PlayStation.svg");
platforms.add("ps3", "PlayStation 3", "Sony");
platforms.add("nes", "Nintendo Entertainment System", "Nintendo");
platforms.add("gbc", "Game Boy Color", "Nintendo");
platforms.add(
    "magadrive",
    "Sega Genesis/Megadrive",
    "Sega",
    "Genesis",
    "Sega - Mega Drive - Genesis.svg",
);
platforms.add("dreamcast", "Dreamcast", "Sega", "Dreamcast");
platforms.add("gb", "Game Boy", "Nintendo");
platforms.add("xbox", "Xbox", "Microsoft");
platforms.add("xbox360", "Xbox 360", "Microsoft");

export enum PlatformIDs {
    PSP = "psp",
    GBA = "gba",
    PS2 = "ps2",
    NDS = "nds",
    THREEDS = "3ds",
    WII = "wii",
    GAMECUBE = "gamecube",
    N64 = "n64",
    SNES = "snes",
    PS1 = "ps1",
    PS3 = "ps3",
    NES = "nes",
    GBC = "gbc",
    GENESIS = "genesis",
    DREAMCAST = "dreamcast",
    GAMEBOY = "gameboy",
    XBOX = "xbox",
    XBOX360 = "xbox360",
}

export default platforms;

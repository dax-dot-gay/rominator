export type Plugin = {
    id: string;
    name: string;
    icon: string;
    platforms?: string[];
    search: (
        query: string,
        platforms: string[],
        tags: string[],
    ) => Promise<PluginSearchResult[]>;
};

export type PluginDownloadInfo = {
    cookies?: { [key: string]: string };
    headers?: { [key: string]: string };
    extract?: boolean;
};

export type PluginSearchResult = {
    plugin: string;
    name: string;
    platform?: string;
    meta: Partial<{
        description: string;
        rating: number; // Ratio 0-1
        genre: string;
        release_year: string;
    }>;
    tags: string[];
    url: string;
};

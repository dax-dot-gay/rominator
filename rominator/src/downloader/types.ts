import { createContext } from "react";
import { Plugin, PluginSearchResult } from "../util/plugins/pluginTypes";

export type Download = {
    id: string;
    item: PluginSearchResult;
    plugin: Plugin;
    url: string | null;
    headers?: Map<string, string>;
    status: "initializing" | "queued" | "downloading" | "done" | "error";
    progress: number;
    added: Date;
    filename: string | null;
};

export type DownloadContextType = {
    downloads: Map<string, Download>;
    addDownload: (item: PluginSearchResult, plugin: Plugin) => Download | null;
};

export const DownloadContext = createContext<DownloadContextType>({
    downloads: new Map(),
    addDownload: () => null,
});

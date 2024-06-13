import { createContext } from "react";
import { PlatformIDs } from "../util/platforms";
import { Plugin, PluginSearchResult } from "../util/plugins/pluginTypes";

export type SourceContextType = {
    sources: { [key: string]: Plugin };
    enabled: string[];
    setEnabled: (id: string, enabled: boolean) => void;
    search: (
        query: string,
        platforms: (string | PlatformIDs)[],
        tags: string[],
        onResult: (...results: PluginSearchResult[]) => void,
    ) => Promise<void>;
};

export const SourceContext = createContext<SourceContextType>({
    sources: {},
    enabled: [],
    setEnabled: () => {},
    search: async () => {},
});

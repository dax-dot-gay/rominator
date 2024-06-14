import { createContext } from "react";

export type AppConfig = {
    downloads: string | null;
    enabledSources: string[];
};

export type ConfigContextType = {
    config: AppConfig;
    setDownloadsPath: (path: string | null) => void;
    toggleSource: (id: string) => void;
};

export const ConfigContext = createContext<ConfigContextType>({
    config: {
        downloads: null,
        enabledSources: [],
    },
    setDownloadsPath: () => {},
    toggleSource: () => {},
});

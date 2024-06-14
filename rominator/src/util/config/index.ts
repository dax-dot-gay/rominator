import { useContext } from "react";
import { ConfigContext } from "./types";
import { Plugin } from "../plugins/pluginTypes";
import { useSources } from "../../sources";
import { ConfigProvider } from "./ConfigProvider";

export function useConfig() {
    return useContext(ConfigContext);
}

export function useDownloadsPath(): [
    string | null,
    (new_path: string | null) => void,
] {
    const conf = useConfig();
    return [conf.config.downloads, conf.setDownloadsPath];
}

export function useEnabledSources(): {
    sources: (Plugin & { enabled: boolean })[];
    toggle: (id: string) => void;
} {
    const conf = useConfig();
    const sources = useSources();

    return {
        sources: Object.values(sources.sources).map((source) => ({
            ...source,
            enabled: conf.config.enabledSources.includes(source.id),
        })),
        toggle: conf.toggleSource,
    };
}

export { ConfigProvider };

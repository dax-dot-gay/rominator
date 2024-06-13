import { ReactNode, useCallback, useMemo } from "react";
import SOURCES from "./sources";
import { useListState } from "@mantine/hooks";
import { PlatformIDs } from "../util/platforms";
import { SourceContext } from "./types";
import { PluginSearchResult } from "../util/plugins/pluginTypes";

export function SourceProvider({
    children,
}: {
    children?: ReactNode | ReactNode[];
}) {
    const sources = useMemo(() => SOURCES, []);
    const [enabledSources, enabledMethods] = useListState(Object.keys(sources));
    const setEnabled = useCallback(
        (id: string, enabled: boolean) => {
            if (Object.keys(sources).includes(id)) {
                if (enabled && !enabledSources.includes(id)) {
                    enabledMethods.append(id);
                } else if (!enabled) {
                    enabledMethods.filter((v) => v !== id);
                }
            }
        },
        [enabledMethods.append, enabledMethods.filter, enabledSources.length],
    );
    const search = useCallback(
        async function (
            query: string,
            platforms: (string | PlatformIDs)[],
            tags: string[],
            onResult: (...results: PluginSearchResult[]) => void,
        ) {
            const toSearch = Object.values(sources).filter(
                (source) =>
                    enabledSources.includes(source.id) &&
                    (platforms.length === 0 ||
                        source.platforms === undefined ||
                        source.platforms.length === 0 ||
                        platforms.some((platform) =>
                            (source.platforms ?? []).includes(platform),
                        )),
            );
            await Promise.all(
                toSearch.map(
                    async (source) =>
                        await source.search(query, platforms, tags, onResult),
                ),
            );
        },
        [enabledSources],
    );

    return (
        <SourceContext.Provider
            value={{
                sources,
                enabled: enabledSources,
                setEnabled,
                search,
            }}
        >
            {children}
        </SourceContext.Provider>
    );
}

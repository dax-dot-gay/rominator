import { ReactNode, useCallback, useEffect, useState } from "react";
import {
    exists,
    writeTextFile,
    readTextFile,
    BaseDirectory,
    createDir,
} from "@tauri-apps/api/fs";
import { AppConfig, ConfigContext } from "./types";
import { useSources } from "../../sources";

export function ConfigProvider({
    children,
}: {
    children?: ReactNode | ReactNode[];
}) {
    const sources = useSources();
    const [config, setConfig] = useState<AppConfig>({
        downloads: null,
        enabledSources: [],
    });
    const loadConfig = useCallback(async () => {
        if (!(await exists("rominator", { dir: BaseDirectory.Config }))) {
            await createDir("rominator", { dir: BaseDirectory.Config });
        }
        if (await exists("config.json", { dir: BaseDirectory.AppConfig })) {
            const configContent = await readTextFile("config.json", {
                dir: BaseDirectory.AppConfig,
            });
            try {
                const data = JSON.parse(configContent);
                setConfig(data);
                return;
            } catch {}
        }

        await writeTextFile(
            "config.json",
            JSON.stringify({
                downloads: null,
                enabledSources: Object.keys(sources.sources),
            }),
            { dir: BaseDirectory.AppConfig },
        );
        setConfig({
            downloads: null,
            enabledSources: Object.keys(sources.sources),
        });
    }, [setConfig]);

    useEffect(() => {
        loadConfig();
    });

    return (
        <ConfigContext.Provider
            value={{
                config,
                setDownloadsPath: (path) => {
                    writeTextFile(
                        "config.json",
                        JSON.stringify({
                            downloads: path,
                            enabledSources: config.enabledSources,
                        }),
                        { dir: BaseDirectory.AppConfig },
                    );
                    setConfig((cur) => ({ ...cur, downloads: path }));
                },
                toggleSource: (id) => {
                    let newSources: string[];
                    if (config.enabledSources.includes(id)) {
                        newSources = config.enabledSources.filter(
                            (v) => v !== id,
                        );
                    } else {
                        newSources = [...config.enabledSources, id];
                    }

                    sources.setEnabled(id, newSources.includes(id));

                    writeTextFile(
                        "config.json",
                        JSON.stringify({
                            downloads: config.downloads,
                            enabledSources: newSources,
                        }),
                        { dir: BaseDirectory.AppConfig },
                    );
                    setConfig((cur) => ({
                        ...cur,
                        enabledSources: newSources,
                    }));
                },
            }}
        >
            {children}
        </ConfigContext.Provider>
    );
}

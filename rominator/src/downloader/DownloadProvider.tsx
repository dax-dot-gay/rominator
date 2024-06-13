import { useMap } from "@mantine/hooks";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { Download, DownloadContext } from "./types";
import { Plugin, PluginSearchResult } from "../util/plugins/pluginTypes";
import { download as tauriDownload } from "tauri-plugin-upload-api";
import { v4 } from "uuid";
import { appDataDir, resolve } from "@tauri-apps/api/path";
import { listen } from "@tauri-apps/api/event";

const MAX_RUNNING = 4;

export function DownloadProvider({
    children,
}: {
    children?: ReactNode | ReactNode[];
}) {
    const downloads = useMap<string, Download>([]);
    const [sync, setSync] = useState<number>(Date.now());
    listen("download://progress", console.log);

    useEffect(() => {
        const interval = setInterval(() => setSync(Date.now()), 500);
        return () => clearInterval(interval);
    }, [setSync]);

    const addDownload = useCallback(
        (item: PluginSearchResult, plugin: Plugin) => {
            const itemId = v4();
            downloads.set(itemId, {
                id: itemId,
                item,
                plugin,
                url: null,
                status: "initializing",
                progress: 0,
                added: new Date(Date.now()),
                filename: null,
            });
            plugin.getDownloadOptions(item).then((v) =>
                v === null
                    ? downloads.set(itemId, {
                          ...(downloads.get(itemId) as Download),
                          status: "error",
                      })
                    : downloads.set(itemId, {
                          ...(downloads.get(itemId) as Download),
                          status: "queued",
                          url: v.url,
                          headers: v.headers,
                          filename: v.filename,
                      }),
            );
            return downloads.get(itemId) as Download;
        },
        [downloads],
    );

    const execDownload = useCallback(
        async (download: Download) => {
            console.log(download);
            await tauriDownload(
                download.url as string,
                await resolve(await appDataDir(), download.filename as string),
                (progress, total) => {
                    console.log(progress, total);
                    downloads.set(download.id, {
                        ...download,
                        progress: progress / total,
                    });
                },
                download.headers,
            );
            downloads.set(download.id, {
                ...download,
                progress: 1,
                status: "done",
            });
        },
        [downloads.set],
    );

    useEffect(() => {
        let running = 0;
        for (const [id, download] of downloads.entries()) {
            switch (download.status) {
                case "downloading":
                    running++;
                    break;
                case "queued":
                    if (running < MAX_RUNNING) {
                        running++;
                        execDownload(
                            downloads
                                .set(id, {
                                    ...download,
                                    status: "downloading",
                                })
                                .get(id) as Download,
                        );
                    }
                    break;
            }
        }
    }, [sync]);

    return (
        <DownloadContext.Provider value={{ downloads, addDownload }}>
            {children}
        </DownloadContext.Provider>
    );
}

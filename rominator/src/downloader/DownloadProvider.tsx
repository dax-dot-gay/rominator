import { useMap } from "@mantine/hooks";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { Download, DownloadContext, DownloadProgress } from "./types";
import { Plugin, PluginSearchResult } from "../util/plugins/pluginTypes";
import { invoke } from "@tauri-apps/api";
import { v4 } from "uuid";
import { appDataDir } from "@tauri-apps/api/path";
import { Event, UnlistenFn, listen } from "@tauri-apps/api/event";

const MAX_RUNNING = 4;

async function downloadFile(download: Download) {
    await invoke("download_file", {
        id: download.id,
        url: download.url as string,
        directory: await appDataDir(),
        filename: download.filename as string,
    });
}

export function DownloadProvider({
    children,
}: {
    children?: ReactNode | ReactNode[];
}) {
    const downloads = useMap<string, Download>([]);
    const [sync, setSync] = useState<number>(Date.now());

    useEffect(() => {
        const interval = setInterval(() => setSync(Date.now()), 500);
        return () => clearInterval(interval);
    }, [setSync]);

    const updateDownload = useCallback(
        (event: Event<DownloadProgress>) => {
            const target = downloads.get(event.payload.download_id);
            if (!target) {
                return;
            }

            target.progress = event.payload.percentage / 100;
            if (event.event === "rom://download:complete") {
                target.status = "done";
            }
            downloads.set(target.id, target);
        },
        [downloads],
    );

    useEffect(() => {
        let unlisten_progress: UnlistenFn | null = null;
        listen<DownloadProgress>(
            "rom://download:progress",
            updateDownload,
        ).then((v) => (unlisten_progress = v));
        let unlisten_complete: UnlistenFn | null = null;
        listen<DownloadProgress>(
            "rom://download:complete",
            updateDownload,
        ).then((v) => (unlisten_complete = v));
        return () => {
            if (unlisten_complete) {
                unlisten_complete();
            }
            if (unlisten_progress) {
                unlisten_progress();
            }
        };
    }, [updateDownload]);

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
                        downloadFile(
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

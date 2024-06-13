import { useContext } from "react";
import { DownloadProvider } from "./DownloadProvider";
import { Download, DownloadContext, DownloadContextType } from "./types";

export type { Download, DownloadContextType };
export { DownloadProvider };

export function useDownloads(): DownloadContextType {
    return useContext(DownloadContext);
}

import SOURCES from "./sources";
import { SourceProvider } from "./SourceProvider";
import { SourceContext, SourceContextType } from "./types";
import { useContext } from "react";

export function useSources(): SourceContextType {
    return useContext(SourceContext);
}

export function useSearch(): SourceContextType["search"] {
    return useSources().search;
}

export { SOURCES, SourceProvider };

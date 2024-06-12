export type PluginEntrypoint = { id: string; file: string; method: string } & (
    | {
          type: "connection";
          forEntryPoint: string;
      }
    | {
          type: "search";
          platforms?: string[];
      }
    | {
          type: "download";
      }
);

export type PluginManifest = {
    id: string;
    name: string;
    source: string;
    meta: {
        icon?: string;
        description?: string;
        version?: string;
    };
    platforms?: string[];
    entrypoints: PluginEntrypoint[];
};

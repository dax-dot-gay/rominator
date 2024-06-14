import {
    ActionIcon,
    AppShell,
    Box,
    Divider,
    Drawer,
    Group,
    Indicator,
    Paper,
    RingProgress,
    ScrollAreaAutosize,
    Stack,
    Text,
    Tooltip,
} from "@mantine/core";
import {
    IconDeviceGamepad2,
    IconDownload,
    IconProgress,
    IconProgressBolt,
    IconProgressCheck,
    IconProgressX,
    IconSettings,
} from "@tabler/icons-react";
import { SearchTab } from "./search/SearchTab";
import { useDisclosure } from "@mantine/hooks";
import { Download, useDownloads } from "../downloader";
import { useMemo } from "react";

function DownloadItem({ download }: { download: Download }) {
    const icon = useMemo(() => {
        switch (download.status) {
            case "initializing":
                return (
                    <Tooltip label="Initializing">
                        <IconProgressBolt
                            size="24"
                            opacity={0.75}
                            style={{ marginLeft: "12px", marginRight: "12px" }}
                        />
                    </Tooltip>
                );
            case "queued":
                return (
                    <Tooltip label="Queued">
                        <IconProgress
                            size="24"
                            opacity={0.75}
                            style={{ marginLeft: "12px", marginRight: "12px" }}
                        />
                    </Tooltip>
                );
            case "error":
                return (
                    <Tooltip label="Error">
                        <IconProgressX
                            size="24"
                            opacity={0.75}
                            style={{ marginLeft: "12px", marginRight: "12px" }}
                        />
                    </Tooltip>
                );
            case "downloading":
                return (
                    <Tooltip label="Downloading">
                        <RingProgress
                            size={48}
                            thickness={4}
                            roundCaps
                            sections={[
                                {
                                    value: download.progress * 100,
                                    color: "primary",
                                },
                            ]}
                            label={
                                <Text
                                    size="xs"
                                    ta="center"
                                    style={{ pointerEvents: "none" }}
                                    c="dimmed"
                                >
                                    {Math.round(download.progress * 100)}%
                                </Text>
                            }
                        />
                    </Tooltip>
                );
            case "done":
                return (
                    <Tooltip label="Complete">
                        <IconProgressCheck
                            size="24"
                            opacity={0.75}
                            style={{ marginLeft: "12px", marginRight: "12px" }}
                        />
                    </Tooltip>
                );
        }
    }, [download.status, download.progress]);
    return (
        <Paper className="download-item" radius="xs" p="xs">
            <Group gap="sm" wrap="nowrap">
                {icon}
                <Stack gap={2}>
                    <Text size="sm">{download.item.name}</Text>
                    <Text size="xs" c="dimmed" fs="italic">
                        {download.filename}
                    </Text>
                </Stack>
            </Group>
        </Paper>
    );
}

function DownloadsPanel({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const downloads = [...useDownloads().downloads.values()];
    return (
        <Drawer
            className="download-panel"
            offset={8}
            radius="sm"
            opened={open}
            onClose={onClose}
            position="right"
            title={
                <Group gap="sm">
                    <IconDownload />
                    <Text>Downloads</Text>
                </Group>
            }
        >
            <Divider />
            <ScrollAreaAutosize pt="sm">
                <Stack gap="sm">
                    {downloads
                        .sort((a, b) => b.added.getTime() - a.added.getTime())
                        .map((download) => (
                            <DownloadItem
                                download={download}
                                key={download.id}
                            />
                        ))}
                </Stack>
            </ScrollAreaAutosize>
        </Drawer>
    );
}

export function RootView() {
    const [downloads, { open: openDownloads, close: closeDownloads }] =
        useDisclosure(false);
    const isDownloading = [...useDownloads().downloads.values()].some(
        (v) => v.status === "downloading",
    );

    return (
        <AppShell header={{ height: 64 }} className="app-root" p="sm">
            <AppShell.Header
                className="app-root-section header"
                withBorder={false}
                p="sm"
            >
                <Group justify="space-between" wrap="nowrap" gap="sm">
                    <Paper
                        p="xs"
                        className="app-name header-section"
                        shadow="xs"
                    >
                        <Group gap="sm" justify="center">
                            <IconDeviceGamepad2 />
                            <Divider orientation="vertical" />
                            <Text
                                size="lg"
                                ff="monospace"
                                style={{ transform: "translate(0, 1px)" }}
                            >
                                Rominator
                            </Text>
                        </Group>
                    </Paper>
                    <Paper
                        className="app-actions header-section"
                        p="0"
                        shadow="xs"
                    >
                        <Group gap="0">
                            <ActionIcon
                                className="app-action"
                                variant="transparent"
                                onClick={openDownloads}
                            >
                                <Indicator
                                    disabled={!isDownloading}
                                    position="bottom-end"
                                    processing
                                >
                                    <IconDownload />
                                </Indicator>
                            </ActionIcon>
                            <ActionIcon
                                className="app-action"
                                variant="transparent"
                            >
                                <IconSettings />
                            </ActionIcon>
                        </Group>
                    </Paper>
                </Group>
            </AppShell.Header>
            <AppShell.Main className="app-wrapper">
                <Paper className="app-content" p="sm" shadow="xs">
                    <SearchTab />
                </Paper>
                <DownloadsPanel open={downloads} onClose={closeDownloads} />
            </AppShell.Main>
        </AppShell>
    );
}

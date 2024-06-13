import {
    ActionIcon,
    AppShell,
    Box,
    Divider,
    Group,
    Paper,
    Tabs,
    Text,
} from "@mantine/core";
import {
    IconDeviceGamepad2,
    IconDownload,
    IconLibrary,
    IconSearch,
    IconSettings,
} from "@tabler/icons-react";
import { SearchTab } from "./search/SearchTab";

export function RootView() {
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
                            >
                                <IconDownload />
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
                <Box className="app-content">
                    <Tabs
                        className="main-nav"
                        orientation="vertical"
                        defaultValue="search"
                        classNames={{ panel: "nav-panel" }}
                    >
                        <Tabs.List>
                            <Tabs.Tab value="search">
                                <Group
                                    gap="sm"
                                    justify="space-between"
                                    align="start"
                                >
                                    <IconSearch size={20} />
                                    <Text>Search</Text>
                                </Group>
                            </Tabs.Tab>
                            <Tabs.Tab value="library">
                                <Group
                                    gap="sm"
                                    justify="space-between"
                                    align="start"
                                >
                                    <IconLibrary size={20} />
                                    <Text>Library</Text>
                                </Group>
                            </Tabs.Tab>
                        </Tabs.List>
                        <Tabs.Panel value="search">
                            <SearchTab />
                        </Tabs.Panel>
                        <Tabs.Panel value="library">EEE</Tabs.Panel>
                    </Tabs>
                </Box>
            </AppShell.Main>
        </AppShell>
    );
}

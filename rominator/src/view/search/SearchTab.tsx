import {
    ActionIcon,
    Avatar,
    Button,
    Checkbox,
    Collapse,
    Divider,
    Group,
    MultiSelect,
    Paper,
    Stack,
    TagsInput,
    Text,
    TextInput,
} from "@mantine/core";
import { useDisclosure, useInputState } from "@mantine/hooks";
import {
    IconAdjustmentsSearch,
    IconDeviceGamepad,
    IconQuestionMark,
    IconSearch,
    IconTags,
} from "@tabler/icons-react";
import platforms from "../../util/platforms";
import { useCallback, useState } from "react";
import { useSearch } from "../../sources";
import { PluginSearchResult } from "../../util/plugins/pluginTypes";

export function SearchTab() {
    const [query, onQueryChange] = useInputState("");
    const [advanced, { toggle: toggleAdvanced }] = useDisclosure(false);
    const [platformFilter, setPlatformFilter] = useState<string[]>([]);
    const [tagFilter, setTagFilter] = useState<string[]>([]);
    const searchBase = useSearch();
    const [results, setResults] = useState<PluginSearchResult[]>([]);
    const search = useCallback(
        function () {
            searchBase(
                query,
                advanced ? platformFilter : [],
                advanced ? tagFilter : [],
            ).then(setResults);
        },
        [query, advanced, platformFilter, tagFilter, setResults],
    );

    console.log(results);

    return (
        <Stack className="app-view search" gap="sm">
            <Stack gap="xs" className="search-input">
                <Group gap="sm">
                    <TextInput
                        leftSection={<IconSearch size={20} />}
                        value={query}
                        onChange={onQueryChange}
                        placeholder="Search..."
                        variant="filled"
                        style={{ flexGrow: 1 }}
                        size="md"
                    />
                    {!advanced && (
                        <ActionIcon size={42} onClick={search}>
                            <IconSearch size={20} />
                        </ActionIcon>
                    )}
                    <Divider orientation="vertical" />

                    <ActionIcon
                        size={42}
                        variant={advanced ? "filled" : "light"}
                        onClick={() => toggleAdvanced()}
                    >
                        <IconAdjustmentsSearch size={20} />
                    </ActionIcon>
                </Group>
                <Collapse in={advanced} className="search-advanced">
                    <Paper p="sm" className="search-advanced-panel">
                        <Group gap="sm" wrap="nowrap" align="end">
                            <MultiSelect
                                data={platforms.platforms.map((v) => ({
                                    value: v.id,
                                    label: v.vendor + " - " + v.name,
                                }))}
                                leftSection={<IconDeviceGamepad size={20} />}
                                label="Filter Platforms"
                                searchable
                                style={{ flexGrow: 1, maxWidth: "50%" }}
                                variant="filled"
                                renderOption={(item) => {
                                    const platform = platforms.get(
                                        item.option.value,
                                    );
                                    if (platform) {
                                        return (
                                            <Group
                                                gap="sm"
                                                justify="space-between"
                                                w="100%"
                                            >
                                                <Group gap="sm">
                                                    <Avatar
                                                        size="md"
                                                        src={`/assets/platform/${platform.icon}`}
                                                    >
                                                        <IconQuestionMark />
                                                    </Avatar>
                                                    <Stack gap={0}>
                                                        <Text size="sm">
                                                            {platform.name}
                                                        </Text>
                                                        <Text
                                                            size="xs"
                                                            c="dimmed"
                                                            fs="italic"
                                                        >
                                                            {platform.vendor}
                                                        </Text>
                                                    </Stack>
                                                </Group>
                                                <Checkbox
                                                    checked={item.checked}
                                                />
                                            </Group>
                                        );
                                    } else {
                                        return <></>;
                                    }
                                }}
                                clearable
                                value={platformFilter}
                                onChange={setPlatformFilter}
                            />
                            <TagsInput
                                leftSection={<IconTags size={20} />}
                                label="Filter Tags"
                                style={{ flexGrow: 1, maxWidth: "50%" }}
                                variant="filled"
                                clearable
                                value={tagFilter}
                                onChange={setTagFilter}
                            />
                            <Button
                                leftSection={<IconSearch size={16} />}
                                h="36"
                                style={{ minWidth: "fit-content" }}
                            >
                                Search
                            </Button>
                        </Group>
                    </Paper>
                </Collapse>
            </Stack>
        </Stack>
    );
}

import {
    ActionIcon,
    AspectRatio,
    Avatar,
    Button,
    Center,
    Checkbox,
    Collapse,
    Divider,
    Fieldset,
    Group,
    MultiSelect,
    Pagination,
    Paper,
    Pill,
    Rating,
    ScrollAreaAutosize,
    Select,
    Stack,
    TagsInput,
    Text,
    TextInput,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useInputState } from "@mantine/hooks";
import {
    IconAdjustmentsSearch,
    IconDeviceGamepad,
    IconDownload,
    IconPhotoOff,
    IconPuzzleFilled,
    IconQuestionMark,
    IconSearch,
    IconTags,
} from "@tabler/icons-react";
import platforms from "../../util/platforms";
import { memo, useCallback, useState } from "react";
import { useSearch, useSources } from "../../sources";
import { Plugin, PluginSearchResult } from "../../util/plugins/pluginTypes";
import { uniqBy } from "lodash";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useDownloads } from "../../downloader";
import { useDownloadsPath } from "../../util/config";

const ResultItem = memo(
    ({ item, plugin }: { item: PluginSearchResult; plugin: Plugin }) => {
        const platform = platforms.get(item.platform ?? "unknown");
        const { addDownload } = useDownloads();
        const [downloadPath] = useDownloadsPath();

        return (
            <Paper className="result-item" id={item.id} p="sm">
                <Stack gap="sm">
                    <Group
                        gap="sm"
                        justify="space-between"
                        wrap="nowrap"
                        align="start"
                    >
                        <Group gap="sm" wrap="nowrap">
                            <Avatar
                                size="md"
                                src={
                                    platform &&
                                    `/assets/platform/${platform.icon}`
                                }
                            >
                                <IconQuestionMark />
                            </Avatar>
                            <Stack gap={0}>
                                <Text size="sm">{item.name}</Text>
                                <Text size="xs" c="dimmed" fs="italic">
                                    {platform
                                        ? platform.name
                                        : "Unknown Platform"}
                                </Text>
                            </Stack>
                        </Group>

                        {downloadPath ? (
                            <ActionIcon
                                variant="light"
                                onClick={() => addDownload(item, plugin)}
                            >
                                <IconDownload size={20} />
                            </ActionIcon>
                        ) : (
                            <Tooltip label="No download directory set.">
                                <ActionIcon variant="light" disabled>
                                    <IconDownload size={20} />
                                </ActionIcon>
                            </Tooltip>
                        )}
                    </Group>
                    {item.image ? (
                        <img
                            src={item.image}
                            className="result-image"
                            style={{ borderRadius: "4px" }}
                        />
                    ) : (
                        <AspectRatio ratio={4 / 3} className="result-image">
                            <Center>
                                <IconPhotoOff size={32} opacity={0.75} />
                            </Center>
                        </AspectRatio>
                    )}
                    <Fieldset
                        variant="filled"
                        legend={
                            <Group align="start" gap={4}>
                                <IconTags size={16} />
                                <Text size="xs">Tags</Text>
                            </Group>
                        }
                        p="xs"
                    >
                        <Group gap="xs">
                            {item.tags.map((tag, index) => (
                                <Pill
                                    withRemoveButton={false}
                                    key={tag + "-" + index}
                                >
                                    {tag}
                                </Pill>
                            ))}
                        </Group>
                    </Fieldset>
                    <Group gap="sm" justify="space-between" wrap="nowrap">
                        <Group gap="xs">
                            <Avatar size="sm" src={plugin.icon}>
                                <IconPuzzleFilled />
                            </Avatar>
                            <Text style={{ transform: "translate(0, 2px)" }}>
                                {plugin.name}
                            </Text>
                        </Group>
                        <Rating
                            readOnly
                            fractions={2}
                            count={5}
                            value={(item.meta.rating ?? 0) * 5}
                        />
                    </Group>
                </Stack>
            </Paper>
        );
    },
    (prev, next) => prev.item.id === next.item.id,
);

export function SearchTab() {
    const [query, onQueryChange] = useInputState("");
    const [advanced, { toggle: toggleAdvanced }] = useDisclosure(false);
    const [platformFilter, setPlatformFilter] = useState<string[]>([]);
    const [tagFilter, setTagFilter] = useState<string[]>([]);
    const searchBase = useSearch();
    const [results, setResults] = useState<PluginSearchResult[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [offset, setOffset] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const search = useCallback(
        function () {
            setResults([]);
            setLoading(true);
            setOffset(0);
            searchBase(
                query,
                advanced ? platformFilter : [],
                advanced ? tagFilter : [],
                (...results) =>
                    setResults((current) =>
                        uniqBy([...current, ...results], (v) => v.id),
                    ),
            )
                .then(() => setLoading(false))
                .catch(() => setLoading(false));
        },
        [query, advanced, platformFilter, tagFilter, setResults],
    );
    const theme = useMantineTheme();
    const sources = useSources();

    return (
        <Stack className="app-view search" gap="sm" h="100%">
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
                        onKeyDown={(ev) => {
                            if (ev.key === "Enter" && query.length > 0) {
                                search();
                            }
                        }}
                    />
                    {!advanced && (
                        <ActionIcon
                            size={42}
                            onClick={() => search()}
                            loading={loading}
                        >
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
                                                    readOnly
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
                                onClick={() => search()}
                                loading={loading}
                            >
                                Search
                            </Button>
                        </Group>
                    </Paper>
                </Collapse>
            </Stack>
            <Paper withBorder p="sm" className="result-box">
                <ScrollAreaAutosize>
                    <ResponsiveMasonry
                        columnsCountBreakPoints={{
                            576: 1,
                            768: 2,
                            992: 3,
                            1200: 4,
                            1408: 5,
                        }}
                    >
                        <Masonry gutter={theme.spacing.xs}>
                            {results
                                .slice(offset, offset + pageSize)
                                .map((item) => (
                                    <ResultItem
                                        item={item}
                                        plugin={sources.sources[item.plugin]}
                                        key={item.id}
                                    />
                                ))}
                        </Masonry>
                    </ResponsiveMasonry>
                </ScrollAreaAutosize>
            </Paper>
            <Group justify="space-between">
                <Text>
                    {results.length > 0 ? results.length : "No"} Results
                </Text>
                <Group gap="sm" align="end">
                    <Select
                        value={pageSize.toString()}
                        onChange={(value) =>
                            setPageSize(value ? Number(value) : 10)
                        }
                        disabled={results.length === 0}
                        data={[
                            { value: "10", label: "10 Items / Page" },
                            { value: "25", label: "25 Items / Page" },
                            { value: "50", label: "50 Items / Page" },
                            { value: "100", label: "100 Items / Page" },
                        ]}
                    />
                    {results.length > 0 ? (
                        <Pagination
                            total={Math.ceil(results.length / pageSize)}
                            value={Math.ceil(offset / pageSize) + 1}
                            onChange={(v) => setOffset(pageSize * (v - 1))}
                            withControls
                            withEdges
                        />
                    ) : (
                        <Pagination
                            total={10}
                            value={0}
                            disabled
                            withControls
                            withEdges
                        />
                    )}
                </Group>
            </Group>
        </Stack>
    );
}

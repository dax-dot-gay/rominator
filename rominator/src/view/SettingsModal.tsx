import {
    ActionIcon,
    Avatar,
    Checkbox,
    Fieldset,
    Group,
    Modal,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import {
    IconFolderDown,
    IconPuzzleFilled,
    IconSettings,
    IconX,
} from "@tabler/icons-react";
import { useDownloadsPath, useEnabledSources } from "../util/config";
import { dialog } from "@tauri-apps/api";
import { isString } from "lodash";

export function SettingsModal({
    opened,
    onClose,
}: {
    opened: boolean;
    onClose: () => void;
}) {
    const [downloadPath, setDownloadPath] = useDownloadsPath();
    const { sources, toggle } = useEnabledSources();
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size="lg"
            title={
                <Group gap="sm" align="end">
                    <IconSettings />
                    <Text>Settings</Text>
                </Group>
            }
        >
            <Stack gap="sm">
                <TextInput
                    readOnly
                    value={downloadPath ?? ""}
                    placeholder="/downloads"
                    leftSection={<IconFolderDown size={20} />}
                    rightSection={
                        downloadPath ? (
                            <ActionIcon
                                variant="transparent"
                                color="gray"
                                onClick={() => setDownloadPath(null)}
                            >
                                <IconX size={20} opacity={0.5} />
                            </ActionIcon>
                        ) : undefined
                    }
                    variant="filled"
                    size="sm"
                    label="Downloads Folder"
                    className="downloads-input"
                    onClick={() =>
                        dialog
                            .open({
                                directory: true,
                                multiple: false,
                                recursive: true,
                                title: "Select Download Folder",
                            })
                            .then((v) => {
                                if (v && isString(v)) {
                                    setDownloadPath(v);
                                }
                            })
                    }
                />
                <Fieldset legend="Enabled Sources" p="xs">
                    <Stack gap="sm">
                        {sources.map((plugin) => (
                            <Checkbox.Card
                                className="source-item"
                                checked={plugin.enabled}
                                onClick={() => toggle(plugin.id)}
                                key={plugin.id}
                                p="xs"
                                style={{
                                    backgroundColor:
                                        "var(--mantine-color-default)",
                                }}
                                withBorder={false}
                            >
                                <Group gap="sm" justify="space-between">
                                    <Group gap="sm">
                                        <Avatar src={plugin.icon}>
                                            <IconPuzzleFilled />
                                        </Avatar>
                                        <Text>{plugin.name}</Text>
                                    </Group>
                                    <Checkbox.Indicator />
                                </Group>
                            </Checkbox.Card>
                        ))}
                    </Stack>
                </Fieldset>
            </Stack>
        </Modal>
    );
}

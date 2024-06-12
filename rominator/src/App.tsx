import { MantineProvider, createTheme } from "@mantine/core";
import "./style/index.scss";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { RootView } from "./view/root";

function App() {
    return (
        <MantineProvider
            defaultColorScheme="dark"
            theme={createTheme({
                colors: {
                    primary: [
                        "#faedff",
                        "#edd9f7",
                        "#d8b1ea",
                        "#c286dd",
                        "#ae62d2",
                        "#a24bcb",
                        "#9e3fc9",
                        "#8931b2",
                        "#7b2aa0",
                        "#6b218d",
                    ],
                },
                primaryColor: "primary",
                primaryShade: 7,
            })}
        >
            <ModalsProvider>
                <Notifications />
                <RootView />
            </ModalsProvider>
        </MantineProvider>
    );
}

export default App;

import { render } from "preact";
import "./index.css";
import { CreateRaid } from "./create-raid.tsx";
import { Raid } from "./raid.tsx";
import "@mantine/core/styles.css";
import "@mantine/spotlight/styles.css";
import { Box, createTheme, MantineProvider } from "@mantine/core";
import { Menu } from "./menu.tsx";
import { BrowserRouter, Route, Routes } from "react-router";

const theme = createTheme({
  primaryColor: "orange",
});

function App() {
  return (
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      <BrowserRouter>
        <Box h="100dvh">
          <Menu />
          <Routes>
            <Route path="/create" element={<CreateRaid />} />
            <Route path="/:raid_id" element={<Raid />} />;
          </Routes>
        </Box>
      </BrowserRouter>
    </MantineProvider>
  );
}

render(<App />, document.getElementById("app")!);

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "../css/index.css"
import { CreateRaid } from "./create-raid.tsx"
import { Raid } from "./raid.tsx"
import "@mantine/core/styles.css"
import "@mantine/dates/styles.css"
import { Box, createTheme, Grid, MantineProvider } from "@mantine/core"
import { Menu } from "./menu.tsx"
import { BrowserRouter, Route, Routes } from "react-router"

const theme = createTheme({
  primaryColor: "orange",
})

function App() {
  return (
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      <BrowserRouter>
        <Box h="100dvh">
          <Menu />
          <Grid gutter={0} justify="center">
            <Grid.Col span={{ base: 11, md: 4, lg: 3 }}>
              <Routes>
                <Route path="/" element={<CreateRaid />} />
                <Route path="/create" element={<CreateRaid />} />
                <Route path="/:raid_id" element={<Raid />} />;
              </Routes>
            </Grid.Col>
          </Grid>
        </Box>
      </BrowserRouter>
    </MantineProvider>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

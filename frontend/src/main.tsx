import { render } from 'preact'
import './index.css'
import { CreateRaid } from './create-raid.tsx'
import { Raid } from './raid.tsx'
import '@mantine/core/styles.css';
import '@mantine/spotlight/styles.css';
import { createTheme, MantineProvider, Box } from '@mantine/core';
import { Menu } from './menu.tsx'
import { BrowserRouter, Routes, Route } from "react-router";

const theme = createTheme({
  primaryColor: 'orange'
});



function App() {
  return (
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      <BrowserRouter>
        <Menu/>
        <Routes>
          <Route path="/create" element={<CreateRaid/>}/>
          <Route path="/:raid_id" element={<Raid />} />;
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

render(<App/>, document.getElementById('app')!)

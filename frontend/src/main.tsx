import { render } from 'preact'
import './index.css'
import { NewRaid } from './new-raid.tsx'
import { Raid } from './raid.tsx'
import '@mantine/core/styles.css';
import { createTheme, MantineProvider } from '@mantine/core';
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
          <Route path="/new" element={<NewRaid/>}/>
          <Route path="/:raid_id" element={<Raid />} />;
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

render(<App/>, document.getElementById('app')!)

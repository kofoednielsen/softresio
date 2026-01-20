import {
  Box,
  Burger,
  Button,
  Drawer,
  Stack,
  Group,
  ScrollArea,
  Image
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import logo from "../public/logo-orange.png";
import classes from './menu.module.css';
import { NavLink } from "react-router";

export function Menu() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);

  return (
    <Box pb={20}>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">
          <Group>
          <Image src={logo} h={40} w="auto" />
            <Group visibleFrom="sm">
              <NavLink to="/raids">
                <Button variant="default">
                  My raids
                </Button>
              </NavLink>
              <NavLink to="/create">
                <Button>
                  Create raid
                </Button>
              </NavLink>
            </Group>
          </Group>

          <Burger size="sm" opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" />
        </Group>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h="calc(100vh - 80px" mx="-md">
          <Stack justify="center" grow pb="xl" px="md">
              <NavLink to="/raids">
                <Button fullWidth variant="default" onClick={toggleDrawer}>
                  My raids
                </Button>
              </NavLink>
              <NavLink to="/create">
                <Button fullWidth onClick={toggleDrawer}>
                  Create raid
                </Button>
              </NavLink>
          </Stack>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
/* <IconChevronDown size={16} color={theme.colors.blue[6]} /> */

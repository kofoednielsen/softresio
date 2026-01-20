import { useState, useEffect, useMemo} from 'preact/hooks'
import { memo } from 'preact/compat'
import type { Item } from '../types/types.ts'
import { IconChevronDown, IconChevronUp, IconSearch } from '@tabler/icons-react';

import { Divider, Button, Image, Collapse, HoverCard, Box, Group, Stack, Title, Paper, ActionIcon, Checkbox, Input, TextInput, MultiSelect } from '@mantine/core';
import { useDebounce } from 'use-debounce';
import { Spotlight, spotlight } from '@mantine/spotlight';
import type { SpotlightActionData } from '@mantine/spotlight'
import './tooltip.css'


export function ItemSelector({items}: { items: Item[] }) {
  const [unfolded, setUnfolded] = useState<number[]>([])
  const [search, setSearch] = useState("")
  const [characterName, setCharacterName] = useState("")
  const [filteredItems, setFilteredItems] = useState(items)

  useEffect(() => {
    setFilteredItems(items.filter(item => item.name.includes(search)))
  }, [search])

  // const toggle = (item_id: number) => {
  //   if (unfolded.includes(item_id)) {
  //     setUnfolded(unfolded.filter(id => id !== item_id))
  //   } else {
  //     setUnfolded([...unfolded, item_id])
  //   }
  // }
  return (
    <>
      <Paper shadow="sm" p="md">
        <Stack>
          <Title order={2}>Choose your SR</Title>
          <TextInput value={characterName} onChange={(event: any) => setCharacterName(event.currentTarget.value)} label="Character name"/>
          <Group grow>
            <TextInput label="Class"/>
            <TextInput label="Specialization"/>
          </Group>
          <Divider/>
          <MultiSelect
            placeholder="Slot"
            data={['Trinket', 'Ring', 'Chest', 'Head']}
          />
          <Input value={search} onChange={(event: any) => setSearch(event.currentTarget.value)} leftSection={<IconSearch size={16} />} placeholder="Search.."></Input>
        </Stack>
        <br/>
        <Divider mb={8}/>
        <ItemList items={filteredItems}/>
      </Paper>
    </>
  );
}


const ItemList = memo(({ items }: {items: Item[]}) => {
  return (
    <Box style={{maxHeight: "40vh", overflow: "scroll"}}>
      {items.map(item => 
        <Box pb={10} key={item.id}>
          <Stack>
            <Group justify="space-between">
              <HoverCard>
                <HoverCard.Target>
                  {/*<Group wrap="nowrap" onClick={() => toggle(item.id)}>*/}
                  <Group wrap="nowrap">
                    <Image radius="sm" h={20} w="auto" src={`https://raidres.top/img/item-icons/${item.icon}`} />
                    <Title className={`q${item.quality}`} order={6}>{item.name}</Title>
                  </Group>
                </HoverCard.Target>
                <HoverCard.Dropdown style={{margin: 0, padding: 0}}>
                  <div class="tt-wrap" dangerouslySetInnerHTML={{ __html: item.tooltip }} />
                </HoverCard.Dropdown>
              </HoverCard>
              <Group>
                <Checkbox size="md" />
              </Group>
            </Group>
          </Stack>
          <Divider mt={8}/>
        </Box>
      )}
    </Box>
  )
});

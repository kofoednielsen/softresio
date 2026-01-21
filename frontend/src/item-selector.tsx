import { useEffect, useMemo, useState } from "preact/hooks"
import { memo } from "preact/compat"
import type { Item } from "../types/types.ts"
import {
  IconChevronDown,
  IconChevronUp,
  IconSearch,
} from "@tabler/icons-react"
import {
  Flex,
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Collapse,
  Divider,
  Group,
  HoverCard,
  Image,
  Input,
  MultiSelect,
  Paper,
  Stack,
  TextInput,
  Title,
  Select,
  ScrollArea,
  CloseButton,
  Modal
} from "@mantine/core"
import { classes, classIcons } from './classes.ts'
import type { SelectProps } from "@mantine/core"
import { useDebounce } from "use-debounce"
import { Spotlight, spotlight } from "@mantine/spotlight"
import type { SpotlightActionData } from "@mantine/spotlight"
import "./tooltip.css"
import { List } from "react-window"
import { type RowComponentProps } from "react-window"


const ClassIcon = ({iconId}: {iconId: string}) => {
  return (
    <Image
      radius="sm"
      h={20}
      w="auto"
      src={`https://talents.turtlecraft.gg/icons/${classIcons[iconId]}`}
    />
  )
}

const renderSelectOption: SelectProps['renderOption'] = ({ option, checked }) => (
  <Group gap="xs">
    <ClassIcon iconId={option.value}/>
    {option.label}
  </Group>
);

 

function ItemComponent({
  index,
  items,
  style
}: RowComponentProps<{
  items: Item[];
}>) {
  const item = items[index]
    
  return (
    <Group style={style} justify="space-between" wrap="nowrap" className="item-list-element" p={8} key={item.id} mr={10}>
      <HoverCard>
        <HoverCard.Target>
          <Group wrap="nowrap">
            <Image
              style={{ filter: "drop-shadow(0px 0px 2px)" }}
              className={`q${item.quality}`}
              radius="sm"
              h={20}
              w="auto"
              src={`https://database.turtlecraft.gg/images/icons/medium/${item.icon}`}
            />
            <Title className={`q${item.quality}`} order={6} lineClamp={1}>
              {item.name}
            </Title>
          </Group>
        </HoverCard.Target>
        <HoverCard.Dropdown style={{ margin: 0, padding: 0 }}>
          <div
            class="tt-wrap"
            dangerouslySetInnerHTML={{ __html: item.tooltip }}
          />
        </HoverCard.Dropdown>
      </HoverCard>
      <Group>
        <Checkbox size="md" />
      </Group>
    </Group>
  );
}

export function ItemSelector({ items }: { items: Item[] }) {
  const [unfolded, setUnfolded] = useState<number[]>([]);
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [selectedClass, setSelectedClass] = useState<string | null>();
  const [selectedSpec, setSelectedSpec] = useState<string | null>();
  const [characterName, setCharacterName] = useState("");
  const [filteredItems, setFilteredItems] = useState(items);

  useEffect(() => {
    setFilteredItems(items.filter((item) => item.name.toLowerCase().includes(debouncedSearch?.toLowerCase() || "")));
  }, [debouncedSearch]);

  useEffect(() => {
	console.log(filteredItems.length)
  }, [filteredItems])

  return (
    <>
      <Paper shadow="sm" p="md">
        <Stack>
          <Title order={2}>Choose your SR</Title>
          <TextInput
            value={characterName}
            onChange={(event: any) =>
              setCharacterName(event.currentTarget.value)}
            label="Character name"
            placeholder="Character name"
          />
          <Group grow>
            <Select
              placeholder="Class"
              searchable
              value={selectedClass}
              onChange={(value) => { setSelectedSpec(null); setSelectedClass(value)}}
              data={Object.keys(classes)}
              label="Class"
              renderOption={renderSelectOption}
              leftSection={selectedClass ? <ClassIcon iconId={selectedClass}/> : undefined}
            />
            <Select
              placeholder="Specialization"
              disabled={!selectedClass}
              onChange={setSelectedSpec}
              value={selectedSpec}
              data={classes[selectedClass]?.map((spec) => ({value: (selectedClass+spec).replace(" ", ""), label: spec}))}
              renderOption={renderSelectOption}
              leftSection={selectedSpec ? <ClassIcon iconId={selectedSpec}/> : undefined}
              label="Specialization"
            />
          </Group>
          <Button mt="md" onClick={() => setSearchOpen(true)}>
            Select item(s)
          </Button>
        </Stack>
      </Paper>
      <Modal
        opened={searchOpen}
        onClose={() => setSearchOpen(false)}
        size="auto"
        withCloseButton={false}
        styles={{
          body: { height: "90dvh" },
        }}
      >
        <Stack h="100%" gap="md">
          <Group justify="space-between" wrap="nowrap">
            <Input
              w="100%"
              value={search}
              onChange={(event: any) => setSearch(event.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
              placeholder="Search.."
            />
            <CloseButton onClick={() => setSearchOpen(false)}/>
          </Group>
          <Group grow>
            <Select
              placeholder="Slot"
              searchable
              clearable
              data={["Trinket", "Ring", "Chest", "Head"]}
            />
            <Select
              placeholder="Type"
              searchable
              clearable
              data={["Plate", "Cloth", "Mail"]}
            />
          </Group>
          <List
            rowComponent={ItemComponent}
            rowCount={filteredItems.length}
            rowHeight={40}
            rowProps={{items: filteredItems}}
          />
        </Stack>
      </Modal>
    </>
  );
}


const ItemList = memo(({ items }: { items: Item[] }) => {
  return (
    <ScrollArea>
      {items.map((item) => (
        <Box className="item-list-element" p={8} key={item.id} mr={10}>
          <Stack>
            <Group justify="space-between" wrap="nowrap">
              <HoverCard>
                <HoverCard.Target>
                  <Group wrap="nowrap">
                    <Image
                      style={{ filter: "drop-shadow(0px 0px 2px)" }}
                      className={`q${item.quality}`}
                      radius="sm"
                      h={20}
                      w="auto"
                      src={`https://database.turtlecraft.gg/images/icons/medium/${item.icon}`}
                    />
                    <Title className={`q${item.quality}`} order={6} lineClamp={1}>
                      {item.name}
                    </Title>
                  </Group>
                </HoverCard.Target>
                <HoverCard.Dropdown style={{ margin: 0, padding: 0 }}>
                  <div
                    class="tt-wrap"
                    dangerouslySetInnerHTML={{ __html: item.tooltip }}
                  />
                </HoverCard.Dropdown>
              </HoverCard>
              <Group>
                <Checkbox size="md" />
              </Group>
            </Group>
          </Stack>
        </Box>
      ))}
    </ScrollArea>
  );
});

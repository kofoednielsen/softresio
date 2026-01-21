import { useEffect, useMemo, useState } from "preact/hooks";
import { memo } from "preact/compat";
import type { Item } from "../types/types.ts";
import {
  IconChevronDown,
  IconChevronUp,
  IconSearch,
} from "@tabler/icons-react";
import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  CloseButton,
  Collapse,
  Divider,
  Flex,
  Group,
  HoverCard,
  Image,
  Input,
  Modal,
  MultiSelect,
  Paper,
  ScrollArea,
  Select,
  Stack,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useClickOutside, useHover, useToggle } from "@mantine/hooks";
import { useLongPress } from "use-long-press";
import { classes, classIcons } from "./classes.ts";
import type { SelectProps } from "@mantine/core";
import { useDebounce } from "use-debounce";
import { Spotlight, spotlight } from "@mantine/spotlight";
import type { SpotlightActionData } from "@mantine/spotlight";
import "./tooltip.css";
import { List } from "react-window";
import { type RowComponentProps } from "react-window";

const isTouchScreen = window.matchMedia("(pointer: coarse)").matches;

const ClassIcon = ({ iconId }: { iconId: string }) => {
  return (
    <Image
      radius="sm"
      h={20}
      w="auto"
      src={`https://talents.turtlecraft.gg/icons/${classIcons[iconId]}`}
    />
  );
};

const renderSelectOption: SelectProps["renderOption"] = (
  { option, checked },
) => (
  <Group gap="xs">
    <ClassIcon iconId={option.value} />
    {option.label}
  </Group>
);

function ItemComponent({
  index,
  items,
  selectedItems,
  onItemClick,
  onItemLongClick,
  showTooltipItemId,
  style,
}: RowComponentProps<{
  onItemClick: (item_id: number) => void;
  onItemLongClick: (item_id: number) => void;
  selectedItems: number[];
  items: Item[];
  showTooltipItemId: number | undefined;
}>) {
  const { hovered, ref } = useHover();
  const handlers = useLongPress(() => onItemLongClick(item.id));

  const item = items[index];

  return (
    <Tooltip
      m={0}
      p={0}
      opened={showTooltipItemId == item.id || (!isTouchScreen && hovered)}
      label={
        <div
          class="tt-wrap"
          dangerouslySetInnerHTML={{ __html: item.tooltip }}
        />
      }
    >
      <Group
        {...handlers()}
        ref={ref}
        style={style}
        justify="space-between"
        wrap="nowrap"
        className="item-list-element"
        onClick={() => onItemClick(item.id)}
        p={8}
        key={item.id}
        mr={10}
      >
        <Group wrap="nowrap">
          <Image
            style={{
              filter: "drop-shadow(0px 0px 2px)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
            className={`q${item.quality}`}
            radius="sm"
            h={24}
            w="auto"
            src={`https://database.turtlecraft.gg/images/icons/medium/${item.icon}`}
          />
          <Title className={`q${item.quality}`} order={6} lineClamp={1}>
            {item.name}
          </Title>
        </Group>
        <Group>
          <Checkbox checked={selectedItems.includes(item.id)} size="md" />
        </Group>
      </Group>
    </Tooltip>
  );
}

export function ItemSelector({ items }: { items: Item[] }) {
  const [unfolded, setUnfolded] = useState<number[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [selectedClass, setSelectedClass] = useState<string | null>();
  const [selectedSpec, setSelectedSpec] = useState<string | null>();
  const [characterName, setCharacterName] = useState("");
  const [filteredItems, setFilteredItems] = useState(items);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showTooltipItemId, setShowTooltipItemId] = useState<number | null>();

  const onItemLongClick = (item_id: number) => setShowTooltipItemId(item_id);

  const onItemClick = (item_id: number) => {
    if (!showTooltipItemId || showTooltipItemId == item_id) {
      if (selectedItems.includes(item_id)) {
        setSelectedItems(selectedItems.filter((i) => i !== item_id));
      } else {
        setSelectedItems([...selectedItems, item_id]);
      }
    }
    setShowTooltipItemId(undefined);
  };

  useEffect(() => {
    setFilteredItems(
      items.filter((item) =>
        item.name.toLowerCase().includes(debouncedSearch?.toLowerCase() || "")
      ),
    );
  }, [debouncedSearch]);

  useEffect(() => {
    console.log(filteredItems.length);
  }, [filteredItems]);

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
          <Group>
            <Select
              placeholder="Class"
              searchable
              value={selectedClass}
              onChange={(value) => {
                setSelectedSpec(null);
                setSelectedClass(value);
              }}
              data={Object.keys(classes)}
              label="Class"
              renderOption={renderSelectOption}
              leftSection={selectedClass
                ? <ClassIcon iconId={selectedClass} />
                : undefined}
            />
            <Select
              placeholder="Specialization"
              disabled={!selectedClass}
              onChange={setSelectedSpec}
              value={selectedSpec}
              data={classes[selectedClass]?.map((spec) => ({
                value: (selectedClass + spec).replace(" ", ""),
                label: spec,
              }))}
              renderOption={renderSelectOption}
              leftSection={selectedSpec
                ? <ClassIcon iconId={selectedSpec} />
                : undefined}
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
            <CloseButton onClick={() => setSearchOpen(false)} />
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
            rowProps={{
              items: filteredItems,
              onItemClick,
              selectedItems,
              showTooltipItemId,
              onItemLongClick,
            }}
          />
        </Stack>
      </Modal>
    </>
  );
}

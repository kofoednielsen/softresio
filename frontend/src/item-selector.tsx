import { useEffect, useState } from "react"
import type {
  Attendee,
  Character,
  Class,
  CreateSrRequest,
  CreateSrResponse,
  Item,
  Sheet,
  User,
} from "../types/types.ts"
import { IconSearch } from "@tabler/icons-react"
import {
  Button,
  Checkbox,
  CloseButton,
  Group,
  Image,
  Input,
  Modal,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core"
import { useHover } from "@mantine/hooks"
import { useLongPress } from "use-long-press"
import { classes, classIcons } from "./classes.ts"
import { itemSlots } from "./items.ts"
import type { SelectProps } from "@mantine/core"
import { useDebounce } from "use-debounce"
import "../css/tooltip.css"
import { List } from "react-window"
import { type RowComponentProps } from "react-window"

const isTouchScreen = globalThis.matchMedia("(pointer: coarse)").matches

const ClassIcon = ({ spec, xclass }: { xclass: string; spec?: string }) => {
  const icon = `${xclass}${spec ? spec.replace(" ", "") : ""}`
  return (
    <Image
      radius="sm"
      h={20}
      w="auto"
      src={`https://talents.turtlecraft.gg/icons/${classIcons[icon]}`}
    />
  )
}

const ItemComponent = ({
  item,
  onItemClick,
  onItemLongClick,
  selectedItemIds,
  showTooltipItemId,
  deleteMode,
  style,
}: {
  onItemClick: (itemId: number) => void
  onItemLongClick: (itemId: number) => void
  selectedItemIds?: number[]
  showTooltipItemId?: number
  item: Item
  deleteMode?: boolean
  style?: React.CSSProperties
}) => {
  const { hovered, ref } = useHover()
  const handlers = useLongPress(() => onItemLongClick(item.id))

  return (
    <Tooltip
      m={0}
      p={0}
      key={item.id}
      opened={showTooltipItemId == item.id || (!isTouchScreen && hovered)}
      label={
        <div
          className="tt-wrap"
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
        mr={deleteMode ? 0 : 10}
      >
        <Group wrap="nowrap">
          <Image
            onClick={(e) => {
              e.stopPropagation()
              globalThis.open(
                `https://database.turtlecraft.gg/?item=${item.id}`,
              )
            }}
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
        {deleteMode
          ? <CloseButton />
          : <Checkbox checked={selectedItemIds?.includes(item.id)} size="md" />}
      </Group>
    </Tooltip>
  )
}

const ReactWindowItemComponent = ({
  index,
  items,
  selectedItemIds,
  onItemClick,
  onItemLongClick,
  showTooltipItemId,
  style,
  deleteMode = false,
}: RowComponentProps<{
  onItemClick: (item_id: number) => void
  onItemLongClick: (item_id: number) => void
  selectedItemIds: number[]
  items: Item[]
  showTooltipItemId?: number
  deleteMode?: boolean
}>) => {
  return (
    <ItemComponent
      item={items[index]}
      selectedItemIds={selectedItemIds}
      onItemClick={onItemClick}
      onItemLongClick={onItemLongClick}
      showTooltipItemId={showTooltipItemId}
      deleteMode={deleteMode}
      style={style}
    />
  )
}

export function ItemSelector(
  { items, sheet, loadRaid, user }: {
    items: Item[]
    sheet: Sheet
    loadRaid: (sheet?: Sheet) => void
    user: User
  },
) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebounce(search, 100)
  const [selectedClass, setSelectedClass] = useState<string | null>()
  const [selectedSpec, setSelectedSpec] = useState<string | null>()
  const [characterName, setCharacterName] = useState("")
  const [filteredItems, setFilteredItems] = useState(items)
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([])
  const [showTooltipItemId, setShowTooltipItemId] = useState<number>()
  const [slotFilter, setSlotFilter] = useState<string | null>()
  const [typeFilter, setTypeFilter] = useState<string | null>()

  const onItemLongClick = (itemId: number) =>
    showTooltipItemId === itemId
      ? setShowTooltipItemId(undefined)
      : setShowTooltipItemId(itemId)

  const submitSr = () => {
    if (
      selectedClass == undefined || selectedSpec == undefined ||
      characterName == undefined
    ) {
      return
    }
    const character: Character = {
      name: characterName,
      class: selectedClass as Class,
      spec: selectedSpec,
    }
    const request: CreateSrRequest = {
      raidId: sheet.raidId,
      character,
      selectedItemIds,
    }
    fetch("/api/sr/create", { method: "POST", body: JSON.stringify(request) })
      .then((r) => r.json())
      .then((j: CreateSrResponse) => {
        if (j.error) {
          alert(j.error)
        } else if (j.data) {
          loadRaid(j.data)
        }
      })
  }

  const onItemClick = (itemId: number) => {
    if (!showTooltipItemId || showTooltipItemId == itemId) {
      if (selectedItemIds.includes(itemId)) {
        setSelectedItemIds(selectedItemIds.filter((i) => i !== itemId))
      } else {
        setSelectedItemIds([...selectedItemIds, itemId])
      }
    }
    setShowTooltipItemId(undefined)
  }

  const renderClass: SelectProps["renderOption"] = (
    { option },
  ) => (
    <Group gap="xs">
      <ClassIcon xclass={option.value} />
      {option.label}
    </Group>
  )

  const renderSpec: SelectProps["renderOption"] = (
    { option },
  ) => (selectedClass
    ? (
      <Group gap="xs">
        <ClassIcon xclass={selectedClass} spec={option.value} />
        {option.label}
      </Group>
    )
    : null)

  useEffect(() => {
    setFilteredItems(
      items.filter((item) =>
        item.name.toLowerCase().includes(
          debouncedSearch?.toLowerCase() || "",
        ) &&
        (!slotFilter || item.slot == slotFilter) &&
        (!typeFilter || item.type == typeFilter)
      ),
    )
  }, [debouncedSearch, slotFilter, typeFilter])

  const findAttendeeMe = (): Attendee | undefined =>
    sheet.attendees.filter((attendee) =>
      attendee.user.userId === user.userId
    )[0]

  const itemIdsEqual = (a: number[], b: number[]) =>
    a.length === b.length && a.every((itemId) => new Set(b).has(itemId))
  const srChanged = () => {
    const attendeeMe = findAttendeeMe()
    return (!attendeeMe || (attendeeMe.character.name !== characterName ||
      attendeeMe.character.class !== selectedClass ||
      attendeeMe.character.spec !== selectedSpec ||
      !itemIdsEqual(
        attendeeMe.softReserves.map((item) => item.itemId),
        selectedItemIds,
      )))
  }

  useEffect(() => {
    const attendeeMe = findAttendeeMe()
    if (attendeeMe) {
      setSelectedClass(attendeeMe.character.class)
      setSelectedSpec(attendeeMe.character.spec)
      setCharacterName(attendeeMe.character.name)
      setSelectedItemIds(attendeeMe.softReserves.map((sr) => sr.itemId))
    }
  }, [])

  return (
    <>
      <Paper shadow="sm" p="md">
        <Stack>
          <Title order={2}>Choose your SR</Title>
          <TextInput
            withAsterisk={!characterName}
            value={characterName}
            onChange={(event) => setCharacterName(event.currentTarget.value)}
            label="Character name"
            placeholder="Character name"
          />
          <Group>
            <Select
              placeholder="Class"
              searchable
              withAsterisk={!selectedClass}
              value={selectedClass}
              onChange={(value) => {
                setSelectedSpec(null)
                setSelectedClass(value)
              }}
              data={Object.keys(classes)}
              label="Class"
              renderOption={renderClass}
              leftSection={selectedClass
                ? <ClassIcon xclass={selectedClass} />
                : undefined}
            />
            <Select
              placeholder="Specialization"
              withAsterisk={!selectedSpec}
              disabled={!selectedClass}
              onChange={setSelectedSpec}
              value={selectedSpec}
              data={selectedClass ? classes[selectedClass] : []}
              renderOption={renderSpec}
              leftSection={selectedSpec && selectedClass
                ? <ClassIcon xclass={selectedClass} spec={selectedSpec} />
                : undefined}
              label="Specialization"
            />
          </Group>
          <Stack gap={0}>
            <Group mb={3} p={0} gap={3}>
              <Text size="sm">
                Items
              </Text>
              <Text
                size="sm"
                c="var(--mantine-color-error)"
                hidden={selectedItemIds.length == sheet.srCount}
              >
                *
              </Text>
            </Group>
            <Paper
              shadow="sm"
              p="md"
              style={{ backgroundColor: "var(--mantine-color-dark-8" }}
            >
              <Stack gap="sm" justify="bottom">
                {selectedItemIds.map((itemId) => (
                  <ItemComponent
                    item={items.filter((i) => i.id == itemId)[0]}
                    onItemClick={onItemClick}
                    onItemLongClick={() => {}}
                    deleteMode
                  />
                ))}
                {Array.from({ length: sheet.srCount - selectedItemIds.length })
                  .map(() => (
                    <Button
                      w="100%"
                      h={44}
                      onClick={() => setSearchOpen(true)}
                      variant="default"
                    >
                      Select item
                    </Button>
                  ))}
                <Text
                  size="sm"
                  c="var(--mantine-color-error)"
                  hidden={selectedItemIds.length <= sheet.srCount}
                >
                  You must SR exactly {sheet.srCount} item(s)
                </Text>
              </Stack>
            </Paper>
          </Stack>
          <Button
            disabled={!selectedClass || !selectedSpec || !characterName ||
              selectedItemIds.length != sheet.srCount || !srChanged()}
            onClick={submitSr}
          >
            Submit
          </Button>
        </Stack>
      </Paper>
      <Modal
        opened={searchOpen}
        onClose={() => {
          setShowTooltipItemId(undefined)
          setSearchOpen(false)
        }}
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
              onChange={(event) => setSearch(event.currentTarget.value)}
              onFocus={() => setShowTooltipItemId(undefined)}
              leftSection={<IconSearch size={16} />}
              rightSection={
                <CloseButton
                  onClick={() => setSearch("")}
                  size="sm"
                  style={{ display: search ? undefined : "none" }}
                />
              }
              rightSectionPointerEvents="auto"
              placeholder="Search.."
            />
            <CloseButton
              onClick={() => {
                setShowTooltipItemId(undefined)
                setSearchOpen(false)
              }}
            />
          </Group>
          <Group grow>
            <Select
              placeholder="Slot"
              searchable
              clearable
              onFocus={() => setShowTooltipItemId(undefined)}
              value={slotFilter}
              onChange={(value) => {
                setSlotFilter(value)
                if (
                  slotFilter && typeFilter &&
                  !itemSlots[slotFilter].includes(typeFilter)
                ) setTypeFilter(null)
              }}
              data={Object.keys(itemSlots)}
            />
            <Select
              placeholder="Type"
              disabled={!slotFilter || itemSlots[slotFilter].length == 0}
              onFocus={() => setShowTooltipItemId(undefined)}
              searchable
              clearable
              value={typeFilter || null}
              onChange={(value) => setTypeFilter(value || undefined)}
              data={slotFilter ? itemSlots[slotFilter] : []}
            />
          </Group>
          <List
            rowComponent={ReactWindowItemComponent}
            rowCount={filteredItems.length}
            rowHeight={40}
            rowProps={{
              items: filteredItems,
              onItemClick,
              selectedItemIds,
              showTooltipItemId,
              onItemLongClick,
            }}
          />
        </Stack>
      </Modal>
    </>
  )
}

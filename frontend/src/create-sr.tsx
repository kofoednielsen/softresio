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
import {
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core"
import { classes } from "./class.tsx"
import "../css/tooltip.css"
import { ItemPicker } from "./item-picker.tsx"
import { SelectableItem } from "./item.tsx"
import { ClassIcon, renderClass, renderSpec } from "./class.tsx"

export const CreateSr = (
  { items, sheet, loadRaid, user }: {
    items: Item[]
    sheet: Sheet
    loadRaid: (sheet?: Sheet) => void
    user: User
  },
) => {
  const [itemPickerOpen, setItemPickerOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<Class | null>()
  const [selectedSpec, setSelectedSpec] = useState<string | null>()
  const [characterName, setCharacterName] = useState("")
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([])

  const srCounter = new Map()
  for (const attendee of sheet.attendees) {
    for (const sr of attendee.softReserves) {
      srCounter.set(sr.itemId, (srCounter.get(sr.itemId) || 0) + 1)
    }
  }

  const submitSr = () => {
    if (
      selectedClass == undefined || selectedSpec == undefined ||
      characterName == undefined
    ) {
      return
    }
    const character: Character = {
      name: characterName,
      class: selectedClass,
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
    <Paper shadow="sm" p="sm">
      <Stack>
        <Title order={2}>Choose your SR</Title>
        <TextInput
          withAsterisk={!characterName}
          maxLength={12}
          value={characterName}
          onChange={(event) => setCharacterName(event.currentTarget.value)}
          label="Character name"
          placeholder="Character name"
          w="200"
        />
        <Group>
          <Select
            placeholder="Class"
            searchable
            withAsterisk={!selectedClass}
            value={selectedClass}
            onChange={(value) => {
              setSelectedSpec(null)
              setSelectedClass(value as Class)
            }}
            data={Object.keys(classes)}
            label="Class"
            renderOption={renderClass(selectedClass || undefined)}
            leftSection={<ClassIcon xclass={selectedClass} />}
            leftSectionPointerEvents="none"
          />
          <Select
            placeholder="Specialization"
            withAsterisk={!selectedSpec}
            disabled={!selectedClass}
            onChange={setSelectedSpec}
            value={selectedSpec}
            data={selectedClass ? classes[selectedClass] : []}
            renderOption={selectedClass
              ? renderSpec(selectedClass, selectedSpec)
              : undefined}
            leftSection={
              <ClassIcon xclass={selectedClass} spec={selectedSpec} />
            }
            leftSectionPointerEvents="none"
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
            p="sm"
            shadow="sm"
            style={{ backgroundColor: "var(--mantine-color-dark-8" }}
          >
            <Stack gap="sm" justify="bottom">
              {selectedItemIds.map((itemId) => (
                <SelectableItem
                  item={items.filter((i) => i.id == itemId)[0]}
                  onItemClick={() =>
                    setSelectedItemIds(
                      selectedItemIds.filter((i) => i != itemId),
                    )}
                  onItemLongClick={() => {}}
                  deleteMode
                  srCount={(srCounter.get(itemId) || 0)}
                />
              ))}
              {Array.from({
                length: sheet.srCount - selectedItemIds.length,
              })
                .map(() => (
                  <Button
                    w="100%"
                    h={44}
                    onClick={() => setItemPickerOpen(true)}
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
      <ItemPicker
        selectedItemIds={selectedItemIds}
        setSelectedItemIds={setSelectedItemIds}
        items={items}
        open={itemPickerOpen}
        setOpen={setItemPickerOpen}
        selectedClass={selectedClass || null}
        srCounter={srCounter}
      />
    </Paper>
  )
}

import { useState } from "react"
import { Box, Group, Select, Table, Text, TextInput } from "@mantine/core"
import type { Attendee, Class, Item } from "../types/types.ts"
import { ItemNameAndIcon } from "./item.tsx"
import { ClassIcon } from "./class.tsx"
import { classes, renderClass } from "./class.tsx"

export const SrList = (
  { attendees, items }: { attendees: Attendee[]; items: Item[] },
) => {
  const [classFilter, setClassFilter] = useState<Class>()
  const [nameFilter, setNameFilter] = useState<string>()
  const [itemFilter, setItemFilter] = useState<string>()
  const rows = attendees
    .map((attendee) => (
      attendee.softReserves
        .filter((
          _,
        ) => (!classFilter || attendee.character.class == classFilter))
        .filter((
          _,
        ) => (!nameFilter || attendee.character.name.startsWith(nameFilter)))
        .filter((
          res,
        ) => (!itemFilter ||
          items.filter((item) => item.id == res.itemId)[0]?.name.toLowerCase()
            .includes(itemFilter.toLowerCase()))
        )
        .map((res) => (
          <Table.Tr key={attendee.character.name + res.itemId}>
            <Table.Td>
              <Group gap={0}>
                <ClassIcon xclass={attendee.character.class} />
                <ClassIcon
                  xclass={attendee.character.class}
                  spec={attendee.character.spec}
                />
              </Group>
            </Table.Td>
            <Table.Td>
              <Text lineClamp={1}>
                {attendee.character.name}
              </Text>
            </Table.Td>
            <Table.Td>
              <ItemNameAndIcon
                item={items.filter((item) => item.id == res.itemId)[0]}
              />
            </Table.Td>
          </Table.Tr>
        ))
    ))
  return (
    <Box
      h={50 + (39.8) *
          (attendees.flatMap((attendee) => attendee.softReserves)).length}
    >
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              <Select
                data={Object.keys(classes)}
                onChange={(value) =>
                  setClassFilter(value as Class || undefined)}
                value={classFilter}
                withCheckIcon
                checkIconPosition="right"
                renderOption={renderClass}
                rightSection={classFilter && <ClassIcon xclass={classFilter} />}
                comboboxProps={{ width: 140, position: "bottom-start" }}
                w={40}
              />
            </Table.Th>
            <Table.Th>
              <TextInput
                placeholder="Name"
                onChange={(event) =>
                  setNameFilter(event.currentTarget.value || undefined)}
                value={nameFilter || ""}
              />
            </Table.Th>
            <Table.Th>
              <TextInput
                placeholder="Reserved Item"
                onChange={(event) =>
                  setItemFilter(event.currentTarget.value || undefined)}
                value={itemFilter || ""}
              />
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Box>
  )
}

import type { SrPlus } from "../shared/types.ts"
import { Anchor, Modal, Table, Text, Tooltip } from "@mantine/core"
import { formatDistanceToNow } from "date-fns"
import { formatTime, raidIdToUrl } from "../shared/utils.ts"

export const SrPlusLog = (
  { srPlus, open, onClose }: {
    srPlus: SrPlus
    open: boolean
    onClose: () => void
  },
) => {
  return (
    <Modal
      title={`${srPlus.characterName}'s SR+ History`}
      size="auto"
      opened={open}
      onClose={onClose}
      withCloseButton
      padding="sm"
    >
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Time</Table.Th>
            <Table.Th>Source</Table.Th>
            <Table.Th>Change</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {srPlus.raids.sort((a, b) => b.time.localeCompare(a.time)).map((
            raid,
          ) => (
            <Table.Tr>
              <Table.Td>
                <Tooltip label={formatTime(raid.time)}>
                  <Text size="sm">
                    {formatDistanceToNow(raid.time, { addSuffix: true })}
                  </Text>
                </Tooltip>
              </Table.Td>
              <Table.Td>
                <Anchor size="sm" href={raidIdToUrl(raid.id)}>
                  {raidIdToUrl(raid.id)}
                </Anchor>
              </Table.Td>
              <Table.Td>
                <Text size="sm">
                  +10
                </Text>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Modal>
  )
}

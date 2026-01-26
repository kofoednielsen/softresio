import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Anchor, Paper, Stack, Table, Text, Title } from "@mantine/core"
import { useNavigate } from "react-router"
import type {
  GetInstancesResponse,
  GetMyRaidsResponse,
  Instance,
  Raid,
} from "../types/types.ts"
import { CopyClipboardButton, raidIdToUrl } from "./copy-clipboard-button.tsx"

const MyRaidItem = (
  { instances, raids }: { instances: Instance[]; raids: Raid[] },
) => {
  const navigate = useNavigate()

  function idToInstance(id: number): string {
    if (!instances) return ""
    const matches = instances.filter((instance) => instance.id == id)
    return matches[0].name
  }

  const raidLinks = raids.map((raid) => {
    const instanceName = idToInstance(raid.sheet.instanceId)
    return (
      <Table.Tr>
        <Table.Td>
          <Anchor
            onClick={() => navigate(`/${raid.sheet.raidId}`)}
            key={raid.sheet.raidId}
          >
            <Text>{instanceName}</Text>
          </Anchor>
        </Table.Td>
        <Table.Td>
          {formatDistanceToNow(raid.sheet.time, { addSuffix: true })}
        </Table.Td>
        <Table.Td>
          <CopyClipboardButton
            w="100%"
            tooltip="Copy link to raid"
            label={raid.sheet.raidId}
            toClipboard={raidIdToUrl(raid.sheet.raidId)}
          />
        </Table.Td>
      </Table.Tr>
    )
  })

  return (
    <Paper shadow="sm" p="sm">
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              Instance
            </Table.Th>
            <Table.Th>
              Time
            </Table.Th>
            <Table.Th w={110}>
              Share link
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {raidLinks}
        </Table.Tbody>
      </Table>
    </Paper>
  )
}

export const MyRaids = () => {
  const [raidList, setRaidList] = useState<Raid[]>()
  const [instances, setInstances] = useState<Instance[]>()

  useEffect(() => {
    fetch(`/api/raids`).then((r) => {
      return r.json()
    }).then(
      (j: GetMyRaidsResponse) => {
        if (j.error) {
          alert(j.error)
        } else if (j.data) {
          setRaidList(j.data)
        }
      },
    )
  }, [])

  useEffect(() => {
    fetch("/api/instances")
      .then((r) => r.json())
      .then((j: GetInstancesResponse) => {
        if (j.error) {
          alert(j.error)
        } else if (j.data) {
          setInstances(j.data)
        }
      })
  }, [])

  raidList?.sort((raid1, raid2) =>
    Date.parse(raid2.sheet.time) - Date.parse(raid1.sheet.time)
  )

  if (!instances || !raidList) {
    return <></>
  }

  const upcomingRaids = []
  const pastRaids = []

  const today = (new Date()).getDate()
  for (const raid of raidList) {
    if (new Date(Date.parse(raid.sheet.time)).getDate() < today) {
      pastRaids.push(raid)
    } else {
      upcomingRaids.push(raid)
    }
  }

  return (
    <Stack>
      <Title>Upcoming</Title>
      <MyRaidItem instances={instances} raids={upcomingRaids} />
      <Title>Past</Title>
      <MyRaidItem instances={instances} raids={pastRaids} />
    </Stack>
  )
}

import { useEffect, useState } from "react"
import type {
  GetInstancesResponse,
  GetRaidResponse,
  Instance,
  Sheet,
  User,
} from "../types/types.ts"
import { useParams } from "react-router"
import { Paper, Title } from "@mantine/core"
import { CreateSr } from "./create-sr.tsx"
import { SrList } from "./sr-list.tsx"
import useWebSocket from "react-use-websocket"

export const RaidUpdater = (
  { loadRaid, raidId }: { loadRaid: (sheet: Sheet) => void; raidId: string },
) => {
  const { lastMessage } = useWebSocket(`/api/ws/${raidId}`)
  useEffect(() => {
    if (lastMessage?.data) {
      loadRaid(JSON.parse(lastMessage.data))
    }
  }, [lastMessage])
  return null
}

export const Raid = () => {
  const params = useParams()
  const [sheet, setSheet] = useState<Sheet>()
  const [user, setUser] = useState<User>()
  const [instance, setInstance] = useState<Instance>()

  const loadRaid = (sheet?: Sheet) => {
    if (sheet) {
      return setSheet(sheet)
    }
    fetch(`/api/raid/${params.raid_id}`).then((r) => r.json()).then(
      (j: GetRaidResponse) => {
        if (j.error) {
          alert(j.error)
        } else if (j.data) {
          setUser(j.user)
          setSheet(j.data)
        }
      },
    )
  }

  useEffect(loadRaid, [])

  useEffect(() => {
    if (sheet) {
      fetch("/api/instances")
        .then((r) => r.json())
        .then((j: GetInstancesResponse) => {
          if (j.error) {
            alert(j.error)
          } else if (j.data) {
            const matches = j.data.filter((i: Instance) =>
              i.id == sheet.instanceId
            )
            if (matches.length == 1) {
              setInstance(matches[0])
            } else {
              alert("Could not find instance")
            }
          }
        })
    }
  }, [sheet?.instanceId])

  if (sheet && instance && user) {
    return (
      <>
        <Paper shadow="sm" p="sm">
          <Title>{instance.name}</Title>
        </Paper>
        <br />
        <CreateSr
          loadRaid={loadRaid}
          items={instance.items}
          sheet={sheet}
          user={user}
        />
        <br />
        <Paper shadow="sm">
          <SrList attendees={sheet.attendees} items={instance.items} />
        </Paper>
        <RaidUpdater raidId={sheet.raidId} loadRaid={loadRaid} />
      </>
    )
  }
}

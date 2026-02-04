import { useState } from "react"
import { Button, Paper, Stack, TextInput } from "@mantine/core"
import type {
  CreateGuildRequest,
  CreateGuildResponse,
} from "../shared/types.ts"

export const CreateGuild = () => {
  const [name, setName] = useState("")
  const [shortname, setShortname] = useState("")

  const createGuild = () => {
    const request: CreateGuildRequest = {
      name,
      shortname,
    }
    fetch("/api/guild/create", {
      method: "POST",
      body: JSON.stringify(request),
    })
      .then((r) => r.json())
      .then((j: CreateGuildResponse) => {
        if (j.error) {
          alert(j.error.message)
        } else {
          alert("Guild created!")
        }
      })
  }

  return (
    <Paper shadow="sm" p="sm">
      <Stack>
        <TextInput
          label="Guild name"
          placeholder="Guild name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <TextInput
          label="Shortname"
          placeholder="Shortname"
          value={shortname}
          onChange={(e) => setShortname(e.currentTarget.value.toUpperCase())}
        />
        <Button mt="sm" disabled={!shortname || !name} onClick={createGuild}>
          Create Guild
        </Button>
      </Stack>
    </Paper>
  )
}

import { useState, useEffect } from 'preact/hooks'
import { Grid, Paper, Title, Textarea, Select, useMantineTheme, Box, Button, Switch, PasswordInput } from '@mantine/core';

export function NewRaid() {
  const [count, setCount] = useState(5)
  const theme = useMantineTheme(); 

  const [instances, setInstances] = useState()

  const [instance, setInstance] = useState("")
  const [description, setDescription] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [useSRPlus, setUseSRPlus] = useState(false)

  function createRaid() {
    console.log(
      {
        instance,
        description,
        useSRPlus,
        adminPassword
      }
    )
  }

  useEffect(() => {
    fetch("/api/instances").then((r) => r.json()).then((json) => setInstances(json))
  }, [])

  return (
    <>
      <Grid justify="center">
        <Grid.Col span={{ base: 11, md:4 }}>
          <Paper shadow="md" p="xl">
            <Title pb={10} order={1}>Create a new raid</Title>
            <Select
              pb={20}
              withAsterisk={instance == ""}
              label="Instance"
              placeholder="Select instance"
              data={instances?.map((e) => {return {value: e.id.toString(), label: e.name}})}
              value={instance.toString()}
              onChange={(v) => setInstance(Number(v))}
            />
            <Textarea
              pb={20}
              label="Description"
              value={description}
              onChange={(event: any) => setDescription(event.currentTarget.value)}
            />
            <PasswordInput
              pb={20}
              label="Admin password"
              value={adminPassword}
              withAsterisk={adminPassword == ""}
              onChange={(event: any) => setAdminPassword(event.currentTarget.value)}
              description="Anyone with the admin password can become admin of the raid"
            />
            <Switch
              pb={40}
              value={useSRPlus}
              onChange={(event: any) => setUseSRPlus(event.currentTarget.value)}
              label="Use SR+"
            />
            <Button onClick={createRaid} disabled={!instance || !adminPassword}>
              Create Raid
            </Button>
          </Paper>
        </Grid.Col>
      </Grid>
    </>
  )
}

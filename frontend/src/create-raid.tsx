import { useState, useEffect } from 'preact/hooks'
import { useNavigate } from 'react-router'
import { Grid, Paper, Title, Textarea, Select, useMantineTheme, Box, Button, Switch, PasswordInput } from '@mantine/core';
import type { Instance, CreateRaidRequest, GenericResponse, CreateRaidResponse } from '../types/types.ts'

export function CreateRaid() {
  const navigate = useNavigate();

  const [instances, setInstances] = useState<Instance[]>()

  const [instance, setInstance] = useState<number>()
  const [description, setDescription] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [useSRPlus, setUseSRPlus] = useState(false)

  function createRaid() {
    if (instance == undefined || adminPassword == undefined) {
      alert("Missing information")
      return
    }
    const request: CreateRaidRequest = {
      instance_id: instance,
      admin_password: adminPassword,
      use_sr_plus: useSRPlus,
      description: description
    }
    fetch("/api/new", { method: "POST", body: JSON.stringify(request) })
      .then(r => r.json())
      .then((j: GenericResponse<CreateRaidResponse>) => {
        if (j.error) {
            alert(j.error)
        } else if (j.data) {
          navigate(`/${j.data.raid_id}`)
        }
      })
  }

  useEffect(() => {
    fetch("/api/instances")
      .then(r => r.json())
      .then((j: GenericResponse<Instance[]>) => {
        if (j.error) {
            alert(j.error)
        } else if (j.data) {
          setInstances(j.data)
        }
      })
  }, [])

  return (
    <>
      <Grid gutter={0} justify="center">
        <Grid.Col span={{ base: 11, md:8, lg: 4 }}>
          <Paper shadow="sm" p="md">
            <Title pb={10} order={2}>Create a new raid</Title>
            <Select
              pb={20}
              withAsterisk={instance == undefined}
              label="Instance"
              placeholder="Select instance"
              data={instances?.map((e) => {return {value: e.id.toString(), label: e.name}})}
              value={(instance || "").toString()}
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

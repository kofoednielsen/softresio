import { useState, useEffect } from 'preact/hooks'
import type { GenericResponse, Raid, Sheet, User } from '../types/types.ts'
import { useParams } from 'react-router'
import { Text, Card, Group, Badge, Button, Image, Grid, Paper, Title } from '@mantine/core'

export function Raid() {
  const params = useParams();
  const [sheet, setSheet] = useState<Sheet>()
  const [user, setUser] = useState<User>()
  const [instance, setInstance] = useState()

  useEffect(() => {
    fetch(`/api/${params.raid_id}`).then(r => r.json()).then((j: GenericResponse<Sheet>) => {
      if (j.error) {
        alert(j.error)
      } else if (j.data) {
        setUser(j.user)
        setSheet(j.data) 
      }
    })
  }, [])

  useEffect(() => {
    if (sheet) {
      fetch("/api/instances").then((r) => r.json()).then((json) => {
        const matches = json.filter((e) => e.id == sheet.instance_id)
        console.log(matches)
        setInstance(matches[0])
      })
    }
  }, [sheet])

  if (sheet && instance) {
    return (
      <>
        <Grid justify="center">
          <Grid.Col span={{ base: 11, md:8 }}>
            <Paper shadow="md" p="xl">
              <Title>{instance.name}</Title>
            </Paper>
          </Grid.Col>
        </Grid>
      </>
    )
  }
}

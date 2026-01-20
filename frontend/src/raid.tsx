import { useState, useEffect } from 'preact/hooks'
import type { GenericResponse, Raid, Sheet, User, Instance } from '../types/types.ts'
import { useParams } from 'react-router'
import { ItemSelector } from './item-selector.tsx'
import { Text, Card, Group, Badge, Button, Image, Grid, Paper, Title } from '@mantine/core'

export function Raid() {
  const params = useParams();
  const [sheet, setSheet] = useState<Sheet>()
  const [user, setUser] = useState<User>()
  const [instance, setInstance] = useState<Instance>()

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
      fetch("/api/instances")
        .then(r => r.json())
        .then((j: GenericResponse<Instance[]>) => {
          if (j.error) {
              alert(j.error)
          } else if (j.data) {
            const matches = j.data.filter((i: Instance) => i.id == sheet.instance_id)
            if (matches.length == 1) {
              setInstance(matches[0])
            } else {
              alert("Could not find instance")
            }
          }
      })
    }
  }, [sheet])

  if (sheet && instance) {
    return (
      <>
        <Grid gutter={0} justify="center">
          <Grid.Col span={{ base: 11, md:4 }}>
            {/*
            <Paper shadow="sm" p="xl">
              <Title>{instance.name}</Title>
            </Paper>
             */} 
            <ItemSelector items={instance.items} />
          </Grid.Col>
        </Grid>
      </>
    )
  }
}

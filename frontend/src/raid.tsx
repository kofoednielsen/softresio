import { useEffect, useState } from "preact/hooks";
import type {
  GenericResponse,
  Instance,
  Raid,
  Sheet,
  User,
} from "../types/types.ts";
import { useParams } from "react-router";
import { ItemSelector } from "./item-selector.tsx";
import {
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Image,
  Paper,
  Text,
  Title,
} from "@mantine/core";

export function Raid() {
  const params = useParams();
  const [sheet, setSheet] = useState<Sheet>();
  const [user, setUser] = useState<User>();
  const [instance, setInstance] = useState<Instance>();

  useEffect(() => {
    fetch(`/api/${params.raid_id}`).then((r) => r.json()).then(
      (j: GenericResponse<Sheet>) => {
        if (j.error) {
          alert(j.error);
        } else if (j.data) {
          setUser(j.user);
          setSheet(j.data);
        }
      },
    );
  }, []);

  useEffect(() => {
    if (sheet) {
      fetch("/api/instances")
        .then((r) => r.json())
        .then((j: GenericResponse<Instance[]>) => {
          if (j.error) {
            alert(j.error);
          } else if (j.data) {
            const matches = j.data.filter((i: Instance) =>
              i.id == sheet.instance_id
            );
            if (matches.length == 1) {
              setInstance(matches[0]);
            } else {
              alert("Could not find instance");
            }
          }
        });
    }
  }, [sheet]);

  if (sheet && instance) {
    return (
      <>
        <Grid gutter={0} justify="center" style={{flex: 1}}>
          <Grid.Col span={{ base: 11, md: 4 }} style={{flex: 1}}>
            {
              /*
            <Paper shadow="sm" p="xl">
              <Title>{instance.name}</Title>
            </Paper>
             */
            }
            <ItemSelector items={instance.items} />
          </Grid.Col>
        </Grid>
      </>
    );
  }
}

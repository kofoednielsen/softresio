import { useEffect, useState } from "react";
import type {
  GenericResponse,
  Instance,
  Sheet,
  User,
} from "../types/types.ts";
import { useParams } from "react-router";
import { ItemSelector } from "./item-selector.tsx";
import {
  Grid,
  Paper,
  Title,
} from "@mantine/core";

export const Raid = () => {
  const params = useParams();
  const [sheet, setSheet] = useState<Sheet>();
  const [_user, setUser] = useState<User>();
  const [instance, setInstance] = useState<Instance>();

  useEffect(() => {
    fetch(`/api/raid/${params.raid_id}`).then((r) => r.json()).then(
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
              i.id == sheet.instanceId
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
        <Grid gutter={0} justify="center">
          <Grid.Col span={{ base: 11, md: 4 }}>
            <Paper shadow="sm" p="xl">
              <Title>{instance.name}</Title>
            </Paper>
            <br />
            <ItemSelector items={instance.items} sheet={sheet} />
            <br />
            <Paper shadow="sm" p="xl">
              SR list coming soon! (tm)
            </Paper>
            <br />
          </Grid.Col>
        </Grid>
      </>
    );
  }
}

import { useEffect, useState } from "preact/hooks";
import { useNavigate } from "react-router";
import {
  Box,
  Button,
  Grid,
  Paper,
  PasswordInput,
  Select,
  Switch,
  Textarea,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";

import type {
  CreateRaidRequest,
  CreateRaidResponse,
  GenericResponse,
  Instance,
  SrCount,
} from "../types/types.ts";

export function CreateRaid() {
  const navigate = useNavigate();

  const [instances, setInstances] = useState<Instance[]>();

  const [instanceId, setInstanceId] = useState<number>();
  const [description, setDescription] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [useSRPlus, setUseSRPlus] = useState(false);
  const [srCount, setSrCount] = useState<SrCount | undefined>();
  const [time, setTime] = useState<Date>(
    new Date(
      Math.ceil((new Date()).getTime() / (60 * 30 * 1000)) * 60 * 30 * 1000,
    ),
  );

  function createRaid() {
    if (instanceId == undefined || adminPassword == undefined) {
      alert("Missing information");
      return;
    }
    const request: CreateRaidRequest = {
      instance_id: instanceId,
      admin_password: adminPassword,
      use_sr_plus: useSRPlus,
      description: description,
    };
    fetch("/api/new", { method: "POST", body: JSON.stringify(request) })
      .then((r) => r.json())
      .then((j: GenericResponse<CreateRaidResponse>) => {
        if (j.error) {
          alert(j.error);
        } else if (j.data) {
          navigate(`/${j.data.raid_id}`);
        }
      });
  }

  useEffect(() => {
    fetch("/api/instances")
      .then((r) => r.json())
      .then((j: GenericResponse<Instance[]>) => {
        if (j.error) {
          alert(j.error);
        } else if (j.data) {
          setInstances(j.data);
        }
      });
  }, []);

  return (
    <>
      <Grid gutter={0} justify="center">
        <Grid.Col span={{ base: 11, md: 8, lg: 4 }}>
          <Paper shadow="sm" p="md">
            <Stack gap="md">
              <Title order={2}>Create a new raid</Title>
              <Select
                withAsterisk={instanceId == undefined}
                label="Instance"
                searchable
                placeholder="Select instance"
                data={instances?.map((e) => {
                  return { value: e.id.toString(), label: e.name };
                })}
                value={(instanceId || "").toString()}
                onChange={(v) => setInstanceId(Number(v))}
              />
              <Textarea
                label="Description"
                value={description}
                onChange={(event: any) =>
                  setDescription(event.currentTarget.value)}
              />

              <Stack gap={0}>
                <Group mb={3} p={0} gap={3}>
                  <Text size="sm">
                    Number of SRs
                  </Text>
                  <Text
                    size="sm"
                    c="var(--mantine-color-error)"
                    hidden={!!srCount}
                  >
                    *
                  </Text>
                </Group>
                <SegmentedControl
                  defaultValue=""
                  data={["1", "2", "3", "4"]}
                  w="100%"
                  withItemsBorders={false}
                  value={srCount?.toString()}
                  onChange={(value) => setSrCount(Number(value))}
                />
              </Stack>
              <DateTimePicker
                value={time}
                onChange={(value) => {
                  if (value) setTime(new Date(value));
                }}
                label="Pick date and time"
                placeholder="Pick date and time"
              />
              <Switch
                value={useSRPlus ? 1 : 0}
                onChange={(event: any) =>
                  setUseSRPlus(event.currentTarget.value)}
                label="Use SR+"
              />
              <PasswordInput
                label="Admin password"
                value={adminPassword}
                withAsterisk={adminPassword == ""}
                onChange={(event: any) =>
                  setAdminPassword(event.currentTarget.value)}
                description="Anyone with the admin password can become admin of the raid"
              />
              <Button
                mt="sm"
                onClick={createRaid}
                disabled={!instanceId || !adminPassword || !srCount}
              >
                Create Raid
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </>
  );
}

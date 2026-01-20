import { useEffect, useMemo, useState } from "preact/hooks";
import { memo } from "preact/compat";
import type { Item } from "../types/types.ts";
import {
  IconChevronDown,
  IconChevronUp,
  IconSearch,
} from "@tabler/icons-react";
import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Collapse,
  Divider,
  Group,
  HoverCard,
  Image,
  Input,
  MultiSelect,
  Paper,
  Stack,
  TextInput,
  Title,
  Select,
  ScrollArea
} from "@mantine/core";
import type { SelectProps } from "@mantine/core";
import { useDebounce } from "use-debounce";
import { Spotlight, spotlight } from "@mantine/spotlight";
import type { SpotlightActionData } from "@mantine/spotlight";
import "./tooltip.css";

const classes = {
  "Warrior": [
    "Arms",
    "Fury",
    "Protection"
  ],
  "Priest": [
    "Discipline",
    "Holy",
    "Shadow"
  ],
  "Mage": [
    "Arcane",
    "Fire",
    "Frost"
  ],
  "Rogue": [
    "Assassination",
    "Combat",
    "Subtlety"
  ],
  "Druid": [
    "Balance",
    "Feral Combat",
    "Restoration"
  ],
  "Paladin": [
    "Holy",
    "Protection",
    "Retribution"
  ],
  "Shaman": [
    "Elemental",
    "Enhancement",
    "Restoration"
  ],
  "Warlock": [
    "Affliction",
    "Demonology",
    "Destruction"
  ],
  "Hunter": [
    "Beast Mastery",
    "Marksmanship",
    "Survival"
  ]
}

const icons = {
  "Warrior": "class_warrior.png",
  "WarriorArms": "ability_rogue_eviscerate.png",
  "WarriorFury": "ability_warrior_innerrage.png",
  "WarriorProtection": "inv_shield_06.png",
  "Paladin": "class_paladin.png",
  "PaladinHoly": "spell_holy_holybolt.png",
  "PaladinProtection": "spell_holy_devotionaura.png",
  "PaladinRetribution": "spell_holy_auraoflight.png",
  "Hunter": "class_hunter.png",
  "HunterBeastMastery": "ability_hunter_beasttaming.png",
  "HunterMarksmanship": "ability_marksmanship.png",
  "HunterSurvival": "ability_hunter_swiftstrike.png",
  "Rogue": "class_rogue.png",
  "RogueAssassination": "ability_rogue_eviscerate.png",
  "RogueCombat": "ability_backstab.png",
  "RogueSubtlety": "ability_stealth.png",
  "Priest": "class_priest.png",
  "PriestDiscipline": "spell_holy_wordfortitude.png",
  "PriestHoly": "spell_holy_holybolt.png",
  "PriestShadow": "spell_shadow_shadowwordpain.png",
  "Shaman": "class_shaman.png",
  "ShamanElemental": "spell_nature_lightning.png",
  "ShamanEnhancement": "spell_nature_lightningshield.png",
  "ShamanRestoration": "spell_nature_magicimmunity.png",
  "Mage": "class_mage.png",
  "MageArcane": "spell_holy_magicalsentry.png",
  "MageFire": "spell_fire_flamebolt.png",
  "MageFrost": "spell_frost_frostbolt02.png",
  "Warlock": "class_warlock.png",
  "WarlockAffliction": "spell_shadow_deathcoil.png",
  "WarlockDemonology": "spell_shadow_metamorphosis.png",
  "WarlockDestruction": "spell_shadow_rainoffire.png",
  "Druid": "class_druid.png",
  "DruidBalance": "spell_nature_starfall.png",
  "DruidFeralCombat": "ability_racial_bearform.png",
  "DruidRestoration": "spell_nature_healingtouch.png"
}

const ClassIcon = ({iconId}: {iconId: string}) => {
  return (
    <Image
      radius="sm"
      h={20}
      w="auto"
      src={`https://talents.turtlecraft.gg/icons/${icons[iconId]}`}
    />
  )
}

const renderSelectOption: SelectProps['renderOption'] = ({ option, checked }) => (
  <Group flex="1" gap="xs">
    <ClassIcon iconId={option.value}/>
    {option.label}
  </Group>
);

export function ItemSelector({ items }: { items: Item[] }) {
  const [unfolded, setUnfolded] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>();
  const [selectedSpec, setSelectedSpec] = useState<string | null>();
  const [characterName, setCharacterName] = useState("");
  const [filteredItems, setFilteredItems] = useState(items);

  useEffect(() => {
    setFilteredItems(items.filter((item) => item.name.includes(search)).slice(0,10));
  }, [search]);

  return (
    <>
      <Paper shadow="sm" p="md" style={{flex: 1}}>
        <Stack>
          <Title order={2}>Choose your SR</Title>
          <TextInput
            value={characterName}
            onChange={(event: any) =>
              setCharacterName(event.currentTarget.value)}
            label="Character name"
            placeholder="Character name"
          />
          <Group grow>
            <Select
              placeholder="Class"
              searchable
              value={selectedClass}
              onChange={(value) => { setSelectedSpec(null); setSelectedClass(value)}}
              data={Object.keys(classes)}
              label="Class"
              renderOption={renderSelectOption}
              leftSection={selectedClass ? <ClassIcon iconId={selectedClass}/> : undefined}
            />
            <Select
              placeholder="Specialization"
              disabled={!selectedClass}
              onChange={setSelectedSpec}
              value={selectedSpec}
              data={classes[selectedClass]?.map((spec) => ({value: (selectedClass+spec).replace(" ", ""), label: spec}))}
              renderOption={renderSelectOption}
              leftSection={selectedSpec ? <ClassIcon iconId={selectedSpec}/> : undefined}
              label="Specialization"
            />
          </Group>
          <Divider />
          <Group grow>
            <Select
              placeholder="Slot"
              searchable
              clearable
              data={["Trinket", "Ring", "Chest", "Head"]}
            />
            <Select
              placeholder="Type"
              searchable
              clearable
              data={["Plate", "Cloth", "Mail"]}
            />
          </Group>
          <Input
            value={search}
            onChange={(event: any) => setSearch(event.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
            placeholder="Search.."
          >
          </Input>
        </Stack>
        <br />
        <Divider mb={8} />
        <ItemList items={filteredItems} />
      </Paper>
    </>
  );
}

const ItemList = memo(({ items }: { items: Item[] }) => {
  return (
    <ScrollArea flex={1} style={{overflow: "scroll"}}>
      {items.map((item) => (
        <Box pb={10} key={item.id}>
          <Stack>
            <Group justify="space-between">
              <HoverCard>
                <HoverCard.Target>
                  <Group wrap="nowrap">
                    <Image
                      style={{ filter: "drop-shadow(0px 0px 2px)" }}
                      ml="sm"
                      className={`q${item.quality}`}
                      radius="sm"
                      h={20}
                      w="auto"
                      src={`https://database.turtlecraft.gg/images/icons/medium/${item.icon}`}
                    />
                    <Title className={`q${item.quality}`} order={6}>
                      {item.name}
                    </Title>
                  </Group>
                </HoverCard.Target>
                <HoverCard.Dropdown style={{ margin: 0, padding: 0 }}>
                  <div
                    class="tt-wrap"
                    dangerouslySetInnerHTML={{ __html: item.tooltip }}
                  />
                </HoverCard.Dropdown>
              </HoverCard>
              <Group>
                <Checkbox size="md" />
              </Group>
            </Group>
          </Stack>
          <Divider mt={8} />
        </Box>
      ))}
    </ScrollArea>
  );
});

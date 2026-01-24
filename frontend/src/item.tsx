import { useHover } from "@mantine/hooks"
import { LongPressCallbackReason, useLongPress } from "use-long-press"
import type { Item } from "../types/types.ts"
import { type RowComponentProps } from "react-window"
import {
  Checkbox,
  CloseButton,
  Group,
  Image,
  Title,
  Tooltip,
} from "@mantine/core"

const isTouchScreen = globalThis.matchMedia("(pointer: coarse)").matches

export const ItemNameAndIcon = ({ item }: { item: Item }) => (
  <Group wrap="nowrap">
    <Image
      onClick={(e) => {
        e.stopPropagation()
        globalThis.open(
          `https://database.turtlecraft.gg/?item=${item.id}`,
        )
      }}
      style={{
        filter: "drop-shadow(0px 0px 2px)",
        border: "1px solid rgba(255,255,255,0.3)",
      }}
      className={`q${item.quality}`}
      radius="sm"
      h={24}
      w={24}
      src={`https://database.turtlecraft.gg/images/icons/medium/${item.icon}`}
    />
    <Title className={`q${item.quality}`} order={6} lineClamp={1}>
      {item.name}
    </Title>
  </Group>
)

const reservedByOthers = (srCount: number) => {
  const otherSRs = srCount - 1

  let srMaybePlural = null
  if (otherSRs > 1) {
    srMaybePlural = "SRs"
  } else {
    srMaybePlural = "SR"
  }

  if (otherSRs <= 0) {
    return null
  }

  return <p>({otherSRs} other {srMaybePlural})</p>
}

export const SelectableItem = ({
  item,
  onItemClick,
  onItemLongClick,
  selectedItemIds,
  showTooltipItemId,
  srCount,
  deleteMode,
  style,
}: {
  onItemClick: (itemId: number) => void
  onItemLongClick: (itemId: number) => void
  selectedItemIds?: number[]
  showTooltipItemId?: number
  item: Item
  srCount: number
  deleteMode?: boolean
  style?: React.CSSProperties
}) => {
  const { hovered, ref } = useHover()
  const handlers = useLongPress(() => onItemLongClick(item.id), {
    onCancel: (_, meta) => {
      if (meta.reason == LongPressCallbackReason.CancelledByRelease) {
        onItemClick(item.id)
      }
    },
  })

  const highlight = !isTouchScreen && hovered || showTooltipItemId == item.id ||
    selectedItemIds?.includes(item.id)

  return (
    <Tooltip
      m={0}
      p={0}
      key={item.id}
      opened={showTooltipItemId == item.id || (!isTouchScreen && hovered)}
      label={
        <div
          className="tt-wrap"
          dangerouslySetInnerHTML={{ __html: item.tooltip }}
        />
      }
    >
      <Group
        {...handlers()}
        ref={ref}
        style={style}
        justify="space-between"
        wrap="nowrap"
        className={`item-list-element ${
          highlight ? "item-list-element-highlight" : ""
        }`}
        p={8}
        key={item.id}
        mr={deleteMode ? 0 : 10}
      >
        <ItemNameAndIcon item={item} />
        {reservedByOthers(srCount)}
        {deleteMode
          ? <CloseButton />
          : <Checkbox checked={selectedItemIds?.includes(item.id)} size="md" />}
      </Group>
    </Tooltip>
  )
}

export const ReactWindowSelectableItem = ({
  index,
  items,
  selectedItemIds,
  onItemClick,
  onItemLongClick,
  showTooltipItemId,
  srCounter,
  style,
  deleteMode = false,
}: RowComponentProps<{
  onItemClick: (item_id: number) => void
  onItemLongClick: (item_id: number) => void
  selectedItemIds: number[]
  items: Item[]
  srCounter: Map
  showTooltipItemId?: number
  deleteMode?: boolean
}>) => {
  return (
    <SelectableItem
      item={items[index]}
      selectedItemIds={selectedItemIds}
      onItemClick={onItemClick}
      onItemLongClick={onItemLongClick}
      showTooltipItemId={showTooltipItemId}
      srCount={srCounter.get(items[index].id) || 0}
      deleteMode={deleteMode}
      style={style}
    />
  )
}

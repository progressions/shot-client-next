import { ListItemText, ListItem } from "@mui/material"
import type { ShotDetails } from "@/types"
import { Character, Vehicle } from "@/components/encounters"

interface ShotDetailItemProps {
  detail: ShotDetails
}

export default function ShotDetailItem({ detail }: ShotDetailItemProps) {
  const componentMap: Record<string, (detail: ShotDetails) => JSX.Element> = {
    Character: (detail) => <Character detail={detail} />,
    Vehicle: (detail) => <Vehicle detail={detail} />,
  }

  const SelectedComponent = componentMap[detail.entity_class] || (() => <></>)

  return (
    <ListItem sx={{ py: 0.5 }}>
      <ListItemText
        primary={detail.name}
        secondary={<SelectedComponent detail={detail} />}
      />
    </ListItem>
  )
}

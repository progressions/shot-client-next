import { ListItemText, ListItem } from "@mui/material"
import type { ShotDetails } from "@/types"
import { Character, Vehicle } from "@/components/encounters"
import { CharacterLink, VehicleLink } from "@/components/ui"

interface ShotDetailItemProps {
  detail: ShotDetails
}

export default function ShotDetailItem({ detail }: ShotDetailItemProps) {
  console.log("detail.character", detail)
  if (detail.character) {
    return (
      <ListItem sx={{ py: 0.5 }}>
        <ListItemText
          primary={title}
          secondary={<Character detail={detail.character} />}
        />
      </ListItem>
    )
  }
}

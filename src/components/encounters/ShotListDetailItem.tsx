import { ListItemText, ListItem } from "@mui/material"
import type { ShotDetails } from "@/types"
import { Character } from "@/components/encounters"

interface ShotDetailItemProps {
  detail: ShotDetails
}

export default function ShotDetailItem({ detail }: ShotDetailItemProps) {
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

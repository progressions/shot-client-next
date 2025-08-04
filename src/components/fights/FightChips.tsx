import { Chipset } from "@/components/ui"
import { Chip } from "@mui/material"
import type { Fight } from "@/types"

type FightChipsProps = {
  fight: Fight
}

export default function FightChips({ fight }: FightChipsProps) {
  return (
    <Chipset>
      {fight.season && <Chip label={`Season ${fight.season}`} size="small" />}
      {fight.session && (
        <Chip label={`Session ${fight.session}`} size="small" />
      )}
      {!fight.started_at && (
        <Chip label="Unstarted" size="small" color="warning" />
      )}
      {fight.started_at && (
        <Chip
          label={`Started: ${new Date(fight.started_at).toLocaleDateString()}`}
          size="small"
          color="warning"
        />
      )}
      {fight.ended_at && (
        <Chip
          label={`Ended: ${new Date(fight.ended_at).toLocaleDateString()}`}
          size="small"
          color="warning"
        />
      )}
    </Chipset>
  )
}

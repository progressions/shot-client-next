import type { Encounter, Fight, Character} from "@/types"
import { ListItemText, List, ListItem, ListSubheader, Box, Stack, Typography } from "@mui/material"
import { FormActions, useForm } from "@/reducers"

type ShotCounterProps = {
  encounter: Encounter
}

type FormData = Encounter

export default function ShotCounter({ encounter: initialEncounter }: ShotCounterProps) {
  const { formState, dispatchForm } = useForm<FormData>(initialEncounter)
  const { saving, errors, status } = formState
  const { data: encounter } = formState

  return (
    <List>
      { encounter.shots.map(([shot, characters], index) => (<>
        <ListSubheader sx={{fontSize: "1.5rem", fontWeight: "bold", width: "100%"}} key={index}>{shot}</ListSubheader>
        { characters.map((character: Character) => (
          <ListItem>
            <ListItemText primary={character.name} secondary={JSON.stringify(character)} />
          </ListItem>
        )) }
      </>)) }
    </List>
  )
}

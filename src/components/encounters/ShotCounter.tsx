import type { Encounter, Character } from "@/types"
import {
  ListItemIcon,
  ListItemText,
  List,
  ListItem,
  ListSubheader,
  Box,
} from "@mui/material"
import { CharacterAvatar } from "@/components/avatars"
import { useForm } from "@/reducers"
import { CharacterLink } from "@/components/ui"
import { Wounds, Character } from "@/components/encounters"

type ShotCounterProps = {
  encounter: Encounter
}

type FormData = Encounter

export default function ShotCounter({
  encounter: initialEncounter,
}: ShotCounterProps) {
  const { formState, dispatchForm } = useForm<FormData>(initialEncounter)
  const { saving, errors, status } = formState
  const { data: encounter } = formState

  return (
    <List>
      {encounter.shots.map(([shot, characters], index) => (
        <Box key={`${shot}-${index}`}>
          <ListSubheader
            sx={{
              textAlign: "right",
              fontSize: "1.5rem",
              fontWeight: "bold",
              width: "100%",
              borderRadius: "8px 8px 1px 1px",
            }}
            key={index}
          >
            {shot}
          </ListSubheader>
          {characters.map((character: Character) => (
            <ListItem key={`${shot}-${character.id}`}>
              <ListItemIcon sx={{ display: { xs: "none", md: "flex" } }}>
                <CharacterAvatar character={character} />
              </ListItemIcon>
              <ListItemIcon>
                <Wounds character={character} />
              </ListItemIcon>
              <ListItemText
                primary={<CharacterLink character={character} />}
                secondary={<Character character={character} />}
              />
            </ListItem>
          ))}
        </Box>
      ))}
    </List>
  )
}

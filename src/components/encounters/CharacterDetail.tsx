import { motion } from "framer-motion"
import type { Character } from "@/types"
import { ListItemIcon, ListItemText, ListItem } from "@mui/material"
import { CharacterHeader, Wounds, Character } from "@/components/encounters"
import { useEncounter } from "@/contexts"

type CharacterDetailProps = {
  character: Character
}

export default function CharacterDetail({ character }: CharacterDetailProps) {
  const { encounter, encounterState, dispatchEncounter } = useEncounter()

  return (
    <motion.div
      key={character.id}
      layout
      layoutId={`character-${character.id}`}
      transition={{ duration: 0.75 }}
    >
      <ListItem sx={{ alignItems: "flex-start" }}>
        <ListItemIcon>
          <Wounds character={character} />
        </ListItemIcon>
        <ListItemText
          sx={{ ml: 2 }}
          primary={<CharacterHeader character={character} />}
          secondary={<Character character={character} />}
        />
      </ListItem>
    </motion.div>
  )
}

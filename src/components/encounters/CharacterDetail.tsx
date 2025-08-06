import { motion } from "motion/react"
import type { Character } from "@/types"
import { ListItemIcon, ListItemText, ListItem } from "@mui/material"
import { CharacterHeader, Wounds, Character } from "@/components/encounters"
import { transition } from "@/components/encounters/Encounter"

type CharacterDetailProps = {
  character: Character
}

export default function CharacterDetail({ character }: CharacterDetailProps) {
  return (
    <motion.div
      key={character.id}
      layout
      layoutId={`character-${character.id}`}
      transition={transition}
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

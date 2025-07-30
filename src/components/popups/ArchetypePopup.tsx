import { Box, Typography, Stack } from "@mui/material"
import styles from "@/components/editor/Editor.module.scss"
import { RichTextRenderer } from "@/components/editor"
import ReactDOMServer from "react-dom/server"
import type { PopupProps } from "@/types"

const descriptions: Record<PopupProps["id"], React.ReactElement> = {
  Killer: (
    <p>
      A character who is a ruthless and efficient killer, often driven by
      personal motives or a dark past.
    </p>
  ),
  "Everyday Hero": (
    <p>
      A character who embodies the spirit of the common person, often facing
      challenges with resilience and determination.
    </p>
  ),
  "Magic Cop": (
    <p>
      A character who combines the roles of law enforcement and magical
      abilities, often solving crimes with a supernatural twist.
    </p>
  ),
  Cyborg: (
    <p>
      A character who is part human and part machine, often enhancing their
      abilities with technology.
    </p>
  ),
  Sorcerer: (
    <p>
      A character who wields powerful magic, often with a deep understanding of
      the mystical arts.
    </p>
  ),
  "Ex-Special Forces": (
    <p>
      A character with a background in elite military service, bringing combat
      skills and tactical expertise to the table.
    </p>
  ),
  "Exorcist Monk": (
    <p>
      A character who combines monastic discipline with the ability to banish
      evil spirits, often using spiritual practices and rituals.
    </p>
  ),
  "Martial Artist": (
    <p>
      A character who has mastered the art of combat through rigorous training
      and discipline, often relying on physical prowess and technique.
    </p>
  ),
  "Gene Freak": (
    <p>
      A character who has undergone genetic modifications, resulting in enhanced
      abilities or unique traits that set them apart from others.
    </p>
  ),
  Spy: (
    <p>
      A character who operates in secrecy, gathering intelligence and often
      engaging in espionage activities to achieve their goals.
    </p>
  ),
  Gambler: (
    <p>
      A character who thrives on risk and chance, often using their luck and
      cunning to navigate dangerous situations.
    </p>
  ),
  Swordsman: (
    <p>
      A character who is skilled in the art of swordsmanship, often relying on
      their agility and precision in combat.
    </p>
  ),
  Drifter: (
    <p>
      A character who wanders from place to place, often with no fixed home, and
      has a mysterious past that shapes their actions.
    </p>
  ),
  Archer: (
    <p>
      A character who excels in archery, using their keen eyesight and steady
      hand to hit targets from a distance.
    </p>
  ),
  Sifu: (
    <p>
      A character who is a master of martial arts, often serving as a mentor or
      teacher to others, imparting wisdom and skills.
    </p>
  ),
  "Maverick Cop": (
    <p>
      A character who operates outside the bounds of traditional law
      enforcement, often bending the rules to achieve justice.
    </p>
  ),
  "Transformed Animal": (
    <p>
      A character with latent animal traits or abilities, often resulting from a
      transformation or mutation that grants them unique powers.
    </p>
  ),
  "Snake Spirit": (
    <p>
      A character who embodies the cunning and stealth of a snake, often using
      their agility and charm to navigate complex situations.
    </p>
  ),
  Ninja: (
    <p>
      A character who is a master of stealth and combat, often using agility and
      cunning to achieve their objectives without being detected.
    </p>
  ),
  "Big Bruiser": (
    <p>
      A character who relies on brute strength and physical power, often
      intimidating others with their sheer size and force.
    </p>
  ),
}

export default function ArchetypePopup({ id }: PopupProps) {
  const description = descriptions[id] || <p>Unknown character type.</p>
  const html = ReactDOMServer.renderToStaticMarkup(description)

  return (
    <Box className={styles.mentionPopup}>
      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
        <Typography>{id}</Typography>
      </Stack>
      <Typography variant="caption" sx={{ textTransform: "uppercase" }}>
        Archetype
      </Typography>
      <Box mt={1}>
        <RichTextRenderer html={html} />
      </Box>
    </Box>
  )
}

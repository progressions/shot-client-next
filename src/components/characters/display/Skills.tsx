import { Typography, Stack, Box } from "@mui/material"
import type { Character } from "@/types"
import { CS } from "@/services"

type SkillsProps = {
  character: Character
}

export default function Skills({ character }: SkillsProps) {
  const skillValues = CS.knownSkills({ skills: [], ...character })

  if (skillValues.length === 0) return null

  return (
    <Box>
      <Typography variant="h6">Skills</Typography>
      <Stack direction="column">
        {skillValues.map((skill, index) => (
          <Typography key={index} variant="body1" sx={{ color: "#ffffff" }}>
            {skill[0]}: {skill[1]}
          </Typography>
        ))}
      </Stack>
    </Box>
  )
}

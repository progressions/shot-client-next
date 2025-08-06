import { Box, IconButton } from "@mui/material"
import { useClient, useEncounter } from "@/contexts"
import { type Character } from "@/types"
import { Icon } from "@/components/ui"

type ActionsProps = {
  character: Character
}

export default function Actions({ character }: ActionsProps) {
  const { client } = useClient()
  const { encounter } = useEncounter()

  const spendShots = async () => {
    console.log("character", character)
    const response = await client.actCharacter(encounter, character, 3)
    if (response.error) {
      console.error("Error acting character:", response.error)
    } else {
      console.log("Character acted successfully:", response.data)
    }
  }

  return (
    <Box component="span" sx={{ display: "flex", alignItems: "center" }}>
      <IconButton onClick={spendShots}>
        <Icon keyword="Actions" size={24} />
      </IconButton>
    </Box>
  )
}

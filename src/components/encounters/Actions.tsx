import type { Character, Encounter } from "@/types"
import { Box, IconButton } from "@mui/material"
import { useClient, useEncounter } from "@/contexts"
import { FormActions } from "@/reducers"
import { Icon } from "@/components/ui"

type ActionsProps = {
  character: Character
}

export default function Actions({ character }: ActionsProps) {
  const { client } = useClient()
  const { encounter, dispatchEncounter } = useEncounter()

  const spendShots = async () => {
    try {
      const response = await client.actCharacter(encounter, character, 3)
      if (response.data) {
        const updatedEncounter: Encounter = response.data
        dispatchEncounter({
          type: FormActions.UPDATE,
          name: "encounter",
          value: updatedEncounter,
        })
      } else {
        console.error("Error acting character: No data in response")
      }
    } catch (err) {
      console.error("Error acting character:", err)
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

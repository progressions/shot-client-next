import type { Entity, Encounter } from "@/types"
import { Box, IconButton } from "@mui/material"
import { useClient, useEncounter } from "@/contexts"
import { FormActions } from "@/reducers"
import { Icon } from "@/components/ui"

type ActionsProps = {
  entity: Entity
}

export default function Actions({ entity }: ActionsProps) {
  const { client } = useClient()
  const { encounter, dispatchEncounter } = useEncounter()

  const spendShots = async () => {
    try {
      const response = await client.spendShots(encounter, entity, 3)
      if (response.data) {
        const updatedEncounter: Encounter = response.data
        dispatchEncounter({
          type: FormActions.UPDATE,
          name: "encounter",
          value: updatedEncounter,
        })
      } else {
        console.error("Error acting entity: No data in response")
      }
    } catch (err) {
      console.error("Error acting entity:", err)
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

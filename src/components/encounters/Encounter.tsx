"use client"
import { useEffect } from "react"
import { FormControl, FormHelperText, Box } from "@mui/material"
import {
  SpeedDialMenu,
  Alert,
  NameEditor,
  HeroImage,
  EditableRichText,
} from "@/components/ui"
import { FightChips } from "@/components/fights"
import { FormActions } from "@/reducers"
import { Encounter } from "@/types"
import { ShotCounter } from "@/components/encounters"
import { useEncounter } from "@/contexts"

export default function Encounter() {
  const {
    dispatchEncounter,
    encounterState,
    encounter,
    updateEncounter,
    deleteEncounter,
    changeAndSaveEncounter,
  } = useEncounter()
  const { errors, status } = encounterState

  useEffect(() => {
    document.title = encounter.name ? `${encounter.name} - Chi War` : "Chi War"
  }, [encounter.name])

  const setEncounter = (updatedEncounter: Encounter) => {
    dispatchEncounter({
      type: FormActions.UPDATE,
      name: "entity",
      value: updatedEncounter,
    })
  }

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <SpeedDialMenu onDelete={deleteEncounter} />
      <HeroImage
        entity={encounter}
        setEntity={setEncounter}
        pageContext="encounter"
        height={200}
      />
      <FightChips fight={encounter} />
      <Alert status={status} />
      <FormControl fullWidth margin="normal" error={!!errors.name}>
        <NameEditor
          entity={encounter}
          setEntity={setEncounter}
          updateEntity={updateEncounter}
        />
        {errors.name && <FormHelperText>{errors.name}</FormHelperText>}
      </FormControl>
      <FormControl fullWidth margin="normal" error={!!errors.description}>
        <EditableRichText
          name="description"
          html={encounter.description}
          editable={true}
          onChange={changeAndSaveEncounter}
          fallback="No description available."
        />
        {errors.description && (
          <FormHelperText>{errors.description}</FormHelperText>
        )}
      </FormControl>
      <ShotCounter />
    </Box>
  )
}

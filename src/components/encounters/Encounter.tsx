"use client"
import { useEffect } from "react"
import { FormControl, FormHelperText, Box } from "@mui/material"
import {
  Alert,
  NameEditor,
  HeroImage,
  SpeedDialMenu,
  EditableRichText,
} from "@/components/ui"
import { useCampaign } from "@/contexts"
import { FightChips } from "@/components/fights"
import { useEntity } from "@/hooks"
import { FormActions, useForm } from "@/reducers"
import { Encounter } from "@/types"
import { ShotCounter } from "@/components/encounters"
import { useEncounter } from "@/contexts"

export default function Encounter() {
  const { campaignData } = useCampaign()
  const { dispatchEncounter, encounterState, encounter, weapons, schticks } = useEncounter()
  const { saving, errors, status } = encounterState

  console.log("encounter", encounter)
  console.log("weapons", weapons)

  const deleteEntity = () => {}
  const updateEntity = () => {}
  const handleChangeAndSave = () => {}

  useEffect(() => {
    document.title = encounter.name ? `${encounter.name} - Chi War` : "Chi War"
  }, [encounter.name])

  useEffect(() => {
    if (
      campaignData?.encounter &&
      campaignData.encounter.id === encounter.id
    ) {
      dispatchEncounter({
        type: FormActions.EDIT,
        name: "data",
        value: campaignData.encounter,
      })
    }
  }, [campaignData, encounter, dispatchEncounter])

  const setEncounter = (updatedEncounter: Encounter) => {
    dispatchEncounter({
      type: FormActions.EDIT,
      name: "data",
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
          updateEntity={updateEntity}
        />
        {errors.name && <FormHelperText>{errors.name}</FormHelperText>}
      </FormControl>
      <FormControl fullWidth margin="normal" error={!!errors.description}>
        <EditableRichText
          name="description"
          html={encounter.description}
          editable={true}
          onChange={handleChangeAndSave}
          fallback="No description available."
        />
        {errors.description && (
          <FormHelperText>{errors.description}</FormHelperText>
        )}
      </FormControl>
      <ShotCounter encounter={encounter} />
    </Box>
  )
}

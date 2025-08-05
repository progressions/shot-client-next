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
import { ShotList } from "@/components/encounters"

interface EncounterProperties {
  encounter: Encounter
}

export default function Encounter({
  encounter: initialEncounter,
}: EncounterProperties) {
  const { campaignData } = useCampaign()
  const { formState, dispatchForm } = useForm<Encounter>(initialEncounter)
  const { errors, status, data: encounter } = formState
  const { updateEntity, deleteEntity, handleChangeAndSave } = useEntity(
    encounter,
    dispatchForm
  )

  console.log("encounter", encounter)

  useEffect(() => {
    document.title = encounter.name ? `${encounter.name} - Chi War` : "Chi War"
  }, [encounter.name])

  useEffect(() => {
    if (
      campaignData?.encounter &&
      campaignData.encounter.id === initialEncounter.id
    ) {
      dispatchForm({
        type: FormActions.EDIT,
        name: "data",
        value: campaignData.encounter,
      })
    }
  }, [campaignData, initialEncounter, dispatchForm])

  const setEncounter = (updatedEncounter: Encounter) => {
    dispatchForm({
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
      <SpeedDialMenu onDelete={deleteEntity} />
      <HeroImage
        entity={encounter}
        setEntity={setEncounter}
        pageContext="play"
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
      <ShotList shots={encounter.shots} />
    </Box>
  )
}

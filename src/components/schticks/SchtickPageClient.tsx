"use client"

import { useEffect } from "react"
import { FormControl, FormHelperText, Box } from "@mui/material"
import type { Schtick } from "@/types"
import { useCampaign } from "@/contexts"
import { EditCategoryPath, SchtickChips } from "@/components/schticks"
import {
  Alert,
  EditableRichText,
  HeroImage,
  SpeedDialMenu,
  SectionHeader,
  NameEditor,
  InfoLink,
  Icon,
} from "@/components/ui"
import { useEntity } from "@/hooks"
import { FormActions, useForm } from "@/reducers"

interface SchtickPageClientProperties {
  schtick: Schtick
}

type FormStateData = Schtick & {
  image?: File | null
}

export default function SchtickPageClient({
  schtick: initialSchtick,
}: SchtickPageClientProperties) {
  const { campaignData } = useCampaign()
  const { formState, dispatchForm } = useForm<FormStateData>({
    ...initialSchtick,
    image: null,
  })
  const { status, errors } = formState
  const schtick = formState.data

  const { updateEntity, deleteEntity, handleChangeAndSave } = useEntity(
    schtick,
    dispatchForm
  )

  const setSchtick = (schtick: Schtick) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "entity",
      value: schtick,
    })
  }

  useEffect(() => {
    document.title = schtick.name ? `${schtick.name} - Chi War` : "Chi War"
  }, [schtick.name])

  useEffect(() => {
    if (
      campaignData?.schtick &&
      campaignData.schtick.id === initialSchtick.id
    ) {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "entity",
        value: campaignData.schtick,
      })
    }
  }, [campaignData, initialSchtick, dispatchForm])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <SpeedDialMenu onDelete={deleteEntity} />
      <HeroImage entity={schtick} setEntity={setSchtick} />
      <Alert status={status} />
      <FormControl fullWidth margin="normal" error={!!errors.name}>
        <NameEditor
          entity={schtick}
          setEntity={setSchtick}
          updateEntity={updateEntity}
        />
        {errors.name && <FormHelperText>{errors.name}</FormHelperText>}
      </FormControl>
      <SchtickChips schtick={schtick} />

      <EditCategoryPath
        schtick={schtick}
        updateEntity={updateEntity}
        state={formState}
      />
      <SectionHeader title="Description" icon={<Icon keyword="Schtick" />}>
        A description of the Schtick, including whether it costs a{" "}
        <InfoLink info="Shot" />
        or <InfoLink info="Chi" /> to activate, who it affects, and what its
        effects are.
      </SectionHeader>
      <EditableRichText
        name="description"
        html={schtick.description}
        editable={true}
        onChange={handleChangeAndSave}
        fallback="No description available."
      />
    </Box>
  )
}

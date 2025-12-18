"use client"

import { useEffect } from "react"
import { FormControl, FormHelperText, Box } from "@mui/material"
import type { Schtick } from "@/types"
import { useCampaign, useClient } from "@/contexts"
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
import { EntityActiveToggle } from "@/components/common"
import { PrerequisiteSchtickAutocomplete } from "@/components/autocomplete"
import { useEntity } from "@/hooks"
import { FormActions, useForm } from "@/reducers"
import Link from "next/link"
import { Typography } from "@mui/material"

interface ShowProperties {
  schtick: Schtick
}

type FormStateData = {
  entity: Schtick & {
    image?: File | null
  }
}

export default function Show({ schtick: initialSchtick }: ShowProperties) {
  const { subscribeToEntity, campaign } = useCampaign()
  const { user } = useClient()
  const { formState, dispatchForm } = useForm<FormStateData>({
    entity: initialSchtick,
  })
  const { status, errors } = formState
  const schtick = formState.data.entity

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

  // Subscribe to schtick updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("schtick", data => {
      if (data && data.id === initialSchtick.id) {
        dispatchForm({
          type: FormActions.UPDATE,
          name: "entity",
          value: { ...data },
        })
      }
    })
    return unsubscribe
  }, [subscribeToEntity, initialSchtick.id, dispatchForm])

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
      <SectionHeader title="Prerequisite" icon={<Icon keyword="Schtick" />}>
        A schtick that the character must already have before they can learn
        this schtick.
      </SectionHeader>
      {schtick.prerequisite && schtick.prerequisite.id && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
            Current prerequisite:
          </Typography>
          <Link
            href={`/schticks/${schtick.prerequisite.id}`}
            style={{ color: "#ffc107", textDecoration: "none" }}
          >
            {schtick.prerequisite.name || "Unknown Schtick"}
            {schtick.prerequisite.category &&
              ` (${schtick.prerequisite.category})`}
          </Link>
        </Box>
      )}
      <Box sx={{ mb: 3 }}>
        <PrerequisiteSchtickAutocomplete
          value={schtick.prerequisite_id || null}
          onChange={async prerequisiteId => {
            await handleChangeAndSave({
              target: { name: "prerequisite_id", value: prerequisiteId },
            })
          }}
          category={schtick.category}
          path={schtick.path}
          exclude={[schtick.id]}
        />
      </Box>
      <SectionHeader title="Description" icon={<Icon keyword="Schtick" />}>
        A description of the Schtick, including whether it costs a{" "}
        <InfoLink info="Shot" /> or <InfoLink info="Chi" /> to activate, who it
        affects, and what its effects are.
      </SectionHeader>
      <EditableRichText
        name="description"
        html={schtick.description}
        editable={true}
        onChange={handleChangeAndSave}
        fallback="No description available."
      />
      {(user?.admin || (campaign && user?.id === campaign.gamemaster_id)) && (
        <>
          <SectionHeader
            title="Administrative Controls"
            icon={<Icon keyword="Administration" />}
          >
            Manage the visibility and status of this schtick.
          </SectionHeader>
          <EntityActiveToggle
            entity={schtick}
            handleChangeAndSave={handleChangeAndSave}
          />
        </>
      )}
    </Box>
  )
}

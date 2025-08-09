"use client"

import { VscGithubAction } from "react-icons/vsc"
import { useEffect } from "react"
import { FormControl, FormHelperText, Alert, Box } from "@mui/material"
import type { Weapon } from "@/types"
import { useCampaign } from "@/contexts"
import { WeaponChips, Stats, EditJunctureCategory } from "@/components/weapons"
import { useToast } from "@/contexts"
import {
  SectionHeader,
  EditableRichText,
  HeroImage,
  SpeedDialMenu,
  NameEditor,
} from "@/components/ui"
import { useEntity } from "@/hooks"
import { FormActions, useForm } from "@/reducers"

export const junctureColors: Record<
  string,
  { main: string; rgb: string; contrastText: string }
> = {
  Past: {
    main: "#6D28D9",
    rgb: "rgb(109, 40, 217)",
    contrastText: "#FFFFFF",
  },
  Modern: {
    main: "#047857",
    rgb: "rgb(4, 120, 87)",
    contrastText: "#FFFFFF",
  },
  Ancient: {
    main: "#B45309",
    rgb: "rgb(180, 83, 9)",
    contrastText: "#FFFFFF",
  },
  Future: {
    main: "#1E40AF",
    rgb: "rgb(30, 64, 175)",
    contrastText: "#FFFFFF",
  },
}

interface ShowProperties {
  weapon: Weapon
}

type FormStateData = {
  entity: Weapon & {
    image?: File | null
  }
}

export default function Show({ weapon: initialWeapon }: ShowProperties) {
  const { campaignData } = useCampaign()
  const { toastError } = useToast()
  const { formState, dispatchForm } = useForm<FormStateData>({
    entity: initialWeapon,
  })
  const { status, errors = {} } = formState
  const weapon = formState.data.entity
  const { deleteEntity, updateEntity, handleChangeAndSave } = useEntity<Weapon>(
    weapon,
    dispatchForm
  )

  useEffect(() => {
    document.title = weapon.name ? `${weapon.name} - Chi War` : "Chi War"
  }, [weapon.name])

  useEffect(() => {
    if (campaignData?.weapon && campaignData.weapon.id === initialWeapon.id) {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "entity",
        value: campaignData.weapon,
      })
    }
  }, [campaignData, initialWeapon, dispatchForm])

  const handleDelete = async () => {
    try {
      await deleteEntity()
    } catch (error: AxiosError) {
      if (error.response?.data?.errors?.carries) {
        if (
          confirm(
            "This weapon is carried by one or more characters. Do you want to delete it anyway?"
          )
        ) {
          try {
            await deleteEntity({ force: true })
          } catch (forceError: unknown) {
            console.error(forceError)
            toastError("Failed to delete weapon.")
          }
        }
      }

      console.error("Delete weapon error:", error)
    }
    toastError("Failed to delete weapon.")
  }

  const setWeapon = (updatedWeapon: Weapon) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "entity",
      value: updatedWeapon,
    })
  }

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <SpeedDialMenu onDelete={handleDelete} />
      <HeroImage entity={weapon} setEntity={setWeapon} />
      {status.message && (
        <Alert severity={status.severity} sx={{ mb: 2 }}>
          {status.message}
        </Alert>
      )}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
          position: "relative",
        }}
      >
        <FormControl fullWidth margin="normal" error={!!errors.name}>
          <NameEditor
            entity={weapon}
            setEntity={setWeapon}
            updateEntity={updateEntity}
          />
          {errors.name && <FormHelperText>{errors.name}</FormHelperText>}
        </FormControl>
      </Box>
      <WeaponChips weapon={weapon} />
      <Stats weapon={weapon} updateWeapon={updateEntity} state={formState} />
      <SectionHeader title="Description" icon={<VscGithubAction size="24" />} />
      <EditableRichText
        name="description"
        html={weapon.description}
        editable={true}
        onChange={handleChangeAndSave}
        fallback="No description available."
      />
      <EditJunctureCategory
        weapon={weapon}
        updateWeapon={updateEntity}
        state={formState}
      />
    </Box>
  )
}

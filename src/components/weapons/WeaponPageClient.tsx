"use client"

import { VscGithubAction } from "react-icons/vsc"
import { redirect } from "next/navigation"
import { useEffect } from "react"
import { FormControl, FormHelperText, Alert, Box } from "@mui/material"
import type { Weapon } from "@/types"
import { useCampaign } from "@/contexts"
import { WeaponChips, Stats, EditJunctureCategory } from "@/components/weapons"
import { useClient } from "@/contexts"
import {
  SectionHeader,
  EditableRichText,
  HeroImage,
  SpeedDialMenu,
  NameEditor,
} from "@/components/ui"
import { useEntity } from "@/hooks"
import { FormActions, useForm } from "@/reducers"

interface WeaponPageClientProperties {
  weapon: Weapon
}

type FormStateData = Weapon & {
  image?: File | null
}

export default function WeaponPageClient({
  weapon: initialWeapon,
}: WeaponPageClientProperties) {
  const { campaignData } = useCampaign()
  const { client } = useClient()
  const { formState, dispatchForm } = useForm<FormStateData>({
    ...initialWeapon,
    image: null,
  })
  const { status, saving, errors = {} } = formState
  const weapon = formState.data
  const { updateEntity, handleChangeAndSave } = useEntity<Weapon>(
    weapon,
    dispatchForm
  )

  console.log("saving", saving)

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
    if (!weapon?.id) return
    if (!confirm(`Are you sure you want to delete the weapon: ${weapon.name}?`))
      return

    try {
      await client.deleteWeapon(weapon)
      handleMenuClose()
      redirect("/parties")
    } catch (error_) {
      console.error("Failed to delete weapon:", error_)
    }
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
        updateEntity={updateEntity}
        state={formState}
      />
    </Box>
  )
}

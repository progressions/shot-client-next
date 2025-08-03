"use client"

import { VscGithubAction } from "react-icons/vsc"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Alert, Stack, Chip, Box } from "@mui/material"
import type { Weapon } from "@/types"
import { useCampaign } from "@/contexts"
import { Stats, EditJunctureCategory } from "@/components/weapons"
import { useClient } from "@/contexts"
import {
  SectionHeader,
  EditableRichText,
  HeroImage,
  SpeedDialMenu,
} from "@/components/ui"
import { useEntity } from "@/hooks"
import { NameEditor } from "@/components/entities"

interface WeaponPageClientProperties {
  weapon: Weapon
}

const junctureColors: Record<
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

export default function WeaponPageClient({
  weapon: initialWeapon,
}: WeaponPageClientProperties) {
  const { campaignData } = useCampaign()
  const { client } = useClient()
  const [weapon, setWeapon] = useState<Weapon>(initialWeapon)
  const [error, setError] = useState<string | null>(null)
  const { update: updateWeapon } = useEntity<Weapon>("weapon", setWeapon)

  useEffect(() => {
    document.title = weapon.name ? `${weapon.name} - Chi War` : "Chi War"
  }, [weapon.name])

  useEffect(() => {
    if (campaignData?.weapon && campaignData.weapon.id === initialWeapon.id) {
      setWeapon(campaignData.weapon)
    }
  }, [campaignData, initialWeapon])

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
      setError("Failed to delete weapon.")
    }
  }

  console.log("weapon", weapon)

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedWeapon = {
      ...weapon,
      [event.target.name]: event.target.value,
    }
    await updateWeapon(updatedWeapon)
  }

  const junctureColor = junctureColors[weapon.juncture] || junctureColors.Modern

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <SpeedDialMenu onDelete={handleDelete} />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
          position: "relative",
        }}
      >
        <NameEditor
          entity={weapon}
          setEntity={setWeapon}
          updateEntity={updateWeapon}
        />
      </Box>
      <HeroImage entity={weapon} setEntity={setWeapon} />
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        {weapon.juncture && (
          <Chip
            size="medium"
            sx={{ backgroundColor: junctureColor.main }}
            label={`${weapon.juncture}`}
          />
        )}
        {weapon.category && (
          <Chip
            size="medium"
            sx={{ backgroundColor: junctureColor.main }}
            label={`${weapon.category}`}
          />
        )}
        <Chip size="medium" label={`Damage ${weapon.damage}`} />
        <Chip
          size="medium"
          label={`Concealment ${weapon.concealment || " - "}`}
        />
        <Chip size="medium" label={`Reload ${weapon.reload_value || " - "}`} />
        <Chip
          size="medium"
          label={`Mook Bonus ${weapon.mook_bonus || " - "}`}
        />
        {weapon.kachunk && <Chip size="medium" label={"Kachunk!"} />}
      </Stack>
      <Stats
        weapon={weapon}
        setWeapon={setWeapon}
        updateWeapon={updateWeapon}
      />
      <SectionHeader title="Description" icon={<VscGithubAction size="24" />} />
      <EditableRichText
        name="description"
        html={weapon.description}
        editable={true}
        onChange={handleChange}
        fallback="No description available."
      />
      <EditJunctureCategory
        weapon={weapon}
        setWeapon={setWeapon}
        updateWeapon={updateWeapon}
      />
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  )
}

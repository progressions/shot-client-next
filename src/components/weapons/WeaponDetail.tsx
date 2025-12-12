"use client"

import { useEffect, useState } from "react"
import {
  Stack,
  Chip,
  Card,
  CardContent,
  Box,
  Alert,
  Typography,
} from "@mui/material"
import type { Weapon } from "@/types"
import Link from "next/link"
import { WeaponName } from "@/components/weapons"
import { useToast, useCampaign, useClient, useConfirm } from "@/contexts"
import { RichTextRenderer } from "@/components/editor"
import DetailButtons from "@/components/DetailButtons"
import { PositionableImage } from "@/components/ui"
import { handleEntityDeletion } from "@/lib/deletionHandler"

interface WeaponDetailProperties {
  weapon: Weapon
  onDelete: (weaponId: string) => void
  isMobile?: boolean
}

export default function WeaponDetail({
  weapon: initialWeapon,
  onDelete,
  isMobile = false,
}: WeaponDetailProperties) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const { confirm } = useConfirm()
  const { campaignData } = useCampaign()
  const [error, setError] = useState<string | null>(null)
  const [weapon, setWeapon] = useState<Weapon>(initialWeapon)

  useEffect(() => {
    if (campaignData?.weapon && campaignData.weapon.id === initialWeapon.id) {
      setWeapon(campaignData.weapon)
    }
  }, [campaignData, initialWeapon])

  const handleDelete = async () => {
    if (!weapon?.id) return

    await handleEntityDeletion(weapon, client.deleteWeapon, {
      entityName: "weapon",
      onSuccess: () => {
        onDelete(weapon.id)
        setError(null)
        toastSuccess("Weapon deleted successfully")
      },
      onError: message => {
        setError(message)
        toastError(message)
      },
      confirm,
    })
  }

  return (
    <Card sx={{ mb: 2, bgcolor: "#424242" }}>
      <PositionableImage
        entity={weapon}
        pageContext="index"
        height="200"
        isMobile={isMobile}
      />
      <CardContent sx={{ p: "1rem" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ color: "#ffffff" }}>
            <Link href={`/weapons/${weapon.id}`} style={{ color: "#fff" }}>
              <WeaponName weapon={weapon} />
            </Link>{" "}
            ({weapon.damage}/{weapon.concealment || "-"}/
            {weapon.reload_value || "-"})
          </Typography>
          <DetailButtons name="Weapon" onDelete={handleDelete} />
        </Box>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          {weapon.juncture && (
            <Typography variant="h6" sx={{ mb: 1 }}>
              <Chip size="small" label={`${weapon.juncture}`} />
            </Typography>
          )}
          {weapon.category && (
            <Typography variant="h6" sx={{ mb: 1 }}>
              <Chip size="small" label={`${weapon.category}`} />
            </Typography>
          )}
        </Stack>
        <Box sx={{ mt: 1, mb: 2 }}>
          <Typography variant="body2">
            Damage: {weapon.damage || "Unknown"}
            {" / "}
            Concealment: {weapon.concealment || "-"}
            {" / "}
            Reload: {weapon.reload_value || "-"}
          </Typography>
        </Box>
        <RichTextRenderer key={weapon.description} html={weapon.description} />
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

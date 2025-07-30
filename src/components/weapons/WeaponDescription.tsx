"use client"

import { useState, useEffect } from "react"
import { useCampaign } from "@/contexts"
import type { Weapon } from "@/types"
import { RichTextRenderer } from "@/components/editor"
import type { SystemStyleObject, Theme } from "@mui/system"

interface WeaponDescriptionProps {
  weapon: Weapon
  sx?: SystemStyleObject<Theme>
}

export default function WeaponDescription({
  weapon,
  sx = {},
}: WeaponDescriptionProps) {
  const { campaignData } = useCampaign()
  const [displayDescription, setDisplayDescription] = useState(
    weapon.description || ""
  )

  useEffect(() => {
    if (campaignData) {
      const updatedWeapon = campaignData?.weapon
      if (updatedWeapon && updatedWeapon.id === weapon.id && updatedWeapon.description) {
          setDisplayDescription(updatedWeapon.description)
        }
    }
  }, [campaignData, weapon.id])

  return <RichTextRenderer html={displayDescription} sx={sx} />
}

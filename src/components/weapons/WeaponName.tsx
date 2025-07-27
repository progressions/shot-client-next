"use client"

import { useState, useEffect } from "react"
import { useCampaign } from "@/contexts"
import type { Weapon } from "@/types/types"

interface WeaponNameProps {
  weapon: Weapon
}

export default function WeaponName({ weapon }: WeaponNameProps) {
  const { campaignData } = useCampaign()
  const [displayName, setDisplayName] = useState(weapon.name)

  useEffect(() => {
    if (campaignData && "weapon" in campaignData) {
      const updatedWeapon = campaignData.weapon
      if (updatedWeapon && updatedWeapon.id === weapon.id) {
        if (updatedWeapon.name) {
          setDisplayName(updatedWeapon.name)
        }
      }
    }
  }, [campaignData, weapon.id])

  return (<>
    {displayName}
  </>)
}

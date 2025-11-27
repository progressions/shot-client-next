"use client"

import { useMemo, useCallback, useState } from "react"
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
} from "@mui/material"
import { CS } from "@/services"
import type { AttackFormData, Character, Weapon } from "@/types"
import { FormActions } from "@/reducers"
import { NumberField } from "@/components/ui"
import { EntityAvatar } from "@/components/avatars"
import { CharacterLink } from "@/components/ui"

interface AttackerBarProps {
  formState: { data: AttackFormData }
  dispatchForm: (action: {
    type: string
    name?: string
    value?: unknown
    updates?: Partial<AttackFormData>
  }) => void
  attacker: Character | null
  attackerWeapons: Weapon[]
  selectedTargetIds: string[]
  allShots: { character?: Character }[]
}

export default function AttackerBar({
  formState,
  dispatchForm,
  attacker,
  attackerWeapons,
  selectedTargetIds,
  allShots,
}: AttackerBarProps) {
  // Extract needed values from formState
  const {
    shotCost,
    attackSkill,
    attackValue,
    attackValueChange,
    weaponDamage,
    damageChange,
    selectedWeaponId,
    kachunkActive,
  } = formState.data

  // Fortune state
  const [fortuneBonus, setFortuneBonus] = useState("0")

  // Helper to update a field
  const updateField = useCallback(
    (name: keyof AttackFormData, value: unknown) => {
      dispatchForm({
        type: FormActions.UPDATE,
        name,
        value,
      })
    },
    [dispatchForm]
  )

  // Get available Fortune points for the attacker
  const availableFortune = useMemo(() => {
    if (!attacker) return 0
    return CS.fortune(attacker)
  }, [attacker])

  // Check if attacker is a PC
  const isPC = useMemo(() => {
    if (!attacker) return false
    return CS.isPC(attacker)
  }, [attacker])

  // Check if any selected targets are mooks
  const targetingMooks = selectedTargetIds.some(id => {
    const shot = allShots.find(s => s.character?.shot_id === id)
    return shot?.character && CS.isMook(shot.character)
  })

  // Get the selected weapon
  const selectedWeapon = attackerWeapons.find(
    w => w.id?.toString() === selectedWeaponId
  )

  // Get attack skills for the selected attacker
  const attackOptions = useMemo(() => {
    if (!attacker || !("action_values" in attacker)) return []

    const mainAttack = CS.mainAttack(attacker)
    const mainValue = CS.actionValue(attacker, mainAttack)
    const secondaryAttack = CS.secondaryAttack(attacker)
    const secondaryValue = secondaryAttack
      ? CS.actionValue(attacker, secondaryAttack)
      : 0

    return [
      { skill: mainAttack, value: mainValue },
      ...(secondaryAttack
        ? [{ skill: secondaryAttack, value: secondaryValue }]
        : []),
    ]
  }, [attacker])

  if (!attacker || !("action_values" in attacker)) {
    return null
  }

  return (
    <Box
      sx={{
        backgroundColor: "background.paper",
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      {/* Compact Bar - Always Visible */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          p: 1,
          backgroundColor: "action.hover",
          flexWrap: "wrap",
        }}
      >
        {/* Attacker Name/Avatar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            minWidth: 100,
          }}
        >
          <EntityAvatar entity={attacker} size="small" />
          <CharacterLink character={attacker} />
        </Box>

        {/* Core Stats - Compact */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <NumberField
            name="attackValue"
            label="AV"
            labelBackgroundColor="#424242"
            value={parseInt(attackValue) || 0}
            size="small"
            width="70px"
            error={false}
            onChange={e => updateField("attackValue", e.target.value)}
            onBlur={e => updateField("attackValue", e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: 36,
                "& input": { padding: "6px 8px", fontSize: "0.875rem" },
              },
            }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <NumberField
            name="weaponDamage"
            label="Dmg"
            labelBackgroundColor="#424242"
            value={parseInt(weaponDamage) || 0}
            size="small"
            width="70px"
            error={false}
            onChange={e => updateField("weaponDamage", e.target.value)}
            onBlur={e => updateField("weaponDamage", e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: 36,
                "& input": { padding: "6px 8px", fontSize: "0.875rem" },
              },
            }}
          />
        </Box>

        {/* Fortune (for PCs) */}
        {isPC && availableFortune > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <NumberField
              name="fortuneBonus"
              label="Fortune"
              labelBackgroundColor="#f57c00"
              value={fortuneBonus}
              size="small"
              width="70px"
              error={false}
              onChange={e => {
                const value = e.target.value
                setFortuneBonus(value)
                updateField("fortuneBonus", value)
              }}
              onBlur={e => {
                const value = parseInt(e.target.value) || 0
                const finalValue = value < 0 ? "0" : value.toString()
                setFortuneBonus(finalValue)
                updateField("fortuneBonus", finalValue)
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 36,
                  "& input": { padding: "6px 8px", fontSize: "0.875rem" },
                  backgroundColor:
                    fortuneBonus !== "0" ? "warning.light" : "background.paper",
                },
              }}
            />
          </Box>
        )}

        {/* Shot Cost */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <NumberField
            name="shotCost"
            label="Shots"
            labelBackgroundColor="#424242"
            value={parseInt(shotCost) || 0}
            size="small"
            width="70px"
            error={false}
            onChange={e => updateField("shotCost", e.target.value)}
            onBlur={e => updateField("shotCost", e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: 36,
                "& input": { padding: "6px 8px", fontSize: "0.875rem" },
              },
            }}
          />
        </Box>

        {/* Kachunk indicator */}
        {selectedWeapon?.kachunk && (
          <Button
            variant={kachunkActive ? "contained" : "outlined"}
            color="warning"
            size="small"
            onClick={() => {
              if (kachunkActive) {
                updateField("kachunkActive", false)
                const adjustedDamage = selectedWeapon.damage + damageChange
                updateField("weaponDamage", adjustedDamage.toString())
                updateField("shotCost", (parseInt(shotCost) - 1).toString())
              } else {
                updateField("kachunkActive", true)
                const kachunkDamage = 14 + damageChange
                updateField("weaponDamage", kachunkDamage.toString())
                updateField("shotCost", (parseInt(shotCost) + 1).toString())
              }
            }}
            sx={{
              minWidth: "auto",
              px: 1,
              py: 0.5,
              fontSize: "0.7rem",
            }}
          >
            💥 {kachunkActive ? "Kachunk!" : "Ka-"}
          </Button>
        )}
      </Box>

      {/* Weapon and Skill Selectors */}
      <Box sx={{ p: 1, borderTop: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {/* Attack Skill Selector */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Attack Skill</InputLabel>
            <Select
              value={attackSkill}
              label="Attack Skill"
              onChange={e => {
                const selected = e.target.value
                updateField("attackSkill", selected)
                const option = attackOptions.find(o => o.skill === selected)
                if (option) {
                  updateField("attackValue", option.value.toString())
                }
              }}
              sx={{ height: 40 }}
            >
              {attackOptions.map(option => (
                <MenuItem key={option.skill} value={option.skill}>
                  {option.skill} ({option.value})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Weapon Selector */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Weapon</InputLabel>
            <Select
              value={selectedWeaponId}
              label="Weapon"
              onChange={e => {
                updateField("selectedWeaponId", e.target.value)
                if (kachunkActive) {
                  updateField("kachunkActive", false)
                  updateField("shotCost", (parseInt(shotCost) - 1).toString())
                }
                if (e.target.value === "unarmed") {
                  const damage = CS.damage(attacker) || 7
                  const adjustedDamage = damage + damageChange
                  updateField("weaponDamage", adjustedDamage.toString())
                } else {
                  const weapon = attackerWeapons.find(
                    w => w.id?.toString() === e.target.value
                  )
                  if (weapon) {
                    const adjustedDamage = weapon.damage + damageChange
                    updateField("weaponDamage", adjustedDamage.toString())
                  }
                }
              }}
              sx={{ height: 40 }}
            >
              <MenuItem value="unarmed">
                Unarmed ({CS.damage(attacker) || 7})
              </MenuItem>
              {attackerWeapons.map(weapon => (
                <MenuItem key={weapon.id} value={weapon.id?.toString() || ""}>
                  {weapon.name} ({weapon.damage})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
    </Box>
  )
}

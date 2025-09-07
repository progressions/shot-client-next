"use client"

import { useMemo, useEffect, useRef, useCallback, useState } from "react"
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Stack,
  Button,
  Tooltip,
} from "@mui/material"
import { CS } from "@/services"
import type { AttackFormData, Character, Weapon } from "@/types"
import { FormActions } from "@/reducers"
import { NumberField } from "@/components/ui"

interface AttackerCombatFieldsProps {
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

export default function AttackerCombatFields({
  formState,
  dispatchForm,
  attacker,
  attackerWeapons,
  selectedTargetIds,
  allShots,
}: AttackerCombatFieldsProps) {
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
  const [usingFortune, setUsingFortune] = useState(false)

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

  // Get the selected weapon's mook bonus (only show if targeting mooks)
  const selectedWeapon = attackerWeapons.find(
    w => w.id?.toString() === selectedWeaponId
  )
  const weaponMookBonus =
    targetingMooks && selectedWeapon?.mook_bonus ? selectedWeapon.mook_bonus : 0

  // Track previous targeting state to detect changes
  const prevTargetingMooks = useRef(targetingMooks)

  // Update attack value when targeting mooks changes
  useEffect(() => {
    if (prevTargetingMooks.current !== targetingMooks && selectedWeapon) {
      const mookBonus = selectedWeapon.mook_bonus || 0
      if (mookBonus > 0) {
        const currentValue = parseInt(attackValue) || 0
        if (targetingMooks && !prevTargetingMooks.current) {
          // Just started targeting mooks - add bonus
          updateField("attackValue", (currentValue + mookBonus).toString())
        } else if (!targetingMooks && prevTargetingMooks.current) {
          // Stopped targeting mooks - remove bonus
          updateField("attackValue", (currentValue - mookBonus).toString())
        }
      }
    }
    prevTargetingMooks.current = targetingMooks
  }, [targetingMooks, selectedWeapon, attackValue, updateField])

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
    <Box sx={{ p: 1 }}>
      <Typography
        variant="subtitle2"
        sx={{ mb: 1, fontWeight: "bold", color: "text.secondary" }}
      >
        ATTACKER
      </Typography>

      {/* Stack layout: Attack Value, then Damage, then Fortune/Shot Cost */}
      <Box>
        {/* Attack Value - full width */}
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", fontSize: "0.7rem" }}
          >
            Attack Value
          </Typography>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
            <NumberField
              name="attackValue"
              value={parseInt(attackValue) || 0}
              size="small"
              error={false}
              onChange={e => updateField("attackValue", e.target.value)}
              onBlur={e => updateField("attackValue", e.target.value)}
              sx={{
                width: 80,
                "& .MuiOutlinedInput-root": {
                  height: 40,
                  "& input": { padding: "8px 12px" },
                  backgroundColor: "background.paper",
                },
              }}
            />
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Attack Skill</InputLabel>
              <Select
                value={attackSkill}
                label="Attack Skill"
                onChange={e => {
                  const selected = e.target.value
                  updateField("attackSkill", selected)
                  const option = attackOptions.find(o => o.skill === selected)
                  if (option) {
                    const baseValue = option.value
                    const totalValue = baseValue + weaponMookBonus
                    updateField("attackValue", totalValue.toString())
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
          </Box>
        </Box>

        {/* Damage - full width */}
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", fontSize: "0.7rem" }}
          >
            Damage
          </Typography>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
            <NumberField
              name="weaponDamage"
              value={parseInt(weaponDamage) || 0}
              size="small"
              error={false}
              onChange={e => updateField("weaponDamage", e.target.value)}
              onBlur={e => updateField("weaponDamage", e.target.value)}
              sx={{
                width: 80,
                "& .MuiOutlinedInput-root": {
                  height: 40,
                  "& input": { padding: "8px 12px" },
                  backgroundColor: "background.paper",
                },
              }}
            />
            <FormControl size="small" sx={{ flex: 1 }}>
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
                    if (targetingMooks) {
                      const oldWeapon = attackerWeapons.find(
                        w => w.id?.toString() === selectedWeaponId
                      )
                      const oldBonus = oldWeapon?.mook_bonus || 0
                      const baseAttackValue = parseInt(attackValue) - oldBonus
                      updateField("attackValue", baseAttackValue.toString())
                    }
                  } else {
                    const weapon = attackerWeapons.find(
                      w => w.id?.toString() === e.target.value
                    )
                    if (weapon) {
                      const adjustedDamage = weapon.damage + damageChange
                      updateField("weaponDamage", adjustedDamage.toString())
                      if (targetingMooks) {
                        const oldWeapon = attackerWeapons.find(
                          w => w.id?.toString() === selectedWeaponId
                        )
                        const oldBonus = oldWeapon?.mook_bonus || 0
                        const newBonus = weapon.mook_bonus || 0
                        const baseAttackValue = parseInt(attackValue) - oldBonus
                        const newAttackValue = baseAttackValue + newBonus
                        updateField("attackValue", newAttackValue.toString())
                      }
                    }
                  }
                }}
                sx={{ height: 40 }}
              >
                <MenuItem value="unarmed">
                  Damage ({CS.damage(attacker) || 7})
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

        {/* Fortune and Shot Cost - side by side */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Fortune field for PCs */}
          {isPC && availableFortune > 0 && (
            <Box>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontSize: "0.7rem" }}
              >
                Fortune +
              </Typography>
              <NumberField
                name="fortuneBonus"
                value={fortuneBonus}
                size="small"
                error={false}
                onChange={e => {
                  const value = e.target.value
                  setFortuneBonus(value)
                  updateField("fortuneBonus", value)
                  const isUsing = value !== "" && value !== "0"
                  setUsingFortune(isUsing)
                  updateField("fortuneSpent", isUsing)
                }}
                onBlur={e => {
                  const value = parseInt(e.target.value) || 0
                  const finalValue = value < 0 ? "0" : value.toString()
                  setFortuneBonus(finalValue)
                  updateField("fortuneBonus", finalValue)
                  const isUsing = finalValue !== "0"
                  setUsingFortune(isUsing)
                  updateField("fortuneSpent", isUsing)
                }}
                sx={{
                  width: 80,
                  "& .MuiOutlinedInput-root": {
                    height: 40,
                    "& input": { padding: "8px 12px" },
                    backgroundColor:
                      fortuneBonus !== "0"
                        ? "warning.light"
                        : "background.paper",
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.65rem",
                  color: "text.secondary",
                  display: "block",
                }}
              >
                {availableFortune} avail
              </Typography>
            </Box>
          )}

          {/* Shot Cost */}
          <Box>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontSize: "0.7rem" }}
            >
              Shot Cost
            </Typography>
            <NumberField
              name="shotCost"
              value={parseInt(shotCost) || 0}
              size="small"
              error={false}
              onChange={e => updateField("shotCost", e.target.value)}
              onBlur={e => updateField("shotCost", e.target.value)}
              sx={{
                width: 80,
                "& .MuiOutlinedInput-root": {
                  height: 40,
                  "& input": { padding: "8px 12px" },
                  backgroundColor: "background.paper",
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Kachunk Button inline if weapon has it */}
      {selectedWeaponId &&
        selectedWeaponId !== "unarmed" &&
        (() => {
          const weapon = attackerWeapons.find(
            w => w.id?.toString() === selectedWeaponId
          )
          if (weapon?.kachunk) {
            return (
              <Box sx={{ mt: 0.5 }}>
                <Button
                  variant={kachunkActive ? "contained" : "outlined"}
                  color="warning"
                  size="small"
                  onClick={() => {
                    if (kachunkActive) {
                      updateField("kachunkActive", false)
                      const adjustedDamage = weapon.damage + damageChange
                      updateField("weaponDamage", adjustedDamage.toString())
                      updateField(
                        "shotCost",
                        (parseInt(shotCost) - 1).toString()
                      )
                    } else {
                      updateField("kachunkActive", true)
                      const kachunkDamage = 14 + damageChange
                      updateField("weaponDamage", kachunkDamage.toString())
                      updateField(
                        "shotCost",
                        (parseInt(shotCost) + 1).toString()
                      )
                    }
                  }}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.75rem",
                    py: 0.5,
                    px: 1,
                  }}
                >
                  💥 Kachunk! {kachunkActive && "✓"}
                </Button>
              </Box>
            )
          }
          return null
        })()}
    </Box>
  )
}

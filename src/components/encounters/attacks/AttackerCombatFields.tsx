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
    <Box
      sx={{
        p: { xs: 1, sm: 1.5 },
        borderBottom: "2px solid",
        borderBottomColor: "divider",
        backgroundColor: "action.hover",
      }}
    >
      {/* All fields - responsive layout */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 2, sm: 2 }}
        sx={{ mb: 2 }}
        alignItems={{ xs: "stretch", sm: "flex-start" }}
      >
        {/* Fortune field for PCs - only show if PC has Fortune */}
        {isPC && availableFortune > 0 && (
          <Box sx={{ flexShrink: 0 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: "medium" }}>
              Fortune +
            </Typography>
            <NumberField
              name="fortuneBonus"
              value={fortuneBonus}
              size="small"
              width="80px"
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
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor:
                        fortuneBonus !== "0" ? "warning.main" : "primary.main",
                    },
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor:
                      fortuneBonus !== "0" ? "warning.main" : undefined,
                  },
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 0.25,
                color: fortuneBonus !== "0" ? "warning.main" : "text.secondary",
                fontSize: "0.65rem",
                textAlign: "center",
              }}
            >
              {fortuneBonus !== "0" ? `Cost: 1` : `Avail: ${availableFortune}`}
            </Typography>
          </Box>
        )}

        {/* Attack Value Block - includes Shot Cost on mobile */}
        <Box
          sx={{ flex: { xs: "0 0 auto", sm: 1 }, minWidth: 0, width: "100%" }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="flex-start"
            sx={{ width: "100%" }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: "medium" }}>
                Attack Value
              </Typography>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Box>
                  <NumberField
                    name="attackValue"
                    value={parseInt(attackValue) || 0}
                    size="small"
                    width="80px"
                    error={false}
                    onChange={e => updateField("attackValue", e.target.value)}
                    onBlur={e => updateField("attackValue", e.target.value)}
                  />
                  {(() => {
                    // Calculate NET modifier from base value
                    const impairmentPenalty = attacker?.impairments
                      ? -attacker.impairments
                      : 0
                    const totalAttackModifier =
                      impairmentPenalty + attackValueChange + weaponMookBonus

                    if (totalAttackModifier !== 0) {
                      return (
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mt: 0.25,
                            color:
                              totalAttackModifier > 0
                                ? "success.main"
                                : "error.main",
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          {totalAttackModifier > 0 ? "+" : ""}
                          {totalAttackModifier}
                        </Typography>
                      )
                    }
                    return null
                  })()}
                </Box>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    "& .MuiInputBase-root": { height: 56 },
                    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor: "primary.main",
                      },
                  }}
                >
                  <InputLabel>Attack Value</InputLabel>
                  <Select
                    value={attackSkill}
                    onChange={e => {
                      const selected = e.target.value
                      updateField("attackSkill", selected)
                      const option = attackOptions.find(
                        o => o.skill === selected
                      )
                      if (option) {
                        // Include weapon mook bonus in the attack value (only if targeting mooks)
                        const baseValue = option.value
                        const totalValue = baseValue + weaponMookBonus
                        updateField("attackValue", totalValue.toString())
                      }
                    }}
                    label="Attack Value"
                  >
                    {attackOptions.map(option => (
                      <MenuItem key={option.skill} value={option.skill}>
                        {option.skill} ({option.value})
                      </MenuItem>
                    ))}
                  </Select>
                  {/* Display attack modifiers */}
                  {(() => {
                    const modifiers = []

                    if (attacker && attacker.impairments > 0) {
                      modifiers.push(
                        `-${attacker.impairments} from impairments`
                      )
                    }

                    if (weaponMookBonus > 0) {
                      modifiers.push(`+${weaponMookBonus} AV vs mooks`)
                    }

                    if (attackValueChange !== 0) {
                      modifiers.push(
                        `${attackValueChange > 0 ? "+" : ""}${attackValueChange} from effects`
                      )
                    }

                    if (modifiers.length > 0) {
                      return (
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mt: 0.5,
                            ml: 1.75,
                            color: "text.secondary",
                            fontStyle: "italic",
                          }}
                        >
                          {modifiers.join(", ")}
                        </Typography>
                      )
                    }

                    return null
                  })()}
                </FormControl>
              </Stack>
            </Box>

            {/* Shot Cost - Mobile only, shown next to Attack Value */}
            <Box
              sx={{
                display: { xs: "block", sm: "none" },
                flexShrink: 0,
              }}
            >
              <Typography variant="body2" sx={{ mb: 1, fontWeight: "medium" }}>
                Shot Cost
              </Typography>
              <NumberField
                name="shotCost"
                value={parseInt(shotCost) || 0}
                size="small"
                width="80px"
                error={false}
                onChange={e => updateField("shotCost", e.target.value)}
                onBlur={e => updateField("shotCost", e.target.value)}
              />
            </Box>
          </Stack>
        </Box>

        {/* Damage and Weapon Block */}
        <Box sx={{ flex: { xs: "0 0 auto", sm: 1 }, minWidth: 0 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: "medium" }}>
            Damage
          </Typography>
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <Box>
              <NumberField
                name="weaponDamage"
                value={parseInt(weaponDamage) || 0}
                size="small"
                width="80px"
                error={false}
                onChange={e => updateField("weaponDamage", e.target.value)}
                onBlur={e => updateField("weaponDamage", e.target.value)}
              />
              {damageChange !== 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 0.25,
                    color: damageChange > 0 ? "success.main" : "error.main",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {damageChange > 0 ? "+" : ""}
                  {damageChange}
                </Typography>
              )}
            </Box>
            <FormControl
              sx={{
                flex: 1,
                minWidth: 0,
                "& .MuiInputBase-root": { height: 56 },
                "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "primary.main",
                  },
              }}
            >
              <InputLabel>Weapon</InputLabel>
              <Select
                value={selectedWeaponId}
                onChange={e => {
                  updateField("selectedWeaponId", e.target.value)
                  // Reset kachunk when switching weapons
                  if (kachunkActive) {
                    updateField("kachunkActive", false)
                    updateField("shotCost", (parseInt(shotCost) - 1).toString())
                  }
                  if (e.target.value === "unarmed") {
                    const damage = CS.damage(attacker) || 7
                    // Include damage change from effects
                    const adjustedDamage = damage + damageChange
                    updateField("weaponDamage", adjustedDamage.toString())
                    // Remove mook bonus when switching to unarmed (if targeting mooks)
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
                      // Include damage change from effects
                      const adjustedDamage = weapon.damage + damageChange
                      updateField("weaponDamage", adjustedDamage.toString())
                      // Update attack value with new weapon's mook bonus (only if targeting mooks)
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
                label="Weapon"
              >
                <MenuItem value="unarmed">
                  Damage ({CS.damage(attacker) || 7})
                </MenuItem>
                {attackerWeapons.map(weapon => (
                  <MenuItem key={weapon.id} value={weapon.id?.toString() || ""}>
                    {weapon.name} ({weapon.damage}/{weapon.concealment}/
                    {weapon.reload_value || "-"})
                    {weapon.mook_bonus > 0 &&
                      ` [+${weapon.mook_bonus} AV vs mooks]`}
                  </MenuItem>
                ))}
              </Select>
              {/* Display selected weapon stats */}
              {selectedWeaponId &&
                selectedWeaponId !== "unarmed" &&
                (() => {
                  const weapon = attackerWeapons.find(
                    w => w.id?.toString() === selectedWeaponId
                  )
                  if (weapon) {
                    const attrs = `(${weapon.damage}/${weapon.concealment}/${weapon.reload_value || "-"})`
                    const mookBonus =
                      weapon.mook_bonus && weapon.mook_bonus > 0
                        ? `, +${weapon.mook_bonus} AV vs mooks`
                        : ""
                    const kachunk = weapon.kachunk ? ", kachunk!" : ""
                    return (
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          mt: 0.5,
                          ml: 1.75,
                          color: "text.secondary",
                          fontStyle: "italic",
                        }}
                      >
                        {attrs}
                        {mookBonus}
                        {kachunk}
                      </Typography>
                    )
                  }
                  return null
                })()}
            </FormControl>
          </Stack>
        </Box>

        {/* Shot Cost - On mobile, display in a row with Attack Value */}
        <Box
          sx={{
            flexShrink: 0,
            display: { xs: "none", sm: "block" },
          }}
        >
          <Typography variant="body2" sx={{ mb: 1, fontWeight: "medium" }}>
            Shot Cost
          </Typography>
          <NumberField
            name="shotCost"
            value={parseInt(shotCost) || 0}
            size="small"
            width="80px"
            error={false}
            onChange={e => updateField("shotCost", e.target.value)}
            onBlur={e => updateField("shotCost", e.target.value)}
          />
        </Box>
      </Stack>

      {/* Kachunk Button on separate row */}
      {selectedWeaponId &&
        selectedWeaponId !== "unarmed" &&
        (() => {
          const weapon = attackerWeapons.find(
            w => w.id?.toString() === selectedWeaponId
          )
          if (weapon?.kachunk) {
            return (
              <Box sx={{ ml: 2, mt: 1 }}>
                <Tooltip
                  title={
                    kachunkActive
                      ? "Click to deactivate kachunk mode"
                      : "Weapon damage is 14 if you spend an extra shot to go 'ka-chunk!'"
                  }
                  placement="top"
                >
                  <Button
                    variant={kachunkActive ? "contained" : "outlined"}
                    color="warning"
                    size="small"
                    onClick={() => {
                      if (kachunkActive) {
                        // Deactivate kachunk - restore original weapon damage with effects
                        updateField("kachunkActive", false)
                        const adjustedDamage = weapon.damage + damageChange
                        updateField("weaponDamage", adjustedDamage.toString())
                        updateField(
                          "shotCost",
                          (parseInt(shotCost) - 1).toString()
                        )
                      } else {
                        // Activate kachunk - set to 14 plus damage change from effects
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
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      ...(kachunkActive && {
                        backgroundColor: "warning.dark",
                        "&:hover": {
                          backgroundColor: "warning.main",
                        },
                      }),
                    }}
                  >
                    💥 Kachunk! {kachunkActive && "✓"}
                  </Button>
                </Tooltip>
              </Box>
            )
          }
          return null
        })()}
    </Box>
  )
}

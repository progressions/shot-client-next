"use client"

import { useMemo, useEffect, useRef } from "react"
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Stack,
} from "@mui/material"
import { CS } from "@/services"
import type { AttackFormData, AttackerSectionProps } from "@/types"
import { FormActions } from "@/reducers"
import { NumberField } from "@/components/ui"
import CharacterSelector from "../CharacterSelector"

export default function AttackerSection({
  sortedAttackerShots,
  formState,
  dispatchForm,
  attacker,
  attackerWeapons,
  allShots,
  selectedTargetIds,
}: AttackerSectionProps) {
  // Extract needed values from formState
  const {
    attackerShotId,
    shotCost,
    attackSkill,
    attackValue,
    attackValueChange,
    weaponDamage,
    damageChange,
    selectedWeaponId,
  } = formState.data

  // Helper to update a field
  const updateField = (name: keyof AttackFormData, value: unknown) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name,
      value,
    })
  }

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
  }, [targetingMooks, selectedWeapon, attackValue])

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

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        borderBottom: "2px solid",
        borderBottomColor: "divider",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
        ⚔️ Attacker
      </Typography>

      {/* Avatar Selection and Shot Cost on same line */}
      <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 3 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <CharacterSelector
            shots={sortedAttackerShots}
            selectedShotId={attackerShotId}
            onSelect={shotId => updateField("attackerShotId", shotId)}
            borderColor="primary.main"
          />
        </Box>

        {/* Shot Cost */}
        <Box sx={{ flexShrink: 0 }}>
          <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
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

      {/* Attack Skill and Weapon Selection */}
      {attacker && "action_values" in attacker && (
        <>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 2, sm: 2 }}
            sx={{ mb: 3 }}
          >
            {/* Attack Skill Block */}
            <Box sx={{ width: "50%" }}>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: "medium" }}>
                Attack Skill
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
                  {attackValueChange !== 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 0.25,
                        color:
                          attackValueChange > 0 ? "success.main" : "error.main",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      {attackValueChange > 0 ? "+" : ""}
                      {attackValueChange}
                    </Typography>
                  )}
                </Box>
                <FormControl
                  sx={{
                    flex: 1,
                    "& .MuiInputBase-root": { height: 56 },
                  }}
                >
                  <InputLabel>Attack Skill</InputLabel>
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
                    label="Attack Skill"
                  >
                    {attackOptions.map(option => (
                      <MenuItem key={option.skill} value={option.skill}>
                        {option.skill} ({option.value})
                      </MenuItem>
                    ))}
                  </Select>
                  {/* Display attack modifiers */}
                  <Box sx={{ ml: 1.75 }}>
                    {weaponMookBonus > 0 && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          mt: 0.5,
                          color: "text.secondary",
                          fontStyle: "italic",
                        }}
                      >
                        +{weaponMookBonus} vs mooks
                      </Typography>
                    )}
                    {(attacker && attacker.impairments > 0) ||
                    attackValueChange !== 0 ? (
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          mt: 0.5,
                          color: "text.secondary",
                          fontStyle: "italic",
                        }}
                      >
                        {attacker && attacker.impairments > 0 && (
                          <span>-{attacker.impairments} impairment</span>
                        )}
                        {attacker &&
                          attacker.impairments > 0 &&
                          attackValueChange !== 0 && <span>, </span>}
                        {attackValueChange !== 0 && (
                          <span>
                            {attackValueChange > 0 ? "+" : ""}
                            {attackValueChange} from effects
                          </span>
                        )}
                      </Typography>
                    ) : null}
                  </Box>
                </FormControl>
              </Stack>
            </Box>

            {/* Damage and Weapon Block */}
            <Box sx={{ width: "50%" }}>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: "medium" }}>
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
                  sx={{ flex: 1, "& .MuiInputBase-root": { height: 56 } }}
                >
                  <InputLabel>Weapon</InputLabel>
                  <Select
                    value={selectedWeaponId}
                    onChange={e => {
                      updateField("selectedWeaponId", e.target.value)
                      if (e.target.value === "unarmed") {
                        const damage = CS.damage(attacker) || 7
                        updateField("weaponDamage", damage.toString())
                        // Remove mook bonus when switching to unarmed (if targeting mooks)
                        if (targetingMooks) {
                          const oldWeapon = attackerWeapons.find(
                            w => w.id?.toString() === selectedWeaponId
                          )
                          const oldBonus = oldWeapon?.mook_bonus || 0
                          const baseAttackValue =
                            parseInt(attackValue) - oldBonus
                          updateField("attackValue", baseAttackValue.toString())
                        }
                      } else {
                        const weapon = attackerWeapons.find(
                          w => w.id?.toString() === e.target.value
                        )
                        if (weapon) {
                          updateField("weaponDamage", weapon.damage.toString())
                          // Update attack value with new weapon's mook bonus (only if targeting mooks)
                          if (targetingMooks) {
                            const oldWeapon = attackerWeapons.find(
                              w => w.id?.toString() === selectedWeaponId
                            )
                            const oldBonus = oldWeapon?.mook_bonus || 0
                            const newBonus = weapon.mook_bonus || 0
                            const baseAttackValue =
                              parseInt(attackValue) - oldBonus
                            const newAttackValue = baseAttackValue + newBonus
                            updateField(
                              "attackValue",
                              newAttackValue.toString()
                            )
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
                      <MenuItem
                        key={weapon.id}
                        value={weapon.id?.toString() || ""}
                      >
                        {weapon.name} ({weapon.damage}/{weapon.concealment}/
                        {weapon.reload_value || "-"})
                        {weapon.mook_bonus > 0 &&
                          ` [+${weapon.mook_bonus} vs mooks]`}
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
                            ? `, +${weapon.mook_bonus} vs mooks`
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
          </Stack>
        </>
      )}
    </Box>
  )
}

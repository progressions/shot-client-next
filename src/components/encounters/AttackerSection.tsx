"use client"

import { useMemo } from "react"
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
import type { Character, Shot, Weapon } from "@/types"
import type { FormStateType, FormStateAction } from "@/reducers"
import { FormActions } from "@/reducers"
import { NumberField } from "@/components/ui"
import CharacterSelector from "./CharacterSelector"

// Import the AttackFormData type from parent
interface AttackFormData {
  attackerShotId: string
  shotCost: string
  attackSkill: string
  attackValue: string
  weaponDamage: string
  selectedWeaponId: string
  [key: string]: unknown
}

interface AttackerSectionProps {
  sortedAttackerShots: Shot[]
  formState: FormStateType<AttackFormData>
  dispatchForm: (action: FormStateAction<AttackFormData>) => void
  attacker: Character | undefined
  attackerWeapons: Weapon[]
}

export default function AttackerSection({
  sortedAttackerShots,
  formState,
  dispatchForm,
  attacker,
  attackerWeapons,
}: AttackerSectionProps) {
  // Extract needed values from formState
  const {
    attackerShotId,
    shotCost,
    attackSkill,
    attackValue,
    weaponDamage,
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
      <Stack
        direction="row"
        spacing={2}
        alignItems="flex-start"
        sx={{ mb: 3 }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <CharacterSelector
            shots={sortedAttackerShots}
            selectedShotId={attackerShotId}
            onSelect={(shotId) => updateField("attackerShotId", shotId)}
            borderColor="primary.main"
          />
        </Box>

        {/* Shot Cost */}
        <Box sx={{ flexShrink: 0 }}>
          <Typography
            variant="caption"
            sx={{ display: "block", mb: 0.5 }}
          >
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
              <Typography
                variant="body2"
                sx={{ mb: 2, fontWeight: "medium" }}
              >
                Attack Skill
              </Typography>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <NumberField
                  name="attackValue"
                  value={parseInt(attackValue) || 0}
                  size="small"
                  width="80px"
                  error={false}
                  onChange={e => updateField("attackValue", e.target.value)}
                  onBlur={e => updateField("attackValue", e.target.value)}
                />
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
                        updateField("attackValue", option.value.toString())
                      }
                    }}
                    label="Attack Skill"
                  >
                    {attackOptions.map(option => (
                      <MenuItem
                        key={option.skill}
                        value={option.skill}
                      >
                        {option.skill} ({option.value})
                      </MenuItem>
                    ))}
                  </Select>
                  {/* Display attack modifiers */}
                  {attacker && attacker.impairments > 0 && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: "block", 
                        mt: 0.5, 
                        ml: 1.75,
                        color: "text.secondary",
                        fontStyle: "italic"
                      }}
                    >
                      -{attacker.impairments} impairment
                    </Typography>
                  )}
                </FormControl>
              </Stack>
            </Box>

            {/* Damage and Weapon Block */}
            <Box sx={{ width: "50%" }}>
              <Typography
                variant="body2"
                sx={{ mb: 2, fontWeight: "medium" }}
              >
                Damage
              </Typography>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <NumberField
                  name="weaponDamage"
                  value={parseInt(weaponDamage) || 0}
                  size="small"
                  width="80px"
                  error={false}
                  onChange={e => updateField("weaponDamage", e.target.value)}
                  onBlur={e => updateField("weaponDamage", e.target.value)}
                />
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
                      } else {
                        const weapon = attackerWeapons.find(
                          w => w.id?.toString() === e.target.value
                        )
                        if (weapon) {
                          updateField("weaponDamage", weapon.damage.toString())
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
                        {weapon.name} ({weapon.damage}/{weapon.concealment}/{weapon.reload_value || "-"})
                      </MenuItem>
                    ))}
                  </Select>
                  {/* Display selected weapon stats */}
                  {selectedWeaponId && selectedWeaponId !== "unarmed" && (() => {
                    const weapon = attackerWeapons.find(w => w.id?.toString() === selectedWeaponId)
                    if (weapon) {
                      const attrs = `(${weapon.damage}/${weapon.concealment}/${weapon.reload_value || "-"})`
                      const mookBonus = weapon.mook_bonus && weapon.mook_bonus > 0 ? `, +${weapon.mook_bonus} vs mooks` : ""
                      const kachunk = weapon.kachunk ? ", kachunk!" : ""
                      return (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: "block", 
                            mt: 0.5, 
                            ml: 1.75,
                            color: "text.secondary",
                            fontStyle: "italic"
                          }}
                        >
                          {attrs}{mookBonus}{kachunk}
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
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
import { NumberField } from "@/components/ui"
import CharacterSelector from "./CharacterSelector"

interface AttackerSectionProps {
  sortedAttackerShots: Shot[]
  attackerShotId: string
  setAttackerShotId: (shotId: string) => void
  shotCost: string
  setShotCost: (cost: string) => void
  attackSkill: string
  setAttackSkill: (skill: string) => void
  attackValue: string
  setAttackValue: (value: string) => void
  weaponDamage: string
  setWeaponDamage: (damage: string) => void
  selectedWeaponId: string
  setSelectedWeaponId: (weaponId: string) => void
  attacker: Character | undefined
  attackerWeapons: Weapon[]
}

export default function AttackerSection({
  sortedAttackerShots,
  attackerShotId,
  setAttackerShotId,
  shotCost,
  setShotCost,
  attackSkill,
  setAttackSkill,
  attackValue,
  setAttackValue,
  weaponDamage,
  setWeaponDamage,
  selectedWeaponId,
  setSelectedWeaponId,
  attacker,
  attackerWeapons,
}: AttackerSectionProps) {
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
            onSelect={setAttackerShotId}
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
            onChange={e => setShotCost(e.target.value)}
            onBlur={e => setShotCost(e.target.value)}
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
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{ mb: 2, fontWeight: "medium" }}
              >
                Attack Skill
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <NumberField
                  name="attackValue"
                  value={parseInt(attackValue) || 0}
                  size="small"
                  width="80px"
                  error={false}
                  onChange={e => setAttackValue(e.target.value)}
                  onBlur={e => setAttackValue(e.target.value)}
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
                      setAttackSkill(selected)
                      const option = attackOptions.find(
                        o => o.skill === selected
                      )
                      if (option) {
                        setAttackValue(option.value.toString())
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
                </FormControl>
              </Stack>
            </Box>

            {/* Damage and Weapon Block */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{ mb: 2, fontWeight: "medium" }}
              >
                Damage
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <NumberField
                  name="weaponDamage"
                  value={parseInt(weaponDamage) || 0}
                  size="small"
                  width="80px"
                  error={false}
                  onChange={e => setWeaponDamage(e.target.value)}
                  onBlur={e => setWeaponDamage(e.target.value)}
                />
                <FormControl
                  sx={{ flex: 1, "& .MuiInputBase-root": { height: 56 } }}
                >
                  <InputLabel>Weapon</InputLabel>
                  <Select
                    value={selectedWeaponId}
                    onChange={e => {
                      setSelectedWeaponId(e.target.value)
                      if (e.target.value === "unarmed") {
                        const damage = CS.damage(attacker) || 7
                        setWeaponDamage(damage.toString())
                      } else {
                        const weapon = attackerWeapons.find(
                          w => w.id?.toString() === e.target.value
                        )
                        if (weapon) {
                          setWeaponDamage(weapon.damage.toString())
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
                        {weapon.name} (Damage: {weapon.damage})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Box>
          </Stack>
        </>
      )}
    </Box>
  )
}
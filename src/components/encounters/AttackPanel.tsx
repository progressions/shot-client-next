"use client"

import { useState, useMemo } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Stack,
  Divider,
  Alert,
  Autocomplete,
  Avatar as MuiAvatar,
  Chip,
  Tooltip,
} from "@mui/material"
import { useEncounter, useToast } from "@/contexts"
import { CS, VS } from "@/services"
import type { Character, Vehicle, Shot, Weapon } from "@/types"
import { useClient } from "@/contexts/AppContext"
import { NumberField } from "@/components/ui"
import { Avatar } from "@/components/avatars"

interface AttackPanelProps {
  onClose?: () => void
}

export default function AttackPanel({ onClose }: AttackPanelProps) {
  const {
    encounter,
    weapons: encounterWeapons,
    refreshEncounter,
  } = useEncounter()
  const { toastSuccess, toastError } = useToast()
  const client = useClient()

  // State for attack form
  const [attackerShotId, setAttackerShotId] = useState<string>("")
  const [targetShotId, setTargetShotId] = useState<string>("")
  const [attackSkill, setAttackSkill] = useState<string>("")
  const [attackValue, setAttackValue] = useState<string>("")
  const [defenseValue, setDefenseValue] = useState<string>("")
  const [toughnessValue, setToughnessValue] = useState<string>("")
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>("")
  const [weaponDamage, setWeaponDamage] = useState<string>("")
  const [swerve, setSwerve] = useState<string>("")
  const [stunt, setStunt] = useState(false)
  const [dodge, setDodge] = useState(false)
  const [finalDamage, setFinalDamage] = useState<string>("")
  const [shotCost, setShotCost] = useState<string>("3")
  const [isProcessing, setIsProcessing] = useState(false)

  // Get all characters in the fight (excluding hidden ones and vehicles)
  const allShots = useMemo(() => {
    const shots: Shot[] = []
    let index = 0
    encounter.shots.forEach(shotGroup => {
      // Only include if shot value is not null (not hidden)
      if (shotGroup.shot !== null && shotGroup.shot !== undefined) {
        if (shotGroup.characters) {
          shotGroup.characters.forEach(char => {
            shots.push({
              ...shotGroup,
              character: char as Character,
              characters: [char as Character],
              // Add a unique index for handling duplicate names
              uniqueIndex: index++,
            })
          })
        }
        // Skip vehicles - this panel is for character combat only
      }
    })
    return shots
  }, [encounter.shots])

  // Get selected attacker and target
  const attackerShot = allShots.find(
    s =>
      s.character?.shot_id === attackerShotId ||
      s.vehicle?.shot_id === attackerShotId
  )
  const targetShot = allShots.find(
    s =>
      s.character?.shot_id === targetShotId ||
      s.vehicle?.shot_id === targetShotId
  )

  const attacker = attackerShot?.character || attackerShot?.vehicle
  const target = targetShot?.character || targetShot?.vehicle

  // Get weapons for selected attacker from preloaded encounter weapons
  const attackerWeapons = useMemo(() => {
    if (attacker && "action_values" in attacker) {
      const char = attacker as Character
      const weaponIds = char.weapon_ids || []
      return weaponIds
        .map(id => encounterWeapons[id])
        .filter((weapon): weapon is Weapon => weapon !== undefined)
    }
    return []
  }, [attacker, encounterWeapons])

  // Calculate suggested values when selections change
  useMemo(() => {
    if (attacker && "action_values" in attacker) {
      const char = attacker as Character

      // Get attack skills
      const mainAttack = CS.mainAttack(char)
      setAttackSkill(mainAttack)

      // Set suggested attack value
      const av = CS.actionValue(char, mainAttack)
      setAttackValue(av.toString())

      // Set default weapon and damage
      const weaponIds = char.weapon_ids || []
      const charWeapons = weaponIds
        .map(id => encounterWeapons[id])
        .filter((weapon): weapon is Weapon => weapon !== undefined)

      if (charWeapons.length > 0) {
        setSelectedWeaponId(charWeapons[0].id?.toString() || "")
        setWeaponDamage(charWeapons[0].damage.toString())
      } else {
        setSelectedWeaponId("unarmed")
        const damage = CS.damage(char) || 7
        setWeaponDamage(damage.toString())
      }

      // Set shot cost based on character type
      if (CS.isBoss(char) || CS.isUberBoss(char)) {
        setShotCost("2")
      } else {
        setShotCost("3")
      }
    }
  }, [attacker, encounterWeapons])

  useMemo(() => {
    if (target) {
      // Set suggested defense value
      let defense = 0
      let toughness = 0
      if ("action_values" in target) {
        defense = CS.defense(target as Character)
        toughness = CS.toughness(target as Character)
      } else if ("action_values" in target) {
        defense = VS.defense(target as Vehicle)
        // Vehicles don't have toughness in the same way
        toughness = 0
      }

      // Apply dodge bonus if checked
      if (dodge) {
        defense += 3
      }

      // Apply stunt bonus if checked
      if (stunt) {
        defense += 2
      }

      setDefenseValue(defense.toString())
      setToughnessValue(toughness.toString())
    }
  }, [target, dodge, stunt])

  // Calculate damage when swerve is entered
  useMemo(() => {
    if (swerve && attackValue && defenseValue) {
      const av = parseInt(attackValue) || 0
      const dv = parseInt(defenseValue) || 0
      const sw = parseInt(swerve) || 0

      const outcome = av - dv + sw

      if (outcome >= 0) {
        const weaponDmg = parseInt(weaponDamage) || 0
        const totalDamage = outcome + weaponDmg
        setFinalDamage(totalDamage.toString())
      } else {
        setFinalDamage("0")
      }
    }
  }, [swerve, attackValue, defenseValue, weaponDamage])

  const handleDodge = async () => {
    if (!targetShot) return

    setIsProcessing(true)
    try {
      // Spend 1 shot for dodge
      await client.fight.spendShots(encounter, target!, 1)
      setDodge(true)
      toastSuccess("Dodge action taken! +3 Defense")
      await refreshEncounter()
    } catch (error) {
      toastError("Failed to apply dodge")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApplyDamage = async () => {
    if (!target || !targetShot || !finalDamage || !attacker || !attackerShot)
      return

    setIsProcessing(true)
    try {
      const damage = parseInt(finalDamage) || 0
      const shots = parseInt(shotCost) || 3
      const targetChar = target as Character
      const isPC = CS.isPC(targetChar)

      // Spend shots for the attacker
      await client.fight.spendShots(encounter, attacker, shots)

      // Calculate new wounds and impairments
      let newWounds = 0
      let newImpairments = 0

      if (CS.isMook(targetChar)) {
        // Mooks are eliminated on any hit
        newWounds = 0 // Or reduce count
      } else {
        // Apply damage using CharacterService
        const currentWounds = CS.wounds(targetChar)
        const toughness = parseInt(toughnessValue) || 0
        const actualDamage = CS.calculateWounds(targetChar, damage, toughness)
        newWounds = currentWounds + actualDamage

        // Calculate impairments
        const originalImpairments = targetChar.impairments || 0
        const impairmentChange = CS.calculateImpairments(
          targetChar,
          currentWounds,
          newWounds
        )
        newImpairments = originalImpairments + impairmentChange
      }

      // Send update to backend
      await client.fight.updateCombatState(
        encounter,
        targetShot.character?.shot_id || targetShot.vehicle?.shot_id || "",
        isPC ? newWounds : undefined,
        !isPC ? newWounds : undefined,
        newImpairments,
        {
          type: "attack",
          description: `${attacker.name} attacked ${target.name} for ${damage} damage`,
          details: {
            attacker_id: attackerShot.character?.id || attackerShot.vehicle?.id,
            target_id: target.id,
            damage: damage,
            attack_value: parseInt(attackValue),
            defense_value: parseInt(defenseValue),
            swerve: parseInt(swerve),
            outcome:
              parseInt(attackValue) - parseInt(defenseValue) + parseInt(swerve),
            weapon_damage: parseInt(weaponDamage),
            shot_cost: shots,
            stunt: stunt,
            dodge: dodge,
          },
        }
      )

      toastSuccess(`Applied ${damage} damage to ${target.name}`)
      await refreshEncounter()

      // Reset form
      setTargetShotId("")
      setSwerve("")
      setFinalDamage("")
      setDodge(false)
      setStunt(false)

      if (onClose) {
        onClose()
      }
    } catch (error) {
      toastError("Failed to apply damage")
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ p: 0 }}>
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          Attack Resolution
        </Typography>

        {/* Main Content - Attacker then Target */}
        <Box sx={{ backgroundColor: "action.hover" }}>
          {/* Attacker Section */}
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              borderBottom: "2px solid",
              borderBottomColor: "divider",
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ mb: 2, color: "primary.main" }}
            >
              ⚔️ Attacker
            </Typography>

            {/* Avatar Selection */}
            <Box sx={{ mb: 3 }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  overflowX: "auto",
                  overflowY: "hidden",
                  pb: 1,
                  // Enable smooth scrolling
                  scrollBehavior: "smooth",
                  // Enable momentum scrolling on iOS
                  WebkitOverflowScrolling: "touch",
                  // Make sure horizontal scrolling works with trackpad
                  "&::-webkit-scrollbar": {
                    height: 6,
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "action.hover",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "action.disabled",
                    borderRadius: 3,
                  },
                }}
              >
                {allShots.map(shot => {
                  const entity = shot.character || shot.vehicle
                  if (!entity) return null
                  const isSelected = entity.shot_id === attackerShotId

                  return (
                    <Box
                      key={entity.shot_id}
                      onClick={e => {
                        e.preventDefault()
                        setAttackerShotId(entity.shot_id || "")
                      }}
                      sx={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 80,
                        height: 72,
                        borderRadius: 2,
                        border: isSelected
                          ? "3px solid"
                          : "3px solid transparent",
                        borderColor: isSelected
                          ? "primary.main"
                          : "transparent",
                        backgroundColor: isSelected
                          ? "action.selected"
                          : "transparent",
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                        pl: 1,
                        transition: "all 0.2s",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <Avatar
                          entity={entity}
                          href="#"
                          disableImageViewer={true}
                          sx={{
                            width: 64,
                            height: 64,
                            ml: 0.5,
                          }}
                        />
                      </Box>
                    </Box>
                  )
                })}
              </Stack>
            </Box>

            {/* Attack Skill Selection with Attack Value */}
            {attacker && "action_values" in attacker && (
              <Box sx={{ mb: 3 }}>
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
                  {(() => {
                    const char = attacker as Character
                    const mainAttack = CS.mainAttack(char)
                    const mainValue = CS.actionValue(char, mainAttack)
                    const secondaryAttack = CS.secondaryAttack(char)
                    const secondaryValue = secondaryAttack
                      ? CS.actionValue(char, secondaryAttack)
                      : 0

                    const attackOptions = [
                      { skill: mainAttack, value: mainValue },
                      ...(secondaryAttack
                        ? [{ skill: secondaryAttack, value: secondaryValue }]
                        : []),
                    ]

                    return (
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
                            <MenuItem key={option.skill} value={option.skill}>
                              {option.skill} ({option.value})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )
                  })()}
                </Stack>
              </Box>
            )}

            <Stack spacing={2}>
              {/* Damage and Weapon Row */}
              <Box sx={{ mb: 3 }}>
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
                  {attacker && (
                    <FormControl
                      sx={{ flex: 1, "& .MuiInputBase-root": { height: 56 } }}
                    >
                      <InputLabel>Weapon</InputLabel>
                      <Select
                        value={selectedWeaponId}
                        onChange={e => {
                          setSelectedWeaponId(e.target.value)
                          if (e.target.value === "unarmed") {
                            const damage = CS.damage(attacker as Character) || 7
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
                          Damage ({CS.damage(attacker as Character) || 7})
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
                  )}
                </Stack>
              </Box>
            </Stack>
          </Box>

          {/* Target Section */}
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              borderBottom: "2px solid",
              borderBottomColor: "divider",
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ mb: 2, color: "error.main" }}
            >
              🎯 Target
            </Typography>

            {/* Target Avatar Selection */}
            <Box sx={{ mb: 3 }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  overflowX: "auto",
                  overflowY: "hidden",
                  pb: 1,
                  opacity: !attackerShotId ? 0.5 : 1,
                  pointerEvents: !attackerShotId ? "none" : "auto",
                  // Enable smooth scrolling
                  scrollBehavior: "smooth",
                  // Enable momentum scrolling on iOS
                  WebkitOverflowScrolling: "touch",
                  // Make sure horizontal scrolling works with trackpad
                  "&::-webkit-scrollbar": {
                    height: 6,
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "action.hover",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "action.disabled",
                    borderRadius: 3,
                  },
                }}
              >
                {allShots
                  .filter(s => {
                    const entity = s.character
                    // Exclude self
                    if (entity?.shot_id === attackerShotId) return false

                    // If attacker is PC or Ally, only show enemies
                    if (attacker && "action_values" in attacker) {
                      const attackerChar = attacker as Character
                      if (CS.isPC(attackerChar) || CS.isAlly(attackerChar)) {
                        // Only show enemy types for PC/Ally attackers
                        const targetChar = entity as Character
                        return (
                          CS.isMook(targetChar) ||
                          CS.isFeaturedFoe(targetChar) ||
                          CS.isBoss(targetChar) ||
                          CS.isUberBoss(targetChar)
                        )
                      }
                    }

                    return true // Show all for other attacker types
                  })
                  .map(shot => {
                    const entity = shot.character
                    if (!entity) return null
                    const isSelected = entity.shot_id === targetShotId

                    return (
                      <Box
                        key={entity.shot_id}
                        onClick={e => {
                          e.preventDefault()
                          setTargetShotId(entity.shot_id || "")
                        }}
                        sx={{
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 80,
                          height: 72,
                          borderRadius: 2,
                          border: isSelected
                            ? "3px solid"
                            : "3px solid transparent",
                          borderColor: isSelected
                            ? "error.main"
                            : "transparent",
                          backgroundColor: isSelected
                            ? "action.selected"
                            : "transparent",
                          "&:hover": {
                            backgroundColor: "action.hover",
                          },
                          pl: 1,
                          transition: "all 0.2s",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            height: "100%",
                          }}
                        >
                          <Avatar
                            entity={entity}
                            href="#"
                            disableImageViewer={true}
                            sx={{
                              width: 64,
                              height: 64,
                              ml: 0.5,
                            }}
                          />
                        </Box>
                      </Box>
                    )
                  })}
              </Stack>
            </Box>

            {/* Defense and Toughness Values */}
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" spacing={2} alignItems="flex-end">
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 2, fontWeight: "medium" }}
                  >
                    Defense
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <NumberField
                      name="defenseValue"
                      value={parseInt(defenseValue) || 0}
                      size="small"
                      width="80px"
                      error={false}
                      onChange={e => setDefenseValue(e.target.value)}
                      onBlur={e => setDefenseValue(e.target.value)}
                    />
                    {(() => {
                      let total = 0
                      if (stunt) total += 2
                      if (dodge) total += 3
                      return total > 0 ? (
                        <Typography variant="caption">+{total}</Typography>
                      ) : null
                    })()}
                  </Stack>
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 2, fontWeight: "medium" }}
                  >
                    Toughness
                  </Typography>
                  <NumberField
                    name="toughnessValue"
                    value={parseInt(toughnessValue) || 0}
                    size="small"
                    width="80px"
                    error={false}
                    onChange={e => setToughnessValue(e.target.value)}
                    onBlur={e => setToughnessValue(e.target.value)}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Modifiers */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: "medium" }}>
                Defense Modifiers
              </Typography>
              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={stunt}
                      onChange={e => setStunt(e.target.checked)}
                      disabled={!target}
                    />
                  }
                  label="Stunt (+2 DV)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dodge}
                      onChange={e => setDodge(e.target.checked)}
                      disabled={!targetShot}
                    />
                  }
                  label="Dodge (+3 DV, costs 1 shot)"
                />
                {dodge && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleDodge}
                    disabled={isProcessing}
                    fullWidth
                  >
                    Apply Dodge (-1 Shot)
                  </Button>
                )}
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* Bottom Section - Combat Resolution */}
        <Box
          sx={{ p: { xs: 2, sm: 3 }, backgroundColor: "background.default" }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ textAlign: "center", mb: { xs: 2, sm: 3 } }}
          >
            🎲 Combat Resolution
          </Typography>

          <Stack
            direction="row"
            spacing={{ xs: 1, sm: 2 }}
            alignItems="center"
            justifyContent="center"
            sx={{ flexWrap: { xs: "wrap", sm: "nowrap" } }}
          >
            {/* Shot Cost */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: { xs: "70px", sm: "auto" },
              }}
            >
              <Typography
                variant="caption"
                sx={{ mb: 0.5, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
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

            {/* Dice Roll */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: { xs: "80px", sm: "auto" },
              }}
            >
              <Typography
                variant="caption"
                sx={{ mb: 0.5, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
              >
                Swerve
              </Typography>
              <NumberField
                name="swerve"
                value={
                  swerve === ""
                    ? 0
                    : isNaN(parseInt(swerve))
                      ? 0
                      : parseInt(swerve)
                }
                size="small"
                width="100px"
                error={false}
                onChange={e => {
                  const val = e.target.value
                  if (val === "" || val === "-" || !isNaN(parseInt(val))) {
                    setSwerve(val)
                  }
                }}
                onBlur={e => {
                  const val = e.target.value
                  if (val === "" || val === "-") {
                    setSwerve("0")
                  } else {
                    setSwerve(val)
                  }
                }}
              />
            </Box>

            {/* Final Damage Override */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: { xs: "80px", sm: "auto" },
              }}
            >
              <Typography
                variant="caption"
                sx={{ mb: 0.5, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
              >
                Final Damage
              </Typography>
              <NumberField
                name="finalDamage"
                value={parseInt(finalDamage) || 0}
                size="small"
                width="100px"
                error={false}
                onChange={e => setFinalDamage(e.target.value)}
                onBlur={e => setFinalDamage(e.target.value)}
              />
            </Box>

            {/* Apply Damage Button */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                height: "100%",
                pt: { xs: "8px", sm: "20px" },
                width: { xs: "100%", sm: "auto" },
                mt: { xs: 2, sm: 0 },
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleApplyDamage}
                disabled={!target || !finalDamage || isProcessing}
                size="large"
                sx={{
                  height: 56,
                  px: { xs: 2, sm: 3 },
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                Apply Damage
              </Button>
            </Box>
          </Stack>

          {/* Damage Calculation */}
          {swerve && (
            <Box sx={{ mt: 3 }}>
              <Alert severity="info">
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>
                      Attack Value {attackValue} + Swerve {swerve} = Action
                      Result {parseInt(attackValue) + parseInt(swerve)}
                    </strong>
                  </Typography>
                  <Typography variant="body2">
                    <strong>
                      Action Result {parseInt(attackValue) + parseInt(swerve)} -
                      Defense {defenseValue} = Outcome{" "}
                      {parseInt(attackValue) +
                        parseInt(swerve) -
                        parseInt(defenseValue)}
                      .
                    </strong>
                    {parseInt(attackValue) +
                      parseInt(swerve) -
                      parseInt(defenseValue) >=
                    0 ? (
                      <span style={{ color: "#4caf50", fontWeight: "bold" }}>
                        {" "}
                        Hit!
                      </span>
                    ) : (
                      <span style={{ color: "#f44336", fontWeight: "bold" }}>
                        {" "}
                        Miss!
                      </span>
                    )}
                  </Typography>
                  {parseInt(attackValue) +
                    parseInt(swerve) -
                    parseInt(defenseValue) >=
                  0 ? (
                    <>
                      <Typography variant="body2">
                        <strong>
                          Outcome{" "}
                          {parseInt(attackValue) +
                            parseInt(swerve) -
                            parseInt(defenseValue)}{" "}
                          + Damage {weaponDamage} = Smackdown{" "}
                          {parseInt(attackValue) +
                            parseInt(swerve) -
                            parseInt(defenseValue) +
                            parseInt(weaponDamage)}
                        </strong>
                      </Typography>
                      {toughnessValue && target && (
                        <Typography variant="body2">
                          <strong>
                            Smackdown{" "}
                            {parseInt(attackValue) +
                              parseInt(swerve) -
                              parseInt(defenseValue) +
                              parseInt(weaponDamage)}{" "}
                            - Toughness {parseInt(toughnessValue) || 0} ={" "}
                            {CS.calculateWounds(
                              target as Character,
                              parseInt(attackValue) +
                                parseInt(swerve) -
                                parseInt(defenseValue) +
                                parseInt(weaponDamage),
                              parseInt(toughnessValue) || 0
                            )}{" "}
                            Wounds
                          </strong>
                        </Typography>
                      )}
                    </>
                  ) : null}
                </Stack>
              </Alert>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

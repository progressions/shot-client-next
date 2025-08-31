"use client"

import { useState, useMemo, useEffect } from "react"
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
import CharacterSelector from "./CharacterSelector"

interface AttackPanelProps {
  onClose?: () => void
}

export default function AttackPanel({ onClose }: AttackPanelProps) {
  const {
    encounter,
    weapons: encounterWeapons,
    ec,
  } = useEncounter()
  const { toastSuccess, toastError } = useToast()
  const { client } = useClient()

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
  const [dodgeApplied, setDodgeApplied] = useState(false)

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

  // Sort attacker shots by: shot position (higher first), character type priority, then speed
  const sortedAttackerShots = useMemo(() => {
    const typeOrder: { [key: string]: number } = {
      'Uber-Boss': 1,
      'Boss': 2,
      'PC': 3,
      'Ally': 4,
      'Featured Foe': 5,
      'Mook': 6,
    }

    return [...allShots].sort((a, b) => {
      // First sort by shot position (higher shots first - shot 20 before shot 15)
      if (a.shot !== b.shot) {
        return (b.shot || 0) - (a.shot || 0)
      }

      const charA = a.character
      const charB = b.character
      
      if (!charA || !charB) return 0

      // Then sort by character type priority
      const typeA = typeOrder[CS.type(charA)] || 999
      const typeB = typeOrder[CS.type(charB)] || 999
      
      if (typeA !== typeB) {
        return typeA - typeB
      }

      // Finally sort by Speed (higher speed first)
      const speedA = CS.speed(charA) || 0
      const speedB = CS.speed(charB) || 0
      
      return speedB - speedA
    })
  }, [allShots])

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

  // Sort targets based on attacker type
  const sortedTargetShots = useMemo(() => {
    if (!attacker) return allShots

    const attackerChar = attacker as Character
    const attackerType = CS.type(attackerChar)
    const isNPCAttacker = ['Mook', 'Featured Foe', 'Boss', 'Uber-Boss'].includes(attackerType)

    if (!isNPCAttacker) {
      // If attacker is not an NPC, return normal order
      return allShots
    }

    // Sort: PCs first, then Allies, then others
    return [...allShots].sort((a, b) => {
      const charA = a.character
      const charB = b.character
      
      if (!charA || !charB) return 0
      
      const typeA = CS.type(charA)
      const typeB = CS.type(charB)
      
      const isPC_A = typeA === 'PC'
      const isPC_B = typeB === 'PC'
      const isAlly_A = typeA === 'Ally'
      const isAlly_B = typeB === 'Ally'
      
      // PCs come first
      if (isPC_A && !isPC_B) return -1
      if (!isPC_A && isPC_B) return 1
      
      // Then Allies
      if (isAlly_A && !isAlly_B && !isPC_B) return -1
      if (!isAlly_A && isAlly_B && !isPC_A) return 1
      
      // Others remain in original order
      return 0
    })
  }, [allShots, attacker])

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

  // Reset dodge applied when target changes
  useEffect(() => {
    setDodgeApplied(false)
    setDodge(false)
  }, [targetShotId])

  const handleDodge = async () => {
    if (!targetShot || !target) {
      toastError("Please select a target first")
      return
    }

    setIsProcessing(true)
    try {
      // Spend 1 shot for dodge using the encounter client
      await ec.spendShots(target, 1)
      setDodgeApplied(true) // Mark that dodge has been applied
      // Keep dodge checked - it represents that dodge was used for this attack
      // Don't reset it here since we need the +3 defense to remain
      toastSuccess("Dodge applied! Target moved down 1 shot (+3 Defense)")
      // The encounter will update automatically via WebSocket
    } catch (error) {
      console.error("Dodge error:", error)
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
      await ec.spendShots(attacker, shots)

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
      await client.updateCombatState(
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
              sx={{ mb: 2, color: "primary.main" }}
            >
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
                  // No filtering for attacker selector - shows all characters
                />
              </Box>
              
              {/* Shot Cost */}
              <Box sx={{ flexShrink: 0 }}>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
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
                  </Stack>
                </Box>
              </Stack>
            )}
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
            <CharacterSelector
              shots={sortedTargetShots}
              selectedShotId={targetShotId}
              onSelect={setTargetShotId}
              borderColor="error.main"
              disabled={!attackerShotId}
              showAllCheckbox={true}
              excludeShotId={attackerShotId}
              characterTypes={(() => {
                if (!attacker) return undefined
                const attackerChar = attacker as Character
                
                // If attacker is PC or Ally, show enemies
                if (CS.isPC(attackerChar) || CS.isAlly(attackerChar)) {
                  return ["Mook", "Featured Foe", "Boss", "Uber-Boss"]
                }
                
                // If attacker is NPC (Mook, Featured Foe, Boss, Uber Boss), show PCs and Allies
                if (CS.isMook(attackerChar) || CS.isFeaturedFoe(attackerChar) || 
                    CS.isBoss(attackerChar) || CS.isUberBoss(attackerChar)) {
                  return ["PC", "Ally"]
                }
                
                // For other types, show all
                return undefined
              })()}
            />

            {/* Defense and Toughness Values */}
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 2, fontWeight: "medium" }}
                  >
                    Defense
                  </Typography>
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
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5, minHeight: '20px', textAlign: 'center' }}>
                        +{total}
                      </Typography>
                    ) : (
                      <Box sx={{ minHeight: '20px', mt: 0.5 }} />
                    )
                  })()}
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
                  {/* TODO: Future toughness modifiers (armor, schticks, etc.) will display here */}
                  <Box sx={{ minHeight: '20px', mt: 0.5 }} />
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
                  <Box sx={{ mt: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleDodge}
                      disabled={isProcessing || dodgeApplied}
                    >
                      {dodgeApplied ? "Dodge Applied" : "Apply Dodge (-1 Shot)"}
                    </Button>
                  </Box>
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
                size="large"
                width="120px"
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
                size="large"
                width="120px"
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

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
} from "@mui/material"
import { useEncounter, useToast } from "@/contexts"
import { CS, VS } from "@/services"
import type { Character, Vehicle, Shot, Weapon } from "@/types"
import { useClient } from "@/contexts/AppContext"

interface AttackPanelProps {
  onClose?: () => void
}

export default function AttackPanel({ onClose }: AttackPanelProps) {
  const { encounter, weapons: encounterWeapons, refreshEncounter } = useEncounter()
  const { toastSuccess, toastError } = useToast()
  const client = useClient()
  
  // State for attack form
  const [attackerShotId, setAttackerShotId] = useState<string>("")
  const [targetShotId, setTargetShotId] = useState<string>("")
  const [attackSkill, setAttackSkill] = useState<string>("")
  const [attackValue, setAttackValue] = useState<string>("")
  const [defenseValue, setDefenseValue] = useState<string>("")
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>("")
  const [weaponDamage, setWeaponDamage] = useState<string>("")
  const [swerve, setSwerve] = useState<string>("")
  const [stunt, setStunt] = useState(false)
  const [dodge, setDodge] = useState(false)
  const [finalDamage, setFinalDamage] = useState<string>("")
  const [shotCost, setShotCost] = useState<string>("3")
  const [isProcessing, setIsProcessing] = useState(false)

  // Get all characters and vehicles in the fight (excluding hidden ones)
  const allShots = useMemo(() => {
    const shots: Shot[] = []
    let index = 0
    encounter.shots.forEach((shotGroup) => {
      // Only include if shot value is not null (not hidden)
      if (shotGroup.shot !== null && shotGroup.shot !== undefined) {
        if (shotGroup.characters) {
          shotGroup.characters.forEach((char) => {
            shots.push({
              ...shotGroup,
              character: char as Character,
              characters: [char as Character],
              // Add a unique index for handling duplicate names
              uniqueIndex: index++,
            })
          })
        }
        if (shotGroup.vehicles) {
          shotGroup.vehicles.forEach((veh) => {
            shots.push({
              ...shotGroup,
              vehicle: veh as Vehicle,
              vehicles: [veh as Vehicle],
              // Add a unique index for handling duplicate names
              uniqueIndex: index++,
            })
          })
        }
      }
    })
    return shots
  }, [encounter.shots])

  // Get selected attacker and target
  const attackerShot = allShots.find(
    (s) => s.character?.shot_id === attackerShotId || s.vehicle?.shot_id === attackerShotId
  )
  const targetShot = allShots.find(
    (s) => s.character?.shot_id === targetShotId || s.vehicle?.shot_id === targetShotId
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
      if ("action_values" in target) {
        defense = CS.defense(target as Character)
      } else if ("action_values" in target) {
        defense = VS.defense(target as Vehicle)
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
    if (!target || !targetShot || !finalDamage || !attacker || !attackerShot) return
    
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
        const toughness = CS.toughness(targetChar)
        const actualDamage = Math.max(0, damage - toughness)
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
            outcome: parseInt(attackValue) - parseInt(defenseValue) + parseInt(swerve),
            weapon_damage: parseInt(weaponDamage),
            shot_cost: shots,
            stunt: stunt,
            dodge: dodge,
          }
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
        <Typography variant="h6" sx={{ textAlign: 'center', py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          Attack Resolution
        </Typography>
        
        {/* Top Section - Attacker vs Target */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: 400 }}>
          {/* Attacker Side */}
          <Box sx={{ 
            flex: '0 0 58%',
            p: 3,
            borderRight: { md: '2px solid' }, 
            borderRightColor: { md: 'divider' },
            borderBottom: { xs: '2px solid', md: 'none' },
            borderBottomColor: { xs: 'divider' },
            backgroundColor: 'action.hover'
          }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
              ⚔️ Attacker
            </Typography>
            <Autocomplete
              fullWidth
              sx={{ mb: 3 }}
              options={allShots}
              value={allShots.find(s => {
                const entity = s.character || s.vehicle
                return entity?.shot_id === attackerShotId
              }) || null}
              onChange={(_, newValue) => {
                const entity = newValue?.character || newValue?.vehicle
                setAttackerShotId(entity?.shot_id || "")
              }}
              getOptionLabel={(option) => {
                const entity = option.character || option.vehicle
                const location = option.location ? ` - ${option.location}` : ""
                return entity ? `${entity.name} (Shot ${option.shot})${location}` : ""
              }}
              renderInput={(params) => (
                <TextField {...params} label="Select Attacker" />
              )}
              isOptionEqualToValue={(option, value) => {
                const optEntity = option.character || option.vehicle
                const valEntity = value?.character || value?.vehicle
                return optEntity?.shot_id === valEntity?.shot_id
              }}
            />
            
            {/* Attack Skill Selection with Attack Value */}
            {attacker && "action_values" in attacker && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 2, fontWeight: 'medium' }}>Attack Skill</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    label="AV"
                    type="number"
                    value={attackValue}
                    onChange={(e) => setAttackValue(e.target.value)}
                    sx={{ 
                      minWidth: 80, 
                      maxWidth: 80,
                      '& .MuiInputBase-root': {
                        height: 56
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '1.2rem'
                      }
                    }}
                    disabled={!attacker}
                  />
                  {(() => {
                    const char = attacker as Character
                    const mainAttack = CS.mainAttack(char)
                    const mainValue = CS.actionValue(char, mainAttack)
                    const secondaryAttack = CS.secondaryAttack(char)
                    const secondaryValue = secondaryAttack ? CS.actionValue(char, secondaryAttack) : 0
                    
                    return (
                      <>
                        <Button
                          variant={attackSkill === mainAttack ? "contained" : "outlined"}
                          onClick={() => {
                            setAttackSkill(mainAttack)
                            setAttackValue(mainValue.toString())
                          }}
                          sx={{ 
                            minWidth: 120,
                            height: 56,
                            fontSize: '0.875rem'
                          }}
                        >
                          {mainAttack} {mainValue}
                        </Button>
                        {secondaryAttack && (
                          <Button
                            variant={attackSkill === secondaryAttack ? "contained" : "outlined"}
                            onClick={() => {
                              setAttackSkill(secondaryAttack)
                              setAttackValue(secondaryValue.toString())
                            }}
                            sx={{ 
                              minWidth: 120,
                              height: 56,
                              fontSize: '0.875rem'
                            }}
                          >
                            {secondaryAttack} {secondaryValue}
                          </Button>
                        )}
                      </>
                    )
                  })()}
                </Stack>
              </Box>
            )}
            
            <Stack spacing={2}>
              {/* Damage and Weapon Row */}
              <Stack direction="row" spacing={1}>
                <TextField
                  label="Damage"
                  type="number"
                  value={weaponDamage}
                  onChange={(e) => setWeaponDamage(e.target.value)}
                  sx={{ 
                    minWidth: 80, 
                    maxWidth: 80,
                    '& .MuiInputBase-root': {
                      height: 56
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '1.2rem'
                    }
                  }}
                  disabled={!attacker}
                />
                {attacker && (
                  <FormControl fullWidth sx={{ '& .MuiInputBase-root': { height: 56 } }}>
                    <InputLabel>Weapon</InputLabel>
                    <Select
                      value={selectedWeaponId}
                      onChange={(e) => {
                        setSelectedWeaponId(e.target.value)
                        if (e.target.value === "unarmed") {
                          const damage = CS.damage(attacker as Character) || 7
                          setWeaponDamage(damage.toString())
                        } else {
                          const weapon = attackerWeapons.find(w => w.id?.toString() === e.target.value)
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
                      {attackerWeapons.map((weapon) => (
                        <MenuItem key={weapon.id} value={weapon.id?.toString() || ""}>
                          {weapon.name} (Damage: {weapon.damage})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Stack>
              
            </Stack>
          </Box>
          
          {/* Target Side */}
          <Box sx={{ 
            flex: '0 0 42%',
            p: 3,
            backgroundColor: 'action.hover'
          }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'error.main' }}>
              🎯 Target
            </Typography>
            
            <Autocomplete
              fullWidth
              sx={{ mb: 3 }}
              options={allShots.filter((s) => {
                const entity = s.character || s.vehicle
                // Exclude self
                if (entity?.shot_id === attackerShotId) return false
                
                // If attacker is PC or Ally, only show enemies
                if (attacker && "action_values" in attacker) {
                  const attackerChar = attacker as Character
                  if (CS.isPC(attackerChar) || CS.isAlly(attackerChar)) {
                    // Only show enemy types for PC/Ally attackers
                    if (entity && "action_values" in entity) {
                      const targetChar = entity as Character
                      return CS.isMook(targetChar) || 
                             CS.isFeaturedFoe(targetChar) || 
                             CS.isBoss(targetChar) || 
                             CS.isUberBoss(targetChar)
                    }
                    return false // Exclude vehicles when attacker is PC/Ally
                  }
                }
                
                return true // Show all for other attacker types
              })}
              value={allShots.find(s => {
                const entity = s.character || s.vehicle
                return entity?.shot_id === targetShotId
              }) || null}
              onChange={(_, newValue) => {
                const entity = newValue?.character || newValue?.vehicle
                setTargetShotId(entity?.shot_id || "")
              }}
              getOptionLabel={(option) => {
                const entity = option.character || option.vehicle
                const location = option.location ? ` - ${option.location}` : ""
                return entity ? `${entity.name} (Shot ${option.shot})${location}` : ""
              }}
              renderInput={(params) => (
                <TextField {...params} label="Select Target" />
              )}
              isOptionEqualToValue={(option, value) => {
                const optEntity = option.character || option.vehicle
                const valEntity = value?.character || value?.vehicle
                return optEntity?.shot_id === valEntity?.shot_id
              }}
              disabled={!attackerShotId}
            />
            
            {/* Defense Value - aligned with Attack Skill section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 'medium' }}>Defense</Typography>
              <TextField
                label="DV"
                type="number"
                value={defenseValue}
                onChange={(e) => setDefenseValue(e.target.value)}
                helperText={(() => {
                  let total = 0
                  if (stunt) total += 2
                  if (dodge) total += 3
                  return total > 0 ? `+${total}` : ""
                })()}
                sx={{ 
                  minWidth: 80, 
                  maxWidth: 80,
                  '& .MuiInputBase-root': {
                    height: 56
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '1.2rem'
                  }
                }}
                disabled={!target}
              />
            </Box>
            
            {/* Modifiers */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>Defense Modifiers</Typography>
              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={stunt}
                      onChange={(e) => setStunt(e.target.checked)}
                      disabled={!target}
                    />
                  }
                  label="Stunt (+2 DV)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dodge}
                      onChange={(e) => setDodge(e.target.checked)}
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
        <Box sx={{ p: 3, backgroundColor: 'background.default', borderTop: '2px solid', borderColor: 'divider' }}>
          <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
            🎲 Combat Resolution
          </Typography>
          
          <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="center">
            {/* Shot Cost */}
            <TextField
              label="Shot Cost"
              type="number"
              value={shotCost}
              onChange={(e) => setShotCost(e.target.value)}
              sx={{ 
                minWidth: 80, 
                maxWidth: 80
              }}
              disabled={!attacker}
            />
            
            {/* Dice Roll */}
            <TextField
              label="Swerve"
              type="number"
              value={swerve}
              onChange={(e) => setSwerve(e.target.value)}
              sx={{ 
                minWidth: 120,
                maxWidth: 120
              }}
              disabled={!attackValue || !defenseValue}
            />
            
            {/* Final Damage Override */}
            <TextField
              label="Final Damage"
              type="number"
              value={finalDamage}
              onChange={(e) => setFinalDamage(e.target.value)}
              sx={{ 
                minWidth: 120,
                maxWidth: 120
              }}
            />
            
            {/* Apply Damage Button */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleApplyDamage}
              disabled={!target || !finalDamage || isProcessing}
              size="large"
              sx={{ 
                minHeight: 56,
                px: 3
              }}
            >
              Apply Damage
            </Button>
          </Stack>
          
          {/* Damage Calculation */}
          {swerve && (
            <Box sx={{ mt: 3 }}>
              <Alert severity="info">
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Attack: {attackValue} - {defenseValue} + {swerve} = {
                    parseInt(attackValue) - parseInt(defenseValue) + parseInt(swerve)
                  }
                </Typography>
                {parseInt(attackValue) - parseInt(defenseValue) + parseInt(swerve) >= 0 && (
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    Damage: {parseInt(attackValue) - parseInt(defenseValue) + parseInt(swerve)} + {weaponDamage} = {finalDamage}
                  </Typography>
                )}
              </Alert>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
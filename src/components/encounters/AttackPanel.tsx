"use client"

/**
 * AttackPanel - Attack Panel with improved UX flow
 *
 * Key features:
 * 1. Top-to-bottom workflow that matches natural reading order
 * 2. Prominent "Action Zone" at the bottom for Swerve/Apply - the final step
 * 3. Compact attacker bar at top (expandable for details)
 * 4. Clear visual hierarchy: Attacker → Targets → Resolve
 * 5. Attack resolution is visually prominent and unmissable
 */

import { Box, Typography } from "@mui/material"
import { GiSwordsPower } from "react-icons/gi"
import { useEncounter } from "@/contexts"
import { CS } from "@/services"
import type { Character } from "@/types"
import BasePanel from "./BasePanel"
import AttackerBar from "./attacks/AttackerBar"
import TargetSection from "./attacks/TargetSection"
import MookAttackSection from "./attacks/MookAttackSection"
import ActionZone from "./attacks/ActionZone"
import AttackResults from "./attacks/AttackResults"
import { useAttackPanelController } from "./attacks/useAttackPanelController"

interface AttackPanelProps {
  onComplete?: () => void
  preselectedAttacker: Character
}

export default function AttackPanel({
  onComplete,
  preselectedAttacker,
}: AttackPanelProps) {
  const { encounter } = useEncounter()

  const {
    isReady,
    formState,
    dispatchForm,
    updateField,
    updateFields,
    attacker,
    attackerWeapons,
    allShots,
    sortedTargetShots,
    selectedTargetIds,
    calculateEffectiveAttackValue,
    handleRollMookAttacks,
    handleApplyDamage,
    calculateTargetDefense,
    updateDefenseAndToughness,
    distributeMooks,
  } = useAttackPanelController({ preselectedAttacker, onComplete })

  // Destructure commonly used values from formState.data for rendering
  const {
    attackerShotId,
    attackValue,
    defenseValue,
    weaponDamage,
    swerve,
    smackdown,
    finalDamage,
    shotCost,
    isProcessing,
    mookRolls,
    showMookRolls,
    totalAttackingMooks,
    multiTargetResults,
    showMultiTargetResults,
    targetMookCount,
    defenseChoicePerTarget,
    fortuneBonus,
  } = formState.data

  const isMookAttacker = attacker && CS.isMook(attacker)

  return (
    <BasePanel title="Attack" icon={<GiSwordsPower />} borderColor="error.main">
      {isReady ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            p: 1,
          }}
        >
          {/* STEP 1: Attacker Stats (Compact Bar) */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mb: 0.5,
                color: "text.secondary",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontSize: "0.65rem",
              }}
            >
              Step 1: Attacker
            </Typography>
            <AttackerBar
              formState={formState}
              dispatchForm={dispatchForm}
              attacker={attacker}
              attackerWeapons={attackerWeapons}
              selectedTargetIds={selectedTargetIds}
              allShots={allShots}
            />
          </Box>

          {/* STEP 2: Target Selection */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mb: 0.5,
                color: "text.secondary",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontSize: "0.65rem",
              }}
            >
              Step 2: Select Target{selectedTargetIds.length > 1 ? "s" : ""}
            </Typography>
            <Box
              sx={{
                backgroundColor: "background.paper",
                borderRadius: 1,
                border: "1px solid",
                borderColor:
                  selectedTargetIds.length > 0 ? "warning.main" : "divider",
                transition: "border-color 0.2s ease",
              }}
            >
              <TargetSection
                allShots={allShots}
                sortedTargetShots={sortedTargetShots}
                formState={formState}
                dispatchForm={dispatchForm}
                attacker={attacker}
                attackerShotId={attackerShotId}
                updateField={updateField}
                updateFields={updateFields}
                updateDefenseAndToughness={updateDefenseAndToughness}
                distributeMooks={distributeMooks}
                calculateTargetDefense={calculateTargetDefense}
                encounter={encounter}
              />
            </Box>
          </Box>

          {/* STEP 3: Resolve Attack - THE PROMINENT ACTION ZONE */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mb: 0.5,
                color:
                  selectedTargetIds.length > 0
                    ? "error.main"
                    : "text.secondary",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontSize: "0.65rem",
                transition: "color 0.2s ease",
              }}
            >
              Step 3: Resolve Attack
            </Typography>

            {/* For Mook Attackers - use existing MookAttackSection */}
            {isMookAttacker ? (
              <Box
                sx={{
                  backgroundColor: "background.paper",
                  borderRadius: 1,
                  border: "2px solid",
                  borderColor: "error.main",
                  p: 1,
                }}
              >
                <MookAttackSection
                  attacker={attacker}
                  allShots={allShots}
                  selectedTargetIds={selectedTargetIds}
                  mookRolls={mookRolls}
                  showMookRolls={showMookRolls}
                  totalAttackingMooks={totalAttackingMooks}
                  finalDamage={finalDamage}
                  shotCost={shotCost}
                  attackValue={attackValue}
                  isProcessing={isProcessing}
                  updateField={updateField}
                  handleRollMookAttacks={handleRollMookAttacks}
                  handleApplyDamage={handleApplyDamage}
                />
              </Box>
            ) : (
              /* For Non-Mook Attackers - use new ActionZone */
              <ActionZone
                attackValue={attackValue}
                swerve={swerve}
                smackdown={smackdown}
                finalDamage={finalDamage}
                shotCost={shotCost}
                defenseValue={defenseValue}
                weaponDamage={weaponDamage}
                selectedTargetIds={selectedTargetIds}
                allShots={allShots}
                attacker={attacker}
                showMultiTargetResults={showMultiTargetResults}
                multiTargetResults={multiTargetResults}
                isProcessing={isProcessing}
                updateField={updateField}
                handleApplyDamage={handleApplyDamage}
              />
            )}
          </Box>

          {/* Attack Results Detail (expandable, less prominent) */}
          {showMultiTargetResults && multiTargetResults.length > 1 && (
            <Box
              sx={{
                backgroundColor: "action.hover",
                borderRadius: 1,
                p: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mb: 1,
                  color: "text.secondary",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontSize: "0.65rem",
                }}
              >
                Attack Breakdown
              </Typography>
              <AttackResults
                attacker={attacker}
                attackerWeapons={attackerWeapons}
                allShots={allShots}
                selectedTargetIds={selectedTargetIds}
                multiTargetResults={multiTargetResults}
                attackValue={attackValue}
                swerve={swerve}
                defenseValue={defenseValue}
                weaponDamage={weaponDamage}
                smackdown={smackdown}
                fortuneBonus={fortuneBonus}
                defenseChoicePerTarget={defenseChoicePerTarget}
                calculateEffectiveAttackValue={calculateEffectiveAttackValue}
                calculateTargetDefense={calculateTargetDefense}
              />
            </Box>
          )}
        </Box>
      ) : null}
    </BasePanel>
  )
}

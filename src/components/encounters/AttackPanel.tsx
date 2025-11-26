"use client"

import { Box } from "@mui/material"
import { GiSwordsPower } from "react-icons/gi"
import { useEncounter } from "@/contexts"
import { CS } from "@/services"
import type { Character } from "@/types"
import BasePanel from "./BasePanel"
import AttackerCombatFields from "./attacks/AttackerCombatFields"
import TargetSection from "./attacks/TargetSection"
import WoundsSummary from "./attacks/WoundsSummary"
import MookAttackSection from "./attacks/MookAttackSection"
import CombatResolution from "./attacks/CombatResolution"
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

  return (
    <BasePanel title="Attack" icon={<GiSwordsPower />} borderColor="error.main">
      {/* Main Content - Two Column Grid */}
      {isReady ? (
        <>
          {/* Two-column layout for Attacker/Resolution and Target */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 0.5,
              p: 0.5,
              backgroundColor: "action.hover",
            }}
          >
            {/* Left Column: Attacker and Resolution */}
            <Box sx={{ minWidth: 0 }}>
              <AttackerCombatFields
                formState={formState}
                dispatchForm={dispatchForm}
                attacker={attacker}
                attackerWeapons={attackerWeapons}
                selectedTargetIds={selectedTargetIds}
                allShots={allShots}
              />

              {/* Resolution Section - below Attacker */}
              <Box sx={{ mt: 1 }}>
                {/* Show different UI for mook attackers */}
                {attacker && CS.isMook(attacker) ? (
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
                ) : (
                  <CombatResolution
                    attacker={attacker}
                    allShots={allShots}
                    selectedTargetIds={selectedTargetIds}
                    swerve={swerve}
                    smackdown={smackdown}
                    finalDamage={finalDamage}
                    shotCost={shotCost}
                    showMultiTargetResults={showMultiTargetResults}
                    multiTargetResults={multiTargetResults}
                    isProcessing={isProcessing}
                    updateField={updateField}
                    handleApplyDamage={handleApplyDamage}
                  />
                )}
              </Box>
            </Box>

            {/* Right Column: Target */}
            <Box sx={{ minWidth: 0 }}>
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

          {/* Bottom Section - Attack Results */}
          <Box sx={{ p: 0.5, backgroundColor: "background.default" }}>
            {/* Attack Results for Non-Mook Attackers (single or multiple targets) */}
            {showMultiTargetResults && (
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
            )}

            {/* Summary of wounds to apply */}
            {showMultiTargetResults && multiTargetResults.length > 0 && (
              <WoundsSummary
                multiTargetResults={multiTargetResults}
                allShots={allShots}
                calculateTargetDefense={calculateTargetDefense}
                defenseChoicePerTarget={defenseChoicePerTarget}
                selectedTargetIds={selectedTargetIds}
                attackValue={attackValue}
                swerve={swerve}
                weaponDamage={weaponDamage}
                targetMookCount={targetMookCount}
                finalDamage={finalDamage}
              />
            )}
          </Box>
        </>
      ) : null}
    </BasePanel>
  )
}

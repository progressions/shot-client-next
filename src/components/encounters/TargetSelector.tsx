"use client"
import React, { useMemo } from "react"
import type { Character, Vehicle, Shot } from "@/types"
import CharacterSelector from "./CharacterSelector"

// Re-exporting this type for convenience in parent components
export type CharacterTypeFilter =
  | "PC"
  | "Ally"
  | "Mook"
  | "Featured Foe"
  | "Boss"
  | "Uber-Boss"

interface TargetSelectorProps {
  // Data
  allShots: Shot[]
  actor?: Character | Vehicle // The character performing the action

  // Configuration from CharacterSelector that we want to expose
  selectionMode?: "single" | "multiple"
  filterFunction?: (character: Character) => boolean
  characterTypes?: CharacterTypeFilter[]
  excludeShotId?: string
  disabled?: boolean
  showShotNumbers?: boolean
  borderColor?: string

  // State Management
  selectedIds: string | string[]
  onSelectionChange: (selectedIds: string | string[]) => void

  // UI Customization
  children?: (selectedTargets: (Character | Vehicle)[]) => React.ReactNode
}

export default function TargetSelector({
  allShots,
  selectionMode = "single",
  filterFunction,
  characterTypes,
  excludeShotId,
  disabled,
  showShotNumbers,
  borderColor,
  selectedIds,
  onSelectionChange,
  children,
}: TargetSelectorProps) {
  const handleSelect = (shotId: string) => {
    if (selectionMode === "single") {
      // For single select, deselect if clicking the same one
      const newSelection = selectedIds === shotId ? "" : shotId
      onSelectionChange(newSelection)
    } else {
      // For multi-select, toggle the ID in the array
      const currentSelection = (selectedIds as string[]) || []
      const newSelection = currentSelection.includes(shotId)
        ? currentSelection.filter(id => id !== shotId)
        : [...currentSelection, shotId]
      onSelectionChange(newSelection)
    }
  }

  const selectedTargets = useMemo(() => {
    const ids = Array.isArray(selectedIds) ? selectedIds : [selectedIds]
    if (ids.length === 0 || !ids[0]) return []

    const targets: (Character | Vehicle)[] = []
    const targetMap = new Map(ids.map(id => [id, true]))

    for (const shot of allShots) {
      const entity = shot.character || shot.vehicle
      if (entity && targetMap.has(entity.shot_id!)) {
        targets.push(entity)
      }
    }
    return targets
  }, [selectedIds, allShots])

  return (
    <>
      <CharacterSelector
        shots={allShots}
        selectedShotId={
          selectionMode === "single" ? (selectedIds as string) : undefined
        }
        selectedShotIds={
          selectionMode === "multiple" ? (selectedIds as string[]) : undefined
        }
        onSelect={handleSelect}
        multiSelect={selectionMode === "multiple"}
        filterFunction={filterFunction}
        characterTypes={characterTypes}
        excludeShotId={excludeShotId}
        disabled={disabled}
        showShotNumbers={showShotNumbers}
        borderColor={borderColor}
      />
      {children && children(selectedTargets)}
    </>
  )
}
/**
 * Example usage of ChaseRelationship API following API_PATTERNS.md
 * 
 * This file demonstrates the correct way to use the chase relationship API
 * in components using the useClient hook.
 */

import { useClient } from "@/contexts"
import { useEffect, useState } from "react"
import type { ChaseRelationship, Fight, Vehicle } from "@/types"

// ✅ CORRECT: Using useClient hook
export function ChaseRelationshipExample() {
  const { client } = useClient()
  const [relationships, setRelationships] = useState<ChaseRelationship[]>([])

  // Example: Get all chase relationships for a fight
  const loadChaseRelationships = async (fight: Fight) => {
    try {
      const response = await client.getChaseRelationshipsForFight(fight)
      setRelationships(response.data.chase_relationships)
    } catch (error) {
      console.error("Failed to load chase relationships:", error)
    }
  }

  // Example: Create a new chase relationship
  const createChaseRelationship = async (
    pursuer: Vehicle,
    evader: Vehicle,
    fight: Fight
  ) => {
    try {
      const response = await client.createChaseRelationship({
        pursuer_id: pursuer.id,
        evader_id: evader.id,
        fight_id: fight.id,
        position: "far",
      })
      console.log("Created relationship:", response.data.chase_relationship)
    } catch (error) {
      console.error("Failed to create chase relationship:", error)
    }
  }

  // Example: Update position
  const updatePosition = async (
    relationshipId: string,
    newPosition: "near" | "far"
  ) => {
    try {
      const response = await client.updateChasePosition(
        relationshipId,
        newPosition
      )
      console.log("Updated position:", response.data.chase_relationship)
    } catch (error) {
      console.error("Failed to update position:", error)
    }
  }

  // Example: Deactivate a relationship (soft delete)
  const deactivateRelationship = async (relationshipId: string) => {
    try {
      const response = await client.deactivateChaseRelationship(relationshipId)
      console.log("Deactivated relationship:", response.data.chase_relationship)
    } catch (error) {
      console.error("Failed to deactivate relationship:", error)
    }
  }

  return (
    <div>
      {/* Component UI */}
    </div>
  )
}

// ❌ INCORRECT: Don't use fetch or axios directly
export function IncorrectExample() {
  // DON'T DO THIS:
  const loadRelationships = async () => {
    // ❌ Wrong - direct fetch
    const response = await fetch("/api/v2/chase_relationships")
    
    // ❌ Wrong - direct axios
    // const response = await axios.get("/api/v2/chase_relationships")
  }
}

// Available ChaseRelationship client methods:
// - client.getChaseRelationships(params, cacheOptions)
// - client.getChaseRelationshipsForFight(fight, cacheOptions)
// - client.getChaseRelationshipsForVehicle(vehicle, cacheOptions)
// - client.getChaseRelationship(id, cacheOptions)
// - client.createChaseRelationship(params)
// - client.updateChaseRelationship(id, params)
// - client.updateChasePosition(id, position)
// - client.deleteChaseRelationship(id)
// - client.deactivateChaseRelationship(id)
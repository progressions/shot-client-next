"use client"

/**
 * SoloEncounterContext - Solo Play State Management
 *
 * Manages state for solo play encounters including:
 * - Fight/encounter data with combatants
 * - Narrative events log
 * - Current turn tracking (player vs NPC)
 * - Solo server status
 * - WebSocket updates for real-time narrative
 *
 * @module contexts/SoloEncounterContext
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react"
import type { Fight, Character, Shot } from "@/types"
import { useClient, useCampaign } from "@/contexts/AppContext"

/**
 * Narrative event from the solo play system
 */
export interface NarrativeEvent {
  id: string
  narrative: string
  mechanicalResult?: string
  isHit?: boolean
  actorName?: string
  targetName?: string
  timestamp: string
}

/**
 * Combatant info for the sidebar
 */
export interface Combatant {
  id: string
  name: string
  currentShot: number
  wounds: number
  maxWounds: number
  isPlayer: boolean
  imageUrl?: string
}

interface SoloEncounterContextType {
  fight: Fight | null
  narrative: NarrativeEvent[]
  combatants: Combatant[]
  currentTurn: "player" | "npc" | null
  playerCharacterId: string | null
  isProcessing: boolean
  serverRunning: boolean
  // Actions
  startServer: () => Promise<void>
  stopServer: () => Promise<void>
  advanceTurn: () => Promise<void>
  takeAction: (params: {
    type: "attack" | "defend" | "stunt"
    targetId?: string
  }) => Promise<void>
  refreshState: () => Promise<void>
}

const SoloEncounterContext = createContext<
  SoloEncounterContextType | undefined
>(undefined)

interface SoloEncounterProviderProps {
  fight: Fight
  children: React.ReactNode
}

export function SoloEncounterProvider({
  fight: initialFight,
  children,
}: SoloEncounterProviderProps) {
  const { client } = useClient()
  const { campaignData } = useCampaign()

  const [fight, setFight] = useState<Fight | null>(initialFight)
  const [narrative, setNarrative] = useState<NarrativeEvent[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [serverRunning, setServerRunning] = useState(false)
  const narrativeRef = useRef<NarrativeEvent[]>([])

  // Keep ref in sync for use in callbacks
  useEffect(() => {
    narrativeRef.current = narrative
  }, [narrative])

  // Derive combatants from fight shots
  const combatants: Combatant[] = (fight?.shots || [])
    .filter((shot: Shot) => shot.character)
    .map((shot: Shot) => {
      const char = shot.character as Character
      const actionValues = char.action_values || {}
      return {
        id: char.id,
        name: char.name,
        currentShot: shot.current_shot || 0,
        wounds: (actionValues["Wounds"] as number) || 0,
        maxWounds: (actionValues["Toughness"] as number) || 35,
        isPlayer: (fight?.solo_player_character_ids || []).includes(char.id),
        imageUrl: char.image_url,
      }
    })
    .sort((a, b) => b.currentShot - a.currentShot)

  // Determine whose turn it is (highest shot)
  const currentTurn: "player" | "npc" | null =
    combatants.length > 0 ? (combatants[0].isPlayer ? "player" : "npc") : null

  // Player character ID (first one in the list)
  const playerCharacterId = fight?.solo_player_character_ids?.[0] || null

  // Check server status
  const checkServerStatus = useCallback(async () => {
    if (!fight) return
    try {
      const response = await client.get(`/fights/${fight.id}/solo/status`)
      setServerRunning(response.data?.running || false)
    } catch (error) {
      console.error("Error checking solo server status:", error)
      setServerRunning(false)
    }
  }, [client, fight])

  // Start the solo server
  const startServer = useCallback(async () => {
    if (!fight) return
    setIsProcessing(true)
    try {
      await client.post(`/fights/${fight.id}/solo/start`)
      setServerRunning(true)
      addNarrativeEvent({
        narrative: "The encounter begins...",
        mechanicalResult: "Solo server started",
      })
    } catch (error) {
      console.error("Error starting solo server:", error)
    } finally {
      setIsProcessing(false)
    }
  }, [client, fight])

  // Stop the solo server
  const stopServer = useCallback(async () => {
    if (!fight) return
    setIsProcessing(true)
    try {
      await client.post(`/fights/${fight.id}/solo/stop`)
      setServerRunning(false)
    } catch (error) {
      console.error("Error stopping solo server:", error)
    } finally {
      setIsProcessing(false)
    }
  }, [client, fight])

  // Refresh fight state from server
  const refreshState = useCallback(async () => {
    if (!fight) return
    try {
      const response = await client.getEncounter(fight.id)
      if (response.data) {
        setFight(response.data as Fight)
      }
    } catch (error) {
      console.error("Error refreshing fight state:", error)
    }
  }, [client, fight])

  // Advance to next turn (triggers NPC actions)
  const advanceTurn = useCallback(async () => {
    if (!fight) return
    setIsProcessing(true)
    try {
      await client.post(`/fights/${fight.id}/solo/advance`)
      // Refresh fight state after advance
      await refreshState()
    } catch (error) {
      console.error("Error advancing turn:", error)
    } finally {
      setIsProcessing(false)
    }
  }, [client, fight, refreshState])

  // Player takes an action
  const takeAction = useCallback(
    async (params: {
      type: "attack" | "defend" | "stunt"
      targetId?: string
    }) => {
      if (!fight || !playerCharacterId) return
      setIsProcessing(true)
      try {
        await client.post(`/fights/${fight.id}/solo/action`, {
          action_type: params.type,
          target_id: params.targetId,
          character_id: playerCharacterId,
        })
        // Refresh fight state after action
        await refreshState()
      } catch (error) {
        console.error("Error taking action:", error)
      } finally {
        setIsProcessing(false)
      }
    },
    [client, fight, playerCharacterId, refreshState]
  )

  // Helper to add narrative events
  const addNarrativeEvent = (
    event: Omit<NarrativeEvent, "id" | "timestamp">
  ) => {
    const newEvent: NarrativeEvent = {
      ...event,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    }
    setNarrative(prev => [...prev, newEvent])
  }

  // Listen for WebSocket updates (solo_npc_action events)
  useEffect(() => {
    if (
      campaignData?.solo_npc_action &&
      campaignData.solo_npc_action.fight_id === fight?.id
    ) {
      const action = campaignData.solo_npc_action.action
      addNarrativeEvent({
        narrative: action.narrative,
        mechanicalResult: action.hit ? `${action.damage} damage` : "Miss",
        isHit: action.hit,
        actorName: action.actor_name,
        targetName: action.target_name,
      })
      // Refresh fight state to get updated wounds, etc.
      refreshState()
    }
  }, [campaignData?.solo_npc_action, fight?.id, refreshState])

  // Check server status on mount
  useEffect(() => {
    checkServerStatus()
  }, [checkServerStatus])

  const value: SoloEncounterContextType = {
    fight,
    narrative,
    combatants,
    currentTurn,
    playerCharacterId,
    isProcessing,
    serverRunning,
    startServer,
    stopServer,
    advanceTurn,
    takeAction,
    refreshState,
  }

  return (
    <SoloEncounterContext.Provider value={value}>
      {children}
    </SoloEncounterContext.Provider>
  )
}

export function useSoloEncounter() {
  const context = useContext(SoloEncounterContext)
  if (context === undefined) {
    throw new Error(
      "useSoloEncounter must be used within a SoloEncounterProvider"
    )
  }
  return context
}

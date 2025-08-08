"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import type { Entity, Encounter, Weapon, Schtick } from "@/types"
import { FormStateType, FormActions, useForm } from "@/reducers"
import { useCampaign, useClient } from "@/contexts"
import { useEntity } from "@/hooks"

export const encounterTransition = {
  duration: 1,
  ease: "easeInOut",
}

const EncounterContext = createContext<EncounterContextType | undefined>(
  undefined
)

type FormStateData = {
  encounter: Encounter | null
  weapons: { [id: string]: Weapon }
  schticks: { [id: string]: Schtick }
}

interface EncounterClient {
  spendShots: (entity: Entity, shotCost: number) => Promise<void>
}

interface EncounterContextType {
  encounter: Encounter | null
  weapons: { [id: string]: Weapon }
  schticks: { [id: string]: Schtick }
  loading: boolean
  error: string | null
  encounterState: FormStateType<FormStateData>
  dispatchEncounter: React.Dispatch<FormActions>
  updateEncounter: (entity: Encounter) => void
  deleteEncounter: () => void
  changeAndSaveEncounter: (event: React.ChangeEvent<HTMLInputElement>) => void
  currentShot: number | undefined
  ec: EncounterClient
}

export function EncounterProvider({
  encounter,
  children,
}: {
  encounter: Encounter
  children: React.ReactNode
}) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const { formState: encounterState, dispatchForm: dispatchEncounter } =
    useForm<FormStateData>({
      encounter,
      weapons: {},
      schticks: {},
    })
  const { loading, error, data } = encounterState
  const { encounter: contextEncounter, weapons, schticks } = data
  const { deleteEntity, updateEntity, handleChangeAndSave } = useEntity(
    encounter,
    dispatchEncounter
  )
  const currentShot = contextEncounter?.shots?.[0]?.shot
  const [localAction, setLocalAction] = useState<string | null>(null)

  const encounterClient: EncounterClient = {
    async spendShots(entity: Entity, shotCost: number) {
      if (!contextEncounter) {
        console.error("No encounter available")
        return
      }
      const actionId = uuidv4()
      setLocalAction(actionId)
      try {
        const response = await client.spendShots(
          contextEncounter,
          entity,
          shotCost,
          actionId
        )
        if (response.data) {
          console.log("Server response received", {
            serverEncounter: response.data,
          })
          dispatchEncounter({
            type: FormActions.UPDATE,
            name: "encounter",
            value: response.data as Encounter,
          })
        } else {
          throw new Error("No data in response")
        }
      } catch (err) {
        console.error("Error acting entity:", err)
        dispatchEncounter({
          type: FormActions.EDIT,
          name: "error",
          value: "Failed to update shot",
        })
      } finally {
        setLocalAction(null)
      }
    },
  }

  useEffect(() => {
    if (campaignData?.encounter && campaignData.encounter.id === encounter.id) {
      if (localAction && campaignData.encounter.actionId === localAction) {
        setLocalAction(null)
        return
      }
      dispatchEncounter({
        type: FormActions.UPDATE,
        name: "encounter",
        value: campaignData.encounter,
      })
    }
  }, [
    encounter?.id,
    campaignData,
    contextEncounter,
    dispatchEncounter,
    localAction,
  ])

  useEffect(() => {
    async function fetchAssociations() {
      dispatchEncounter({
        type: FormActions.EDIT,
        name: "loading",
        value: true,
      })
      try {
        const weaponIds = new Set<string>()
        const schtickIds = new Set<string>()
        encounter.shots.forEach(shot => {
          shot.characters.forEach(character => {
            character.weapon_ids?.forEach(id => weaponIds.add(id))
            character.schtick_ids?.forEach(id => schtickIds.add(id))
          })
        })
        const [weaponsResponse, schticksResponse] = await Promise.all([
          weaponIds.size > 0
            ? client.getWeaponsBatch({
                per_page: 1000,
                ids: Array.from(weaponIds).join(","),
              })
            : Promise.resolve({ data: [] }),
          schtickIds.size > 0
            ? client.getSchticksBatch({
                per_page: 1000,
                ids: Array.from(schtickIds).join(","),
              })
            : Promise.resolve({ data: [] }),
        ])
        const weaponsMap = weaponsResponse.data.weapons.reduce(
          (acc: { [id: string]: Weapon }, weapon: Weapon) => ({
            ...acc,
            [weapon.id]: weapon,
          }),
          {}
        )
        const schticksMap = schticksResponse.data.schticks.reduce(
          (acc: { [id: string]: Schtick }, schtick: Schtick) => ({
            ...acc,
            [schtick.id]: schtick,
          }),
          {}
        )
        dispatchEncounter({
          type: FormActions.UPDATE,
          name: "weapons",
          value: weaponsMap,
        })
        dispatchEncounter({
          type: FormActions.UPDATE,
          name: "schticks",
          value: schticksMap,
        })
        dispatchEncounter({
          type: FormActions.EDIT,
          name: "error",
          value: null,
        })
      } catch (err) {
        console.error("Failed to load associations", err)
        dispatchEncounter({
          type: FormActions.EDIT,
          name: "error",
          value: "Failed to load associations",
        })
      } finally {
        dispatchEncounter({
          type: FormActions.EDIT,
          name: "loading",
          value: false,
        })
      }
    }
    fetchAssociations()
  }, [client, encounter, dispatchEncounter])

  return (
    <EncounterContext.Provider
      value={{
        encounterState,
        dispatchEncounter,
        encounter: contextEncounter,
        weapons,
        schticks,
        loading,
        error,
        updateEncounter: updateEntity,
        deleteEncounter: deleteEntity,
        changeAndSaveEncounter: handleChangeAndSave,
        currentShot,
        ec: encounterClient,
      }}
    >
      {children}
    </EncounterContext.Provider>
  )
}

export function useEncounter(): EncounterContextType {
  const context = useContext(EncounterContext)
  if (!context) {
    throw new Error("useEncounter must be used within an EncounterProvider")
  }
  return context
}

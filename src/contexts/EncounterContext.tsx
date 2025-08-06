"use client"

import { createContext, useContext, useEffect } from "react"
import type { Encounter, Weapon, Schtick } from "@/types"
import { FormStateType, FormActions, useForm } from "@/reducers"
import { useClient } from "@/contexts"
import { useEntity } from "@/hooks"
const EncounterContext = createContext<EncounterContextType | undefined>(
  undefined
)

type FormStateData = {
  encounter: Encounter | null
  weapons: { [id: string]: Weapon }
  schticks: { [id: string]: Schtick }
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
}

export function EncounterProvider({
  encounter,
  children,
}: {
  encounter: Encounter
  children: React.ReactNode
}) {
  const { client } = useClient()
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

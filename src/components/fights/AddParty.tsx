import { useCallback } from "react"
import { GenericFilter } from "@/components/ui"
import type { Party, Faction } from "@/types"

interface AddPartyProps {
  formState: {
    data: {
      parties: Party[]
      factions: Faction[]
      filters: Record<string, any>
    }
  }
  onFiltersUpdate: (filters: Record<string, any>) => void
  onPartyAdd: (party: Party) => void
}

export default function AddParty({ formState, onFiltersUpdate, onPartyAdd }: AddPartyProps) {
  const handleAdd = useCallback((party: Party | null) => {
    if (party) {
      onPartyAdd(party)
    }
  }, [onPartyAdd])

  return (
    <GenericFilter
      entity="Party"
      formState={formState}
      omit={["search"]}
      onFiltersUpdate={onFiltersUpdate}
      onChange={handleAdd}
    />
  )
}
// components/WeaponFilter.tsx
"use client"
import { Stack } from "@mui/material"
import {
  createAutocomplete,
  createStringAutocomplete,
  AddButton,
} from "@/components/ui"
import { useClient } from "@/contexts"
import { useState, useEffect, useCallback } from "react"
import { debounce } from "lodash"

interface AutocompleteOption {
  id: number
  name: string
}

const WeaponAutocomplete = createAutocomplete("Weapon")
const CategoryAutocomplete = createStringAutocomplete("Category")
const JunctureAutocomplete = createStringAutocomplete("Juncture")

type WeaponFilterProps = {
  onChange: (value: AutocompleteOption | null) => void
  onFiltersUpdate?: (filters: Record<string, string>) => void
  omit?: Array<"category" | "juncture" | "weapon" | "add">
  excludeIds?: number[]
}

export function WeaponFilter({
  onChange,
  onFiltersUpdate,
  omit = [],
  excludeIds = [],
}: WeaponFilterProps) {
  const { client } = useClient()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedJuncture, setSelectedJuncture] = useState<string | null>(null)
  const [selectedWeapon, setSelectedWeapon] =
    useState<AutocompleteOption | null>(null)
  const [weaponRecords, setWeaponRecords] = useState<AutocompleteOption[]>([])
  const [categoryRecords, setCategoryRecords] = useState<string[]>([])
  const [junctureRecords, setJunctureRecords] = useState<string[]>([])
  const [weaponKey, setWeaponKey] = useState("weapon-0")
  const [keyCounter, setKeyCounter] = useState(1)

  const filteredWeaponRecords = weaponRecords.filter(
    record => !excludeIds.includes(record.id)
  )

  const filters = {
    category:
      !omit.includes("category") && selectedCategory ? selectedCategory : "",
    juncture:
      !omit.includes("juncture") && selectedJuncture ? selectedJuncture : "",
  }

  const fetchRecords = useCallback(
    debounce(async () => {
      try {
        const response = await client.getWeapons({
          autocomplete: true,
          per_page: 200,
          ...filters,
        })
        const weapons = response.data.weapons
        const categories = response.data.categories.filter(
          (category: string | null) => category && category.trim() !== ""
        )
        const junctures = response.data.junctures.filter(
          (juncture: string | null) => juncture && juncture.trim() !== ""
        )
        setWeaponRecords(weapons)
        setCategoryRecords(categories)
        setJunctureRecords(junctures)
      } catch (error) {
        console.error("Failed to fetch records:", error)
      }
    }, 300),
    [client, selectedCategory, selectedJuncture, omit]
  )

  useEffect(() => {
    fetchRecords()
    return () => {
      fetchRecords.cancel()
    }
  }, [fetchRecords])

  useEffect(() => {
    if (onFiltersUpdate) {
      onFiltersUpdate(filters)
    }
  }, [onFiltersUpdate, selectedCategory, selectedJuncture, omit])

  const handleAdd = () => {
    if (selectedWeapon) {
      onChange(selectedWeapon)
      setSelectedWeapon(null)
      setWeaponKey(`weapon-${keyCounter}`)
      setKeyCounter(prev => prev + 1)
    }
  }

  const handleWeaponChange = (value: AutocompleteOption | null) => {
    setSelectedWeapon(value)
    if (omit.includes("add") && value) {
      onChange(value)
      setSelectedWeapon(null)
      setWeaponKey(`weapon-${keyCounter}`)
      setKeyCounter(prev => prev + 1)
    }
  }

  return (
    <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
      {!omit.includes("juncture") && (
        <JunctureAutocomplete
          value={selectedJuncture}
          onChange={setSelectedJuncture}
          filters={{}}
          records={junctureRecords}
          sx={{ width: "100%" }}
        />
      )}
      {!omit.includes("category") && (
        <CategoryAutocomplete
          value={selectedCategory}
          onChange={setSelectedCategory}
          filters={{}}
          records={categoryRecords}
          sx={{ width: "100%" }}
        />
      )}
      {!omit.includes("weapon") && (
        <WeaponAutocomplete
          key={weaponKey}
          value={selectedWeapon}
          onChange={handleWeaponChange}
          filters={filters}
          records={filteredWeaponRecords}
          sx={{ width: "100%" }}
        />
      )}
      {!omit.includes("add") && (
        <AddButton
          onClick={handleAdd}
          disabled={!selectedWeapon}
          sx={{ height: "fit-content", alignSelf: "center" }}
        />
      )}
    </Stack>
  )
}

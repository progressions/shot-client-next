// components/SchtickFilter.tsx
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

const SchtickAutocomplete = createAutocomplete("Schtick")
const CategoryAutocomplete = createStringAutocomplete("Category")
const PathAutocomplete = createStringAutocomplete("Path")

type SchtickFilterProps = {
  onChange: (value: AutocompleteOption | null) => void
  onFiltersUpdate?: (filters: Record<string, string>) => void
  omit?: Array<"category" | "path" | "schtick" | "add">
  excludeIds?: number[]
}

export function SchtickFilter({
  onChange,
  onFiltersUpdate,
  omit = [],
  excludeIds = [],
}: SchtickFilterProps) {
  const { client } = useClient()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [selectedSchtick, setSelectedSchtick] =
    useState<AutocompleteOption | null>(null)
  const [schtickRecords, setSchtickRecords] = useState<AutocompleteOption[]>([])
  const [categoryRecords, setCategoryRecords] = useState<string[]>([])
  const [pathRecords, setPathRecords] = useState<string[]>([])
  const [schtickKey, setSchtickKey] = useState("schtick-0")
  const [keyCounter, setKeyCounter] = useState(1)

  const filteredSchtickRecords = schtickRecords.filter(
    record => !excludeIds.includes(record.id)
  )

  const filters = {
    category:
      !omit.includes("category") && selectedCategory ? selectedCategory : "",
    path: !omit.includes("path") && selectedPath ? selectedPath : "",
  }

  const fetchRecords = useCallback(
    debounce(async () => {
      try {
        const response = await client.getSchticks({
          autocomplete: true,
          per_page: 200,
          ...filters,
        })
        const schticks = response.data.schticks
        const categories = response.data.categories.filter(
          (category: string | null) => category && category.trim() !== ""
        )
        const paths = response.data.paths.filter(
          (path: string | null) => path && path.trim() !== ""
        )
        setSchtickRecords(schticks)
        setCategoryRecords(categories)
        setPathRecords(paths)
      } catch (error) {
        console.error("Failed to fetch records:", error)
      }
    }, 300),
    [client, selectedCategory, selectedPath, omit]
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
  }, [onFiltersUpdate, selectedCategory, selectedPath, omit])

  const handleAdd = () => {
    if (selectedSchtick) {
      onChange(selectedSchtick)
      setSelectedSchtick(null)
      setSchtickKey(`schtick-${keyCounter}`)
      setKeyCounter(prev => prev + 1)
    }
  }

  const handleSchtickChange = (value: AutocompleteOption | null) => {
    setSelectedSchtick(value)
    if (omit.includes("add") && value) {
      onChange(value)
      setSelectedSchtick(null)
      setSchtickKey(`schtick-${keyCounter}`)
      setKeyCounter(prev => prev + 1)
    }
  }

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{ width: "100%" }}
    >
      {!omit.includes("category") && (
        <CategoryAutocomplete
          value={selectedCategory}
          onChange={setSelectedCategory}
          filters={{}}
          records={categoryRecords}
          sx={{ width: "100%" }}
        />
      )}
      {!omit.includes("path") && (
        <PathAutocomplete
          value={selectedPath}
          onChange={setSelectedPath}
          filters={{}}
          records={pathRecords}
          sx={{ width: "100%" }}
        />
      )}
      {!omit.includes("schtick") && (
        <SchtickAutocomplete
          key={schtickKey}
          value={selectedSchtick}
          onChange={handleSchtickChange}
          filters={filters}
          records={filteredSchtickRecords}
          sx={{ width: "100%" }}
        />
      )}
      {!omit.includes("add") && (
        <AddButton
          onClick={handleAdd}
          disabled={!selectedSchtick}
          sx={{ height: "fit-content", alignSelf: "center" }}
        />
      )}
    </Stack>
  )
}

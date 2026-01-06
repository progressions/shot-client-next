"use client"
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material"
import type { MediaLibraryFilters, MediaImageEntityType } from "@/types"

interface FilterProps {
  filters: MediaLibraryFilters
  onFilterChange: (filters: MediaLibraryFilters) => void
}

const ENTITY_TYPES: MediaImageEntityType[] = [
  "Character",
  "Vehicle",
  "Weapon",
  "Schtick",
  "Site",
  "Faction",
  "Party",
  "Fight",
  "User",
]

export default function Filter({ filters, onFilterChange }: FilterProps) {
  const handleStatusChange = (event: SelectChangeEvent) => {
    const value = event.target.value
    onFilterChange({
      ...filters,
      status: value === "all" ? undefined : (value as "orphan" | "attached"),
      page: 1,
    })
  }

  const handleEntityTypeChange = (event: SelectChangeEvent) => {
    const value = event.target.value
    onFilterChange({
      ...filters,
      entity_type: value === "" ? undefined : (value as MediaImageEntityType),
      page: 1,
    })
  }

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="status-filter-label">Status</InputLabel>
        <Select
          labelId="status-filter-label"
          id="status-filter"
          value={filters.status || "all"}
          label="Status"
          onChange={handleStatusChange}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="orphan">Orphan</MenuItem>
          <MenuItem value="attached">Attached</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="entity-type-filter-label">Entity Type</InputLabel>
        <Select
          labelId="entity-type-filter-label"
          id="entity-type-filter"
          value={filters.entity_type || ""}
          label="Entity Type"
          onChange={handleEntityTypeChange}
        >
          <MenuItem value="">All Types</MenuItem>
          {ENTITY_TYPES.map(type => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}

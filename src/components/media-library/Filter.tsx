"use client"
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material"
import {
  ArrowUpward as AscIcon,
  ArrowDownward as DescIcon,
} from "@mui/icons-material"
import type {
  MediaLibraryFilters,
  MediaImageEntityType,
  MediaImageSource,
  MediaLibrarySortField,
  SortOrder,
} from "@/types"
import TagSearchInput from "./TagSearchInput"

interface FilterProps {
  filters: MediaLibraryFilters
  onFilterChange: (filters: MediaLibraryFilters) => void
  searchTags: string[]
  onSearchTagsChange: (tags: string[]) => void
  isSearchMode: boolean
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

const SORT_OPTIONS: { value: MediaLibrarySortField; label: string }[] = [
  { value: "inserted_at", label: "Date Created" },
  { value: "updated_at", label: "Date Modified" },
  { value: "filename", label: "Filename" },
  { value: "byte_size", label: "File Size" },
  { value: "entity_type", label: "Entity Type" },
]

export default function Filter({
  filters,
  onFilterChange,
  searchTags,
  onSearchTagsChange,
  isSearchMode,
}: FilterProps) {
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

  const handleSourceChange = (event: SelectChangeEvent) => {
    const value = event.target.value
    onFilterChange({
      ...filters,
      source: value === "all" ? undefined : (value as MediaImageSource),
      page: 1,
    })
  }

  const handleSortChange = (event: SelectChangeEvent) => {
    const value = event.target.value as MediaLibrarySortField
    onFilterChange({
      ...filters,
      sort: value,
      page: 1,
    })
  }

  const handleOrderToggle = () => {
    const newOrder: SortOrder = filters.order === "asc" ? "desc" : "asc"
    onFilterChange({
      ...filters,
      order: newOrder,
      page: 1,
    })
  }

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
      {/* AI Tag Search */}
      <TagSearchInput
        value={searchTags}
        onChange={onSearchTagsChange}
        placeholder="Search by AI tags..."
      />

      {/* Show filters only when not in search mode */}
      {!isSearchMode && (
        <>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

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

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="source-filter-label">Source</InputLabel>
            <Select
              labelId="source-filter-label"
              id="source-filter"
              value={filters.source || "all"}
              label="Source"
              onChange={handleSourceChange}
            >
              <MenuItem value="all">All Sources</MenuItem>
              <MenuItem value="upload">Uploaded</MenuItem>
              <MenuItem value="ai_generated">AI Generated</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="sort-filter-label">Sort By</InputLabel>
              <Select
                labelId="sort-filter-label"
                id="sort-filter"
                value={filters.sort || "inserted_at"}
                label="Sort By"
                onChange={handleSortChange}
              >
                {SORT_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip
              title={filters.order === "asc" ? "Ascending" : "Descending"}
              placement="top"
            >
              <IconButton
                size="small"
                onClick={handleOrderToggle}
                sx={{ ml: 0.5 }}
                aria-label={`Sort ${filters.order === "asc" ? "ascending" : "descending"}`}
              >
                {filters.order === "asc" ? <AscIcon /> : <DescIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </>
      )}
    </Box>
  )
}

"use client"
import { useState, useMemo } from "react"
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Stack,
  Badge,
  Button,
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
} from "@mui/material"
import { ExpandMore, FilterList, Clear } from "@mui/icons-material"
import { GenericFilter } from "./GenericFilter"
import { FilterOption } from "./EntityFilters"
import { filterConfigs } from "@/lib/filterConfigs"

interface FilterAccordionProps {
  // For EntityFilters functionality
  filters: Record<string, boolean | string | null>
  filterOptions?: FilterOption[]
  onFiltersUpdate: (filters: Record<string, string | boolean | null>) => void

  // For GenericFilter functionality
  entity?: keyof typeof filterConfigs
  formState?: {
    data: {
      filters: Record<string, string | boolean | null>
      [key: string]: unknown
    }
  }
  omit?: string[]
  excludeIds?: number[]

  // Common props
  title?: string
}

export function FilterAccordion({
  filters,
  filterOptions = [],
  onFiltersUpdate,
  entity,
  formState,
  omit = [],
  excludeIds = [],
  title = "Filters",
}: FilterAccordionProps) {
  const [expanded, setExpanded] = useState(false)

  // Calculate active filters
  const activeFilters = useMemo(() => {
    const active: Array<{ name: string; value: string; label: string }> = []

    // Check EntityFilters options
    filterOptions.forEach(option => {
      const value = filters[option.name]
      if (option.type === "dropdown") {
        if (value && value !== option.defaultValue) {
          const selectedOption = option.options?.find(
            opt => opt.value === value
          )
          if (selectedOption) {
            active.push({
              name: option.name,
              value: value as string,
              label: `${option.label}: ${selectedOption.label}`,
            })
          }
        }
      } else if (value === true) {
        active.push({
          name: option.name,
          value: "true",
          label: option.label,
        })
      }
    })

    // Check search filter
    if (filters.search && filters.search !== "") {
      active.push({
        name: "search",
        value: filters.search as string,
        label: `Search: "${filters.search}"`,
      })
    }

    // Check GenericFilter fields if entity is provided
    if (entity && formState) {
      const config = filterConfigs[entity]
      config.fields.forEach(field => {
        if (!omit.includes(field.name)) {
          const value = formState.data.filters[field.name]
          // Only show as active if value exists and is different from default
          if (value && value !== field.defaultValue) {
            const displayName = field.displayName || field.name
            if (typeof value === "object" && value.name) {
              active.push({
                name: field.name,
                value: value.id,
                label: `${displayName}: ${value.name}`,
              })
            } else if (typeof value === "string" && value !== "") {
              // Don't show as active if it matches the default value
              if (value !== field.defaultValue) {
                active.push({
                  name: field.name,
                  value: value,
                  label: `${displayName}: ${value}`,
                })
              }
            }
          }
        }
      })
    }

    return active
  }, [filters, filterOptions, entity, formState, omit])

  const handleClearFilters = () => {
    const clearedFilters: Record<string, boolean | string | null> = {}

    // Clear EntityFilters
    filterOptions.forEach(option => {
      clearedFilters[option.name] =
        option.defaultValue || (option.type === "dropdown" ? "" : false)
    })

    // Clear search
    clearedFilters.search = ""

    // Clear GenericFilter fields - restore to default values
    if (entity) {
      const config = filterConfigs[entity]
      config.fields.forEach(field => {
        if (!omit.includes(field.name)) {
          // Use defaultValue if available, otherwise null
          clearedFilters[field.name] = field.defaultValue ?? null
        }
      })
    }

    onFiltersUpdate({
      ...clearedFilters,
      page: 1,
    })
  }

  const handleRemoveFilter = (filterName: string) => {
    const option = filterOptions.find(opt => opt.name === filterName)
    let newValue =
      option?.defaultValue || (option?.type === "dropdown" ? "" : false)

    // Check if it's a GenericFilter field
    if (!option && entity) {
      const config = filterConfigs[entity]
      const field = config.fields.find(f => f.name === filterName)
      if (field) {
        newValue = field.defaultValue ?? null
      }
    }

    onFiltersUpdate({
      ...filters,
      [filterName]: filterName === "search" ? "" : newValue,
      page: 1,
    })
  }

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
      sx={{
        backgroundColor: "background.paper",
        boxShadow: 1,
        mb: 2,
        "&:before": { display: "none" },
      }}
      data-testid="filter-accordion"
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          minHeight: 48,
          "&.Mui-expanded": { minHeight: 48 },
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ width: "100%" }}
        >
          <Badge
            badgeContent={activeFilters.length}
            color="primary"
            invisible={activeFilters.length === 0}
          >
            <FilterList />
          </Badge>
          <Typography>{title}</Typography>
          {activeFilters.length > 0 && !expanded && (
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", ml: 2 }}>
              {activeFilters.slice(0, 3).map(filter => (
                <Chip
                  key={filter.name}
                  label={filter.label}
                  size="small"
                  onDelete={e => {
                    e.stopPropagation()
                    handleRemoveFilter(filter.name)
                  }}
                  sx={{ maxWidth: 200 }}
                />
              ))}
              {activeFilters.length > 3 && (
                <Chip
                  label={`+${activeFilters.length - 3} more`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          )}
        </Stack>
      </AccordionSummary>

      <AccordionDetails>
        <Stack spacing={2}>
          {/* GenericFilter on its own row */}
          {entity && formState && (
            <Box sx={{ display: "flex", width: "100%" }}>
              <GenericFilter
                entity={entity}
                formState={formState}
                onFiltersUpdate={onFiltersUpdate}
                omit={omit}
                excludeIds={excludeIds}
              />
            </Box>
          )}

          {/* Dropdown filters on separate row below */}
          {filterOptions.filter(opt => opt.type === "dropdown").length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {filterOptions
                .filter(opt => opt.type === "dropdown")
                .map(option => (
                  <FormControl
                    key={option.name}
                    size="small"
                    sx={{ minWidth: 200 }}
                  >
                    <InputLabel id={`${option.name}-label`}>
                      {option.label}
                    </InputLabel>
                    <Select
                      labelId={`${option.name}-label`}
                      id={option.name}
                      name={option.name}
                      value={filters[option.name] || option.defaultValue || ""}
                      label={option.label}
                      onChange={e =>
                        onFiltersUpdate({
                          ...filters,
                          [option.name]: e.target.value,
                          page: 1,
                        })
                      }
                      data-testid={`${option.name}-select`}
                    >
                      {option.options?.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ))}
            </Box>
          )}

          {/* Render checkbox filters on separate row */}
          {filterOptions.filter(opt => opt.type !== "dropdown").length > 0 && (
            <FormGroup row>
              {filterOptions
                .filter(opt => opt.type !== "dropdown")
                .map(option => (
                  <FormControlLabel
                    key={option.name}
                    control={
                      <Checkbox
                        checked={!!filters[option.name]}
                        onChange={e =>
                          onFiltersUpdate({
                            ...filters,
                            [option.name]: e.target.checked,
                            page: 1,
                          })
                        }
                        size="small"
                      />
                    }
                    label={option.label}
                    sx={{ mr: 3 }}
                  />
                ))}
            </FormGroup>
          )}

          {/* Clear All button */}
          {activeFilters.length > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Clear />}
              onClick={handleClearFilters}
              sx={{ alignSelf: "flex-start" }}
              data-testid="clear-all-filters"
            >
              Clear All Filters
            </Button>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}

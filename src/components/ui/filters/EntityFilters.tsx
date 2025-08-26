"use client"
import { useState } from "react"
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Stack,
  Badge,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material"
import { ExpandMore, FilterList, Clear } from "@mui/icons-material"

export interface FilterOption {
  name: string
  label: string
  defaultValue?: boolean | string
  type?: "checkbox" | "dropdown"
  options?: Array<{ value: string; label: string }>
}

interface EntityFiltersProps {
  filters: Record<string, boolean | string>
  options: FilterOption[]
  onFiltersUpdate: (filters: Record<string, string | boolean | null>) => void
  title?: string
}

export function EntityFilters({
  filters,
  options,
  onFiltersUpdate,
  title = "Filters",
}: EntityFiltersProps) {
  const [expanded, setExpanded] = useState(false)

  // Count active filters (for checkboxes: true values, for dropdowns: non-default values)
  const activeFilterCount = options.reduce((count, option) => {
    const value = filters[option.name]
    if (option.type === "dropdown") {
      // For dropdowns, count as active if not the default value
      return (
        count + (value !== option.defaultValue && value !== undefined ? 1 : 0)
      )
    } else {
      // For checkboxes, count as active if true
      return count + (value === true ? 1 : 0)
    }
  }, 0)

  const handleFilterChange = (filterName: string, value: boolean | string) => {
    onFiltersUpdate({
      ...filters,
      [filterName]: value,
      page: 1, // Reset to first page when filters change
    })
  }

  const handleClearFilters = () => {
    const clearedFilters: Record<string, boolean | string> = {}
    options.forEach(option => {
      clearedFilters[option.name] =
        option.defaultValue || (option.type === "dropdown" ? "" : false)
    })
    onFiltersUpdate({
      ...clearedFilters,
      page: 1,
    })
  }

  // Separate options by type for rendering
  const checkboxOptions = options.filter(opt => opt.type !== "dropdown")
  const dropdownOptions = options.filter(opt => opt.type === "dropdown")

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
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          minHeight: 48,
          "&.Mui-expanded": { minHeight: 48 },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Badge
            badgeContent={activeFilterCount}
            color="primary"
            invisible={activeFilterCount === 0}
          >
            <FilterList />
          </Badge>
          <Typography>{title}</Typography>
          {activeFilterCount > 0 && (
            <Typography variant="caption" color="text.secondary">
              ({activeFilterCount} active)
            </Typography>
          )}
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {/* Render dropdown filters first */}
          {dropdownOptions.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {dropdownOptions.map(option => (
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
                      handleFilterChange(option.name, e.target.value)
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

          {/* Render checkbox filters */}
          {checkboxOptions.length > 0 && (
            <FormGroup row>
              {checkboxOptions.map(option => (
                <FormControlLabel
                  key={option.name}
                  control={
                    <Checkbox
                      checked={!!filters[option.name]}
                      onChange={e =>
                        handleFilterChange(option.name, e.target.checked)
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

          {activeFilterCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Clear />}
              onClick={handleClearFilters}
              sx={{ alignSelf: "flex-start" }}
            >
              Clear Filters
            </Button>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}

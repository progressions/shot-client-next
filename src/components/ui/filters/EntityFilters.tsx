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
} from "@mui/material"
import { ExpandMore, FilterList, Clear } from "@mui/icons-material"

export interface FilterOption {
  name: string
  label: string
  defaultValue?: boolean
}

interface EntityFiltersProps {
  filters: Record<string, boolean>
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

  // Count active filters (filters that are true)
  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const handleFilterChange = (filterName: string, checked: boolean) => {
    onFiltersUpdate({
      ...filters,
      [filterName]: checked,
      page: 1, // Reset to first page when filters change
    })
  }

  const handleClearFilters = () => {
    const clearedFilters: Record<string, boolean> = {}
    options.forEach(option => {
      clearedFilters[option.name] = option.defaultValue || false
    })
    onFiltersUpdate({
      ...clearedFilters,
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
          <FormGroup row>
            {options.map(option => (
              <FormControlLabel
                key={option.name}
                control={
                  <Checkbox
                    checked={filters[option.name] || false}
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

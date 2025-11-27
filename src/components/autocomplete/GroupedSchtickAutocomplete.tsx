"use client"
import { Autocomplete, TextField } from "@mui/material"
import { styled, lighten, darken } from "@mui/system"
import { useMemo } from "react"
import type { Schtick } from "@/types"

interface SchtickOption extends Schtick {
  group: string
}

interface GroupedSchtickAutocompleteProps {
  schticks: Schtick[]
  value: string | null
  onChange: (value: SchtickOption | null) => void
  allowNone?: boolean
  disabled?: boolean
  sx?: Record<string, unknown>
}

const GroupHeader = styled("div")(({ theme }) => ({
  top: "-8px",
  padding: "4px 14px",
  fontWeight: 600,
  color: theme.palette.primary.main,
  backgroundColor: lighten(theme.palette.primary.light, 0.85),
  ...theme.applyStyles("dark", {
    backgroundColor: darken(theme.palette.primary.main, 0.8),
  }),
}))

const GroupItems = styled("ul")({
  padding: 0,
})

export function GroupedSchtickAutocomplete({
  schticks,
  value,
  onChange,
  allowNone = true,
  disabled,
  sx,
}: GroupedSchtickAutocompleteProps) {
  // Sort by category, path, name and add group property
  const options = useMemo(() => {
    const sorted = [...schticks].sort((a, b) => {
      // Sort by category first
      const categoryA = a.category || ""
      const categoryB = b.category || ""
      if (categoryA !== categoryB) return categoryA.localeCompare(categoryB)

      // Then by path
      const pathA = a.path || ""
      const pathB = b.path || ""
      if (pathA !== pathB) return pathA.localeCompare(pathB)

      // Finally by name
      return a.name.localeCompare(b.name)
    })

    return sorted.map(s => ({
      ...s,
      group:
        s.category && s.path
          ? `${s.category} / ${s.path}`
          : s.category || "Uncategorized",
    }))
  }, [schticks])

  const selectedValue = useMemo(() => {
    if (!value) return null
    return options.find(o => o.id === value) || null
  }, [options, value])

  return (
    <Autocomplete
      options={options}
      getOptionLabel={option => option.name}
      getOptionKey={option => String(option.id)}
      groupBy={option => option.group}
      renderGroup={params => (
        <li key={params.key}>
          <GroupHeader>{params.group}</GroupHeader>
          <GroupItems>{params.children}</GroupItems>
        </li>
      )}
      value={selectedValue}
      onChange={(_, newValue) => onChange(newValue)}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      renderInput={params => (
        <TextField {...params} label="Schticks" variant="outlined" />
      )}
      sx={sx}
      disabled={disabled}
      disableClearable={!allowNone}
    />
  )
}

export default GroupedSchtickAutocomplete

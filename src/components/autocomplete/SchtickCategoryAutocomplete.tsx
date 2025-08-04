"use client"
import type { SchtickCategory } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"
import { styled, lighten, darken } from "@mui/system"

type SchtickCategoryAutocompleteProperties = {
  value: string
  onChange: (value: string | null) => void
  options?: Option[]
  exclude?: string[]
  allowNone?: boolean
}

const GroupHeader = styled("div")(({ theme }) => ({
  top: "-8px",
  padding: "4px 14px",
  color: theme.palette.primary.main,
  backgroundColor: lighten(theme.palette.primary.light, 0.85),
  ...theme.applyStyles("dark", {
    backgroundColor: darken(theme.palette.primary.main, 0.8),
  }),
}))

const GroupItems = styled("ul")({
  padding: 0,
})

export default function SchtickCategoryAutocomplete({
  value,
  onChange,
  options,
  allowNone = true,
  exclude = [],
}: SchtickCategoryAutocompleteProperties) {
  const { client } = useClient()

  const fetchOptions = async (inputValue: string): Promise<Option[]> => {
    if (options) {
      const filteredOptions = options
        .filter(option =>
          option.label.toLowerCase().includes(inputValue.toLowerCase())
        )
        .filter(option => !exclude.includes(option.value))
      return filteredOptions
    }

    try {
      const response = await client.getSchtickCategories({ search: inputValue })
      const { general, core } = response.data
      const generalOptions: Option[] = general.map(
        (category: SchtickCategory) => ({
          label: category || "",
          value: category || "",
          group: "General",
        })
      )
      const coreOptions: Option[] = core.map((category: SchtickCategory) => ({
        label: category || "",
        value: category || "",
        group: "Core",
      }))
      return [...generalOptions, ...coreOptions].filter(
        option => !exclude.includes(option.value) || option.isDivider
      )
    } catch (error) {
      console.error("Error fetching options:", error)
      return []
    }
  }

  return (
    <Autocomplete
      label="Category"
      value={value}
      fetchOptions={fetchOptions}
      onChange={onChange}
      allowNone={allowNone}
      exclude={exclude}
      groupBy={(option: Option) => (option.isDivider ? "" : option.group || "")}
      renderGroup={params => (
        <li key={params.key}>
          <GroupHeader>{params.group}</GroupHeader>
          <GroupItems>{params.children}</GroupItems>
        </li>
      )}
    />
  )
}

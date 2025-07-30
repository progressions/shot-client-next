"use client"

import type { User } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"

type UserAutocompleteProperties = {
  value: string
  onChange: (value: string | null) => void
  options?: Option[]
  exclude?: string[]
  allowNone?: boolean
}

export default function UserAutocomplete({
  options,
  value,
  exclude = [],
  onChange,
  allowNone = true,
}: UserAutocompleteProperties) {
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
      const response = await client.getUsers({
        search: inputValue,
        per_page: 120,
        sort: "name",
        order: "asc",
      })
      const { users } = response.data
      return users
        .map((user: User) => ({
          label: user.name || user.email,
          value: user.id || "",
        }))
        .filter(option => !exclude.includes(option.value))
    } catch (error) {
      console.error("Error fetching options:", error)
      return []
    }
  }

  return (
    <Autocomplete
      value={value}
      label="User"
      fetchOptions={fetchOptions}
      onChange={onChange}
      exclude={exclude}
      allowNone={allowNone}
    />
  )
}

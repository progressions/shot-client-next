"use client"

import type { User } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"
import { useEffect, useState } from "react"

type UserAutocompleteProperties = {
  value: string
  onChange: (value: string | null) => void
  options?: Option[]
  exclude?: string[]
  allowNone?: boolean
  filters?: Record<string, unknown>
}

export default function UserAutocomplete({
  options,
  value,
  exclude = [],
  onChange,
  allowNone = true,
  filters = {},
}: UserAutocompleteProperties) {
  const { client } = useClient()
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await client.getUsers({
          per_page: 200,
          page: 1,
          sort: "name",
          order: "asc",
          ...filters,
        })
        setUsers(response.data.users || [])
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    fetchUsers().catch(error => {
      console.error("Error in useEffect fetchUsers:", error)
    })
  }, [client, filters])

  const fetchOptions = async (inputValue: string): Promise<Option[]> => {
    if (options) {
      const filteredOptions = options
        .filter(option =>
          option.label.toLowerCase().includes(inputValue.toLowerCase())
        )
        .filter(option => !exclude.includes(option.value))

      return filteredOptions
    }
    return users
      .filter(user => {
        const searchName = user.name || ""
        const searchEmail = user.email || ""
        const query = inputValue.toLowerCase()
        return (
          searchName.toLowerCase().includes(query) ||
          searchEmail.toLowerCase().includes(query)
        )
      })
      .map(user => ({
        label:
          user.name && user.email
            ? `${user.name} (${user.email})`
            : user.name || user.email || "Unknown User",
        value: user.id,
      }))
  }

  const handleChange = (selectedOption: string | null) => {
    onChange(selectedOption)
  }

  return (
    <Autocomplete
      label="User"
      value={value}
      fetchOptions={fetchOptions}
      onChange={handleChange}
      exclude={exclude}
      allowNone={allowNone}
    />
  )
}

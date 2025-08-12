// components/UserFilter.tsx
"use client"
import { Stack } from "@mui/material"
import { createAutocomplete, AddButton } from "@/components/ui"
import { useClient } from "@/contexts"
import { useState, useEffect, useCallback } from "react"
import { debounce } from "lodash"

interface AutocompleteOption {
  id: number
  name: string
}

const UsersAutocomplete = createAutocomplete("User")

type UserFilterProps = {
  onChange: (value: AutocompleteOption | null) => void
  omit?: Array<"user" | "add">
  excludeIds?: number[]
}

export function UserFilter({
  onChange,
  omit = [],
  excludeIds = [],
}: UserFilterProps) {
  const { client } = useClient()
  const [selectedUser, setSelectedUser] = useState<AutocompleteOption | null>(
    null
  )
  const [userRecords, setUserRecords] = useState<AutocompleteOption[]>([])
  const [userKey, setUserKey] = useState("user-0")
  const [keyCounter, setKeyCounter] = useState(1)

  const filteredUserRecords = userRecords.filter(
    record => !excludeIds.includes(record.id)
  )

  const fetchRecords = useCallback(
    debounce(async () => {
      try {
        const response = await client.getUsers({
          autocomplete: true,
          per_page: 200,
        })
        const users = response.data.users
        setUserRecords(users)
      } catch (error) {
        console.error("Failed to fetch records:", error)
      }
    }, 300),
    [client]
  )

  useEffect(() => {
    fetchRecords()
    return () => {
      fetchRecords.cancel()
    }
  }, [fetchRecords])

  const handleAdd = () => {
    if (selectedUser) {
      onChange(selectedUser)
      setSelectedUser(null)
      setUserKey(`user-${keyCounter}`)
      setKeyCounter(prev => prev + 1)
    }
  }

  const handleUserChange = (value: AutocompleteOption | null) => {
    setSelectedUser(value)
    if (omit.includes("add") && value) {
      onChange(value)
      setSelectedUser(null)
      setUserKey(`user-${keyCounter}`)
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
      {!omit.includes("user") && (
        <UsersAutocomplete
          key={userKey}
          value={selectedUser}
          onChange={handleUserChange}
          filters={{}}
          records={filteredUserRecords}
          sx={{ width: "100%" }}
        />
      )}
      {!omit.includes("add") && (
        <AddButton
          onClick={handleAdd}
          disabled={!selectedUser}
          sx={{ height: "fit-content", alignSelf: "center" }}
        />
      )}
    </Stack>
  )
}

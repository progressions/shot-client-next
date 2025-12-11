"use client"

import { useState, useEffect, useCallback } from "react"
import { Box, Skeleton, Stack } from "@mui/material"
import {
  SectionHeader,
  Icon,
  ManageButton,
  GenericFilter,
  BadgeList,
} from "@/components/ui"
import { useClient, useToast, useCampaign } from "@/contexts"
import { useAutocompleteFilters } from "@/components/ListManager/hooks"
import { paginateArray } from "@/lib"
import type { User, Character, Entity } from "@/types"

interface CharacterManagerProps {
  user: User
  onUserUpdate: (user: User) => void
}

export default function CharacterManager({
  user,
  onUserUpdate,
}: CharacterManagerProps) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const { campaign } = useCampaign()

  const [open, setOpen] = useState(false)
  const [myCharacters, setMyCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Use the autocomplete filters hook for unassigned characters
  const {
    formState,
    updateFilters,
    loading: filtersLoading,
  } = useAutocompleteFilters("Characters", client, { unassigned: "true" })

  // Fetch user's characters
  const fetchMyCharacters = useCallback(async () => {
    if (!campaign) return

    setIsLoading(true)
    try {
      const response = await client.getCharacters({
        user_id: user.id,
        per_page: 100,
        sort: "name",
        order: "asc",
      })
      setMyCharacters(response.data.characters || [])
    } catch (error) {
      console.error("Error fetching characters:", error)
      toastError("Failed to load characters")
    } finally {
      setIsLoading(false)
    }
  }, [client, campaign, user.id, toastError])

  useEffect(() => {
    fetchMyCharacters()
  }, [fetchMyCharacters])

  // Handle adding a character to the user
  const handleAdd = useCallback(
    async (selected: { id: string; name: string } | null) => {
      if (!selected) return

      const character = formState.data.characters?.find(
        (c: Character) => c.id === selected.id
      )
      if (!character) return

      try {
        const formData = new FormData()
        formData.append("character", JSON.stringify({ user_id: user.id }))
        await client.updateCharacter(character.id, formData)

        // Update local state
        setMyCharacters(prev =>
          [...prev, character].sort((a, b) => a.name.localeCompare(b.name))
        )

        // Refresh the unassigned characters list
        updateFilters({ ...formState.data.filters, page: 1 })

        toastSuccess(`Added "${character.name}" to your characters`)
      } catch (error) {
        console.error("Failed to add character:", error)
        toastError("Failed to add character")
      }
    },
    [client, user.id, formState.data, updateFilters, toastSuccess, toastError]
  )

  // Handle removing a character from the user
  const handleDelete = useCallback(
    async (entity: Entity) => {
      const character = entity as Character
      try {
        const formData = new FormData()
        formData.append("character", JSON.stringify({ user_id: null }))
        await client.updateCharacter(character.id, formData)

        // Update local state
        setMyCharacters(prev => prev.filter(c => c.id !== character.id))

        // Refresh the unassigned characters list
        updateFilters({ ...formState.data.filters, page: 1 })

        // Adjust page if needed
        const remainingItems = myCharacters.length - 1
        const totalPages = Math.ceil(remainingItems / 5)
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages)
        }

        toastSuccess(`Removed "${character.name}" from your characters`)
      } catch (error) {
        console.error("Failed to remove character:", error)
        toastError("Failed to remove character")
      }
    },
    [
      client,
      formState.data.filters,
      updateFilters,
      myCharacters.length,
      currentPage,
      toastSuccess,
      toastError,
    ]
  )

  // Pagination
  const { items: paginatedItems, meta } = paginateArray(
    myCharacters.sort((a, b) => a.name.localeCompare(b.name)),
    currentPage,
    5
  )

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setCurrentPage(newPage)
  }

  const actionButton = <ManageButton open={open} onClick={setOpen} />

  if (!campaign) {
    return (
      <Box sx={{ my: 4 }}>
        <SectionHeader
          title="My Characters"
          icon={<Icon keyword="Character" />}
          sx={{ mb: 2 }}
        >
          Characters you own in the current campaign.
        </SectionHeader>
      </Box>
    )
  }

  return (
    <Box sx={{ my: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: { xs: 1, sm: 1.5 },
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <SectionHeader
          title="My Characters"
          icon={<Icon keyword="Character" />}
          actions={actionButton}
          sx={{ width: "100%" }}
        >
          Characters you own in the current campaign.
        </SectionHeader>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {open && (
          <GenericFilter
            entity="Character"
            formState={formState}
            omit={["search"]}
            onFiltersUpdate={updateFilters}
            onChange={handleAdd}
          />
        )}
        {isLoading || filtersLoading ? (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="rectangular" width="100%" height={40} />
          </Stack>
        ) : (
          <BadgeList
            items={paginatedItems}
            open={open}
            collection="characters"
            meta={meta}
            handleDelete={handleDelete}
            handlePageChange={handlePageChange}
          />
        )}
      </Box>
    </Box>
  )
}

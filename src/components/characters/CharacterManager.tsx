"use client"

import { Box, Button, Stack } from "@mui/material"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import type { Entity } from "@/types"

import { FormActions, useForm } from "@/reducers"

import { paginateArray } from "@/lib"
import { BadgeList } from "@/components/lists"
import { CharacterFilter } from "@/components/characters"
import { useClient } from "@/contexts"
import { useEffect } from "react"
import { ManageButton, SectionHeader } from "@/components/ui"

type FormStateData = {
  page: number
  open: boolean
  id?: string | null
  characters: string[]
  character_ids: string[]
}

type CharacterManagerProperties = {
  icon: React.ReactNode
  name: string
  title: string
  entity: Entity
  description: React.ReactNode
  update: (id: string, formData: FormData) => Promise<void>
}

export default function CharacterManager({
  icon,
  name,
  title,
  entity,
  description,
  update,
}: CharacterManagerProperties) {
  const { client } = useClient()

  const { formState, dispatchForm } = useForm<FormStateData>({
    id: null,
    page: 1,
    open: false,
    characters: entity.characters || [],
    character_ids: entity.character_ids || [],
  })
  const { characters, character_ids, page, id, open } = formState.data
  const { items, meta } = paginateArray<Entity>(characters, page, 5)
  const isStringArray = (value: unknown): value is string[] => {
    return Array.isArray(value) && value.every(item => typeof item === "string")
  }

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await client.getCharacters({
          [`${name}_id`]: entity.id,
          per_page: 100,
          sort: "name",
          order: "asc",
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "characters",
          value: response.data.characters || [],
        })
      } catch (error) {
        console.error("Error fetching characters:", error)
      }
    }

    fetchCharacters().catch(error => {
      console.error("Failed to fetch characters:", error)
    })
  }, [entity, name, client, dispatchForm])

  const handleAddMember = async () => {
    if (!id) return

    if (!isStringArray(character_ids)) {
      alert("Invalid characters data.")
      return
    }

    try {
      const updatedIds = [...character_ids, id]
      const entityData = {
        ...entity,
        character_ids: updatedIds,
      }
      await update(entityData)
      dispatchForm({
        type: FormActions.UPDATE,
        name: "character_ids",
        value: updatedIds,
      })

      dispatchForm({ type: FormActions.UPDATE, name: "id", value: null })
    } catch (error) {
      console.error("Error adding member:", error)
      alert("Failed to add character. Please try again.")
    }
  }

  const handleDelete = async (item: Entity) => {
    if (!isStringArray(character_ids)) {
      alert("Invalid characters data.")
      return
    }

    try {
      let found = false
      const updatedIds = character_ids.filter((id: string) => {
        if (id === item.id && !found) {
          found = true
          return false
        }
        return true
      })
      const entityData = { ...entity, character_ids: updatedIds }
      dispatchForm({
        type: FormActions.UPDATE,
        name: "character_ids",
        value: updatedIds,
      })
      await update(entityData)
    } catch (error) {
      console.error("Error removing entity member:", error)
      alert("Failed to remove.")
    }
  }

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    dispatchForm({ type: FormActions.UPDATE, name: "page", value })
  }

  const setCharacterId = (value: string | null) => {
    dispatchForm({ type: FormActions.UPDATE, name: "id", value })
  }

  const actionButton = <ManageButton open={open} dispatchForm={dispatchForm} />

  return (
    <>
      <Box sx={{ my: 4, width: "100%" }}>
        <Box
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <SectionHeader title={title} icon={icon} actions={actionButton}>
            {description}
          </SectionHeader>
        </Box>

        {open && (
          <Stack
            direction="row"
            spacing={1}
            sx={{ my: 2, alignItems: { xs: "flex-end", sm: "center" } }}
          >
            <CharacterFilter setCharacterId={setCharacterId} />
            <Box sx={{ pb: { xs: 1, sm: 0 } }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleAddMember}
                size="small"
                sx={{ height: "2.5rem", px: 2 }}
              >
                <PersonAddIcon />
              </Button>
            </Box>
          </Stack>
        )}
        <BadgeList
          items={items}
          open={open}
          handleDelete={handleDelete}
          collection="characters"
          meta={meta}
          handlePageChange={handlePageChange}
        />
      </Box>
    </>
  )
}

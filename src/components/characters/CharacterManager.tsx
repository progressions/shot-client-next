"use client"

import { Box, Button, Stack, Typography } from "@mui/material"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import type { Entity } from "@/types"

import { FormActions, useForm } from "@/reducers"

import { paginateArray } from "@/lib"
import { BadgeList } from "@/components/lists"
import { CharacterFilter } from "@/components/characters"

type FormStateData = {
  page: number
  open: boolean
  id?: string | null
}

type CharacterManagerProperties = {
  entity: Entity
  name: string
  title: string
  description: React.ReactNode
  update: (id: string, formData: FormData) => Promise<void>
  characters: Character[]
  character_ids: string[]
}

export default function CharacterManager({
  entity,
  name,
  update,
  title,
  description,
  characters = [],
  character_ids,
}: CharacterManagerProperties) {
  const { formState, dispatchForm } = useForm<FormStateData>({
    id: null,
    page: 1,
    open: false,
  })
  const { page, id, open } = formState.data
  const { items, meta } = paginateArray<Entity>(characters, page, 5)
  const isStringArray = (value: unknown): value is string[] => {
    return Array.isArray(value) && value.every(item => typeof item === "string")
  }

  const handleAddMember = async () => {
    if (!id) return

    if (!isStringArray(character_ids)) {
      alert("Invalid characters data.")
      return
    }

    try {
      const formData = new FormData()
      const entityData = {
        ...entity,
        character_ids: [...character_ids, id],
      }
      formData.append(name.toLowerCase(), JSON.stringify(entityData))
      formData.set(name.toLowerCase(), JSON.stringify(entityData))
      await update(entity.id, formData)

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
      const formData = new FormData()
      let found = false
      const updatedIds = character_ids.filter((id: string) => {
        if (id === item.id && !found) {
          found = true
          return false
        }
        return true
      })
      const entityData = { ...entity, character_ids: updatedIds }
      formData.append(name.toLowerCase(), JSON.stringify(entityData))
      await update(entity.id, formData)
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

  return (
    <>
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
          <Typography variant="h5">{title}</Typography>
          {open && (
            <Button
              variant="contained"
              color="primary"
              onClick={() =>
                dispatchForm({
                  type: FormActions.UPDATE,
                  name: "open",
                  value: false,
                })
              }
              size="small"
              sx={{ px: 1.5 }}
            >
              Close
            </Button>
          )}
          {!open && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() =>
                dispatchForm({
                  type: FormActions.UPDATE,
                  name: "open",
                  value: true,
                })
              }
              sx={{ px: 1.5 }}
            >
              Manage
            </Button>
          )}
        </Box>
        <Typography gutterBottom>{description}</Typography>

        {open && (
          <Stack
            direction="row"
            spacing={1}
            sx={{ my: 2, alignItems: "center" }}
          >
            <CharacterFilter setCharacterId={setCharacterId} />
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAddMember}
              size="small"
              sx={{ height: "2.5rem", px: 2 }}
            >
              <PersonAddIcon />
            </Button>
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

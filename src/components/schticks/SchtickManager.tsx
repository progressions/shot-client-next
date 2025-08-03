"use client"

import { Box, Button, Stack } from "@mui/material"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import type { Entity } from "@/types"

import { FormActions, useForm } from "@/reducers"

import { paginateArray } from "@/lib"
import { BadgeList } from "@/components/lists"
import { SchtickFilter } from "@/components/schticks"
import { useClient } from "@/contexts"
import { useEffect } from "react"
import { ManageButton, SectionHeader } from "@/components/ui"

type FormStateData = {
  page: number
  open: boolean
  id?: string | null
  schticks: string[]
  schtick_ids: string[]
}

type SchtickManagerProperties = {
  entity: Entity
  title: string
  description: React.ReactNode
  update: (id: string, formData: FormData) => Promise<void>
  icon: React.ReactNode
}

export default function SchtickManager({
  entity,
  update,
  title,
  description,
  icon,
}: SchtickManagerProperties) {
  const { client } = useClient()

  const { formState, dispatchForm } = useForm<FormStateData>({
    id: null,
    page: 1,
    open: false,
    schticks: entity.schticks || [],
    schtick_ids: entity.schtick_ids || [],
  })
  const { schticks, schtick_ids, page, id, open } = formState.data
  const { items, meta } = paginateArray<Entity>(schticks, page, 5)
  const isStringArray = (value: unknown): value is string[] => {
    return Array.isArray(value) && value.every(item => typeof item === "string")
  }

  useEffect(() => {
    const fetchSchticks = async () => {
      try {
        const response = await client.getSchticks({
          character_id: entity.id,
          per_page: 100,
          sort: "name",
          order: "asc",
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "schticks",
          value: response.data.schticks || [],
        })
      } catch (error) {
        console.error("Error fetching schticks:", error)
      }
    }

    fetchSchticks().catch(error => {
      console.error("Failed to fetch schticks:", error)
    })
  }, [entity.id, client, dispatchForm])

  const handleAddMember = async () => {
    if (!id) return

    if (!isStringArray(schtick_ids)) {
      alert("Invalid schticks data.")
      return
    }

    try {
      const entityData = {
        ...entity,
        schtick_ids: [...schtick_ids, id],
      }
      await update(entityData)

      dispatchForm({ type: FormActions.UPDATE, name: "id", value: null })
    } catch (error) {
      console.error("Error adding member:", error)
      alert("Failed to add schtick. Please try again.")
    }
  }

  const handleDelete = async (item: Entity) => {
    if (!isStringArray(schtick_ids)) {
      alert("Invalid schticks data.")
      return
    }

    try {
      let found = false
      const updatedIds = schtick_ids.filter((id: string) => {
        if (id === item.id && !found) {
          found = true
          return false
        }
        return true
      })
      const entityData = { ...entity, schtick_ids: updatedIds }
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

  const setSchtickId = (value: string | null) => {
    dispatchForm({ type: FormActions.UPDATE, name: "id", value })
  }
  const actionButton = <ManageButton open={open} dispatchForm={dispatchForm} />

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
          <SectionHeader
            title={title}
            icon={icon}
            actions={actionButton}
            sx={{ width: "100%" }}
          >
            {description}
          </SectionHeader>
        </Box>

        {open && (
          <Stack
            direction="row"
            spacing={1}
            sx={{ my: 2, alignItems: { xs: "flex-end", sm: "center" } }}
          >
            <SchtickFilter setSchtickId={setSchtickId} />
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
          collection="schticks"
          meta={meta}
          handlePageChange={handlePageChange}
        />
      </Box>
    </>
  )
}

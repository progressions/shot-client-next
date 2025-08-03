"use client"

import { Box, Button, Stack } from "@mui/material"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import type { Entity } from "@/types"

import { FormActions, useForm } from "@/reducers"

import { paginateArray } from "@/lib"
import { BadgeList } from "@/components/lists"
import { WeaponFilter } from "@/components/weapons"
import { ManageButton, SectionHeader } from "@/components/ui"
import { useClient } from "@/contexts"
import { useEffect } from "react"

type FormStateData = {
  page: number
  open: boolean
  id?: string | null
  weapons: string[]
  weapon_ids: string[]
}

type WeaponManagerProperties = {
  entity: Entity
  name: string
  title: string
  description: React.ReactNode
  update: (id: string, formData: FormData) => Promise<void>
  icon: React.ReactNode
}

export default function WeaponManager({
  entity,
  update,
  title,
  description,
  icon,
}: WeaponManagerProperties) {
  const { client } = useClient()

  const { formState, dispatchForm } = useForm<FormStateData>({
    id: null,
    page: 1,
    open: false,
    weapons: entity.weapons || [],
    weapon_ids: entity.weapon_ids || [],
  })
  const { weapons, weapon_ids, page, id, open } = formState.data
  const { items, meta } = paginateArray<Entity>(weapons, page, 5)
  const isStringArray = (value: unknown): value is string[] => {
    return Array.isArray(value) && value.every(item => typeof item === "string")
  }

  useEffect(() => {
    const fetchWeapons = async () => {
      try {
        const response = await client.getWeapons({
          character_id: entity.id,
          per_page: 100,
          sort: "name",
          order: "asc",
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "weapons",
          value: response.data.weapons || [],
        })
      } catch (error) {
        console.error("Error fetching weapons:", error)
      }
    }

    fetchWeapons().catch(error => {
      console.error("Failed to fetch weapons:", error)
    })
  }, [entity, client, dispatchForm])

  const handleAddMember = async () => {
    if (!id) return

    if (!isStringArray(weapon_ids)) {
      alert("Invalid weapons data.")
      return
    }

    try {
      const entityData = {
        ...entity,
        weapon_ids: [...weapon_ids, id],
      }
      await update(entityData)

      dispatchForm({ type: FormActions.UPDATE, name: "id", value: null })
    } catch (error) {
      console.error("Error adding member:", error)
      alert("Failed to add weapon. Please try again.")
    }
  }

  const handleDelete = async (item: Entity) => {
    if (!isStringArray(weapon_ids)) {
      alert("Invalid weapons data.")
      return
    }

    try {
      let found = false
      const updatedIds = weapon_ids.filter((id: string) => {
        if (id === item.id && !found) {
          found = true
          return false
        }
        return true
      })
      const entityData = { ...entity, weapon_ids: updatedIds }
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

  const setWeaponId = (value: string | null) => {
    console.log("Setting weapon ID:", value)
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
            <WeaponFilter setWeaponId={setWeaponId} />
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
          collection="weapons"
          meta={meta}
          handlePageChange={handlePageChange}
        />
      </Box>
    </>
  )
}

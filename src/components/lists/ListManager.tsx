"use client"

import { Box, Button, Stack } from "@mui/material"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import type { Entity } from "@/types"

import { FormActions, useForm } from "@/reducers"
import {
  UserAutocomplete,
  CharacterAutocomplete,
  VehicleAutocomplete,
  PartyAutocomplete,
  JunctureAutocomplete,
  SiteAutocomplete,
  WeaponAutocomplete,
  FactionAutocomplete,
  SchtickAutocomplete,
} from "@/components/autocomplete"
import { paginateArray } from "@/lib"
import { BadgeList } from "@/components/lists"
import { ManageButton, SectionHeader } from "@/components/ui"

type FormStateData = {
  page: number
  open: boolean
  id?: string | null
  selectedEntity?: Entity | null
  collectionItems?: Entity[]
}

type ListManagerProperties = {
  icon: React.ReactNode
  entity: Entity
  name: string
  title: string
  description: React.ReactNode
  update: (id: string, formData: FormData) => Promise<void>
  collection: string
  collection_ids: string
  manage?: boolean
}

export default function ListManager({
  icon,
  entity,
  name,
  update,
  title,
  description,
  collection,
  collection_ids,
  manage = true,
}: ListManagerProperties) {
  const { formState, dispatchForm } = useForm<FormStateData>({
    collectionItems: entity[collection] || ([] as Entity[]),
    selectedEntity: null,
    id: null,
    page: 1,
    open: false,
  })
  const { collectionItems, page, id, open } = formState.data
  const sortedItems = collectionItems.sort((a, b) => {
    if (a.name && b.name) {
      return a.name.localeCompare(b.name)
    }
    return 0
  })
  const { items, meta } = paginateArray<Entity>(sortedItems || [], page, 5)
  const entityCollection = entity[collection_ids] || ([] as string[])

  const isStringArray = (value: unknown): value is string[] => {
    return Array.isArray(value) && value.every(item => typeof item === "string")
  }

  const handleAddMember = async () => {
    if (!id) return

    if (!isStringArray(entityCollection)) {
      alert("Invalid collection data.")
      return
    }

    if (entityCollection.includes(id)) {
      alert("already a member.")
      return
    }

    try {
      const formData = new FormData()
      const entityData = {
        ...entity,
        [collection_ids]: [...entityCollection, id],
      }
      formData.append(name.toLowerCase(), JSON.stringify(entityData))
      formData.set(name.toLowerCase(), JSON.stringify(entityData))
      await update(entity.id, formData)

      dispatchForm({
        type: FormActions.UPDATE,
        name: "collectionItems",
        value: [...collectionItems, formState.data.selectedEntity],
      })
      dispatchForm({ type: FormActions.UPDATE, name: "id", value: null })
    } catch (error) {
      console.error("Error adding member:", error)
      alert("Failed to add. Please try again.")
    }
  }

  const handleDelete = async (item: Entity) => {
    if (!isStringArray(entityCollection)) {
      alert("Invalid collection data.")
      return
    }

    try {
      const formData = new FormData()
      const updatedIds = entityCollection.filter((id: string) => id !== item.id)
      const entityData = { ...entity, [collection_ids]: updatedIds }
      formData.append(name.toLowerCase(), JSON.stringify(entityData))
      await update(entity.id, formData)

      dispatchForm({
        type: FormActions.UPDATE,
        name: "collectionItems",
        value: collectionItems.filter((i: Entity) => i.id !== item.id),
      })
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

  const handleAutocompleteChange = (value: string | null) => {
    dispatchForm({ type: FormActions.UPDATE, name: "id", value: value.id })
    dispatchForm({ type: FormActions.UPDATE, name: "selectedEntity", value })
  }

  const ids = entity[collection_ids] || ([] as string[])

  const autocompleteMap: Record<string, React.ReactNode> = {
    actors: (
      <CharacterAutocomplete
        value={id || ""}
        onChange={handleAutocompleteChange}
        exclude={ids as string[]}
        allowNone={false}
      />
    ),
    characters: (
      <CharacterAutocomplete
        value={id || ""}
        onChange={handleAutocompleteChange}
        exclude={ids as string[]}
        allowNone={false}
      />
    ),
    vehicles: (
      <VehicleAutocomplete
        value={id || ""}
        onChange={handleAutocompleteChange}
        exclude={ids as string[]}
        allowNone={false}
      />
    ),
    parties: (
      <PartyAutocomplete
        value={id || ""}
        onChange={handleAutocompleteChange}
        exclude={ids as string[]}
        allowNone={false}
      />
    ),
    junctures: (
      <JunctureAutocomplete
        value={id || ""}
        onChange={handleAutocompleteChange}
        exclude={ids as string[]}
        allowNone={false}
      />
    ),
    sites: (
      <SiteAutocomplete
        value={id || ""}
        onChange={handleAutocompleteChange}
        exclude={ids as string[]}
        allowNone={false}
      />
    ),
    weapons: (
      <WeaponAutocomplete
        value={id || ""}
        onChange={handleAutocompleteChange}
        exclude={ids as string[]}
        allowNone={false}
      />
    ),
    factions: (
      <FactionAutocomplete
        value={id || ""}
        onChange={handleAutocompleteChange}
        exclude={ids as string[]}
        allowNone={false}
      />
    ),
    schticks: (
      <SchtickAutocomplete
        value={id || ""}
        onChange={handleAutocompleteChange}
        exclude={ids as string[]}
        allowNone={false}
      />
    ),
    players: (
      <UserAutocomplete
        value={id || ""}
        onChange={handleAutocompleteChange}
        exclude={ids as string[]}
        allowNone={false}
      />
    ),
    users: (
      <UserAutocomplete
        value={id || ""}
        onChange={handleAutocompleteChange}
        exclude={ids as string[]}
        allowNone={false}
      />
    ),
  }

  const autocomplete = autocompleteMap[collection]

  if (!manage)
    return (
      <>
        <Box sx={{ my: 4 }}>
          <BadgeList
            items={items}
            open={open}
            handleDelete={handleDelete}
            collection={collection}
            meta={meta}
            handlePageChange={handlePageChange}
          />
        </Box>
      </>
    )

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
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            {autocomplete}
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
          collection={collection}
          meta={meta}
          handlePageChange={handlePageChange}
        />
      </Box>
    </>
  )
}

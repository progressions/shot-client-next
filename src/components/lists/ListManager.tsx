"use client"

import {
  IconButton,
  Pagination,
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import type {
  Weapon,
  Schtick,
  Faction,
  Site,
  Party,
  Juncture,
  Entity,
  Character,
} from "@/types"
import {
  CharacterBadge,
  VehicleBadge,
  PartyBadge,
  FactionBadge,
  JunctureBadge,
  SiteBadge,
  WeaponBadge,
  SchtickBadge,
} from "@/components/badges"
import { useClient } from "@/contexts"
import { FormActions, useForm } from "@/reducers"
import {
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

type FormStateData = {
  page: number
  open: boolean
  id?: string | null
}

type ListManagerProps = {
  entity: Entity
  name: string
  title: string
  description: React.ReactNode
  update: (id: string, formData: FormData) => Promise<void>
  collection: string
  collection_ids: string
}

export default function ListManager({
  entity,
  name,
  update,
  title,
  description,
  collection,
  collection_ids,
}: ListManagerProps) {
  const { client } = useClient()
  const { formState, dispatchForm } = useForm<FormStateData>({
    id: null,
    page: 1,
    open: false,
  })
  const { page, id, open } = formState.data
  const { items, meta } = paginateArray<Entity>(
    (entity[collection] as Entity[]) || [],
    page,
    5
  )
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

      dispatchForm({ type: FormActions.UPDATE, name: "id", value: null })
    } catch (error) {
      console.error("Error adding member:", error)
      alert("Failed to add character. Please try again.")
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
    dispatchForm({ type: FormActions.UPDATE, name: "id", value })
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
  }

  const autocomplete = autocompleteMap[collection]

  const badgeMap: Record<string, (thing: Entity) => React.ReactNode> = {
    actors: (thing: Entity) => (
      <CharacterBadge character={thing as Character} />
    ),
    characters: (thing: Entity) => (
      <CharacterBadge character={thing as Character} />
    ),
    vehicles: (thing: Entity) => <VehicleBadge vehicle={thing as Vehicle} />,
    parties: (thing: Entity) => <PartyBadge party={thing as Party} />,
    junctures: (thing: Entity) => (
      <JunctureBadge juncture={thing as Juncture} />
    ),
    sites: (thing: Entity) => <SiteBadge site={thing as Site} />,
    weapons: (thing: Entity) => <WeaponBadge weapon={thing as Weapon} />,
    factions: (thing: Entity) => <FactionBadge faction={thing as Faction} />,
    schticks: (thing: Entity) => <SchtickBadge schtick={thing as Schtick} />,
  }

  const badge = badgeMap[collection]

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
        <Stack direction="column" spacing={1} sx={{ mt: 2 }}>
          {items.map((item: Entity, index: number) => (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              key={`${item.id}-${index}`}
            >
              <Box sx={{ width: "100%" }}>{badge(item)}</Box>
              {open && (
                <Box>
                  <IconButton
                    color="inherit"
                    onClick={() => handleDelete(item)}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
            </Stack>
          ))}
          <Pagination
            count={meta.total_pages}
            page={meta.current_page}
            onChange={handlePageChange}
            variant="outlined"
            color="primary"
            shape="rounded"
            size="medium"
          />
        </Stack>
      </Box>
    </>
  )
}

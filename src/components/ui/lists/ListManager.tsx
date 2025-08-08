"use client"

import { Box, Stack } from "@mui/material"
import pluralize from "pluralize"
import { useCallback, useEffect } from "react"
import type { Entity } from "@/types"
import { useClient } from "@/contexts"
import { FormActions, useForm } from "@/reducers"
import {
  FilterSelector,
  BadgeList,
  ManageButton,
  SectionHeader,
  AddButton,
} from "@/components/ui"
import { paginateArray } from "@/lib"

type FormStateData = {
  parentEntity: Entity // the parent entity which owns the children being managed
  page: number
  open: boolean
  selectedChild: Entity | null
  childItems: Entity[]
}

type ListManagerProperties = {
  icon: React.ReactNode
  parent: Entity
  title: string
  description: React.ReactNode
  updateParent: (id: string, formData: FormData) => Promise<void>
  collectionName: string // plural, the property on the entity that holds the collection, e.g. "characters", "vehicles"
  manage?: boolean
}

export function ListManager({
  icon,
  parent: initialParent,
  title,
  description,
  collectionName,
  manage = true,
  updateParent,
}: ListManagerProperties) {
  const { client } = useClient()

  const initialData = {
    parentEntity: initialParent,
    selectedChild: null,
    page: 1,
    open: false,
  }
  const { formState: managerState, dispatchForm: dispatchManager } =
    useForm<FormStateData>(initialData)
  const { parentEntity, page, open, selectedChild } = managerState.data
  const childItems = parentEntity[collectionName] || []
  const collectionIdsName = pluralize.singular(collectionName) + "_ids"
  const collectionIds = parentEntity[collectionIdsName] || []
  const { items, meta } = paginateArray<Entity>(childItems, page, 5)

  const getFunc = `get${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)}`
  const singularEntityName = pluralize
    .singular(parentEntity.entity_class)
    .toLowerCase()
  // const singularCollectionName = pluralize.singular(collectionName).toLowerCase()
  // const collectionIdsName = pluralize.singular(collectionIdsName).toLowerCase()

  const fetchChildren = useCallback(async () => {
    try {
      const response = await client[getFunc]({
        [`${singularEntityName}_id`]: parentEntity.id,
        per_page: 100,
        sort: "name",
        order: "asc",
      })

      const newCollection = response.data[collectionName] || []
      const newCollectionIds =
        newCollection.map((item: Entity) => item.id) || []

      dispatchManager({
        type: FormActions.UPDATE,
        name: "meta",
        value: response.data.meta,
      })

      dispatchManager({
        type: FormActions.UPDATE,
        name: "parentEntity",
        value: {
          ...parentEntity,
          [collectionName]: newCollection,
          [collectionIdsName]: newCollectionIds,
        },
      })
    } catch (error) {
      console.error(`Error fetching ${collectionName}:`, error)
    }
  }, [parentEntity, collectionName, client, getFunc, dispatchManager])

  useEffect(() => {
    // when the component first loads, fetch the collection items from the
    // server and store them in 'parentEntity'
    fetchChildren()
  }, [parentEntity.id, page])

  const handleAutocompleteChange = (child: Entity | null) => {
    dispatchManager({
      type: FormActions.UPDATE,
      name: "selectedChild",
      value: child,
    })
  }

  if (!manage)
    return (
      <>
        <Box sx={{ my: 4 }}>
          <BadgeList
            items={items}
            open={open}
            handleDelete={handleDelete}
            collection={collectionName}
            meta={meta}
            handlePageChange={handlePageChange}
          />
        </Box>
      </>
    )

  const handleAddMember = async () => {
    const updatedEntity = {
      ...parentEntity,
      [collectionIdsName]: [...collectionIds, selectedChild.id],
    }
    dispatchManager({
      type: FormActions.UPDATE,
      name: "parentEntity",
      value: updatedEntity,
    })
    dispatchManager({
      type: FormActions.UPDATE,
      name: "selectedChild",
      value: null,
    })
    await updateParent(updatedEntity)
    await fetchChildren()
  }

  const handleDelete = async (item: Entity) => {
    let found = false
    const updatedCollectionIds = collectionIds.filter((id: string) => {
      if (id === item.id && !found) {
        found = true
        return false
      }
      return true
    })
    const updatedEntity = {
      ...parentEntity,
      [collectionIdsName]: updatedCollectionIds,
    }
    dispatchManager({
      type: FormActions.UPDATE,
      name: "parentEntity",
      value: updatedEntity,
    })
    dispatchManager({
      type: FormActions.UPDATE,
      name: "selectedChild",
      value: null,
    })
    await updateParent(updatedEntity)
    await fetchChildren()
  }

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    dispatchManager({ type: FormActions.UPDATE, name: "page", value })
    dispatchManager({
      type: FormActions.UPDATE,
      name: "selectedChild",
      value: null,
    })
  }

  const actionButton = (
    <ManageButton open={open} dispatchForm={dispatchManager} />
  )

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
            <FilterSelector
              selectedChild={selectedChild}
              setSelectedChild={handleAutocompleteChange}
              handleAddMember={handleAddMember}
              collectionIds={collectionIds}
              collectionName={collectionName}
            />
            {!["characters"].includes(collectionName) && (
              <AddButton onClick={handleAddMember} disabled={!selectedChild} />
            )}
          </Stack>
        )}
        <BadgeList
          items={items}
          open={open}
          collection={collectionName}
          meta={meta}
          handlePageChange={handlePageChange}
          handleDelete={handleDelete}
        />
      </Box>
    </>
  )
}

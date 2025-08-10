"use client"

import { Stack, Box } from "@mui/material"
import { FormActions, useForm } from "@/reducers"
import { useClient } from "@/contexts"
import { WeaponAutocomplete } from "@/components/autocomplete"
import { AddButton, Autocomplete } from "@/components/ui"
import type { Weapon, Juncture } from "@/types"
import { useCallback, useEffect } from "react"

type FormStateData = {
  weapon_type: string | null
  categories: string[]
  category: string | null
  weapons: Weapon[]
  junctures: Juncture[]
  juncture: string | null
  selectedChild: Weapon | null
}

type OmitType = "category" | "juncture" | "weapon" | "add"

type WeaponFilterProps = {
  // value is the ID of the selected weapon
  value?: string | null
  setSelectedChild: (weapon: Weapon) => void
  addMember?: (weapon: Weapon) => void
  dispatch: React.Dispatch<FormStateData>
  omit: OmitType[]
}

export default function WeaponFilter({
  value,
  setSelectedChild,
  addMember,
  dispatch,
  omit = [],
}: WeaponFilterProps) {
  const { client } = useClient()
  const { formState, dispatchForm } = useForm<FormStateData>({
    weapon_type: null,
    categories: [],
    category: null,
    weapons: [],
    junctures: [],
    selectedChild: value,
  })
  const {
    weapon_type,
    categories,
    category,
    weapons,
    junctures,
    juncture,
    selectedChild,
  } = formState.data

  const weapon_id = selectedChild?.id

  const fetchWeapons = useCallback(async () => {
    try {
      const response = await client.getWeapons({
        autocomplete: true,
        juncture: juncture,
        category: category,
        per_page: 100,
        sort: "name",
        order: "asc",
      })
      dispatchForm({
        type: FormActions.UPDATE,
        name: "weapons",
        value: response.data.weapons || [],
      })
      dispatchForm({
        type: FormActions.UPDATE,
        name: "categories",
        value: response.data.categories || [],
      })
      dispatchForm({
        type: FormActions.UPDATE,
        name: "junctures",
        value: response.data.junctures || [],
      })
      if (dispatch) {
        dispatch({ type: FormActions.UPDATE, name: "weapons", value: weapons })
        dispatch({
          type: FormActions.UPDATE,
          name: "category",
          value: category,
        })
        dispatch({
          type: FormActions.UPDATE,
          name: "juncture",
          value: juncture,
        })
      }
    } catch (error) {
      console.error("Error fetching weapons:", error)
      return []
    }
  }, [client, juncture, category, dispatchForm, dispatch])

  useEffect(() => {
    fetchWeapons()
      .catch(error => {
        console.error("Error in useEffect fetchWeapons:", error)
      })
      .then(() => {
        dispatchForm({
          type: FormActions.EDIT,
          name: "loading",
          value: false,
        })
      })
  }, [client, dispatchForm, weapon_type, selectedChild, juncture, fetchWeapons])

  const handleWeaponChange = (weapon: Weapon | null) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "selectedChild",
      value: weapon,
    })
    setSelectedChild?.(weapon)
  }

  const handleJunctureChange = (value: string | null) => {
    dispatchForm({ type: FormActions.UPDATE, name: "juncture", value: value })
  }

  const handleCategoryChange = (value: string | null) => {
    dispatchForm({ type: FormActions.UPDATE, name: "category", value: value })
  }

  const fetchCategories = async () => {
    const opts = categories.map(category => ({
      label: category,
      value: category,
    }))
    return Promise.resolve(opts)
  }

  const fetchJunctures = async () => {
    const opts = junctures.map(juncture => ({
      label: juncture,
      value: juncture,
    }))
    return Promise.resolve(opts)
  }

  const handleAddMember = () => {
    addMember?.(selectedChild)
    dispatchForm({
      type: FormActions.UPDATE,
      name: "selectedChild",
      value: null,
    })
    setSelectedChild(null)
  }

  return (
    <Box
      sx={{
        mb: 2,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems="center"
        sx={{ width: "100%" }}
      >
        {!omit.includes("juncture") && (
          <Autocomplete
            label="Juncture"
            value={juncture || ""}
            fetchOptions={fetchJunctures}
            onChange={handleJunctureChange}
            allowNone={false}
          />
        )}
        {!omit.includes("category") && (
          <Autocomplete
            label="Category"
            value={category || ""}
            fetchOptions={fetchCategories}
            onChange={handleCategoryChange}
            allowNone={false}
          />
        )}
        {!omit.includes("weapon") && (
          <WeaponAutocomplete
            options={weapons.map(weapon => ({
              label: weapon.name || "",
              value: weapon.id || "",
            }))}
            value={weapon_id || ""}
            onChange={handleWeaponChange}
            allowNone={false}
          />
        )}
        {!omit.includes("add") && (
          <AddButton onClick={handleAddMember} disabled={!selectedChild} />
        )}
      </Stack>
    </Box>
  )
}

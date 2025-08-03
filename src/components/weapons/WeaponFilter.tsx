"use client"

import { Stack, Box } from "@mui/material"
import { FormActions, useForm } from "@/reducers"
import { useClient } from "@/contexts"
import { WeaponAutocomplete } from "@/components/autocomplete"
import { Autocomplete } from "@/components/ui"
import type { Weapon } from "@/types"
import { useCallback, useEffect } from "react"

type FormStateData = {
  weapons: Weapon[]
  weapon_id: string | null
  categories: string[]
  category: string | null
  junctures: string[]
  juncture: string | null
}

type WeaponFilterProps = {
  setWeaponId: (id: string | null) => void
  dispatch: React.Dispatch<FormStateData>
  omit: string[]
}

export default function WeaponFilter({
  setWeaponId,
  dispatch,
  omit = [],
}: WeaponFilterProps) {
  const { client } = useClient()
  const { formState, dispatchForm } = useForm<FormStateData>({
    weapons: [],
    weapon_id: null,
    categories: [],
    category: null,
    junctures: [],
    juncture: null,
  })
  const { weapons, weapon_id, categories, category, junctures, juncture } =
    formState.data

  const fetchWeapons = useCallback(async () => {
    try {
      const response = await client.getWeapons({
        category: category,
        juncture: juncture,
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
    } catch (error) {
      console.error("Error fetching weapons:", error)
      return []
    }
  }, [client, category, juncture, dispatchForm])

  useEffect(() => {
    if (!dispatch) return
    // update the set of weapons outside the component
    dispatch({
      type: FormActions.UPDATE,
      name: "category",
      value: category,
    })
    dispatch({ type: FormActions.UPDATE, name: "category", value: category })
    dispatch({
      type: FormActions.UPDATE,
      name: "juncture",
      value: juncture,
    })
  }, [dispatch, category, juncture])

  useEffect(() => {
    fetchWeapons().catch(error => {
      console.error("Error in useEffect fetchWeapons:", error)
    })
  }, [fetchWeapons])

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
  }, [client, dispatchForm, fetchWeapons, category, juncture])

  const handleWeaponChange = (weapon: Weapon | null) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "weapon_id",
      value: weapon.id,
    })
    setWeaponId(weapon.id)
  }

  const handleCategoryChange = (value: string | null) => {
    dispatchForm({ type: FormActions.UPDATE, name: "category", value })
  }

  const handleJunctureChange = (value: string | null) => {
    dispatchForm({ type: FormActions.UPDATE, name: "juncture", value })
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
        spacing={2}
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
      </Stack>
    </Box>
  )
}

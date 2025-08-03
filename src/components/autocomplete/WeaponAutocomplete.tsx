"use client"

import type { Weapon } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"
import { useState, useEffect } from "react"

type WeaponsAutocompleteProperties = {
  value: string
  onChange: (value: string | null) => void
  options?: Option[]
  exclude?: string[]
  allowNone?: boolean
}

export default function WeaponsAutocomplete({
  value,
  onChange,
  options,
  exclude = [],
  allowNone = true,
}: WeaponsAutocompleteProperties) {
  const { client } = useClient()
  const [weapons, setWeapons] = useState<Weapon[]>([])

  useEffect(() => {
    const fetchWeapons = async () => {
      try {
        const response = await client.getWeapons({
          per_page: 200,
          page: 1,
          sort: "name",
          order: "asc",
        })
        setWeapons(response.data.weapons || [])
      } catch (error) {
        console.error("Error fetching weapons:", error)
      }
    }

    fetchWeapons().catch(error => {
      console.error("Error in useEffect fetchWeapons:", error)
    })
  }, [client])

  const fetchOptions = async (inputValue: string): Promise<Option[]> => {
    if (options) {
      const filteredOptions = options
        .filter(option =>
          option.label.toLowerCase().includes(inputValue.toLowerCase())
        )
        .filter(option => !exclude.includes(option.value))

      return filteredOptions
    }
    return weapons
      .filter(weapon =>
        weapon.name.toLowerCase().includes(inputValue.toLowerCase())
      )
      .map(weapon => ({
        label: weapon.name,
        value: weapon.id,
      }))
  }

  const handleChange = (selectedOption: Option | null) => {
    console.log("selectedOption", selectedOption)
    const weapon = weapons.find(s => s.id === selectedOption)
    onChange(weapon)
  }

  return (
    <Autocomplete
      label="Weapon"
      value={value}
      fetchOptions={fetchOptions}
      onChange={handleChange}
      exclude={exclude}
      allowNone={allowNone}
    />
  )
}

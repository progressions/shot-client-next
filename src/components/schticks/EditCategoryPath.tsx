"use client"

import { Stack } from "@mui/material"
import { SectionHeader } from "@/components/ui"
import { InfoLink } from "@/components/links"
import {
  SchtickCategoryAutocomplete,
  SchtickPathAutocomplete,
} from "@/components/autocomplete"
import { useClient } from "@/contexts"
import type { Schtick, SchtickPath } from "@/types"
import { useState } from "react"

type EditCategoryPathProps = {
  schtick: Schtick
  updateSchtick: (schtick: Schtick) => Promise<void>
}

export default function EditCategoryPath({
  schtick,
  updateSchtick,
}: EditCategoryPathProps) {
  const { client } = useClient()
  const [category, setCategory] = useState<string | null>(
    schtick.category || null
  )
  const [path, setPath] = useState<string | null>(schtick.path || null)

  const handleCategoryChange = async (value: string | null) => {
    setCategory(value)
    await updateSchtick({ ...schtick, category: value })
  }

  const handlePathChange = async (value: string | null) => {
    setPath(value)
    await updateSchtick({ ...schtick, path: value })
  }

  const fetchPaths = async (inputValue: string): Promise<Option[]> => {
    try {
      const response = await client.getSchtickPaths({
        search: inputValue,
        category: category,
      })
      return response.data.paths.map((path: SchtickPath) => ({
        label: path || "",
        value: path || "",
      }))
    } catch (error) {
      console.error("Error fetching options:", error)
      return []
    }
  }

  return (
    <>
      <SectionHeader title="Category and Path">
        A <InfoLink href="/schticks" info="Schtick" /> belongs to a certain{" "}
        <InfoLink info="Category" /> and <InfoLink info="Path" />, which governs
        the style of the Schtick and determines future{" "}
        <InfoLink info="Advancement" /> choices.
      </SectionHeader>
      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <SchtickCategoryAutocomplete
          value={category || ""}
          onChange={handleCategoryChange}
          allowNone={false}
        />
        <SchtickPathAutocomplete
          value={path || ""}
          onChange={handlePathChange}
          fetchOptions={fetchPaths}
          allowNone={false}
        />
      </Stack>
    </>
  )
}

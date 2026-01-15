"use client"

import type { NotionPage } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"
import { useEffect, useState } from "react"

export type EntityType = "site" | "party" | "faction" | "juncture" | "adventure"

type EntityNotionPageAutocompleteProperties = {
  value: string | null
  onChange: (value: string | null) => void
  entityType: EntityType
  entityName?: string
  allowNone?: boolean
}

export default function EntityNotionPageAutocomplete({
  value,
  onChange,
  entityType,
  entityName = "",
  allowNone = true,
}: EntityNotionPageAutocompleteProperties) {
  const { client } = useClient()
  const [pages, setPages] = useState<NotionPage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPages = async () => {
      setIsLoading(true)
      try {
        let response
        const params = entityName ? { name: entityName } : {}

        switch (entityType) {
          case "site":
            response = await client.getNotionSites(params)
            break
          case "party":
            response = await client.getNotionParties(params)
            break
          case "faction":
            response = await client.getNotionFactions(params)
            break
          case "juncture":
            response = await client.getNotionJunctures(params)
            break
          case "adventure":
            response = await client.getNotionAdventures(params)
            break
        }

        setPages(response?.data || [])
      } catch (error) {
        console.error(`Error fetching Notion ${entityType} pages:`, error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPages().catch(error => {
      console.error("Error in useEffect fetchPages:", error)
      setIsLoading(false)
    })
  }, [client, entityType, entityName])

  const fetchOptions = async (inputValue: string): Promise<Option[]> => {
    return pages
      .filter(page => {
        const pageName = page.title || ""
        return pageName.toLowerCase().includes(inputValue.toLowerCase())
      })
      .map(page => ({
        label: page.title || "Untitled",
        value: page.id,
      }))
  }

  const handleChange = (selectedOption: string | null) => {
    onChange(selectedOption)
  }

  const entityLabel = entityType.charAt(0).toUpperCase() + entityType.slice(1)

  return (
    <Autocomplete
      label={
        isLoading
          ? `Loading Notion ${entityLabel}s...`
          : `Notion ${entityLabel} Page`
      }
      value={value}
      fetchOptions={fetchOptions}
      onChange={handleChange}
      allowNone={allowNone}
      disabled={isLoading}
    />
  )
}

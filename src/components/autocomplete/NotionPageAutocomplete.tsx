"use client"

import type { NotionPage } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"
import { useEffect, useState } from "react"

type NotionPageAutocompleteProperties = {
  value: string
  onChange: (value: string | null) => void
  characterName?: string
  allowNone?: boolean
}

export default function NotionPageAutocomplete({
  value,
  onChange,
  characterName = "",
  allowNone = true,
}: NotionPageAutocompleteProperties) {
  const { client } = useClient()
  const [pages, setPages] = useState<NotionPage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPages = async () => {
      setIsLoading(true)
      try {
        const response = await client.getNotionCharacters({
          name: characterName,
        })
        setPages(response.data || [])
      } catch (error) {
        console.error("Error fetching Notion pages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPages().catch(error => {
      console.error("Error in useEffect fetchPages:", error)
      setIsLoading(false)
    })
  }, [client, characterName])

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

  return (
    <Autocomplete
      label={isLoading ? "Loading Notion pages..." : "Notion Page"}
      value={value}
      fetchOptions={fetchOptions}
      onChange={handleChange}
      allowNone={allowNone}
      disabled={isLoading}
    />
  )
}

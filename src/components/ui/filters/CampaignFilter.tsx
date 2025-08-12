// components/CampaignFilter.tsx
"use client"
import { Stack } from "@mui/material"
import { createAutocomplete, AddButton } from "@/components/ui"
import { useClient } from "@/contexts"
import { useState, useEffect, useCallback } from "react"
import { debounce } from "lodash"

interface AutocompleteOption {
  id: number
  name: string
}

const CampaignAutocomplete = createAutocomplete("Campaign")

type CampaignFilterProps = {
  onChange: (value: AutocompleteOption | null) => void
  omit?: Array<"campaign" | "add">
  excludeIds?: number[]
}

export function CampaignFilter({
  onChange,
  omit = [],
  excludeIds = [],
}: CampaignFilterProps) {
  const { client } = useClient()
  const [selectedCampaign, setSelectedCampaign] =
    useState<AutocompleteOption | null>(null)
  const [campaignRecords, setCampaignRecords] = useState<AutocompleteOption[]>(
    []
  )
  const [campaignKey, setCampaignKey] = useState("campaign-0")
  const [keyCounter, setKeyCounter] = useState(1)

  const filteredCampaignRecords = campaignRecords.filter(
    record => !excludeIds.includes(record.id)
  )

  const fetchRecords = useCallback(
    debounce(async () => {
      try {
        const response = await client.getCampaigns({
          autocomplete: true,
          per_page: 200,
        })
        const campaigns = response.data.campaigns
        setCampaignRecords(campaigns)
      } catch (error) {
        console.error("Failed to fetch records:", error)
      }
    }, 300),
    [client]
  )

  useEffect(() => {
    fetchRecords()
    return () => {
      fetchRecords.cancel()
    }
  }, [fetchRecords])

  const handleAdd = () => {
    if (selectedCampaign) {
      onChange(selectedCampaign)
      setSelectedCampaign(null)
      setCampaignKey(`campaign-${keyCounter}`)
      setKeyCounter(prev => prev + 1)
    }
  }

  const handleCampaignChange = (value: AutocompleteOption | null) => {
    setSelectedCampaign(value)
    if (omit.includes("add") && value) {
      onChange(value)
      setSelectedCampaign(null)
      setCampaignKey(`campaign-${keyCounter}`)
      setKeyCounter(prev => prev + 1)
    }
  }

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{ width: "100%" }}
    >
      {!omit.includes("campaign") && (
        <CampaignAutocomplete
          key={campaignKey}
          value={selectedCampaign}
          onChange={handleCampaignChange}
          filters={{}}
          records={filteredCampaignRecords}
          sx={{ width: "100%" }}
        />
      )}
      {!omit.includes("add") && (
        <AddButton
          onClick={handleAdd}
          disabled={!selectedCampaign}
          sx={{ height: "fit-content", alignSelf: "center" }}
        />
      )}
    </Stack>
  )
}

"use client"

import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Alert, Typography, Box } from "@mui/material"
import type { Party } from "@/types"
import { RichTextRenderer } from "@/components/editor"
import { useCampaign } from "@/contexts"
import { MembersList, EditPartyForm } from "@/components/parties"
import { useClient } from "@/contexts"
import { FactionLink } from "@/components/links"
import { HeroImage, SpeedDialMenu } from "@/components/ui"

interface PartyPageClientProperties {
  party: Party
}

export default function PartyPageClient({
  party: initialParty,
}: PartyPageClientProperties) {
  const { campaignData } = useCampaign()
  const { client } = useClient()

  const [party, setParty] = useState<Party>(initialParty)
  const [editOpen, setEditOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = party.name ? `${party.name} - Chi War` : "Chi War"
  }, [party.name])

  useEffect(() => {
    if (campaignData?.party && campaignData.party.id === initialParty.id) {
      setParty(campaignData.party)
    }
  }, [campaignData, initialParty])

  const handleSave = async () => {
    setEditOpen(false)
  }

  const handleDelete = async () => {
    if (!party?.id) return
    if (!confirm(`Are you sure you want to delete the party: ${party.name}?`))
      return

    try {
      await client.deleteParty(party)
      handleMenuClose()
      redirect("/parties")
    } catch (error_) {
      console.error("Failed to delete party:", error_)
      setError("Failed to delete party.")
    }
  }

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <SpeedDialMenu onEdit={() => setEditOpen(true)} onDelete={handleDelete} />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography variant="h4">{party.name}</Typography>
      </Box>
      <HeroImage entity={party} />
      {party.faction && (
        <Typography variant="h6">
          Belongs to <FactionLink faction={party.faction} />
        </Typography>
      )}
      <Box sx={{ p: 2, backgroundColor: "#2e2e2e", borderRadius: 1, my: 2 }}>
        <RichTextRenderer
          key={party.description}
          html={party.description || ""}
          sx={{ mb: 2 }}
        />
      </Box>

      <MembersList party={party} />

      <EditPartyForm
        key={JSON.stringify(party)}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        party={party}
      />
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  )
}

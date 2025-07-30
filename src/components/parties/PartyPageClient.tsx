"use client"

import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Button, Stack, Alert, Typography, Box } from "@mui/material"
import type { Party } from "@/types"
import { RichTextRenderer } from "@/components/editor"
import { useCampaign } from "@/contexts"
import { MembersForm, EditPartyForm } from "@/components/parties"
import { useClient } from "@/contexts"
import { CharacterBadge } from "@/components/badges"
import { FactionLink } from "@/components/links"
import { SpeedDialMenu } from "@/components/ui"

interface PartyPageClientProps {
  party: Party
}

export default function PartyPageClient({
  party: initialParty,
}: PartyPageClientProps) {
  const { campaignData } = useCampaign()
  const { client } = useClient()

  const [party, setParty] = useState<Party>(initialParty)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const [editOpen, setEditOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

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

  const handleOpenMembers = () => {
    setMembersOpen(prev => !prev)
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
      {party.image_url && (
        <Box
          component="img"
          src={party.image_url}
          alt={party.name}
          sx={{
            width: "100%",
            height: "300px",
            objectFit: "cover",
            objectPosition: "50% 20%",
            mb: 2,
            display: "block",
            mx: "auto",
          }}
        />
      )}
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
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 1,
            alignItems: "center",
          }}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            Party Members
          </Typography>
        </Box>
        {membersOpen && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenMembers}
            sx={{ px: 2 }}
          >
            Close
          </Button>
        )}
        {!membersOpen && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenMembers}
            sx={{ px: 2 }}
          >
            Manage
          </Button>
        )}
      </Box>
      <MembersForm open={membersOpen} party={party} />
      {!membersOpen && (
        <Box sx={{ mb: 2 }}>
          <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
            {party.characters && party.characters.length > 0
              ? party.characters.map((actor, index) => (
                  <CharacterBadge
                    key={`${actor.id}-${index}`}
                    character={actor}
                    sx={{ width: "100%", maxWidth: "100%" }}
                  />
                ))
              : null}
          </Stack>
        </Box>
      )}

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

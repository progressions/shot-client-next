"use client"

import { useState } from "react"
import { Box, Collapse } from "@mui/material"
import { Email } from "@mui/icons-material"
import { SectionHeader, ManageButton } from "@/components/ui"
import InviteByEmailForm from "./InviteByEmailForm"
import PendingInvitations from "./PendingInvitations"
import type { Invitation } from "@/types"

export default function CampaignInvitations() {
  const [open, setOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleInvitationCreated = (invitation: Invitation) => {
    // Trigger a refresh of the pending invitations list
    setRefreshTrigger(prev => prev + 1)
  }

  return (
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
          title="Email Invitations"
          icon={<Email />}
          actions={<ManageButton open={open} onClick={setOpen} />}
          sx={{ width: "100%" }}
        >
          Invite players to your campaign by email. They will receive a link to
          join.
        </SectionHeader>
      </Box>

      <Collapse in={open}>
        <Box sx={{ mb: 2 }}>
          <InviteByEmailForm onInvitationCreated={handleInvitationCreated} />
        </Box>
      </Collapse>

      <PendingInvitations refreshTrigger={refreshTrigger} />
    </Box>
  )
}

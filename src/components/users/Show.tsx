"use client"

import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Alert, Typography, Box } from "@mui/material"
import type { User } from "@/types"
import { RichTextRenderer } from "@/components/editor"
import { useCampaign } from "@/contexts"
import { EditUserForm } from "@/components/users"
import RoleManagement from "@/components/users/RoleManagement"
import { useClient } from "@/contexts"
import { HeroImage, SpeedDialMenu } from "@/components/ui"

interface ShowProperties {
  user: User
  initialIsMobile?: boolean
}

export default function Show({ user: initialUser, initialIsMobile }: ShowProperties) {
  const { campaignData } = useCampaign()
  const { client } = useClient()

  const [user, setUser] = useState<User>(initialUser)
  const [editOpen, setEditOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if current user is admin - if not, redirect silently
  useEffect(() => {
    if (campaignData?.user && !campaignData.user.admin) {
      redirect("/")
    }
  }, [campaignData])

  useEffect(() => {
    document.title = user.name ? `${user.name} - Chi War` : "Chi War"
  }, [user.name])

  useEffect(() => {
    if (campaignData?.user && campaignData.user.id === initialUser.id) {
      setUser(campaignData.user)
    }
  }, [campaignData, initialUser])

  const handleSave = async () => {
    setEditOpen(false)
  }

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser)
  }

  const handleDelete = async () => {
    if (!user?.id) return
    if (!confirm(`Are you sure you want to delete the user: ${user.name}?`))
      return

    try {
      await client.deleteUser(user)
      redirect("/users")
    } catch (error_) {
      console.error("Failed to delete user:", error_)
      setError("Failed to delete user.")
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
        <Typography variant="h4">{user.name}</Typography>
      </Box>
      <HeroImage entity={user} setEntity={setUser} />
      <Box sx={{ p: 2, backgroundColor: "#2e2e2e", borderRadius: 1, my: 2 }}>
        <RichTextRenderer
          key={user.description}
          html={user.description || ""}
          sx={{ mb: 2 }}
        />
      </Box>
      <RoleManagement user={user} onUserUpdate={handleUserUpdate} />
      <EditUserForm
        key={JSON.stringify(user)}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        user={user}
      />
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  )
}

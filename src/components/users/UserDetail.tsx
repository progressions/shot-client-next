"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardMedia,
  Box,
  Alert,
  Typography,
} from "@mui/material"
import type { User } from "@/types"
import Link from "next/link"
import { useCampaign, useClient } from "@/contexts"
import DetailButtons from "@/components/DetailButtons"

interface UserDetailProperties {
  user: User
  onDelete: (userId: string) => void
  onEdit: (user: User) => void
}

export default function UserDetail({
  user: initialUser,
  onDelete,
  onEdit,
}: UserDetailProperties) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User>(initialUser)

  useEffect(() => {
    if (campaignData?.user && campaignData.user.id === initialUser.id) {
      setUser(campaignData.user)
    }
  }, [campaignData, initialUser])

  const handleDelete = async () => {
    if (!user?.id) return
    if (!confirm(`Are you sure you want to delete the user: ${user.name}?`))
      return

    try {
      await client.deleteUser(user)
      onDelete(user.id)
      setError(null)
    } catch (error_) {
      setError(
        error_ instanceof Error ? error_.message : "Failed to delete user"
      )
      console.error("Delete user error:", error_)
    }
  }

  const handleEdit = () => {
    onEdit(user)
  }

  // Format created_at timestamp for display
  const formattedCreatedAt = user.created_at
    ? new Date(user.created_at).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
    : "Unknown"

  return (
    <Card sx={{ mb: 2, bgcolor: "#424242" }}>
      {user.image_url && (
        <CardMedia
          component="img"
          height="140"
          image={user.image_url}
          alt={user.name}
          sx={{ objectFit: "cover" }}
        />
      )}
      <CardContent sx={{ p: "1rem" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ color: "#ffffff" }}>
            <Link href={`/users/${user.id}`} style={{ color: "#fff" }}>
              {user.name}
            </Link>
          </Typography>
          <DetailButtons
            name="User"
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Box>
        <Typography variant="body2" sx={{ mt: 1, color: "#ffffff" }}>
          Created: {formattedCreatedAt}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

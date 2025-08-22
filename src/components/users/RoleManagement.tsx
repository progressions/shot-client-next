"use client"

import { useState } from "react"
import {
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
  CircularProgress,
  Paper,
  Divider,
} from "@mui/material"
import type { User } from "@/types"
import { useClient, useToast } from "@/contexts"

interface RoleManagementProps {
  user: User
  onUserUpdate: (updatedUser: User) => void
}

export default function RoleManagement({
  user,
  onUserUpdate,
}: RoleManagementProps) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const [updating, setUpdating] = useState<string | null>(null)

  const handleRoleToggle = async (
    role: "admin" | "gamemaster",
    checked: boolean
  ) => {
    setUpdating(role)

    try {
      // Create FormData for the update
      const formData = new FormData()
      formData.append("user", JSON.stringify({ [role]: checked }))

      const updatedResponse = await client.updateUser(user.id, formData)
      const updatedUser = updatedResponse.data

      onUserUpdate(updatedUser)
      toastSuccess(
        `${role === "admin" ? "Admin" : "Gamemaster"} status ${checked ? "granted" : "revoked"} successfully`
      )
    } catch (error_) {
      console.error(`Failed to update ${role} status:`, error_)
      toastError(
        `Failed to update ${role === "admin" ? "Admin" : "Gamemaster"} status. Please try again.`
      )
    } finally {
      setUpdating(null)
    }
  }

  const handleAdminToggle = (checked: boolean) => {
    handleRoleToggle("admin", checked)
  }

  const handleGamemasterToggle = (checked: boolean) => {
    handleRoleToggle("gamemaster", checked)
  }

  return (
    <Paper sx={{ p: 3, my: 2 }}>
      <Typography variant="h6" gutterBottom>
        User Roles & Permissions
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <FormControlLabel
          control={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox
                checked={user.admin || false}
                onChange={e => handleAdminToggle(e.target.checked)}
                disabled={updating === "admin"}
                color="primary"
              />
              {updating === "admin" && <CircularProgress size={16} />}
            </Box>
          }
          label={
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Admin
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Full administrative access to all features and user management
              </Typography>
            </Box>
          }
        />

        <FormControlLabel
          control={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox
                checked={user.gamemaster || false}
                onChange={e => handleGamemasterToggle(e.target.checked)}
                disabled={updating === "gamemaster"}
                color="secondary"
              />
              {updating === "gamemaster" && <CircularProgress size={16} />}
            </Box>
          }
          label={
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Gamemaster
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Can create and manage campaigns, characters, and game sessions
              </Typography>
            </Box>
          }
        />
      </Box>

      {/* Current Status Display */}
      <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: "divider" }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Current Status:
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Typography
            variant="body2"
            sx={{
              px: 1.5,
              py: 0.5,
              bgcolor: user.admin ? "primary.main" : "grey.600",
              color: user.admin ? "primary.contrastText" : "grey.50",
              borderRadius: 1,
              fontWeight: 500,
            }}
          >
            {user.admin ? "Admin" : "Not Admin"}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              px: 1.5,
              py: 0.5,
              bgcolor: user.gamemaster ? "secondary.main" : "grey.600",
              color: user.gamemaster ? "secondary.contrastText" : "grey.50",
              borderRadius: 1,
              fontWeight: 500,
            }}
          >
            {user.gamemaster ? "Gamemaster" : "Not Gamemaster"}
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

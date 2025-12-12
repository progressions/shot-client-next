"use client"

import { redirect } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import { Alert, Box, Stack } from "@mui/material"
import type { User } from "@/types"
import { useCampaign } from "@/contexts"
import { EditUserForm } from "@/components/users"
import RoleManagement from "@/components/users/RoleManagement"
import { useClient, useToast, useConfirm } from "@/contexts"
import {
  HeroImage,
  SpeedDialMenu,
  TextField,
  EmailChangeConfirmation,
} from "@/components/ui"

interface ShowProperties {
  user: User
  initialIsMobile?: boolean
}

export default function Show({
  user: initialUser,
  initialIsMobile: _initialIsMobile,
}: ShowProperties) {
  const { campaignData } = useCampaign()
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const { confirm } = useConfirm()

  const [user, setUser] = useState<User>(initialUser)
  const [editOpen, setEditOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  // Email change confirmation state
  const [originalEmail] = useState(initialUser.email)
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)
  const [pendingEmailChange, setPendingEmailChange] = useState<{
    fieldName: string
    newValue: string
  } | null>(null)

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

  // Update user field following the same pattern as RoleManagement
  const updateUserField = useCallback(
    async (fieldName: string, fieldValue: string) => {
      setUpdating(fieldName)

      try {
        // Create FormData for the update
        const formData = new FormData()
        formData.append("user", JSON.stringify({ [fieldName]: fieldValue }))

        const updatedResponse = await client.updateUser(user.id, formData)
        const updatedUser = updatedResponse.data

        setUser(updatedUser)

        // Format field name for display
        const displayName = fieldName.replace("_", " ")
        const capitalizedName =
          displayName.charAt(0).toUpperCase() + displayName.slice(1)
        toastSuccess(`${capitalizedName} updated successfully`)
      } catch (error_) {
        console.error(`Failed to update ${fieldName}:`, error_)
        const displayName = fieldName.replace("_", " ")
        const capitalizedName =
          displayName.charAt(0).toUpperCase() + displayName.slice(1)
        toastError(`Failed to update ${capitalizedName}. Please try again.`)
      } finally {
        setUpdating(null)
      }
    },
    [client, user.id, toastSuccess, toastError]
  )

  // Email change detection helper
  const detectEmailChange = useCallback(
    (current: string, new_email: string): boolean => {
      return current.toLowerCase().trim() !== new_email.toLowerCase().trim()
    },
    []
  )

  const handleFieldChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target

      // Update local state immediately for responsive UI
      setUser(prev => ({ ...prev, [name]: value }))
    },
    []
  )

  const handleFieldBlur = useCallback(
    async (event: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = event.target

      // For email changes, check if confirmation is needed
      if (name === "email" && detectEmailChange(originalEmail, value)) {
        setPendingEmailChange({ fieldName: name, newValue: value })
        setShowEmailConfirmation(true)
        return
      }

      // For all other changes, update immediately
      await updateUserField(name, value)
    },
    [originalEmail, detectEmailChange, updateUserField]
  )

  // Email change confirmation handlers
  const handleEmailChangeConfirm = useCallback(async () => {
    if (!pendingEmailChange) return

    setShowEmailConfirmation(false)
    await updateUserField(
      pendingEmailChange.fieldName,
      pendingEmailChange.newValue
    )
    setPendingEmailChange(null)
  }, [pendingEmailChange, updateUserField])

  const handleEmailChangeCancel = useCallback(() => {
    setShowEmailConfirmation(false)
    setPendingEmailChange(null)
    // Revert email field to original value
    setUser(prev => ({ ...prev, email: originalEmail }))
  }, [originalEmail])

  const handleDelete = async () => {
    if (!user?.id) return
    const confirmed = await confirm({
      title: "Delete User",
      message: `Are you sure you want to delete the user: ${user.name}?`,
      confirmText: "Delete",
      destructive: true,
    })
    if (!confirmed) return

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
      <HeroImage entity={user} setEntity={setUser} />
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="First Name"
            name="first_name"
            value={user.first_name || ""}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            disabled={updating === "first_name"}
            variant="outlined"
            fullWidth
          />

          <TextField
            label="Last Name"
            name="last_name"
            value={user.last_name || ""}
            onChange={handleFieldChange}
            onBlur={handleFieldBlur}
            disabled={updating === "last_name"}
            variant="outlined"
            fullWidth
          />
        </Stack>

        <TextField
          label="Email"
          name="email"
          type="email"
          value={user.email || ""}
          onChange={handleFieldChange}
          onBlur={handleFieldBlur}
          disabled={updating === "email"}
          variant="outlined"
          fullWidth
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

      <EmailChangeConfirmation
        open={showEmailConfirmation}
        currentEmail={originalEmail}
        newEmail={pendingEmailChange?.newValue || ""}
        onConfirm={handleEmailChangeConfirm}
        onCancel={handleEmailChangeCancel}
      />
    </Box>
  )
}

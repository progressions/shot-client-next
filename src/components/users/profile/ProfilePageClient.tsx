"use client"

import { useCallback, useEffect } from "react"
import { FormControl, FormHelperText, Stack, Box, TextField, Typography } from "@mui/material"
import type { User } from "@/types"
import {
  Icon,
  Alert,
  SectionHeader,
  HeroImage,
} from "@/components/ui"
import { CampaignsList } from "@/components/users/profile"
import { useClient, useToast } from "@/contexts"
import { FormActions, useForm } from "@/reducers"

interface ProfilePageClientProps {
  user: User
}

type FormStateData = {
  entity: User & {
    image?: File | null
  }
}

export default function ProfilePageClient({ user: initialUser }: ProfilePageClientProps) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const { formState, dispatchForm } = useForm<FormStateData>({
    entity: initialUser,
  })
  const { status, errors } = formState
  const user = formState.data.entity

  const setUser = useCallback(
    (user: User) => {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "entity",
        value: user,
      })
    },
    [dispatchForm]
  )

  const handleFieldChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    
    // Update the local state immediately
    dispatchForm({
      type: FormActions.UPDATE,
      name: "entity",
      value: { ...user, [name]: value },
    })

    // Create form data for the API call
    const formData = new FormData()
    const userData = { ...user, [name]: value }
    
    // Only send the updated fields we care about
    formData.set("user", JSON.stringify({
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email
    }))

    try {
      const response = await client.updateUser(user.id, formData)
      // Update with the response data to ensure sync
      dispatchForm({
        type: FormActions.UPDATE,
        name: "entity",
        value: response.data,
      })
      dispatchForm({ type: FormActions.SUCCESS })
      toastSuccess("Profile updated successfully")
    } catch (error: unknown) {
      console.error("Failed to update profile:", error)
      const errorResponse = error as { response?: { data?: { errors?: Record<string, string[]> } } }
      dispatchForm({
        type: FormActions.ERROR,
        payload: errorResponse.response?.data?.errors ? 
          Object.values(errorResponse.response.data.errors).flat().join(", ") :
          "Failed to update profile"
      })
      toastError("Failed to update profile")
      
      // Revert the local change on error
      dispatchForm({
        type: FormActions.UPDATE,
        name: "entity", 
        value: initialUser,
      })
    }
  }, [user, client, dispatchForm, toastSuccess, toastError, initialUser])

  useEffect(() => {
    document.title = user.name ? `${user.name} - Profile - Chi War` : "Profile - Chi War"
  }, [user.name])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <HeroImage entity={user} setEntity={setUser} />
      <Alert status={status} />
      
      <Box sx={{ mb: 4 }}>
        <SectionHeader
          title="Personal Information"
          icon={<Icon keyword="User" />}
          sx={{ mb: 2 }}
        >
          Your personal profile information and account details.
        </SectionHeader>
        
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <FormControl fullWidth error={!!errors.first_name}>
            <TextField
              label="First Name"
              name="first_name"
              value={user.first_name || ""}
              onChange={handleFieldChange}
              variant="outlined"
            />
            {errors.first_name && <FormHelperText>{errors.first_name}</FormHelperText>}
          </FormControl>
          
          <FormControl fullWidth error={!!errors.last_name}>
            <TextField
              label="Last Name"
              name="last_name"
              value={user.last_name || ""}
              onChange={handleFieldChange}
              variant="outlined"
            />
            {errors.last_name && <FormHelperText>{errors.last_name}</FormHelperText>}
          </FormControl>
        </Stack>
        
        <FormControl fullWidth error={!!errors.email}>
          <TextField
            label="Email"
            name="email"
            type="email"
            value={user.email || ""}
            onChange={handleFieldChange}
            variant="outlined"
          />
          {errors.email && <FormHelperText>{errors.email}</FormHelperText>}
        </FormControl>
      </Box>

      <Box sx={{ mb: 4 }}>
        <SectionHeader
          title="Account Information"
          icon={<Icon keyword="Settings" />}
          sx={{ mb: 2 }}
        >
          Your account status and role information.
        </SectionHeader>
        
        <Stack direction="column" spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Account Type
            </Typography>
            <Typography variant="body1">
              {user.admin ? "Admin" : user.gamemaster ? "Gamemaster" : "Player"}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">
              Member Since
            </Typography>
            <Typography variant="body1">
              {new Date(user.created_at).toLocaleDateString()}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <CampaignsList
        user={user}
        onUserUpdate={setUser}
      />
    </Box>
  )
}
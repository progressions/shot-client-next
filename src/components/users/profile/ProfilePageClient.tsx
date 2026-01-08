"use client"

import { useCallback, useEffect, useState } from "react"
import {
  FormControl,
  FormHelperText,
  Stack,
  Box,
  TextField,
  Typography,
} from "@mui/material"
import SmartToyIcon from "@mui/icons-material/SmartToy"
import type { User } from "@/types"
import {
  Icon,
  Alert,
  SectionHeader,
  HeroImage,
  EmailChangeConfirmation,
} from "@/components/ui"
import {
  CampaignsList,
  CharacterManager,
  DiscordLinkingSection,
  OnboardingMilestonesForm,
} from "@/components/users/profile"
import {
  PasskeyManager,
  PasswordChangeForm,
  AiProviderSettings,
  CliSessionsDisplay,
} from "@/components/settings"
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

export default function ProfilePageClient({
  user: initialUser,
}: ProfilePageClientProps) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const { formState, dispatchForm } = useForm<FormStateData>({
    entity: initialUser,
  })
  const { status, errors } = formState
  const user = formState.data.entity

  // Email change confirmation state
  const [originalEmail] = useState(initialUser.email)
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)
  const [pendingEmailChange, setPendingEmailChange] = useState<{
    event: React.ChangeEvent<HTMLInputElement>
    newEmail: string
  } | null>(null)

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

  // Email change detection helper
  const detectEmailChange = useCallback(
    (current: string, new_email: string): boolean => {
      return current.toLowerCase().trim() !== new_email.toLowerCase().trim()
    },
    []
  )

  const processFieldChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      formData.set(
        "user",
        JSON.stringify({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
        })
      )

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
        const errorResponse = error as {
          response?: { data?: { errors?: Record<string, string[]> } }
        }
        dispatchForm({
          type: FormActions.ERROR,
          payload: errorResponse.response?.data?.errors
            ? Object.values(errorResponse.response.data.errors)
                .flat()
                .join(", ")
            : "Failed to update profile",
        })
        toastError("Failed to update profile")

        // Revert the local change on error
        dispatchForm({
          type: FormActions.UPDATE,
          name: "entity",
          value: initialUser,
        })
      }
    },
    [user, client, dispatchForm, toastSuccess, toastError, initialUser]
  )

  const handleFieldChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name } = event.target

      // For email changes, only update UI immediately - don&apos;t process yet
      if (name === "email") {
        dispatchForm({
          type: FormActions.UPDATE,
          name: "entity",
          value: { ...user, [name]: event.target.value },
        })
        return
      }

      // For non-email changes, proceed normally
      await processFieldChange(event)
    },
    [processFieldChange, dispatchForm, user]
  )

  const handleEmailBlur = useCallback(
    async (event: React.FocusEvent<HTMLInputElement>) => {
      const { value } = event.target

      // Check if this is an email change that requires confirmation
      if (detectEmailChange(originalEmail, value)) {
        // Store the pending change and show confirmation dialog
        setPendingEmailChange({
          event: {
            target: { name: "email", value },
          } as React.ChangeEvent<HTMLInputElement>,
          newEmail: value,
        })
        setShowEmailConfirmation(true)
        return
      }

      // If no significant change, process the field update normally
      const syntheticEvent = {
        target: { name: "email", value },
      } as React.ChangeEvent<HTMLInputElement>

      await processFieldChange(syntheticEvent)
    },
    [originalEmail, detectEmailChange, processFieldChange]
  )

  // Email change confirmation handlers
  const handleEmailChangeConfirm = useCallback(async () => {
    if (!pendingEmailChange) return

    setShowEmailConfirmation(false)

    // Create a new event object with the current email value from form state
    const syntheticEvent = {
      target: {
        name: "email",
        value: pendingEmailChange.newEmail,
      },
    } as React.ChangeEvent<HTMLInputElement>

    await processFieldChange(syntheticEvent)
    setPendingEmailChange(null)
  }, [pendingEmailChange, processFieldChange])

  const handleEmailChangeCancel = useCallback(() => {
    setShowEmailConfirmation(false)
    setPendingEmailChange(null)
    // Revert email field to original value
    dispatchForm({
      type: FormActions.UPDATE,
      name: "entity",
      value: { ...user, email: originalEmail },
    })
  }, [dispatchForm, user, originalEmail])

  useEffect(() => {
    document.title = user.name
      ? `${user.name} - Profile - Chi War`
      : "Profile - Chi War"
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
            {errors.first_name && (
              <FormHelperText>{errors.first_name}</FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth error={!!errors.last_name}>
            <TextField
              label="Last Name"
              name="last_name"
              value={user.last_name || ""}
              onChange={handleFieldChange}
              variant="outlined"
            />
            {errors.last_name && (
              <FormHelperText>{errors.last_name}</FormHelperText>
            )}
          </FormControl>
        </Stack>

        <FormControl fullWidth error={!!errors.email}>
          <TextField
            label="Email"
            name="email"
            type="email"
            value={user.email || ""}
            onChange={handleFieldChange}
            onBlur={handleEmailBlur}
            variant="outlined"
          />
          {errors.email && <FormHelperText>{errors.email}</FormHelperText>}
        </FormControl>
      </Box>

      <Box sx={{ mb: 4 }}>
        <SectionHeader
          title="Account Information"
          icon={<Icon keyword="Account" />}
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

      <OnboardingMilestonesForm />

      <Box sx={{ mb: 4 }}>
        <SectionHeader
          title="Security"
          icon={<Icon keyword="Security" />}
          sx={{ mb: 2 }}
        >
          Manage your authentication methods and security settings.
        </SectionHeader>
        <Stack spacing={2}>
          <PasswordChangeForm />
          <PasskeyManager />
          <CliSessionsDisplay />
        </Stack>
      </Box>

      {user.gamemaster && (
        <Box sx={{ mb: 4 }}>
          <SectionHeader
            title="AI Providers"
            icon={<SmartToyIcon color="primary" />}
            sx={{ mb: 2 }}
          >
            Connect your AI service accounts for character and image generation.
          </SectionHeader>
          <AiProviderSettings />
        </Box>
      )}

      <DiscordLinkingSection user={user} onUserUpdate={setUser} />

      <CampaignsList user={user} onUserUpdate={setUser} />

      <CharacterManager user={user} onUserUpdate={setUser} />

      <EmailChangeConfirmation
        open={showEmailConfirmation}
        currentEmail={originalEmail}
        newEmail={pendingEmailChange?.newEmail || ""}
        onConfirm={handleEmailChangeConfirm}
        onCancel={handleEmailChangeCancel}
      />
    </Box>
  )
}

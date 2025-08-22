"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Container,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material"
import { useClient, useToast } from "@/contexts"
import { Invitation, HttpError } from "@/types"
import { InvitationRegistrationForm } from "@/components/invitations"

export default function InvitationRegisterPage() {
  const params = useParams()
  const router = useRouter()
  const { client } = useClient()
  const { addToast } = useToast()
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const invitationId = params.id as string

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await client.getInvitation(invitationId)
        const invitation = response.data

        // Check if user already has an account
        if (invitation.pending_user) {
          addToast({
            severity: "info",
            message:
              "You already have an account. Please log in to accept this invitation.",
          })
          router.push(`/login?redirect=/redeem/${invitationId}`)
          return
        }

        setInvitation(invitation)
      } catch (error) {
        const httpError = error as HttpError
        console.error("Error fetching invitation:", httpError)
        if (httpError.response?.status === 404) {
          setError("This invitation was not found or may have expired.")
        } else {
          setError("Unable to load invitation details.")
        }
      } finally {
        setLoading(false)
      }
    }

    if (invitationId) {
      fetchInvitation()
    }
  }, [invitationId, client, router, addToast])

  const handleRegistrationSuccess = (message: string) => {
    setSuccessMessage(message)
  }

  const handleRegistrationError = (error: string) => {
    setError(error)
  }

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            mt: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading invitation...</Typography>
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            mt: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Alert severity="error" sx={{ mb: 3, width: "100%" }}>
            {error}
          </Alert>
        </Box>
      </Container>
    )
  }

  if (!invitation) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            mt: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Alert severity="error" sx={{ mb: 3, width: "100%" }}>
            Invitation not found.
          </Alert>
        </Box>
      </Container>
    )
  }

  // Show success message after registration
  if (successMessage) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            mt: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ textAlign: "center" }}
          >
            Account Created!
          </Typography>

          <Paper sx={{ p: 4, width: "100%", mt: 3 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              {successMessage}
            </Alert>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body1">
                Check your email and click the confirmation link to complete
                your registration and join the campaign.
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ textAlign: "center" }}
        >
          Create Your Account
        </Typography>

        <Typography variant="body1" sx={{ mb: 3, textAlign: "center" }}>
          Register to join <strong>{invitation.campaign?.name}</strong>
        </Typography>

        <InvitationRegistrationForm
          invitation={invitation}
          onSuccess={handleRegistrationSuccess}
          onError={handleRegistrationError}
        />
      </Box>
    </Container>
  )
}

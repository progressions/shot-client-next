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
  Stack
} from "@mui/material"
import { Button } from "@/components/ui"
import { useClient, useToast } from "@/contexts"
import { ApiV2 } from "@/lib"
import { Invitation, Campaign } from "@/types"

export default function RedeemInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser, jwt } = useClient()
  const { addToast } = useToast()
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const invitationId = params.id as string
  const apiV2 = new ApiV2()

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await fetch(apiV2.invitations({ id: invitationId }))
        if (!response.ok) {
          if (response.status === 404) {
            setError("This invitation was not found or may have expired.")
          } else {
            setError("Unable to load invitation details.")
          }
          return
        }
        const data = await response.json()
        setInvitation(data)
      } catch (error) {
        console.error("Error fetching invitation:", error)
        setError("Unable to load invitation details.")
      } finally {
        setLoading(false)
      }
    }

    if (invitationId) {
      fetchInvitation()
    }
  }, [invitationId])

  const handleRedeem = async () => {
    if (!currentUser?.id) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/redeem/${invitationId}`)
      return
    }

    if (!invitation) return

    setRedeeming(true)
    setError(null)

    try {
      const response = await fetch(apiV2.invitationRedeem(invitation), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 409) {
          setError("You are already a member of this campaign.")
        } else if (response.status === 404) {
          setError("This invitation is no longer valid.")
        } else {
          setError(errorData.error || "Failed to join campaign.")
        }
        return
      }

      const data = await response.json()
      addToast({
        severity: "success",
        message: data.message || `Successfully joined ${invitation.campaign?.name}!`,
      })

      // Redirect to campaign page or homepage
      if (data.campaign?.id) {
        router.push(`/campaigns/${data.campaign.id}`)
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Error redeeming invitation:", error)
      setError("An unexpected error occurred.")
    } finally {
      setRedeeming(false)
    }
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
          <Typography sx={{ mt: 2, color: "#ffffff" }}>
            Loading invitation...
          </Typography>
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
          <Button onClick={() => router.push("/")} variant="outlined">
            Go to Homepage
          </Button>
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
          <Button onClick={() => router.push("/")} variant="outlined">
            Go to Homepage
          </Button>
        </Box>
      </Container>
    )
  }

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
          sx={{ color: "#ffffff", textAlign: "center" }}
        >
          Campaign Invitation
        </Typography>

        <Paper sx={{ p: 4, width: "100%", mt: 3 }}>
          <Stack spacing={3}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" gutterBottom>
                {invitation.campaign?.name}
              </Typography>
              {invitation.campaign?.description && (
                <Typography variant="body1" color="text.secondary">
                  {invitation.campaign.description}
                </Typography>
              )}
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body1">
                You&apos;ve been invited by{" "}
                <strong>
                  {invitation.gamemaster?.first_name} {invitation.gamemaster?.last_name}
                </strong>{" "}
                to join this Chi War campaign.
              </Typography>
            </Box>

            {!currentUser?.id && (
              <Alert severity="info">
                You need to log in to accept this invitation.
              </Alert>
            )}

            <Box sx={{ textAlign: "center" }}>
              <Button
                onClick={handleRedeem}
                disabled={redeeming}
                size="large"
                sx={{ minWidth: 200 }}
              >
                {redeeming ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    {currentUser?.id ? "Joining..." : "Redirecting..."}
                  </>
                ) : currentUser?.id ? (
                  "Accept Invitation"
                ) : (
                  "Login to Accept"
                )}
              </Button>
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Button 
                onClick={() => router.push("/")} 
                variant="outlined"
                size="small"
              >
                Not interested? Go to homepage
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Container>
  )
}
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
  Stack,
} from "@mui/material"
import { Button } from "@/components/ui"
import { useClient, useToast } from "@/contexts"
import { ApiV2 } from "@/lib"
import { Invitation, HttpError } from "@/types"

enum UserState {
  NEW_USER = "NEW_USER",
  EXISTING_USER_NOT_LOGGED_IN = "EXISTING_USER_NOT_LOGGED_IN",
  LOGGED_IN_CORRECT_USER = "LOGGED_IN_CORRECT_USER",
  LOGGED_IN_WRONG_USER = "LOGGED_IN_WRONG_USER",
  LOGGED_IN_ALREADY_MEMBER = "LOGGED_IN_ALREADY_MEMBER",
}

export default function RedeemInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser, jwt, client, loading: userLoading } = useClient()
  const { addToast } = useToast()
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userState, setUserState] = useState<UserState | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const invitationId = params.id as string
  const apiV2 = new ApiV2()

  const determineUserState = (invitation: Invitation): UserState => {
    console.log("🔍 determineUserState called with:", {
      currentUser,
      currentUserEmail: currentUser?.email,
      invitationEmail: invitation.email,
      userLoading,
      hasCurrentUser: !!currentUser,
      currentUserId: currentUser?.id,
      isDefaultUser: currentUser?.id === "" || !currentUser?.id,
    })

    // Check if this is actually a default/empty user object
    if (!currentUser || !currentUser.id || currentUser.id === "") {
      // Check if there&apos;s a pending_user field to determine if account exists
      if (invitation.pending_user) {
        return UserState.EXISTING_USER_NOT_LOGGED_IN
      } else {
        return UserState.NEW_USER
      }
    }

    // User is logged in (with actual user data, not default)
    if (currentUser.email !== invitation.email) {
      return UserState.LOGGED_IN_WRONG_USER
    }

    // Check if user is already a member of the campaign
    if (invitation.campaign?.users?.some(user => user.id === currentUser.id)) {
      return UserState.LOGGED_IN_ALREADY_MEMBER
    }

    return UserState.LOGGED_IN_CORRECT_USER
  }

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        // Use client method for invitation show endpoint (public endpoint)
        const response = await client.getInvitation(invitationId)
        const invitation = response.data
        setInvitation(invitation)

        // Only determine user state if user context has finished loading
        if (!userLoading) {
          setUserState(determineUserState(invitation))
        }
      } catch (error) {
        const httpError = error as HttpError
        console.error("Error fetching invitation:", httpError)
        if (httpError.response?.status === 404) {
          setError("This invitation was not found or may have expired.")
        } else {
          setError("Unable to load invitation details.")
        }
      } finally {
        // Only stop loading if user context is also ready
        if (!userLoading) {
          setLoading(false)
        }
      }
    }

    if (invitationId) {
      fetchInvitation()
    }
  }, [invitationId, currentUser, userLoading])

  // Update user state when user context finishes loading
  useEffect(() => {
    if (invitation && !userLoading && !userState) {
      setUserState(determineUserState(invitation))
      setLoading(false)
    }
  }, [invitation, userLoading, userState])

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
      const response = await client.redeemInvitation(invitation, currentUser)

      addToast({
        severity: "success",
        message:
          response.data.message ||
          `Successfully joined ${invitation.campaign?.name}!`,
      })

      // Redirect to campaign page or homepage
      if (response.data.campaign?.id) {
        router.push(`/campaigns/${response.data.campaign.id}`)
      } else {
        router.push("/")
      }
    } catch (error) {
      const httpError = error as HttpError
      console.error("Error redeeming invitation:", httpError)
      if (httpError.response?.status === 409) {
        setError("You are already a member of this campaign.")
      } else if (httpError.response?.status === 404) {
        setError("This invitation is no longer valid.")
      } else if (httpError.response?.status === 403) {
        setError(
          httpError.response.data.error ||
            "This invitation is not for your email address."
        )
      } else {
        setError(httpError.response?.data?.error || "Failed to join campaign.")
      }
    } finally {
      setRedeeming(false)
    }
  }

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
            sx={{ color: "#ffffff", textAlign: "center" }}
          >
            Account Created!
          </Typography>

          <Paper sx={{ p: 4, width: "100%", mt: 3 }}>
            <Stack spacing={3}>
              <Alert severity="success">{successMessage}</Alert>

              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body1">
                  Check your email and click the confirmation link to complete
                  your registration and join the campaign.
                </Typography>
              </Box>

              <Box sx={{ textAlign: "center" }}>
                <Button onClick={() => router.push("/")} variant="outlined">
                  Go to Homepage
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Container>
    )
  }

  const renderContent = () => {
    if (!userState) return null

    switch (userState) {
      case UserState.NEW_USER:
        return (
          <Paper sx={{ p: 4, width: "100%" }}>
            <Stack spacing={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h5" gutterBottom>
                  Welcome!
                </Typography>
                <Typography variant="body1">
                  You&apos;ll need to create an account to accept this
                  invitation to join {invitation.campaign?.name}.
                </Typography>
              </Box>

              <Box sx={{ textAlign: "center" }}>
                <Button
                  onClick={() =>
                    router.push(`/invitations/register/${invitationId}`)
                  }
                  size="large"
                  sx={{ minWidth: 200 }}
                >
                  Create Account
                </Button>
              </Box>
            </Stack>
          </Paper>
        )

      case UserState.EXISTING_USER_NOT_LOGGED_IN:
        return (
          <Paper sx={{ p: 4, width: "100%" }}>
            <Stack spacing={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h5" gutterBottom>
                  Welcome back!
                </Typography>
                <Typography variant="body1">
                  You have an existing account. Please log in to accept this
                  invitation.
                </Typography>
              </Box>

              <Box sx={{ textAlign: "center" }}>
                <Button
                  onClick={() =>
                    router.push(`/login?redirect=/redeem/${invitationId}`)
                  }
                  size="large"
                  sx={{ minWidth: 200 }}
                >
                  Login to Accept
                </Button>
              </Box>
            </Stack>
          </Paper>
        )

      case UserState.LOGGED_IN_CORRECT_USER:
        return (
          <Paper sx={{ p: 4, width: "100%" }}>
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
                    {invitation.gamemaster?.first_name}{" "}
                    {invitation.gamemaster?.last_name}
                  </strong>{" "}
                  to join this Chi War campaign.
                </Typography>
              </Box>

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
                      Joining...
                    </>
                  ) : (
                    "Accept Invitation"
                  )}
                </Button>
              </Box>
            </Stack>
          </Paper>
        )

      case UserState.LOGGED_IN_WRONG_USER:
        return (
          <Paper sx={{ p: 4, width: "100%" }}>
            <Stack spacing={3}>
              <Alert severity="warning">
                This invitation is for <strong>{invitation.email}</strong>, but
                you&apos;re logged in as <strong>{currentUser?.email}</strong>.
              </Alert>

              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body1" gutterBottom>
                  Please choose an option:
                </Typography>
              </Box>

              <Stack spacing={2}>
                {invitation.pending_user ? (
                  <Button
                    onClick={() =>
                      router.push(`/login?redirect=/redeem/${invitationId}`)
                    }
                    size="large"
                    variant="outlined"
                  >
                    Login as {invitation.email}
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      // Manual logout: clear localStorage and cookies, then redirect back
                      localStorage.removeItem("jwtToken")
                      localStorage.removeItem("user")
                      localStorage.removeItem("currentCampaign")

                      // Clear cookies
                      document.cookie =
                        "jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

                      // Redirect back to this same redeem page (not reload)
                      window.location.href = `/redeem/${invitationId}`
                    }}
                    size="large"
                    variant="outlined"
                  >
                    Create account for {invitation.email}
                  </Button>
                )}

                <Button
                  onClick={() => router.push("/")}
                  size="large"
                  variant="text"
                >
                  Continue as {currentUser?.email || "current user"}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        )

      case UserState.LOGGED_IN_ALREADY_MEMBER:
        return (
          <Paper sx={{ p: 4, width: "100%" }}>
            <Stack spacing={3}>
              <Alert severity="info">
                You&apos;re already a member of{" "}
                <strong>{invitation.campaign?.name}</strong>!
              </Alert>

              <Box sx={{ textAlign: "center" }}>
                <Button
                  onClick={() =>
                    router.push(`/campaigns/${invitation.campaign?.id}`)
                  }
                  size="large"
                  sx={{ minWidth: 200 }}
                >
                  Go to Campaign
                </Button>
              </Box>
            </Stack>
          </Paper>
        )

      default:
        return (
          <Alert severity="error">
            Unknown user state. Please refresh the page.
          </Alert>
        )
    }
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

        {renderContent()}

        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Button
            onClick={() => router.push("/")}
            variant="outlined"
            size="small"
          >
            Not interested? Go to homepage
          </Button>
        </Box>
      </Box>
    </Container>
  )
}

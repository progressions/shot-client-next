"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Box,
  Container,
  Typography,
  Link as MuiLink,
  Alert,
} from "@mui/material"
import Link from "next/link"
import { RegistrationForm } from "@/components/auth"

export default function RegisterPage() {
  const router = useRouter()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleRegistrationSuccess = () => {
    setSuccessMessage(
      "Registration successful! Please check your email to confirm your account, then you can sign in."
    )
    // Redirect to login after a short delay to show the success message
    setTimeout(() => {
      router.push("/login")
    }, 3000)
  }

  const handleRegistrationError = (error: string) => {
    // Error is handled within the RegistrationForm component
    console.error("Registration error:", error)
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
          sx={{ color: "#ffffff" }}
        >
          Create Account
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mb: 3, color: "#cccccc" }}
        >
          Join Chi War to manage your Feng Shui 2 campaigns
        </Typography>

        {successMessage ? (
          <Alert severity="success" sx={{ mt: 2, width: "100%" }}>
            <Typography variant="body2">{successMessage}</Typography>
          </Alert>
        ) : (
          <>
            <Box sx={{ width: "100%" }}>
              <RegistrationForm
                onSuccess={handleRegistrationSuccess}
                onError={handleRegistrationError}
              />
            </Box>

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: "#cccccc" }}>
                Already have an account?{" "}
                <Link href="/login" passHref>
                  <MuiLink
                    component="span"
                    color="primary"
                    sx={{
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    Sign in
                  </MuiLink>
                </Link>
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Container>
  )
}

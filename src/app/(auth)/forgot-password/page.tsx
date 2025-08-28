import { Box, Typography, Container } from "@mui/material"
import Link from "next/link"
import { ForgotPasswordClient } from "./ForgotPasswordClient"

export const metadata = {
  title: "Forgot Password - Chi War",
  description: "Reset your Chi War account password",
}

export default function ForgotPasswordPage() {
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
          Reset Your Password
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            textAlign: "center",
            mb: 3,
            maxWidth: 400,
          }}
        >
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </Typography>

        <ForgotPasswordClient />

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Remember your password?{" "}
            <Link
              href="/login"
              style={{
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <Typography
                component="span"
                sx={{
                  color: "primary.main",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Back to Login
              </Typography>
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}

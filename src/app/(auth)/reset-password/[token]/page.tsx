import { Box, Typography, Container, Link as MuiLink } from "@mui/material"
import Link from "next/link"
import { ResetPasswordClient } from "./ResetPasswordClient"

export const metadata = {
  title: "Reset Password - Chi War",
  description: "Create a new password for your Chi War account"
}

interface ResetPasswordPageProps {
  params: {
    token: string
  }
}

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = await params

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
          Create New Password
        </Typography>
        
        <Typography
          variant="body1"
          sx={{ 
            color: "text.secondary", 
            textAlign: "center", 
            mb: 3,
            maxWidth: 400 
          }}
        >
          Please enter your new password below. Make sure it&apos;s strong and secure.
        </Typography>

        <ResetPasswordClient token={token} />

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Need a new reset link?{" "}
            <Link href="/forgot-password" passHref>
              <MuiLink component="span" color="primary">
                Request Password Reset
              </MuiLink>
            </Link>
          </Typography>
        </Box>

        <Box sx={{ mt: 1, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Remember your password?{" "}
            <Link href="/login" passHref>
              <MuiLink component="span" color="primary">
                Back to Login
              </MuiLink>
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}
import { Typography, Container, Box, Link } from "@mui/material"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy - Chi War",
  description:
    "Read the privacy policy for Chi War, the Feng Shui 2 RPG campaign management system.",
  openGraph: {
    title: "Privacy Policy - Chi War",
    description:
      "Read the privacy policy for Chi War, the Feng Shui 2 RPG campaign management system.",
    type: "website",
  },
}

export default function PrivacyPolicyPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 720, mx: "auto" }}
        >
          This policy explains how Chi War collects, uses, and protects your
          information.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Last updated: January 14, 2026
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Information We Collect
        </Typography>
        <Typography paragraph>
          We collect information you provide directly, such as your email,
          profile details, campaign data, and content you create in Chi War.
        </Typography>
        <Typography paragraph>
          We also collect limited technical data such as device type, browser,
          IP address, and usage activity to help operate and secure the Service.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          How We Use Information
        </Typography>
        <Typography paragraph>
          We use your information to provide, maintain, and improve Chi War,
          support your account, and communicate service-related updates.
        </Typography>
        <Typography paragraph>
          We may use aggregated or de-identified data to understand usage
          patterns and improve the Service.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Sharing and Disclosure
        </Typography>
        <Typography paragraph>
          We do not sell your personal information. We may share data with
          trusted service providers who help us operate the Service, subject to
          confidentiality obligations.
        </Typography>
        <Typography paragraph>
          We may disclose information if required by law or to protect the
          rights and safety of Chi War and its users.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Third-Party Integrations
        </Typography>
        <Typography paragraph>
          Chi War integrates with services like Notion and Discord. When you
          connect those services, they may receive data you authorize for
          synchronization. Your use of those services is governed by their own
          privacy policies.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Data Retention
        </Typography>
        <Typography paragraph>
          We retain your information for as long as your account is active or as
          needed to provide the Service. You may request deletion of your
          account and associated data.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Security
        </Typography>
        <Typography paragraph>
          We implement reasonable security measures to protect your data.
          However, no system is completely secure, and we cannot guarantee
          absolute security.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Your Choices
        </Typography>
        <Typography paragraph>
          You can access and update your account information in Chi War. For
          data access or deletion requests, contact us at the email below.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Changes to This Policy
        </Typography>
        <Typography paragraph>
          We may update this policy from time to time. If we make material
          changes, we will post the updated policy here.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h4" component="h2" gutterBottom>
          Contact
        </Typography>
        <Typography paragraph>
          Privacy questions? Contact{" "}
          <Link href="mailto:admin@chiwar.com">admin@chiwar.com</Link>.
        </Typography>
      </Box>
    </Container>
  )
}

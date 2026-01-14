import { Typography, Container, Box, Link } from "@mui/material"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Use - Chi War",
  description:
    "Read the terms of use for Chi War, the Feng Shui 2 RPG campaign management system.",
  openGraph: {
    title: "Terms of Use - Chi War",
    description:
      "Read the terms of use for Chi War, the Feng Shui 2 RPG campaign management system.",
    type: "website",
  },
}

export default function TermsOfUsePage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Terms of Use
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 720, mx: "auto" }}
        >
          Please read these terms carefully before using Chi War.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Last updated: January 14, 2026
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Acceptance of Terms
        </Typography>
        <Typography paragraph>
          By accessing or using Chi War (the &quot;Service&quot;), you agree to
          these Terms of Use. If you do not agree to these terms, do not use the
          Service.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Eligibility and Accounts
        </Typography>
        <Typography paragraph>
          You must be at least 13 years old to use Chi War. If you are under 18,
          you must have permission from a parent or guardian. You are
          responsible for maintaining the confidentiality of your account and
          for all activity that occurs under your account.
        </Typography>
        <Typography paragraph>
          You agree to provide accurate information, keep your profile current,
          and notify us of any unauthorized use of your account.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Acceptable Use
        </Typography>
        <Typography paragraph>
          You agree not to misuse the Service, including attempting to disrupt
          or degrade its performance, access other users&apos; data without
          permission, or use the Service for unlawful, harmful, or abusive
          activities.
        </Typography>
        <Typography paragraph>
          We may suspend or terminate access for violations of these terms or
          behavior that harms the Service or its community.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Your Content
        </Typography>
        <Typography paragraph>
          You retain ownership of the content you create or upload to Chi War.
          By using the Service, you grant us a non-exclusive license to host,
          store, and display your content solely to operate and improve the
          Service.
        </Typography>
        <Typography paragraph>
          You are responsible for ensuring you have the rights to any content
          you submit and that it does not infringe on the rights of others.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Third-Party Services
        </Typography>
        <Typography paragraph>
          Chi War may integrate with third-party services such as Notion or
          Discord. Your use of those services is governed by their respective
          terms and policies. We are not responsible for third-party services or
          their availability.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Intellectual Property
        </Typography>
        <Typography paragraph>
          Chi War and its content, features, and functionality are owned by
          Isaac Priestley and are protected by intellectual property laws. You
          may not copy, modify, or distribute any part of the Service without
          permission, except as allowed by law.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Disclaimers
        </Typography>
        <Typography paragraph>
          The Service is provided on an &quot;as is&quot; and &quot;as
          available&quot; basis without warranties of any kind. We do not
          guarantee that the Service will be uninterrupted, secure, or
          error-free.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Limitation of Liability
        </Typography>
        <Typography paragraph>
          To the fullest extent permitted by law, we are not liable for any
          indirect, incidental, special, or consequential damages arising from
          your use of the Service.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Changes to These Terms
        </Typography>
        <Typography paragraph>
          We may update these terms from time to time. If we make material
          changes, we will post the updated terms here. Continued use of the
          Service after changes constitutes acceptance of the revised terms.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h4" component="h2" gutterBottom>
          Contact
        </Typography>
        <Typography paragraph>
          Questions about these terms? Contact{" "}
          <Link href="mailto:admin@chiwar.com">admin@chiwar.com</Link>.
        </Typography>
      </Box>
    </Container>
  )
}

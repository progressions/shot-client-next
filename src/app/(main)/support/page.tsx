import { Typography, Container, Box, Card, CardContent, Grid, Link, Alert, Button } from "@mui/material"
import EmailIcon from "@mui/icons-material/Email"
import GitHubIcon from "@mui/icons-material/GitHub"
import BugReportIcon from "@mui/icons-material/BugReport"
import LightbulbIcon from "@mui/icons-material/Lightbulb"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Support - Chi War",
  description: "Get help, report bugs, and request features for Chi War, the Feng Shui 2 RPG campaign management system.",
  openGraph: {
    title: "Support - Chi War",
    description: "Get help, report bugs, and request features for Chi War, the Feng Shui 2 RPG campaign management system.",
    type: "website",
  },
}

export default function SupportPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Support
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: "auto" }}>
          Get help, report issues, and help improve Chi War
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography>
          Need immediate help? Check our{" "}
          <Link href="/documentation" color="primary">
            Documentation page
          </Link>{" "}
          first for quick answers to common questions.
        </Typography>
      </Alert>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <BugReportIcon sx={{ mr: 1, color: "error.main" }} />
                <Typography variant="h5" component="h2">
                  Report a Bug
                </Typography>
              </Box>
              <Typography paragraph>
                Found something that isn&apos;t working correctly? We want to fix it! Please report bugs 
                through our GitHub issue tracker with as much detail as possible.
              </Typography>
              <Typography paragraph sx={{ fontWeight: "bold", mb: 2 }}>
                What to include in your bug report:
              </Typography>
              <Typography component="ul" sx={{ pl: 2, mb: 3 }}>
                <li>Steps to reproduce the issue</li>
                <li>What you expected to happen</li>
                <li>What actually happened</li>
                <li>Browser and device information</li>
                <li>Screenshots if applicable</li>
              </Typography>
              <Button
                variant="contained"
                startIcon={<GitHubIcon />}
                href="https://github.com/progressions/chi-war/issues/new?labels=bug&template=bug_report.md"
                target="_blank"
                rel="noopener noreferrer"
                fullWidth
              >
                Report Bug on GitHub
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <LightbulbIcon sx={{ mr: 1, color: "warning.main" }} />
                <Typography variant="h5" component="h2">
                  Request a Feature
                </Typography>
              </Box>
              <Typography paragraph>
                Have an idea for improving Chi War? We&apos;d love to hear about it! Feature requests 
                help us prioritize development and build tools that actually serve your needs.
              </Typography>
              <Typography paragraph sx={{ fontWeight: "bold", mb: 2 }}>
                What to include in your feature request:
              </Typography>
              <Typography component="ul" sx={{ pl: 2, mb: 3 }}>
                <li>Clear description of the feature</li>
                <li>How it would help your campaigns</li>
                <li>Any examples from other tools</li>
                <li>Priority level (nice to have vs essential)</li>
              </Typography>
              <Button
                variant="contained"
                startIcon={<LightbulbIcon />}
                href="https://github.com/progressions/chi-war/issues/new?labels=enhancement&template=feature_request.md"
                target="_blank"
                rel="noopener noreferrer"
                fullWidth
              >
                Request Feature on GitHub
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <EmailIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h5" component="h2">
                  Contact Support
                </Typography>
              </Box>
              <Typography paragraph>
                For general questions, account issues, or private concerns that don&apos;t belong 
                in public GitHub issues, you can reach out directly.
              </Typography>
              <Typography paragraph>
                <strong>Email:</strong>{" "}
                <Link href="mailto:progressions@gmail.com" color="primary">
                  progressions@gmail.com
                </Link>
              </Typography>
              <Typography paragraph>
                Please include &quot;Chi War Support&quot; in your subject line and provide as much 
                context as possible about your question or issue.
              </Typography>
              <Typography sx={{ fontStyle: "italic" }}>
                Response time: Usually within 24-48 hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <GitHubIcon sx={{ mr: 1 }} />
                <Typography variant="h5" component="h2">
                  Community Resources
                </Typography>
              </Box>
              <Typography paragraph>
                Chi War is open source! You can view the code, contribute improvements, 
                or learn more about how it works.
              </Typography>
              <Typography paragraph>
                <strong>GitHub Repository:</strong>{" "}
                <Link 
                  href="https://github.com/progressions/chi-war" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  color="primary"
                >
                  github.com/progressions/chi-war
                </Link>
              </Typography>
              <Typography paragraph>
                <strong>Contribute:</strong> Developers can submit pull requests for bug fixes 
                and new features. Check the repository&apos;s contributing guidelines for details.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Common Troubleshooting Steps
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom>
                Login or Authentication Issues
              </Typography>
              <Typography component="ul" sx={{ pl: 2 }}>
                <li>Clear your browser cache and cookies</li>
                <li>Try logging in from an incognito/private window</li>
                <li>Check if your email is confirmed</li>
                <li>Reset your password if needed</li>
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom>
                Real-time Features Not Working
              </Typography>
              <Typography component="ul" sx={{ pl: 2 }}>
                <li>Check your internet connection</li>
                <li>Refresh the page to reconnect</li>
                <li>Disable browser extensions temporarily</li>
                <li>Try a different browser</li>
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Frequently Reported Issues
          </Typography>
          <Typography paragraph>
            <strong>Characters not saving:</strong> This is usually a temporary connection issue. 
            Try refreshing the page and re-entering your changes.
          </Typography>
          <Typography paragraph>
            <strong>Invitations not received:</strong> Check spam folders. If the email still 
            hasn&apos;t arrived after 10 minutes, contact support.
          </Typography>
          <Typography paragraph>
            <strong>Combat updates not syncing:</strong> Make sure all players have stable internet 
            connections. The gamemaster can refresh the fight to re-sync everyone.
          </Typography>
          <Typography paragraph>
            <strong>Mobile display issues:</strong> Chi War is optimized for desktop and tablet use. 
            Some features may have limited functionality on mobile phones.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  )
}
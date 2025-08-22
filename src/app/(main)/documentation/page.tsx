import { Typography, Container, Box, Accordion, AccordionSummary, AccordionDetails, Card, CardContent, Grid, Link } from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Documentation - Chi War",
  description: "Complete user guide and documentation for Chi War, the Feng Shui 2 RPG campaign management system.",
  openGraph: {
    title: "Documentation - Chi War",
    description: "Complete user guide and documentation for Chi War, the Feng Shui 2 RPG campaign management system.",
    type: "website",
  },
}

export default function DocumentationPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Documentation
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: "auto" }}>
          Everything you need to know to get the most out of Chi War
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Getting Started
              </Typography>
              <Typography paragraph>
                New to Chi War? Start here to learn the basics of setting up your account, 
                creating your first campaign, and inviting players to join your adventures.
              </Typography>
              <Typography paragraph>
                Chi War is designed to be intuitive, but these guides will help you discover 
                all the powerful features available to enhance your Feng Shui 2 sessions.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Quick Reference
              </Typography>
              <Typography paragraph>
                Looking for specific information? Check out our FAQ section below for 
                answers to common questions, or browse through the feature guides to 
                learn about specific aspects of campaign management.
              </Typography>
              <Typography paragraph>
                For real-time help during your sessions, remember that Chi War includes 
                contextual hints and tooltips throughout the interface.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
        User Guides
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Account Setup and First Steps</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography paragraph>
            <strong>Creating Your Account:</strong> Sign up with your email address and verify your account 
            through the confirmation email. Once verified, you can immediately start creating campaigns.
          </Typography>
          <Typography paragraph>
            <strong>Your First Campaign:</strong> Click &quot;Create Campaign&quot; from the dashboard. Give your 
            campaign a name and description. You&apos;ll automatically be set as the gamemaster with full 
            administrative privileges.
          </Typography>
          <Typography paragraph>
            <strong>Inviting Players:</strong> Use the invitation system to invite players to your campaign. 
            Players will receive an email with a unique invitation link that automatically adds them to your campaign.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Character Management</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography paragraph>
            <strong>Creating Characters:</strong> Both players and gamemasters can create characters. Players 
            typically create player characters (PCs), while gamemasters can create NPCs, bosses, and mooks.
          </Typography>
          <Typography paragraph>
            <strong>Character Types:</strong> Chi War supports all Feng Shui 2 character types including PCs, 
            NPCs, featured foes, bosses, uber bosses, mooks, and allies. Each type has appropriate stat blocks 
            and capabilities.
          </Typography>
          <Typography paragraph>
            <strong>AI Generation:</strong> Use the AI character generation feature to quickly create NPCs with 
            complete stat blocks, descriptions, and even generated portraits.
          </Typography>
          <Typography paragraph>
            <strong>Skills and Schticks:</strong> Add skills and schticks to characters using the built-in 
            autocomplete system. The system includes all official Feng Shui 2 schticks and allows custom additions.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Combat and Encounters</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography paragraph>
            <strong>Creating Fights:</strong> Start a new fight from the Fights page. Add characters and vehicles 
            to establish the initial encounter setup.
          </Typography>
          <Typography paragraph>
            <strong>Initiative System:</strong> Chi War uses the Feng Shui 2 shot-based initiative system. 
            Characters act on specific shot numbers, and the system automatically tracks the current shot and sequence.
          </Typography>
          <Typography paragraph>
            <strong>Real-time Updates:</strong> All players see live updates during combat. When the gamemaster 
            advances the shot or updates character conditions, all players see the changes immediately.
          </Typography>
          <Typography paragraph>
            <strong>Shot Management:</strong> Add or remove shots for characters, change initiative order, 
            and mark characters as acting or waiting. The system handles complex timing automatically.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Campaign Organization</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography paragraph>
            <strong>Sites and Locations:</strong> Create and manage locations where your adventures take place. 
            Link sites to specific junctures and add detailed descriptions.
          </Typography>
          <Typography paragraph>
            <strong>Factions:</strong> Track the various groups and organizations in your campaign. Link characters 
            to factions and track relationships between different groups.
          </Typography>
          <Typography paragraph>
            <strong>Parties:</strong> Create adventuring parties and track group relationships. Parties can include 
            both player characters and allied NPCs.
          </Typography>
          <Typography paragraph>
            <strong>Time Junctures:</strong> Organize your campaign across the four Feng Shui 2 time junctures: 
            Ancient China (690 AD), Colonial Hong Kong (1850), Contemporary (1996), and Future (2056).
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Advanced Features</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography paragraph>
            <strong>Discord Integration:</strong> Connect your campaign to Discord for automated notifications 
            and bot commands. Players can check character stats and campaign info directly from Discord.
          </Typography>
          <Typography paragraph>
            <strong>Notion Sync:</strong> Automatically sync your campaign data to Notion databases for additional 
            organization and note-taking capabilities.
          </Typography>
          <Typography paragraph>
            <strong>Import/Export:</strong> Import characters from various formats or export your campaign data 
            for backup and sharing purposes.
          </Typography>
          <Typography paragraph>
            <strong>Duplicate Characters:</strong> Quickly create variations of existing characters for recurring 
            NPCs or similar character types.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 6, mb: 3 }}>
        Frequently Asked Questions
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">How do I invite players to my campaign?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Go to your campaign page and click &quot;Invite Players&quot;. Enter the email addresses of the players 
            you want to invite. They&apos;ll receive an email with a unique invitation link that automatically 
            adds them to your campaign when they create an account or log in.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Can I use Chi War without being online?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Chi War is a web-based application that requires an internet connection. However, once loaded, 
            many features will continue to work during brief connection interruptions. We recommend having 
            a stable internet connection for the best experience, especially during combat encounters.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">How does the real-time combat system work?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Chi War uses WebSocket connections to provide real-time updates during combat. When the gamemaster 
            makes changes to the fight (advancing shots, updating character status, etc.), all connected players 
            see the updates immediately without needing to refresh their browsers.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Is my campaign data secure and private?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Yes, your campaign data is private to you and your invited players. Only users you specifically 
            invite can see your campaign information. Chi War uses secure authentication and all data 
            transmission is encrypted. You can export your data at any time for your own backup purposes.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Can I customize characters beyond the standard Feng Shui 2 rules?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Absolutely! While Chi War includes all standard Feng Shui 2 content, you can add custom schticks, 
            modify stats, and create house rules as needed. The system is flexible enough to accommodate 
            different play styles and campaign modifications.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Box sx={{ mt: 6, p: 3, bgcolor: "background.paper", borderRadius: 2 }}>
        <Typography variant="h5" component="h3" gutterBottom>
          Need More Help?
        </Typography>
        <Typography paragraph>
          Can&apos;t find what you&apos;re looking for? Visit our{" "}
          <Link href="/support" color="primary">
            Support page
          </Link>{" "}
          for additional resources, or check out the{" "}
          <Link href="https://github.com/progressions/chi-war" target="_blank" rel="noopener noreferrer" color="primary">
            GitHub repository
          </Link>{" "}
          for technical documentation and to report issues.
        </Typography>
        <Typography>
          You can also reach out to the community through our Discord server or GitHub discussions 
          for tips, tricks, and campaign ideas from other Chi War users.
        </Typography>
      </Box>
    </Container>
  )
}
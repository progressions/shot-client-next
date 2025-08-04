import { Container, Grid, Link, Typography } from "@mui/material"

interface FooterLink {
  label: string
  href: string
}

interface FooterColumn {
  title: string
  links: FooterLink[]
}

const footerColumns: FooterColumn[] = [
  {
    title: "Chi War",
    links: [
      { label: "About Us", href: "/about" },
      {
        label: "Feng Shui 2",
        href: "https://atlas-games.com/product_tables/AG4020/",
        target: "_blank",
        rel: "noopener noreferrer",
      },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Documentation", href: "/docs" },
      { label: "Support", href: "/support" },
    ],
  },
]

export function Footer() {
  return (
    <footer>
      <Container
        sx={{ py: 4, mt: 4, borderTop: "1px solid", borderColor: "divider" }}
      >
        <Grid container spacing={4}>
          {footerColumns.map(column => (
            <Grid size={{ xs: 12, sm: 4 }} key={column.title}>
              <Typography variant="h6" gutterBottom>
                {column.title}
              </Typography>
              {column.links.map(link => (
                <Typography key={link.label} sx={{ mb: 1 }}>
                  <Link {...link} color="text.secondary" underline="hover">
                    {link.label}
                  </Link>
                </Typography>
              ))}
            </Grid>
          ))}
        </Grid>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 4 }}
        >
          {"© "}
          {new Date().getFullYear()}
          {
            " Isaac Priestley. All rights reserved. Feng Shui 2 by Robin D. Laws and Greg Stolze."
          }
        </Typography>
      </Container>
    </footer>
  )
}

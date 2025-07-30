import { Typography } from "@mui/material"

type HeroTitleProps = {
  children: React.ReactNode
}

export function HeroTitle({ children }: HeroTitleProps) {
  return (
    <Typography
      variant="h4"
      sx={{
        color: "#ffffff",
        fontSize: { xs: "1.5rem", sm: "2.125rem" },
        mb: 2,
      }}
    >
      {children}
    </Typography>
  )
}

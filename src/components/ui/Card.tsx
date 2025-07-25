import { Box, BoxProps } from "@mui/material"

interface CardProps extends BoxProps {
  // Add custom props if needed
}

export function Card(props: CardProps) {
  return (
    <Box
      variant="card"
      sx={{
        border: "1px solid #424242",
        borderRadius: "0.5rem",
        backgroundColor: "#1e1e1e",
        padding: "1rem",
        transition: "border-color 0.3s ease",
        "&:hover": {
          borderColor: "#616161"
        }
      }}
      {...props}
    />
  )
}

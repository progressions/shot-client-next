import { Box, Stack, Typography } from "@mui/material"
import { ActionValueLink } from "@/components/links"

type ActionValueProps = {
  name: string
  value: number | string
}

export default function ActionValue({ name, value }: ActionValueProps) {
  if (!name || !value) {
    return null
  }
  return (
    <Stack direction="column">
      <Typography variant="body2" sx={{ color: "#ffffff" }}>
        <ActionValueLink name={name} />
      </Typography>
      <Box
        sx={{
          textAlign: "center",
          minWidth: { xs: "5rem", sm: "6rem" },
          fontSize: { xs: "2rem", sm: "3rem" },
          border: "1px solid #ffffff",
          borderRadius: 1,
          p: 1,
          px: 2,
        }}
      >
        {value}
      </Box>
    </Stack>
  )
}

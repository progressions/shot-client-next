import { Box, Stack, Typography } from "@mui/material"
import { ActionValueLink } from "@/components/ui"

type ActionValueProps = {
  name: string
  value: number | string
  size: "small" | "large"
}

export default function ActionValue({
  name,
  value,
  size = "large",
}: ActionValueProps) {
  if (!name) {
    return null
  }
  const minWidthMap = {
    small: { xs: "4rem", sm: "5rem" },
    large: { xs: "5rem", sm: "6rem" },
  }
  const fontSizeMap = {
    small: { xs: "1.5rem", sm: "2rem" },
    large: { xs: "2rem", sm: "3rem" },
  }
  return (
    <Stack direction="column">
      <Typography variant="body2" sx={{ color: "#ffffff" }}>
        <ActionValueLink name={name} />
      </Typography>
      <Box
        sx={{
          textAlign: "center",
          minWidth: minWidthMap[size],
          fontSize: fontSizeMap[size],
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

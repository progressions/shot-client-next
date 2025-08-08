import { Skeleton, Box, Stack, CircularProgress } from "@mui/material"

export default async function FightsModule() {
  return (
    <Box
      sx={{
        flexGrow: 1,
        width: { xs: "100%", sm: "auto" },
        p: 2,
        borderRadius: 2,
        backgroundColor: "#2d2d2d",
      }}
    >
      <Skeleton variant="text" width="50%" height={24} sx={{ mb: 1 }} />
      <CircularProgress size={24} sx={{ color: "#fff", mb: 2 }} />
    </Box>
  )
}

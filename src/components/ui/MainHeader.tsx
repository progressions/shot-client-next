import { Box, Stack, Typography } from "@mui/material"

type MainHeaderProps = {
  title: string
  icon?: React.ReactElement
}

export function MainHeader({ title, icon }: MainHeaderProps) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
      <Box sx={{ paddingTop: 1 }}>{icon}</Box>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
    </Stack>
  )
}

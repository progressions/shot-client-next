import { Stack, Typography } from "@mui/material"

type MainHeaderProps = {
  title: string
  icon?: React.ReactElement
}

export function MainHeader({ title, icon }: MainHeaderProps) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
      {icon}
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
    </Stack>
  )
}

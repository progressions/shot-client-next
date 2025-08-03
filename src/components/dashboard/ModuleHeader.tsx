import { Stack, Typography } from "@mui/material"

type ModuleHeaderProps = {
  title: string
  icon: React.ReactElement
}

export default function ModuleHeader({ title, icon }: ModuleHeaderProps) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
      {icon}
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
    </Stack>
  )
}

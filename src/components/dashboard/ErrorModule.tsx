import { Box, Typography } from "@mui/material"
import { ModuleHeader } from "@/components/dashboard"

type ErrorModuleProps = {
  title?: string
  message?: string
  icon?: React.ReactNode
}

export default function ErrorModule({
  title,
  message,
  icon,
}: ErrorModuleProps) {
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
      <ModuleHeader title={title} icon={icon} />
      <Typography variant="body2" color="#fff">
        {message}
      </Typography>
    </Box>
  )
}

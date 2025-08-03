import { Stack, Box, Typography } from "@mui/material"

type SectionHeader = {
  icon?: React.ReactNode
  actions?: React.ReactNode
  title: string
  sx?: object
  children?: React.ReactNode
}

export function SectionHeader({
  icon,
  actions,
  title,
  sx = {},
  children,
}: SectionHeader) {
  return (
    <Box sx={{ mt: 2, ...sx }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ flex: 1, pb: 2 }}
        >
          {icon}
          <Typography
            variant="h5"
            sx={{
              width: "100%",
              position: "relative",
              "&:after": {
                content: '""',
                position: "absolute",
                bottom: -1,
                left: 0,
                width: "100%",
                height: "1px",
                backgroundColor: "white",
              },
            }}
          >
            {title}
          </Typography>
        </Stack>
        {actions}
      </Stack>
      {children && (
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          {children}
        </Typography>
      )}
    </Box>
  )
}

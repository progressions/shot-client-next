import { Stack, Box, Typography } from "@mui/material"

/**
 * Props for the SectionHeader component.
 *
 * @property title - Section title text (required)
 * @property icon - Optional icon to display before the title
 * @property actions - Optional action buttons/elements aligned to the right
 * @property sx - Custom styles to apply to the container
 * @property children - Optional subtitle content displayed below the header
 */
type SectionHeader = {
  icon?: React.ReactNode
  actions?: React.ReactNode
  title: string
  sx?: object
  children?: React.ReactNode
}

/**
 * Section header component with icon, title, actions, and optional subtitle.
 *
 * Renders a consistent section header with:
 * - Optional leading icon
 * - Title with underline decoration
 * - Right-aligned action buttons
 * - Optional subtitle/description below
 *
 * @example
 * ```tsx
 * <SectionHeader
 *   icon={<Icon keyword="Character" />}
 *   title="Characters"
 *   actions={<Button onClick={handleAdd}>Add Character</Button>}
 * >
 *   Manage your campaign characters
 * </SectionHeader>
 * ```
 */
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

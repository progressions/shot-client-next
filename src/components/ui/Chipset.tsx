import { Stack } from "@mui/material"
import { SystemStyleObject, Theme } from "@mui/system"

type ChipsetProps = {
  children: React.ReactNode
  sx?: SystemStyleObject<Theme>
}

export function Chipset({ children, sx = {} }: ChipsetProps) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "flex-start",
        rowGap: 2,
        mb: 4,
        ...sx,
      }}
    >
      {children}
    </Stack>
  )
}

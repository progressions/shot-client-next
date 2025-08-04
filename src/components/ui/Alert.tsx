import { Alert as MuiAlert } from "@mui/material"
import { SystemStyleObject, Theme } from "@mui/system"

type AlertProps = {
  status: {
    severity: "error" | "warning" | "info" | "success"
    message: string
  }
  sx?: SystemStyleObject<Theme>
}

export function Alert({ status, sx }: AlertProps) {
  if (!status.message) return null

  return (
    <MuiAlert severity={status.severity} sx={{ mb: 2, ...sx }}>
      {status.message}
    </MuiAlert>
  )
}

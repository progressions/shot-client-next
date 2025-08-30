import { Stack } from "@mui/material"
import { SaveButton } from "./SaveButton"
import { CancelButton } from "./CancelButton"

export function SaveCancelButtons(props: React.PropsWithChildren<AnyProps>) {
  return (
    <Stack spacing={2} direction="row">
      <CancelButton disabled={props.cancelDisabled} onClick={props.onCancel}>
        {props.cancelText}
      </CancelButton>
      <SaveButton disabled={props.disabled} onClick={props.onSave}>
        {props.saveText}
      </SaveButton>
    </Stack>
  )
}

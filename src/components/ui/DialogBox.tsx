import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import { ConfirmDialog } from "@/components/ui"
import { FormActions, useForm } from "@/reducers"

interface DialogBoxProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  actions?: React.ReactNode
}

export function DialogBox({
  open,
  onClose,
  title,
  children,
  actions,
}: DialogBoxProps) {
  const { formState, dispatchForm } = useForm<FormStateData>({
    isConfirmDialogOpen: false,
  })
  const { isConfirmDialogOpen } = formState.data

  const handleClose = () => {
    if (hasUploaded) {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "isConfirmDialogOpen",
        value: true,
      })
    } else {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "isConfirmDialogOpen",
        value: false,
      })
      onClose()
    }
  }

  const handleConfirmClose = () => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "isConfirmDialogOpen",
      value: false,
    })
    onClose()
  }

  const handleCancelClose = () => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "isConfirmDialogOpen",
      value: false,
    })
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        TransitionProps={{ timeout: 0 }}
        PaperProps={{
          sx: {
            bgcolor: "grey.800",
            color: "white",
            borderRadius: 2,
            border: "2px solid",
            borderColor: "primary.main",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.5)",
            minWidth: { xs: "90%", sm: 600 },
            maxWidth: 800,
          },
        }}
      >
        {title && (
          <DialogTitle sx={{ bgcolor: "grey.800", color: "white" }}>
            {title}
          </DialogTitle>
        )}
        <DialogContent sx={{ bgcolor: "grey.800", color: "white" }}>
          {children}
        </DialogContent>
        {actions && (
          <DialogActions sx={{ bgcolor: "grey.800", p: 2 }}>
            {actions}
          </DialogActions>
        )}
      </Dialog>
      <ConfirmDialog
        open={isConfirmDialogOpen}
        onClose={handleCancelClose}
        onConfirm={handleConfirmClose}
        title="Confirm Close"
      >
        Are you sure you want to close this dialog? Any unsaved changes will be
        lost.
      </ConfirmDialog>
    </>
  )
}

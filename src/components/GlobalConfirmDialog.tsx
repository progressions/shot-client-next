"use client"

import { ConfirmDialog } from "@/components/ui"
import { useConfirm } from "@/contexts/ConfirmContext"

export default function GlobalConfirmDialog() {
  const { confirmState, handleConfirm, handleCancel } = useConfirm()

  return (
    <ConfirmDialog
      open={confirmState.open}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={confirmState.options.title}
      message={confirmState.options.message}
      confirmText={confirmState.options.confirmText}
      cancelText={confirmState.options.cancelText}
      confirmColor={confirmState.options.confirmColor}
      destructive={confirmState.options.destructive}
    />
  )
}

"use client"

import UserForm from "./UserForm"

interface CreateUserFormProperties {
  open: boolean
  onClose: () => void
}

export default function CreateUserForm({
  open,
  onClose,
}: CreateUserFormProperties) {
  return (
    <UserForm
      open={open}
      onClose={onClose}
      title="New User"
    />
  )
}

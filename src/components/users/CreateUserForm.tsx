"use client"

import { defaultUser, type User } from "@/types"
import { useClient } from "@/contexts"
import UserForm from "./UserForm"

interface CreateUserFormProperties {
  open: boolean
  onClose: () => void
  onSave: (newUser: User) => void
}

export default function CreateUserForm({
  open,
  onClose,
  onSave,
}: CreateUserFormProperties) {
  const { client } = useClient()

  const handleSave = async (formData: FormData, userData: User) => {
    const user = { ...defaultUser, ...userData } as User
    formData.set("user", JSON.stringify(user))
    const response = await client.createUser(formData)
    onSave(response.data)
  }

  return (
    <UserForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      initialFormData={{ ...defaultUser, image: null }}
      title="New User"
    />
  )
}

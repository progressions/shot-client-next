"use client"

import { useClient } from "@/contexts"
import { type User } from "@/types"
import UserForm from "./UserForm"

interface EditUserFormProperties {
  open: boolean
  onClose: () => void
  onSave: (updatedUser: User) => void
  user: User
}

export default function EditUserForm({
  open,
  onClose,
  onSave,
  user,
}: EditUserFormProperties) {
  const { client } = useClient()

  const handleSave = async (formData: FormData, userData: User) => {
    const updatedUserData = {
      ...user,
      id: user.id,
      name: userData.name,
      description: userData.description,
    } as User
    formData.set("user", JSON.stringify(updatedUserData))
    const response = await client.updateUser(user.id, formData)
    onSave(response.data)
  }

  return (
    <UserForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      initialFormData={{ ...user, image: null }}
      title="Edit User"
      existingImageUrl={user.image_url}
    />
  )
}

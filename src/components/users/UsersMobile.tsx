"use client"
import { Stack, Typography } from "@mui/material"
import { UserDetail } from "@/components/users"
import { useToast } from "@/contexts"

interface UsersMobileProps {
  formState: {
    data: {
      users: Array<unknown> // Replace unknown with specific type if available
    }
  }
}

export default function UsersMobile({ formState }: UsersMobileProps) {
  const { toastSuccess } = useToast()
  const { users } = formState.data

  const handleDelete = async () => {
    toastSuccess("User deleted successfully")
  }

  return (
    <Stack spacing={2}>
      {users.length === 0 && (
        <Typography sx={{ color: "#fff" }}>No users available</Typography>
      )}
      {users.map(user => (
        <UserDetail user={user} key={user.id} onDelete={handleDelete} />
      ))}
    </Stack>
  )
}

import { CircularProgress, Box, Typography, Stack } from "@mui/material"
import type { PopupProps, User } from "@/types"
import { defaultUser } from "@/types"
import { useState, useEffect } from "react"
import { UserAvatar } from "@/components/avatars"
import { useClient } from "@/contexts"
import { UserLink } from "@/components/ui"

export default function UserPopup({ id }: PopupProps) {
  const { currentUser, client } = useClient()
  const [user, setUser] = useState<User>(defaultUser)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await client.getUser({ id })
        const fetchedUser = response.data
        console.log("Fetched user:", fetchedUser)
        if (fetchedUser) {
          setUser(fetchedUser)
        } else {
          console.error(`User with ID ${id} not found`)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      }
    }

    if (currentUser?.id && id) {
      fetchUser().catch(error => {
        console.error("Failed to fetch user:", error)
      })
    }
  }, [currentUser, id, client])

  if (!user?.id) {
    return null
  }

  const subhead = [user.email].filter(Boolean).join(" - ")

  if (!user?.id) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2">Loading...</Typography>
        <CircularProgress size={24} sx={{ mt: 2 }} />
      </Box>
    )
  }
  return (
    <Box sx={{ py: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
        <UserAvatar user={user} disablePopup={true} />
        <Typography>
          <UserLink user={user} disablePopup={true} />
        </Typography>
      </Stack>
      <Typography variant="caption" sx={{ textTransform: "uppercase" }}>
        {subhead}
      </Typography>
    </Box>
  )
}

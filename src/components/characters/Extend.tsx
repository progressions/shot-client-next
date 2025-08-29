"use client"

import { Button, DialogBox } from "@/components/ui"
import { Stack, Typography } from "@mui/material"
import type { Character } from "@/types"
import { useState } from "react"
import { useClient } from "@/contexts"

type ExtendProps = {
  character: Character
  open: boolean
  onClose: () => void
}

export default function Extend({ character, open, onClose }: ExtendProps) {
  const { client } = useClient()
  const [_loading, setLoading] = useState(false)

  const extendCharacter = async () => {
    setLoading(true)
    try {
      await client.extendCharacter(character)
      onClose()
    } catch (error) {
      console.error("Failed to extend character:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DialogBox open={open} onClose={onClose} title="Extend your Character">
        <Typography>We can flesh out your character a bit with AI.</Typography>
        <Typography>
          Just click the button and we&rsquo;ll update your character with some
          additional details.
        </Typography>
        <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={extendCharacter}>
            Extend Character
          </Button>
        </Stack>
      </DialogBox>
    </>
  )
}

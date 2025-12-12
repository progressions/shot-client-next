"use client"

import { Button, DialogBox } from "@/components/ui"
import { CircularProgress, Stack, Typography } from "@mui/material"
import type { Character } from "@/types"
import { useApp } from "@/contexts"
import { useCharacterExtension } from "@/hooks"

type ExtendProps = {
  character: Character
  open: boolean
  onClose: () => void
  onCharacterUpdate?: (character: Character) => void
}

export default function Extend({
  character,
  open,
  onClose,
  onCharacterUpdate,
}: ExtendProps) {
  const { campaign } = useApp()

  const { pending, extendCharacter, isExtending } = useCharacterExtension({
    campaignId: campaign?.id ?? "",
    character,
    onComplete: updatedCharacter => {
      if (onCharacterUpdate) {
        onCharacterUpdate(updatedCharacter)
      }
      onClose()
    },
  })

  const handleExtend = async () => {
    await extendCharacter()
  }

  const isDisabled = pending || isExtending || !campaign?.id

  return (
    <>
      <DialogBox open={open} onClose={onClose} title="Extend your Character">
        {isExtending && !pending ? (
          <Stack spacing={2} alignItems="center" py={2}>
            <CircularProgress size={40} />
            <Typography>
              Character extension is already in progress...
            </Typography>
          </Stack>
        ) : (
          <>
            <Typography>
              We can flesh out your character a bit with AI.
            </Typography>
            <Typography>
              Just click the button and we&rsquo;ll update your character with
              some additional details.
            </Typography>
          </>
        )}
        <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
          <Button variant="outlined" onClick={onClose} disabled={pending}>
            {pending ? "Please wait..." : "Cancel"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleExtend}
            disabled={isDisabled}
            startIcon={pending ? <CircularProgress size={16} /> : undefined}
          >
            {pending ? "Extending..." : "Extend Character"}
          </Button>
        </Stack>
      </DialogBox>
    </>
  )
}

"use client"

import { Box, Popover, Link } from "@mui/material"
import { useState, MouseEvent } from "react"
import { CharacterPopup } from "@/components/popups"
import { CharacterName } from "@/components/characters"

type CharacterLinkProperties = {
  character: Character
  data?: string | object
  disablePopup?: boolean
}

export default function CharacterLink({
  character,
  data,
  disablePopup = false,
}: CharacterLinkProperties) {
  const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null)

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  return (
    <>
      <Link
        href={`/characters/${character.id}`}
        target="_blank"
        data-mention-id={character.id}
        data-mention-class-name="Character"
        data-mention-data={data ? JSON.stringify(data) : undefined}
        style={{
          fontWeight: "bold",
          textDecoration: "underline",
          color: "#fff",
        }}
        onClick={!disablePopup ? handleClick : undefined}
      >
        <CharacterName character={character} />
      </Link>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box sx={{ p: 2, maxWidth: 400 }}>
          <CharacterPopup id={character.id} />
        </Box>
      </Popover>
    </>
  )
}

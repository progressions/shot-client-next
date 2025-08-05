"use client"

import { Box, Popover, Link } from "@mui/material"
import { useState, MouseEvent } from "react"
import { FightPopup } from "@/components/popups"
import { FightName } from "@/components/fights"

type FightLinkProperties = {
  fight: Fight
  data?: string | object
  disablePopup?: boolean
}

export default function FightLink({
  fight,
  data,
  disablePopup = false,
}: FightLinkProperties) {
  const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null)

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  function seasonLabel(fight) {
    if (fight.season && fight.session) {
      // turn session into a two-digit number
      const session = fight.session.toString().padStart(2, "0")
      return ` (${fight.season}-${session})`
    }
    return fight.name
  }

  return (
    <>
      <Box component="span">
        <Link
          href={`/fights/${fight.id}`}
          target="_blank"
          data-mention-id={fight.id}
          data-mention-class-name="Fight"
          data-mention-data={data ? JSON.stringify(data) : undefined}
          style={{
            fontWeight: "bold",
            textDecoration: "underline",
            color: "#fff",
          }}
          onClick={!disablePopup ? handleClick : undefined}
        >
          <FightName fight={fight} />
        </Link>{" "}
        {seasonLabel(fight)}
      </Box>
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
          <FightPopup id={fight.id} />
        </Box>
      </Popover>
    </>
  )
}

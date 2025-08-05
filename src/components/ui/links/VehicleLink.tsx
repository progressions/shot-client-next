"use client"

import { Box, Popover, Link } from "@mui/material"
import { useState, MouseEvent } from "react"
import { VehiclePopup } from "@/components/popups"
import { VehicleName } from "@/components/vehicles"

type VehicleLinkProperties = {
  vehicle: Vehicle
  data?: string | object
  disablePopup?: boolean
}

export default function VehicleLink({
  vehicle,
  data,
  disablePopup = false,
}: VehicleLinkProperties) {
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
        href={`/vehicles/${vehicle.id}`}
        target="_blank"
        data-mention-id={vehicle.id}
        data-mention-class-name="Vehicle"
        data-mention-data={data ? JSON.stringify(data) : undefined}
        style={{
          fontWeight: "bold",
          textDecoration: "underline",
          color: "#fff",
        }}
        onClick={!disablePopup ? handleClick : null}
      >
        <VehicleName vehicle={vehicle} />
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
          <VehiclePopup id={vehicle.id} />
        </Box>
      </Popover>
    </>
  )
}

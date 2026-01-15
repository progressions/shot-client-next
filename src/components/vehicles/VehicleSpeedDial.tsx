"use client"

import FileDownloadIcon from "@mui/icons-material/FileDownload"
import DeleteIcon from "@mui/icons-material/Delete"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Menu,
  MenuItem,
} from "@mui/material"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import { SystemStyleObject, Theme } from "@mui/system"
import type { MouseEvent, SyntheticEvent } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Vehicle } from "@/types"
import { CS } from "@/services"
import { useClient, useConfirm } from "@/contexts"

type Action = {
  [key: string]: unknown
  icon: React.ReactNode
  name: string
  onClick?: (event: MouseEvent<HTMLElement>) => void
  preventClose?: boolean
}

type VehicleSpeedDialProps = {
  vehicle: Vehicle
  onDelete?: () => Promise<void>
  sx?: SystemStyleObject<Theme>
}

export default function VehicleSpeedDial({
  vehicle,
  onDelete,
  sx = {},
}: VehicleSpeedDialProps) {
  const { client } = useClient()
  const { confirm } = useConfirm()
  const router = useRouter()
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null)
  const exportMenuOpen = Boolean(exportAnchorEl)
  const [speedDialOpen, setSpeedDialOpen] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [persist, setPersist] = useState(false)

  // Reset persist when SpeedDial is closed externally
  useEffect(() => {
    if (!speedDialOpen) {
      setPersist(false)
    }
  }, [speedDialOpen])

  const handleDelete = async () => {
    if (!vehicle?.id) return
    const confirmed = await confirm({
      title: "Delete Vehicle",
      message: `Are you sure you want to delete the vehicle: ${vehicle.name || "Unnamed"}?`,
      confirmText: "Delete",
      destructive: true,
    })
    if (!confirmed) return
    try {
      if (onDelete) {
        await onDelete()
      } else {
        await client.deleteVehicle(vehicle)
        router.push("/vehicles")
      }
    } catch (error_) {
      console.error("Failed to delete vehicle:", error_)
    }
  }

  const handleExportPDF = async () => {
    setExportingPdf(true)
    try {
      const filename = `${(vehicle.name || "vehicle").replace(/\s+/g, "_")}.pdf`
      const response = await client.getVehiclePdf(vehicle)
      const data = response.data
      const pdfBlob = new Blob([data], { type: "application/pdf" })
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error_) {
      console.error("Error downloading PDF:", error_)
      alert("Error downloading PDF")
    } finally {
      setExportingPdf(false)
      setExportAnchorEl(null)
      setSpeedDialOpen(false)
    }
  }

  const handleExportTXT = async () => {
    try {
      const filename = `${(vehicle.name || "vehicle").replace(/\s+/g, "_")}.txt`
      const textContent = `
Vehicle: ${vehicle.name || "Unnamed"}
ID: ${vehicle.id}
Owner: ${vehicle.owner || "N/A"}
Description: ${vehicle.description || "N/A"}
${!CS.isMook(vehicle) ? `Schticks: ${vehicle.schticks?.join(", ") || "None"}` : ""}
Action Values: ${JSON.stringify(vehicle.actionValues, null, 2)}
      `.trim()
      const txtBlob = new Blob([textContent], { type: "text/plain" })
      const url = window.URL.createObjectURL(txtBlob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error_) {
      console.error("Error downloading TXT:", error_)
      alert("Error downloading TXT")
    } finally {
      setExportAnchorEl(null)
      setSpeedDialOpen(false)
    }
  }

  const handleDuplicate = async () => {
    if (!vehicle?.id) return
    try {
      const response = await client.duplicateVehicle(vehicle)
      const newVehicle = response.data
      router.push(`/vehicles/${newVehicle.id}`)
    } catch (error_) {
      console.error("Failed to duplicate vehicle:", error_)
    } finally {
      setSpeedDialOpen(false)
    }
  }

  const handleExportClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setExportAnchorEl(event.currentTarget)
  }

  const handleExportMenuClose = () => {
    setExportAnchorEl(null)
  }

  const actions = [
    {
      icon: <FileDownloadIcon />,
      name: "Export",
      onClick: handleExportClick,
      preventClose: true,
    },
    { icon: <ContentCopyIcon />, name: "Copy", onClick: handleDuplicate },
    { icon: <DeleteIcon />, name: "Delete", onClick: handleDelete },
  ]

  const handleActionClick =
    (action: Action) => (event: MouseEvent<HTMLElement>) => {
      if (action.preventClose) {
        event.stopPropagation()
        setPersist(true)
      } else {
        setPersist(false)
        setSpeedDialOpen(false)
      }
      if (action.onClick) {
        action.onClick(event)
      }
    }

  const handleOpen = (_event: SyntheticEvent, reason: string) => {
    if (reason !== "toggle") {
      return
    }

    setSpeedDialOpen(true)
  }

  const handleClose = (_event: SyntheticEvent, reason: string) => {
    if (reason === "escapeKeyDown") {
      setPersist(false)
      setSpeedDialOpen(false)
      return
    }

    if (reason !== "toggle") {
      return
    }

    if (persist) {
      setPersist(false)
      return
    }

    setSpeedDialOpen(false)
  }

  return (
    <>
      <SpeedDial
        ariaLabel="Vehicle actions"
        sx={{
          position: "absolute",
          right: 0,
          "& .MuiSpeedDial-fab": {
            width: 36,
            height: 36,
            minHeight: 36,
            boxShadow: "none",
          },
          ...sx,
        }}
        icon={<SpeedDialIcon openIcon={<MoreHorizIcon />} />}
        direction="down"
        open={speedDialOpen}
        onOpen={handleOpen}
        onClose={handleClose}
      >
        {actions.map(action => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={handleActionClick(action)}
          />
        ))}
      </SpeedDial>
      <Menu
        anchorEl={exportAnchorEl}
        open={exportMenuOpen}
        onClose={handleExportMenuClose}
        MenuListProps={{
          "aria-labelledby": "export-button",
        }}
      >
        <MenuItem onClick={handleExportPDF}>
          {exportingPdf ? "Exporting..." : "Export as PDF"}
        </MenuItem>
        <MenuItem onClick={handleExportTXT}>Export as TXT</MenuItem>
      </Menu>
    </>
  )
}

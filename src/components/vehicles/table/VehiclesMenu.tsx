import { GridView, ViewList } from "@mui/icons-material"
import { SpeedDial } from "@/components/vehicles"
import { actions as initialActions } from "@/components/vehicles/SpeedDial"

interface VehiclesMenuProps {
  viewMode: "table" | "mobile"
  setViewMode: (mode: "table" | "mobile") => void
}

export default function VehiclesMenu({
  viewMode,
  setViewMode,
}: VehiclesMenuProps) {
  const handleToggleView = () => {
    setViewMode(viewMode === "table" ? "mobile" : "table")
  }

  const actions = [
    {
      icon: viewMode === "table" ? <GridView /> : <ViewList />,
      name:
        viewMode === "table" ? "Switch to Mobile View" : "Switch to Table View",
      onClick: handleToggleView,
    },
    ...initialActions,
  ]

  return <SpeedDial actions={actions} />
}

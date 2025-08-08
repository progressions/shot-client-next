import { GridView, ViewList } from "@mui/icons-material"
import { SpeedDial } from "@/components/fights"
import { actions as initialActions } from "@/components/fights/SpeedDial"

interface MenuProps {
  viewMode: "table" | "mobile"
  setViewMode: (mode: "table" | "mobile") => void
}

export default function Menu({ viewMode, setViewMode }: MenuProps) {
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

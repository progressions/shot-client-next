import { GridView, ViewList } from "@mui/icons-material"
import { SpeedDial, actions as initialActions } from "@/components/ui"

interface CharactersMenuProps {
  viewMode: "table" | "mobile"
  setViewMode: (mode: "table" | "mobile") => void
}

export default function CharactersMenu({
  viewMode,
  setViewMode,
}: CharactersMenuProps) {
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

import { GridView, ViewList } from "@mui/icons-material"
import { FightForm } from "@/components/fights"
import { SpeedDial, actions as initialActions } from "@/components/ui"
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1"

interface MenuProps {
  viewMode: "table" | "mobile"
  setViewMode: (mode: "table" | "mobile") => void
}

export default function Menu({
  viewMode,
  setViewMode,
  drawerOpen,
  handleOpenCreateDrawer,
  handleCloseCreateDrawer,
  handleSaveFight,
}: MenuProps) {
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
    {
      icon: <PersonAddAlt1Icon />,
      name: "Create",
      onClick: handleOpenCreateDrawer,
    },
    ...initialActions,
  ]

  return (
    <>
      <SpeedDial actions={actions} />
      <FightForm
        open={drawerOpen}
        onClose={handleCloseCreateDrawer}
        onSave={handleSaveFight}
      />
    </>
  )
}

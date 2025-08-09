import { GridView, ViewList } from "@mui/icons-material"
import { CreateJunctureForm, SpeedDial } from "@/components/junctures"
import { actions as initialActions } from "@/components/junctures/SpeedDial"
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1"
import { defaultJuncture } from "@/types"

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
  handleSave,
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

  const defaultEntity = defaultJuncture

  return (
    <>
      <SpeedDial actions={actions} />
      <CreateJunctureForm
        open={drawerOpen}
        onClose={handleCloseCreateDrawer}
        onSave={handleSave}
        initialFormData={{ defaultEntity }}
      />
    </>
  )
}

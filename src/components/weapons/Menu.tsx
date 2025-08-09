import { GridView, ViewList } from "@mui/icons-material"
import { CreateWeaponForm, SpeedDial } from "@/components/weapons"
import { actions as initialActions } from "@/components/weapons/SpeedDial"
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1"
import { defaultWeapon } from "@/types"

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

  const defaultEntity = defaultWeapon

  return (
    <>
      <SpeedDial actions={actions} />
      <CreateWeaponForm
        open={drawerOpen}
        onClose={handleCloseCreateDrawer}
        onSave={handleSave}
        initialFormData={{ defaultEntity }}
      />
    </>
  )
}

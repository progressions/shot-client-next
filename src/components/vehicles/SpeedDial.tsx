import { redirect } from "next/navigation"
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1"
import UploadIcon from "@mui/icons-material/Upload"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"

import { SpeedDialMenu } from "@/components/ui"

const handleCreate = () => {
  redirect("/vehicles/create")
}

const handleGenerate = () => {
  redirect("/vehicles/generate")
}

const handleImport = () => {
  redirect("/vehicles/import")
}

export const actions = [
  { icon: <PersonAddAlt1Icon />, name: "Create", onClick: handleCreate },
  { icon: <UploadIcon />, name: "Import", onClick: handleImport },
  {
    icon: <AddCircleOutlineIcon />,
    name: "Generate",
    onClick: handleGenerate,
  },
]

type SpeedDialProps = {
  actions: typeof actions
}

export default function SpeedDial({ actions: initialActions }: SpeedDialProps) {
  return <SpeedDialMenu actions={initialActions || actions} />
}

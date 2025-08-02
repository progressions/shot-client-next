import { ImportPage } from "@/components/characters"
import { Suspense } from "react"
import { CircularProgress } from "@mui/material"
import Breadcrumbs from "@/components/Breadcrumbs"

export const metadata = {
  title: "Import Characters - Chi War",
}

export default async function CharacterImportPage() {
  return (
    <>
      <Breadcrumbs />
      <Suspense fallback={<CircularProgress />}>
        <ImportPage />
      </Suspense>
    </>
  )
}

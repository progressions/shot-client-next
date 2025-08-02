import { GeneratePage } from "@/components/characters"
import { Suspense } from "react"
import { CircularProgress } from "@mui/material"
import Breadcrumbs from "@/components/Breadcrumbs"

export const metadata = {
  title: "Generate Characters - Chi War",
}

export default async function CharacterGeneratePage() {
  return (
    <>
      <Breadcrumbs />
      <Suspense fallback={<CircularProgress />}>
        <GeneratePage />
      </Suspense>
    </>
  )
}

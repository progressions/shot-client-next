import { ImportPage } from "@/components/characters"
import { headers } from "next/headers"
import { Suspense } from "react"
import { CircularProgress } from "@mui/material"
import { getServerClient } from "@/lib"
import Breadcrumbs from "@/components/Breadcrumbs"

export const metadata = {
  title: "Import Characters - Chi War",
}

export default async function CharacterImportPage() {
  const client = await getServerClient()

  // Detect mobile device on the server
  const headersState = await headers()
  const userAgent = headersState.get("user-agent") || ""
  const initialIsMobile = /mobile/i.test(userAgent)

  return (
    <>
      <Breadcrumbs client={client} />
      <Suspense fallback={<CircularProgress />}>
        <ImportPage initialIsMobile={initialIsMobile} />
      </Suspense>
    </>
  )
}

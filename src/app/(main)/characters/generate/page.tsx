import { GeneratePage } from "@/components/characters"
import { headers } from "next/headers"
import { Suspense } from "react"
import { CircularProgress } from "@mui/material"
import { getServerClient } from "@/lib/getServerClient"
import Breadcrumbs from "@/components/Breadcrumbs"

export const metadata = {
  title: "Generate Characters - Chi War",
}

export default async function CharacterGeneratePage() {
  const client = await getServerClient()

  // Detect mobile device on the server
  const headersState = await headers()
  const userAgent = headersState.get("user-agent") || ""
  const initialIsMobile = /mobile/i.test(userAgent)

  return (
    <>
      <Breadcrumbs client={client} />
      <Suspense fallback={<CircularProgress />}>
        <GeneratePage initialIsMobile={initialIsMobile} />
      </Suspense>
    </>
  )
}

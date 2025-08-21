import { CircularProgress, Typography } from "@mui/material"
import { headers } from "next/headers"
import { getServerClient, getCurrentUser } from "@/lib"
import type { Fight } from "@/types"
import { NotFound, Show } from "@/components/fights"
import { Suspense } from "react"
import Breadcrumbs from "@/components/Breadcrumbs"

type FightPageProperties = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: FightPageProperties) {
  const { id } = await params
  const client = await getServerClient()
  
  if (!client) {
    return {
      title: "Fight - Chi War",
      description: "View fight details"
    }
  }

  try {
    const response = await client.getFight({ id })
    const fight: Fight = response.data
    return {
      title: `${fight.name || 'Fight'} - Chi War`,
      description: `Fight details${fight.name ? ` for ${fight.name}` : ''}`
    }
  } catch (error) {
    return {
      title: "Fight Not Found - Chi War",
      description: "The requested fight could not be found"
    }
  }
}

export default async function FightPage({ params }: FightPageProperties) {
  const { id } = await params
  const client = await getServerClient()
  const user = await getCurrentUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  try {
    const response = await client.getFight({ id })
    const fight: Fight = response.data

    // Detect mobile device on the server
    const headersState = await headers()
    const userAgent = headersState.get("user-agent") || ""
    const initialIsMobile = /mobile/i.test(userAgent)

    return (
      <>
        <Breadcrumbs client={client} />
        <Suspense fallback={<CircularProgress />}>
          <Show fight={fight} initialIsMobile={initialIsMobile} />
        </Suspense>
      </>
    )
  } catch (error) {
    console.error(error)
    return <NotFound />
  }
}

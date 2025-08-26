import { CircularProgress } from "@mui/material"
import { redirect } from "next/navigation"
import { CreatePage } from "@/components/characters"
import { getCurrentUser, getServerClient } from "@/lib"
import { Suspense } from "react"
import Breadcrumbs from "@/components/Breadcrumbs"

export const metadata = {
  title: "Create Characters - Chi War",
}

export default async function CharacterCreatePage() {
  const client = await getServerClient()
  const user = await getCurrentUser()

  if (!client || !user) {
    redirect("/login")
  }

  const response = await client.getCharacters({
    is_template: true,
    character_type: "PC",
    sort: "name",
    order: "asc",
    per_page: 50,
  })
  const { characters } = response.data
  
  console.log("PC Template characters fetched:", characters?.length || 0)

  return (
    <>
      <Breadcrumbs client={client} />
      <Suspense fallback={<CircularProgress />}>
        <CreatePage templates={characters} />
      </Suspense>
    </>
  )
}

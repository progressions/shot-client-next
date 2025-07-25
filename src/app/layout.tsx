import ThemeRegistry from "@/components/ThemeRegistry"
import Navbar from "@/components/Navbar"
import { CampaignProvider, ClientProvider, LocalStorageProvider } from "@/contexts"
import { getServerClient, getUser } from "@/lib/getServerClient"
import type { User } from "@/types/types"

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const client = await getServerClient()
  const user = await getUser()

  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <LocalStorageProvider>
            <ClientProvider initialUser={user}>
              <CampaignProvider>
                <Navbar />
                {children}
              </CampaignProvider>
            </ClientProvider>
          </LocalStorageProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}

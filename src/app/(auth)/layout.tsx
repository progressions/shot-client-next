import ThemeRegistry from "@/components/ThemeRegistry"
import {
  CampaignProvider,
  ClientProvider,
  LocalStorageProvider,
} from "@/contexts"
import { getCurrentUser } from "@/lib/getServerClient"
import "@/styles/global.scss"

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <LocalStorageProvider>
            <ClientProvider initialUser={user}>
              <CampaignProvider>{children}</CampaignProvider>
            </ClientProvider>
          </LocalStorageProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}

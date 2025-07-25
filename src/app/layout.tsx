import ThemeRegistry from "@/components/ThemeRegistry"
import Navbar from "@/components/Navbar"
import { CampaignProvider, ClientProvider, LocalStorageProvider } from "@/contexts"
import { getUser } from "@/lib/getServerClient"

export default async function RootLayout({ children }: { children: React.ReactNode }) {
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

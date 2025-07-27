import ThemeRegistry from "@/components/ThemeRegistry"
import { Navbar } from "@/components/navbar"
import { CampaignProvider, ClientProvider, LocalStorageProvider } from "@/contexts"
import { getUser } from "@/lib/getServerClient"
import Breadcrumbs from "@/components/Breadcrumbs"
import "@/styles/global.scss"
import { Container } from "@mui/material"

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
                <Container maxWidth="md" sx={{ paddingTop: 2, paddingBottom: 2 }}>
                  <Breadcrumbs />
                  {children}
                </Container>
              </CampaignProvider>
            </ClientProvider>
          </LocalStorageProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}

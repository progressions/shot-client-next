import ThemeRegistry from "@/components/ThemeRegistry"
import { Navbar } from "@/components/navbar"
import {
  CampaignProvider,
  ClientProvider,
  LocalStorageProvider,
  ToastProvider,
} from "@/contexts"
import { getUser } from "@/lib/getServerClient"
import Breadcrumbs from "@/components/Breadcrumbs"
import "@/styles/global.scss"
import { Container } from "@mui/material"
import PopupToast from "@/components/PopupToast"

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <LocalStorageProvider>
            <ClientProvider initialUser={user}>
              <CampaignProvider>
                <ToastProvider>
                  <Navbar />
                  <Container
                    maxWidth="md"
                    sx={{ paddingTop: 2, paddingBottom: 2 }}
                  >
                    <Breadcrumbs />
                    {children}
                    <PopupToast />
                  </Container>
                </ToastProvider>
              </CampaignProvider>
            </ClientProvider>
          </LocalStorageProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}

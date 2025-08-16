import ThemeRegistry from "@/components/ThemeRegistry"
import { AppProvider, LocalStorageProvider, ToastProvider } from "@/contexts"
import { Navbar, Footer } from "@/components/ui"
import { getCurrentUser } from "@/lib/getServerClient"
import "@/styles/global.scss"
import { Container } from "@mui/material"
import PopupToast from "@/components/PopupToast"

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
            <AppProvider initialUser={user}>
              <ToastProvider>
                <Navbar user={user} />
                <Container
                  maxWidth="md"
                  sx={{ paddingTop: 2, paddingBottom: 2 }}
                >
                  {children}
                  <PopupToast />
                  <Footer />
                </Container>
              </ToastProvider>
            </AppProvider>
          </LocalStorageProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}

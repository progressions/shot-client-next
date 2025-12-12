import React from "react"
import ThemeRegistry from "@/components/ThemeRegistry"
import {
  AppProvider,
  LocalStorageProvider,
  ToastProvider,
  ConfirmProvider,
} from "@/contexts"
import { Navbar, Footer } from "@/components/ui"
import { OnboardingClientWrapper } from "@/components/onboarding"
import { getCurrentUser } from "@/lib"
import "@/styles/global.scss"
import { Container } from "@mui/material"
import PopupToast from "@/components/PopupToast"
import GlobalConfirmDialog from "@/components/GlobalConfirmDialog"

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
                <ConfirmProvider>
                  <Navbar user={user} />
                  <OnboardingClientWrapper />
                  <Container
                    maxWidth="md"
                    sx={{ paddingTop: 2, paddingBottom: 2 }}
                  >
                    {React.Children.map(children, child =>
                      React.isValidElement(child)
                        ? React.cloneElement(child, { user })
                        : child
                    )}
                    <PopupToast />
                    <GlobalConfirmDialog />
                    <Footer />
                  </Container>
                </ConfirmProvider>
              </ToastProvider>
            </AppProvider>
          </LocalStorageProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}

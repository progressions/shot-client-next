import ThemeRegistry from "@/components/ThemeRegistry"
import {
  AppProvider,
  LocalStorageProvider,
} from "@/contexts"
import { getCurrentUser } from "@/lib"
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
            <AppProvider initialUser={user}>
              {children}
            </AppProvider>
          </LocalStorageProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}

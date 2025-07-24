import ThemeRegistry from "@/components/ThemeRegistry"
import Navbar from "@/components/Navbar"
import { ClientProvider, LocalStorageProvider } from "@/contexts"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <LocalStorageProvider>
            <ClientProvider>
              <Navbar />
              {children}
            </ClientProvider>
          </LocalStorageProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}

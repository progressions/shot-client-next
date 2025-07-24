import ThemeRegistry from "@/components/ThemeRegistry"
import Navbar from "@/components/Navbar"
import { ClientProvider } from "@/contexts/ClientContext"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <ClientProvider>
            <Navbar />
            {children}
          </ClientProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
}

import ThemeRegistry from "@/components/ThemeRegistry"
import Navbar from "@/components/Navbar"
import { CampaignProvider, ClientProvider, LocalStorageProvider } from "@/contexts"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <LocalStorageProvider>
            <ClientProvider>
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

import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { ToasterContext } from "@/components/providers/toaster"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ToasterContext>
            {children}
          </ToasterContext>
        </Providers>
      </body>
    </html>
  )
} 
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/providers/auth-provider"
import { ProductProvider } from "@/providers/product-provider"
import { UniversityProvider } from "@/providers/university-provider"
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "UniStore - Campus Marketplace",
  description: "Buy, sell, and discover products within your university community",
    generator: 'Eric Alfred'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
          <AuthProvider>
            <UniversityProvider>
              <ProductProvider>{children}</ProductProvider>
            </UniversityProvider>
          </AuthProvider>
          <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}


import './globals.css'
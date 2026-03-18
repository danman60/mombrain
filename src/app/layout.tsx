import type { Metadata } from "next"
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400"],
})

export const metadata: Metadata = {
  title: "MomBrain — Family Productivity for Moms",
  description: "AI-powered family productivity app for moms. Meal planning, scheduling, task management, and more.",
  openGraph: {
    title: "MomBrain — Your Family's Second Brain",
    description: "AI-powered productivity for busy moms. Plan meals, manage schedules, track health, and keep your family organized.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakarta.variable} ${mono.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
        <script src="https://ddd-one-tawny.vercel.app/feedback-widget.js" data-project="MomBrain" data-color="#E11D48" defer />
      </body>
    </html>
  )
}

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Kirish",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-600 rounded-2xl shadow-lg shadow-violet-500/30 mb-4">
            <span className="text-2xl font-bold text-white">H</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Holva Factory CRM
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Professional boshqaruv tizimi
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}

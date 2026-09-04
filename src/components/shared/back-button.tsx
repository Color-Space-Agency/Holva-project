"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
}

export function BackButton({ href, label = "Ortga", className = "" }: BackButtonProps) {
  const router = useRouter()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        if (href) {
          router.push(href)
        } else if (typeof window !== "undefined" && window.history.length > 1) {
          router.back()
        } else {
          router.push("/dashboard")
        }
      }}
      className={`rounded-2xl gap-1.5 font-bold cursor-pointer bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 shadow-xs transition-all text-xs h-9 px-3 ${className}`}
      title="Ortga qaytish"
    >
      <ArrowLeft className="w-4 h-4 text-amber-600 shrink-0" />
      <span>{label}</span>
    </Button>
  )
}

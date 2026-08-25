"use client"

import { useState, useEffect, useRef } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"
import { BottomNav } from "./bottom-nav"
import type { Database } from "@/types/database"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface AdminShellProps {
  profile: Profile | null
  children: React.ReactNode
}

export function AdminShell({ profile, children }: AdminShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Mobil ekranlarda svayp orqali menyuni ochish / yopish
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      setTouchStartX(e.touches[0].clientX)
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX
      const swipeDistance = touchStartX - touchEndX

      // Chap qirradan o'ngga surilsa menyuni ochish (start < 50px va swipe right > 50px)
      if (touchStartX < 50 && swipeDistance < -50) {
        setMobileSidebarOpen(true)
      }
      // O'ngdan chapga surilsa menyuni yopish
      if (swipeDistance > 60 && mobileSidebarOpen) {
        setMobileSidebarOpen(false)
      }
    }

    const mainElement = mainRef.current
    if (mainElement && isMobile) {
      mainElement.addEventListener("touchstart", handleTouchStart, { passive: true })
      mainElement.addEventListener("touchend", handleTouchEnd, { passive: true })
    }

    return () => {
      if (mainElement) {
        mainElement.removeEventListener("touchstart", handleTouchStart)
        mainElement.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [touchStartX, mobileSidebarOpen, isMobile])

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar (Desktop va Mobil Drawer) */}
      <AdminSidebar
        profile={profile}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Asosiy kontent maydoni */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header with hamburger toggle */}
        <AdminHeader
          profile={profile}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />

        {/* Sahifa ichki kontenti */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 bg-gray-50/50 dark:bg-gray-950 pb-24 lg:pb-8 swipeable"
        >
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">{children}</div>
        </main>

        {/* Mobil Bottom Navigation paneli */}
        {isMobile && <BottomNav />}
      </div>
    </div>
  )
}

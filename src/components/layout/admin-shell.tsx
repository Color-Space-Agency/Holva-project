"use client"

import { useState, useEffect, useRef } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"
import { BottomNav } from "./bottom-nav"
import { AIAssistant } from "@/components/admin/ai-assistant"
import type { Database } from "@/types/database"
import { RefreshCw, Bot } from "lucide-react"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface AdminShellProps {
  profile: Profile | null
  children: React.ReactNode
}

export function AdminShell({ profile, children }: AdminShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isAIOpen, setIsAIOpen] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const [pullProgress, setPullProgress] = useState(0)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Mobil ekranlarda Svayp va Pull-To-Refresh hodisalari
  useEffect(() => {
    let startY = 0
    let pulling = false

    const handleTouchStart = (e: TouchEvent) => {
      const mainElement = mainRef.current
      if (mainElement && mainElement.scrollTop === 0) {
        startY = e.touches[0].clientY
        pulling = true
      }
      setTouchStartX(e.touches[0].clientX)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (pulling) {
        const pullDistance = e.touches[0].clientY - startY
        if (pullDistance > 20) {
          const progress = Math.min(1, pullDistance / 100)
          setPullProgress(progress)
          setIsPulling(true)
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const swipeDistance = touchStartX - e.changedTouches[0].clientX

      // Chap qirradan o'ngga surilsa menyuni ochish
      if (touchStartX < 50 && swipeDistance < -50) {
        setMobileSidebarOpen(true)
      }
      // O'ngdan chapga surilsa menyuni yopish
      if (swipeDistance > 60 && mobileSidebarOpen) {
        setMobileSidebarOpen(false)
      }

      // Pull-to-refresh
      if (pulling) {
        const pullDistance = e.changedTouches[0].clientY - startY
        if (pullDistance > 80) {
          window.dispatchEvent(new CustomEvent("pull-to-refresh"))
        }
        setIsPulling(false)
        setPullProgress(0)
        pulling = false
      }
    }

    const mainElement = mainRef.current
    if (mainElement && isMobile) {
      mainElement.addEventListener("touchstart", handleTouchStart, { passive: true })
      mainElement.addEventListener("touchmove", handleTouchMove, { passive: true })
      mainElement.addEventListener("touchend", handleTouchEnd, { passive: true })
    }

    return () => {
      if (mainElement) {
        mainElement.removeEventListener("touchstart", handleTouchStart)
        mainElement.removeEventListener("touchmove", handleTouchMove)
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Pull-to-refresh vizual indikatori */}
        {isPulling && (
          <div
            className="fixed top-16 left-0 right-0 z-40 flex items-center justify-center py-2 text-xs font-semibold text-amber-600 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xs transition-opacity shadow-sm"
            style={{ opacity: pullProgress }}
          >
            <span className="flex items-center gap-2">
              <RefreshCw className="animate-spin h-3.5 w-3.5" />
              Ma&apos;lumotlar yangilanmoqda...
            </span>
          </div>
        )}

        {/* Header with hamburger toggle */}
        <AdminHeader
          profile={profile}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />

        {/* Sahifa ichki kontenti */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 bg-gray-50/50 dark:bg-gray-950 pb-24 lg:pb-8 swipeable mobile-scroll"
        >
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">{children}</div>
        </main>

        {/* Floating AI Assistant Tugmasi (Desktop & Mobil) */}
        {!isAIOpen && (
          <button
            onClick={() => setIsAIOpen(true)}
            className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 z-40 p-3.5 lg:px-4 lg:py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white rounded-2xl shadow-xl shadow-amber-500/25 hover:shadow-2xl transition touch-press active:scale-95 flex items-center gap-2.5 cursor-pointer border border-amber-400/40"
            title="AI Yordamchi"
          >
            <Bot className="w-5 h-5 lg:w-6 lg:h-6" />
            <span className="font-bold text-xs sm:text-sm hidden sm:inline">AI Yordamchi</span>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
          </button>
        )}

        {/* AI Yordamchi Modali */}
        <AIAssistant
          isOpen={isAIOpen}
          onClose={() => setIsAIOpen(false)}
        />

        {/* Mobil Bottom Navigation paneli */}
        {isMobile && <BottomNav />}
      </div>
    </div>
  )
}

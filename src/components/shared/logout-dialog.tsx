"use client"

import { LogOut, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface LogoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // Ignore
    }

    // Barcha cookie va sessiyalarni tozalash
    document.cookie = "demo_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "sb-access-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "sb-refresh-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    
    // Faqat auth va sessiya kalitlarini tozalash (CRM ma'lumotlarini saqlab qolish)
    try {
      localStorage.removeItem("user_role")
      localStorage.removeItem("user_name")
      localStorage.removeItem("user_id")
      localStorage.removeItem("holva_user")
      sessionStorage.clear()
    } catch {
      // Ignore
    }

    toast.success("Hisobdan muvaffaqiyatli chiqildi")
    onOpenChange(false)

    // To'liq yangilangan holatda login sahifasiga o'tish
    window.location.href = "/login"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center border border-red-100 dark:border-red-900/50">
            <LogOut className="h-7 w-7" />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Tizimdan chiqish
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            Haqiqatan ham hisobingizdan chiqmoqchimisiz? Joriy sessiyangiz yakunlanadi.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="grid grid-cols-2 gap-3 mt-4 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl h-11 text-sm font-medium border-gray-200 dark:border-gray-700"
          >
            Bekor qilish
          </Button>
          <Button
            type="button"
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 text-sm font-semibold shadow-md shadow-red-500/20"
          >
            Ha, chiqish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

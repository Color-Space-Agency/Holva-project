"use client"

import { useState, useRef } from "react"
import { Eye, EyeOff, Lock, User, Award, TrendingUp, Package, ShieldCheck, Smartphone } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Noto'g'ri login yoki parol!")
        setIsLoading(false)
        return
      }

      localStorage.setItem("user_role", data.user?.role || "SUPER_ADMIN")
      localStorage.setItem("user_name", data.user?.full_name || "Super Admin")

      toast.success(`Xush kelibsiz, ${data.user?.full_name || "Foydalanuvchi"}!`)
      window.location.href = data.redirectUrl || "/dashboard"
    } catch {
      setError("Server bilan bog'lanishda xatolik yuz berdi")
      setIsLoading(false)
    }
  }

  const handleSelectRole = (roleName: string) => {
    setUsername(roleName)
    const pass = roleName === "SUPER ADMIN" ? "0321" : "0123"
    setPassword(pass)
    setError("")
    toast.info(`${roleName} tanlandi (Parol: ${pass}).`)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-7 sm:p-8 border border-gray-100 dark:border-gray-800 max-w-md w-full mx-auto animate-fade-in-up">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-600 to-amber-600 rounded-2xl shadow-lg shadow-violet-500/20 mb-3">
          <span className="text-3xl font-black text-white">H</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Holva Factory CRM
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          An&apos;anaviy ta&apos;m, zamonaviy ishlab chiqarish boshqaruvi
        </p>
      </div>

      <div className="flex justify-center gap-4 mb-6 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-1.5 font-medium">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>Sifatli</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          <span>Samarali</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <Package className="w-3.5 h-3.5 text-violet-500" />
          <span>Zamonaviy</span>
        </div>
      </div>

      {/* Profilni tezkor tanlash */}
      <div className="mb-5 space-y-2">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block text-center">
          Profilni tanlash:
        </span>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleSelectRole("SUPER ADMIN")}
            className="flex items-center gap-2 p-3 rounded-2xl border border-violet-100 dark:border-violet-900/40 bg-violet-50/50 dark:bg-violet-950/20 hover:bg-violet-100/70 dark:hover:bg-violet-900/30 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <ShieldCheck size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-violet-950 dark:text-violet-200 truncate">
                SUPER ADMIN
              </p>
              <p className="text-[10px] text-violet-500 dark:text-violet-400">
                To&apos;liq boshqaruv
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectRole("Sotuv agent")}
            className="flex items-center gap-2 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/30 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Smartphone size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200 truncate">
                Sotuv agent
              </p>
              <p className="text-[10px] text-emerald-500 dark:text-emerald-400">
                Mobil savdo
              </p>
            </div>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border-l-4 border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-4 text-xs font-medium animate-shake">
          {error}
        </div>
      )}

      {/* Login form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
            Foydalanuvchi nomi
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10 h-11 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-sm"
              placeholder="SUPER ADMIN, Sotuv agent yoki admin"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Parol
            </label>
            <span className="text-[11px] text-violet-600 dark:text-violet-400">
              Ixtiyoriy (bo'sh qoldirish mumkin)
            </span>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              ref={passwordInputRef}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-11 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-sm"
              placeholder="Parolni kiriting (ixtiyoriy)..."
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition duration-200 shadow-lg shadow-violet-500/25 mt-2"
        >
          {isLoading ? "Tekshirilmoqda..." : "Tizimga kirish →"}
        </Button>
      </form>

      <div className="mt-6 text-center text-[11px] text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
        Holva Factory CRM v2.0 © {new Date().getFullYear()}
      </div>
    </div>
  )
}

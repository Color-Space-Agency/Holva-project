"use client"

import { useState, useRef } from "react"
import { Eye, EyeOff, LogIn, Loader2, ShieldCheck, Smartphone, KeyRound, User } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const router = useRouter()
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const cleanUser = username.trim().toLowerCase()
    const cleanPass = password.trim()

    // 1. SUPER ADMIN TEKSHIRUVI (Login: SUPER ADMIN, Parol: 0321)
    if (
      (cleanUser === "super admin" || cleanUser === "superadmin" || cleanUser === "admin" || cleanUser === "admin@holva.uz") &&
      cleanPass === "0321"
    ) {
      document.cookie = "demo_session=SUPER_ADMIN; path=/; max-age=86400"
      localStorage.setItem("user_role", "SUPER_ADMIN")
      localStorage.setItem("user_name", "Super Admin")
      toast.success("Xush kelibsiz, Super Admin!")
      window.location.href = "/dashboard"
      return
    }

    // 2. SOTUV AGENTI TEKSHIRUVI (Login: Sotuv agent, Parol: 0123)
    if (
      (cleanUser === "sotuv agent" || cleanUser === "sotuvagent" || cleanUser === "agent" || cleanUser === "agent@holva.uz") &&
      cleanPass === "0123"
    ) {
      document.cookie = "demo_session=SALES_AGENT; path=/; max-age=86400"
      localStorage.setItem("user_role", "SALES_AGENT")
      localStorage.setItem("user_name", "Sardor Rahimov (Sotuv Agenti)")
      toast.success("Xush kelibsiz, Sotuv Agenti!")
      window.location.href = "/agent/home"
      return
    }

    // 3. Supabase Auth bilan sinab ko'rish
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username.includes("@") ? username : `${cleanUser}@holva.uz`,
        password: password,
      })

      if (!error && data.user) {
        document.cookie = "demo_session=ADMIN; path=/; max-age=86400"
        toast.success("Muvaffaqiyatli kirildi!")
        window.location.href = "/dashboard"
        return
      }
    } catch {
      // Ignore
    }

    setIsLoading(false)
    toast.error("Login yoki parol noto'g'ri! Iltimos, qaytadan tekshiring.")
  }

  const handleSelectRole = (roleName: string) => {
    setUsername(roleName)
    setPassword("")
    toast.info(`${roleName} tanlandi. Parolingizni kiriting.`)
    setTimeout(() => {
      passwordInputRef.current?.focus()
    }, 100)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-violet-500/5 dark:shadow-gray-950/50 p-7 sm:p-8 border border-gray-100 dark:border-gray-800 max-w-md w-full mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Tizimga kirish
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Holva Factory CRM boshqaruv tizimi
        </p>
      </div>

      {/* Profilni tanlash tugmalari (parolsiz) */}
      <div className="mb-6 space-y-2">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block text-center">
          Profilni tanlash:
        </span>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleSelectRole("SUPER ADMIN")}
            className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-center group cursor-pointer ${
              username === "SUPER ADMIN"
                ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20"
                : "bg-violet-50 hover:bg-violet-100/80 dark:bg-violet-950/40 dark:hover:bg-violet-900/40 text-violet-800 dark:text-violet-200 border-violet-200/60 dark:border-violet-800/50"
            }`}
          >
            <ShieldCheck className={`h-5 w-5 mb-1 ${username === "SUPER ADMIN" ? "text-white" : "text-violet-600 dark:text-violet-400"}`} />
            <span className="text-xs font-bold">SUPER ADMIN</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectRole("Sotuv agent")}
            className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-center group cursor-pointer ${
              username === "Sotuv agent"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20"
                : "bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-200/60 dark:border-emerald-800/50"
            }`}
          >
            <Smartphone className={`h-5 w-5 mb-1 ${username === "Sotuv agent" ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`} />
            <span className="text-xs font-bold">Sotuv agent</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-gray-400" />
            Login / Foydalanuvchi nomi
          </label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="SUPER ADMIN yoki Sotuv agent"
            required
            className="h-11 rounded-xl text-sm border-gray-200 dark:border-gray-700"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <KeyRound className="h-3.5 w-3.5 text-gray-400" />
            Parol
          </label>
          <div className="relative">
            <Input
              ref={passwordInputRef}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parolni kiriting..."
              required
              className="h-11 rounded-xl pr-10 text-sm border-gray-200 dark:border-gray-700"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold gap-2 shadow-lg shadow-violet-500/20 cursor-pointer mt-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          Tizimga kirish
        </Button>
      </form>
    </div>
  )
}

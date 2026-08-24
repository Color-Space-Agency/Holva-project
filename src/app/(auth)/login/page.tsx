"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, LogIn, Loader2, ShieldCheck, Smartphone } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const loginSchema = z.object({
  email: z.string().email("Noto'g'ri email manzil"),
  password: z.string().min(6, "Parol kamida 6 ta belgi bo'lishi kerak"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        if (error.message.includes("Invalid login credentials") || error.message.includes("fetch")) {
          // Demo fallback
          document.cookie = `demo_session=ADMIN; path=/; max-age=86400`
          toast.success("Demo rejimda kirildi (Admin)")
          router.push("/dashboard")
          router.refresh()
          return
        }
        toast.error(error.message)
        return
      }

      toast.success("Muvaffaqiyatli kirildi!")
      router.push("/dashboard")
      router.refresh()
    } catch {
      // Demo fallback on connection error
      document.cookie = `demo_session=ADMIN; path=/; max-age=86400`
      toast.success("Demo rejimda kirildi")
      router.push("/dashboard")
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = (role: "ADMIN" | "SALES_AGENT") => {
    document.cookie = `demo_session=${role}; path=/; max-age=86400`
    if (role === "ADMIN") {
      toast.success("Admin paneli ochilmoqda...")
      router.push("/dashboard")
    } else {
      toast.success("Sotuv agenti ilovasi ochilmoqda...")
      router.push("/agent/home")
    }
    router.refresh()
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-gray-950/50 p-8 border border-gray-100 dark:border-gray-800">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Tizimga kirish
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Hisobingizga kiring yoki tezkor demo orqali sinab ko&apos;ring
      </p>

      {/* Quick Demo Access Buttons */}
      <div className="mb-6 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => handleQuickLogin("ADMIN")}
          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-violet-50 hover:bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:hover:bg-violet-900/50 dark:text-violet-300 rounded-xl text-xs font-semibold border border-violet-200/60 dark:border-violet-800/50 transition-all cursor-pointer"
        >
          <ShieldCheck className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          <span>Admin sifatida</span>
        </button>
        <button
          type="button"
          onClick={() => handleQuickLogin("SALES_AGENT")}
          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 dark:text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-200/60 dark:border-emerald-800/50 transition-all cursor-pointer"
        >
          <Smartphone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Sotuv Agenti (Mobile)</span>
        </button>
      </div>

      <div className="relative flex py-2 items-center mb-4">
        <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
        <span className="flex-shrink mx-3 text-xs text-gray-400">yoki email orqali</span>
        <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email manzil
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="admin@holva.uz"
            autoComplete="email"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Parol
          </label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <LogIn className="h-5 w-5" />
              <span>Kirish</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

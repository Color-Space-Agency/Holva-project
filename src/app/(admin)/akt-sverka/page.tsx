import { AktSverkaClient } from "@/components/finance/akt-sverka-client"
import { BackButton } from "@/components/shared/back-button"

export const metadata = {
  title: "Akt Sverka",
}

export default function AktSverkaPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-3">
        <BackButton />
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Akt Sverka (Solishtirma dalolatnoma)</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Mijozlar bilan oldi-berdi, qarzdorlik va to'lovlarni sanadan sanagacha kalendar orqali hisob-kitob qilish bo'limi.
          </p>
        </div>
      </div>

      <AktSverkaClient />
    </div>
  )
}

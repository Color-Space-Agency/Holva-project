# 🍯 Halva Factory CRM / POS Tizimi

Kichik va o'sib borayotgan holva ishlab chiqaruvchi fabrika uchun to'liq avtomatlashtirilgan, ishlab chiqarishga tayyor (production-ready) Web + Mobile CRM va POS ekotizimi.

---

## 🚀 Texnologiyalar

- **Frontend:** Next.js 16 (App Router, Turbopack), React 19, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui, Lucide Icons, Framer Motion
- **State Management & Caching:** TanStack React Query v5, Zustand
- **Backend & Database:** Supabase (PostgreSQL, Row Level Security - RLS, Storage, Auth)
- **Charts & Export:** Recharts, jsPDF, ExcelJS, PapaParse
- **PWA:** Service Worker, Web App Manifest (Offline qo'llab-quvvatlash)

---

## 📦 Tizim Modullari

1. **Dashboard & Analitika:**
   - Real-vaqtli KPI ko'rsatkichlar (Daromad, Buyurtmalar, Ishlab chiqarish, Qarzlar)
   - Kunlik, haftalik, oylik va yillik tushum hamda buyurtmalar dinamikasi grafiklari
2. **Mahsulotlar (Products):**
   - Holva turlari katalogi, toifalar, o'lchov birliklari, rasm yuklash (Storage)
3. **Xomashyo (Raw Materials):**
   - Xomashyolar ro'yxati, minimal qoldiq ogohlantirishlari, ta'minotchilar bilan ishlash
4. **Retseptlar (Recipes):**
   - Dinamik retsept tuzish, xomashyo tannarxi va 1 kg mahsulot xarajatini avtomatik hisoblash, versiyalar tarixi
5. **Ombor va Inventar (Warehouse):**
   - Tayyor mahsulotlar va Xomashyo ombori
   - Qoldiqlar monitoringi, kam qolgan tovarlar bildirishnomasi
   - Kirim, chiqim, spetsifikatsiya va brak (Waste) hisobi
   - CSV / Excel eksport
6. **Ishlab chiqarish (Production Batches):**
   - Ishlab chiqarish partiyalari (Planned, In Progress, Completed)
   - Retsept asosida xomashyo sarfini bron qilish va avtomatik hisobdan chiqarish
   - Ishlab chiqarish samaradorligi (% efficiency)
7. **Do'konlar va Mijozlar (Stores):**
   - Do'konlar ro'yxati, aloqa ma'lumotlari, qarz limiti, to'lov muddati
   - Do'kon sahifasida buyurtmalar, to'lovlar va yetkazmalar tarixi
8. **Buyurtmalar (Orders) & POS:**
   - Yangi buyurtma yaratish (do'kon, agent, tovarlar, chegirmalar, qarz hisobi)
   - Buyurtma holatlari tarixi (Timeline)
9. **Yetkazib berish (Delivery):**
   - Haydovchi va mashina ma'lumotlari, yetkazib berish statuslari
10. **HR & Xodimlar:**
    - Xodimlar ma'lumotlari va rasmlari
    - Keldi-ketdi (Davomat) tizimi (Vaqt hisobi, kechikish daqiqalari)
11. **Moliya (Finance):**
    - Kassa holati va operatsiyalari (Kirim / Chiqim)
    - Xarajatlar toifalari bo'yicha Recharts doiraviy diagrammasi
12. **Hisobotlar & Eksport (Reports):**
    - Sotuv, moliya, ombor va xodimlar hisobotlari
    - PDF, Excel (.xlsx) va CSV formatlarida yuklab olish
13. **Sotuv Agentlari uchun Mobile UI (PWA):**
    - Maxsus mobil interfeys (`/agent/home`, `/agent/stores`, `/agent/orders`, `/agent/visits`, `/agent/profile`)
    - Mobil buyurtma berish drawer'i, tashriflarni belgilash (Visits)
14. **Sozlamalar (Settings):**
    - Fabrika profili, foydalanuvchi ma'lumotlari, parolni o'zgartirish, bildirishnoma sozlamalari

---

## 🛠 O'rnatish va Ishga Tushirish

### 1. Repository va Paketlar
```bash
npm install
```

### 2. Supabase Sozlash
1. [supabase.com](https://supabase.com) ga kiring va yangi loyiha oching.
2. `supabase/migrations/001_initial_schema.sql` fayli ichidagi barcha SQL kodini Supabase **SQL Editor** bo'limida ishga tushiring.
3. Supabase Dashboard -> **Storage** bo'limida `factory-assets` nomli public bucket yarating.
4. `.env.local` fayliga Supabase URL va Anon kalitlarini kiriting:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Loyihani Ishga Tushirish
```bash
# Rivojlantirish rejimi
npm run dev

# Production build
npm run build
npm start
```

---

## 📱 PWA O'rnatish
Mobil qurilmalarda (Android / iOS) yoki brauzerda **"Add to Home Screen"** / **"Ilovani o'rnatish"** tugmasi orqali to'g'ridan-to'g'ri mustaqil ilova sifatida o'rnatish mumkin.

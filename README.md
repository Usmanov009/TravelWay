# TravelWay — Turizm Platformasi & Flutter Mobile App

TravelWay — bu O'zbekiston sayyohlari uchun eng so'nggi charter narxlari, qaynoq takliflar va **Kompas Tour (online.uz.kompastour.com)** tizimi bilan 1:1 jonli integratsiya qilingan to'liq platforma.

---

## 🚀 Loyihaning tarkibi

1. **Backend & Web App (Node.js + Express + Vite)**
   - Port: `http://localhost:3000`
   - **Kompas Tour Live Scraper**: `/api/kompas/search` va `/api/kompas/hot` (1:1 haqiqiy narxlar va qoldiq o'rinlar)
   - **Xizmatlar**: Combo turlar (`/api/combo/tours`), Aviabiletlar (`/api/flights/search`), Faqat mehmonxonalar (`/api/hotels/search`)
   - **Baza**: MongoDB integratsiyasi va xotirada tezkor zaxira (Buyurtmalar, Narx signallari, Admin)
   - **Telegram Bot**: `@mytravelwaybot`

2. **Flutter Mobil Ilova (`travelway_app`)**
   - **Jonli Kompas integratsiyasi**: Backend orqali hamda backend offline bo'lganda to'g'ridan-to'g'ri `online.uz.kompastour.com` dan jonli ma'lumot olish mexanizmi
   - **5 ta asosiy bo'lim**:
     - 🔍 **Qidiruv**: Toshkent, Samarqand, Buxorodan Turkiya, Dubay, Misr, Maldiv, Tailand va boshqa mamlakatlarga jonli turpaketlar qidiruvi
     - 🔥 **Qaynoq**: Chegirmali so'nggi o'rinlar, tirik vaqt hisoblagichlari va tezkor bron
     - 🧰 **Xizmatlar**: Combo turlar, Aviabiletlar va Mehmonxonalar
     - 🧳 **Turlarim**: Buyurtmalar tarixi, vaucherlar va PDF ma'lumotlari
     - 👤 **Profil**: Server holati monitori, URL sozlash, Telegram bot va Admin paneli
   - **Interaktiv modallar**: Turpaketni to'lov bilan band qilish (Payme, Click, Uzum, Visa) va narx tushishini kuzatuvchi avtomatlashtirilgan "Narx signali" (Price Alert).

---

## 🛠 Ishga tushirish bo'yicha qo'llanma

### 1. Backend serverni ishga tushirish:
```bash
# Asosiy jildda:
npm run start
# yoki
npx tsx server.ts
```
Server `http://localhost:3000` manzilida ishga tushadi.

### 2. Flutter ilovasini ishga tushirish:
```bash
cd travelway_app

# Bog'liqliklarni yangilash:
flutter pub get

# 1. Chrome brauzerida ochish:
flutter run -d chrome

# 2. Windows Desktop dastur sifatida ochish:
flutter run -d windows

# 3. Android emulyatorda ochish:
flutter run -d android
```

> **Eslatma (Android Emulyator):**
> Android emulyatordan kompyuterdagi backendga ulanish uchun Profil bo'limidagi **"URL Sozlash"** tugmasini bosib manzilni `http://10.0.2.2:3000` ga o'zgartirishingiz mumkin.
> Haqiqiy smartfonda sinash uchun esa kompyuteringizning mahalliy Wi-Fi IP manzilini (masalan, `http://192.168.1.X:3000`) kiritishingiz kifoya.

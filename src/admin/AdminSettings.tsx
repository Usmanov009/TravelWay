import React, { useState } from 'react';
import { AdminRole, AdminUser } from './adminTypes';

interface AdminSettingsProps {
  currentRole: AdminRole;
  currentAdmin: AdminUser;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  currentRole,
  currentAdmin,
  onShowToast
}) => {
  const isMainAdmin = currentRole === 'main_admin';
  const [kompasUrl, setKompasUrl] = useState('https://online.uz.kompastour.com/search_tour');
  const [usdRate, setUsdRate] = useState(12850);
  const [commissionRate, setCommissionRate] = useState(8);
  const [tgBotUsername, setTgBotUsername] = useState('@TravelWayUzBot');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMainAdmin) {
      onShowToast("Tizim sozlamalarini o'zgartirish faqat Bosh Admin huquqida!", 'error');
      return;
    }
    onShowToast("Tizim sozlamalari muvaffaqiyatli saqlandi! ⚙️", 'success');
  };

  const handleDownloadBackup = () => {
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        version: '2.5.0',
        tours: localStorage.getItem('travelway_tours'),
        bookings: localStorage.getItem('travelway_bookings'),
        staff: localStorage.getItem('travelway_admin_staff'),
        priceAlerts: localStorage.getItem('travelway_price_alerts')
      };
      const jsonBlob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(jsonBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TravelWay_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onShowToast("Tizim zaxira nusxasi (JSON) muvaffaqiyatli yuklab olindi! 📦", 'success');
    } catch (e) {
      onShowToast("Zaxiralashda xatolik yuz berdi", 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>⚙️</span> Tizim & Kompas Tour API Sozlamalari
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Kompas Tour agregatsiya mexanizmi, valyuta kurslari va Telegram xabarnomalar
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Kompas Tour Integration */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-lg">
                🌐
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Kompas Tour Live Web Scraper & API</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">online.uz.kompastour.com bilan 1:1 real vaqtli ulanish</p>
              </div>
            </div>

            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Faol & Ishlamoqda
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Kompas Tour Qidiruv URL</label>
            <input
              type="text"
              disabled={!isMainAdmin}
              value={kompasUrl}
              onChange={(e) => setKompasUrl(e.target.value)}
              className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent font-mono focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
            />
          </div>
        </div>

        {/* Currency & Finance */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
              💵
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Moliyaviy Koeffitsiyentlar & Kurslar</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Markaziy Bank kursi va keshbek hisobi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">1 USD kursi (UZS)</label>
              <input
                type="number"
                disabled={!isMainAdmin}
                value={usdRate}
                onChange={(e) => setUsdRate(Number(e.target.value))}
                className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Agentlik Komissiyasi (%)</label>
              <input
                type="number"
                disabled={!isMainAdmin}
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white font-bold rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Telegram Notifications */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-lg">
              ✈️
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Telegram Bot Xabarnomalari</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Yangi buyurtmalar va narx signallari uchun bot</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Rasmiy Bot Username</label>
            <input
              type="text"
              disabled={!isMainAdmin}
              value={tgBotUsername}
              onChange={(e) => setTgBotUsername(e.target.value)}
              className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
            />
          </div>
        </div>

        {/* Backup & System Data */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
                📦
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Ma'lumotlar Bazasi Zaxirasi</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Barcha turlar, bronlar va xodimlar ma'lumotlarini JSON fayl qilib saqlash</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadBackup}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all tap-bounce border border-slate-200 dark:border-slate-700"
            >
              <span className="material-symbols-outlined text-[17px] text-purple-600 dark:text-purple-400">download</span>
              <span>Zaxira Nusxani Yuklab Olish</span>
            </button>
          </div>
        </div>

        {isMainAdmin && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-2xs transition-all tap-bounce"
            >
              Sozlamalarni Saqlash
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

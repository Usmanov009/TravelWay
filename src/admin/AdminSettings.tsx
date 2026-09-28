import React, { useState } from 'react';
import { AdminRole, AdminUser } from './adminTypes';

interface AdminSettingsProps {
  currentRole: AdminRole;
  currentAdmin: AdminUser;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
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
    onShowToast("Tizim sozlamalari muvaffaqiyatli saqlandi!", 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-[#11142d] dark:text-white flex items-center gap-2">
          <span>⚙️</span> Tizim & Kompas Tour API Sozlamalari
        </h2>
        <p className="text-xs text-[#777e89] dark:text-[#a39db0] mt-0.5">
          Kompas Tour agregatsiya mexanizmi, valyuta kurslari va Telegram xabarnomalar
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Kompas Tour Integration */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1e1a23] border border-[#e5eaef] dark:border-white/10 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#e0f7fa] dark:bg-[#0891b2]/10 text-[#0891b2] dark:text-cyan-400 flex items-center justify-center font-bold text-lg">
                🌐
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#11142d] dark:text-white">Kompas Tour Live Web Scraper & API</h4>
                <p className="text-xs text-[#777e89] dark:text-[#a39db0]">online.uz.kompastour.com bilan 1:1 real vaqtli ulanish</p>
              </div>
            </div>

            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Faol & Ishlamoqda
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-[#11142d] dark:text-white block mb-1">Kompas Tour Qidiruv URL</label>
            <input
              type="text"
              disabled={!isMainAdmin}
              value={kompasUrl}
              onChange={(e) => setKompasUrl(e.target.value)}
              className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-white/10 font-mono focus:border-[#0891b2] focus:outline-none"
            />
          </div>
        </div>

        {/* Currency & Finance */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1e1a23] border border-[#e5eaef] dark:border-white/10 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
              💵
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#11142d] dark:text-white">Moliyaviy Koeffitsiyentlar & Kurslar</h4>
              <p className="text-xs text-[#777e89] dark:text-[#a39db0]">Markaziy Bank kursi va keshbek hisobi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#11142d] dark:text-white block mb-1">1 USD kursi (UZS)</label>
              <input
                type="number"
                disabled={!isMainAdmin}
                value={usdRate}
                onChange={(e) => setUsdRate(Number(e.target.value))}
                className="w-full bg-[#f4f6f9] dark:bg-white/5 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-white/10 focus:border-[#0891b2] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#11142d] dark:text-white block mb-1">Agentlik Komissiyasi (%)</label>
              <input
                type="number"
                disabled={!isMainAdmin}
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white font-bold rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-white/10 focus:border-[#0891b2] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Telegram Notifications */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1e1a23] border border-[#e5eaef] dark:border-white/10 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
              ✈️
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#11142d] dark:text-white">Telegram Bot Xabarnomalari</h4>
              <p className="text-xs text-[#777e89] dark:text-[#a39db0]">Yangi buyurtmalar va narx signallari uchun bot</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#11142d] dark:text-white block mb-1">Rasmiy Bot Username</label>
            <input
              type="text"
              disabled={!isMainAdmin}
              value={tgBotUsername}
              onChange={(e) => setTgBotUsername(e.target.value)}
              className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-white/10 focus:border-[#0891b2] focus:outline-none"
            />
          </div>
        </div>

        {isMainAdmin && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0891b2] hover:bg-[#0e7490] text-white font-bold text-xs shadow-sm shadow-[#0891b2]/20 transition-all tap-bounce"
            >
              Sozlamalarni Saqlash
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

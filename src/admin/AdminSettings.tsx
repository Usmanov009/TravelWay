import React, { useState, useEffect } from 'react';
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
  const [commissionRate, setCommissionRate] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('travelway_agency_commission');
      if (saved) return Number(saved);
    } catch (e) {}
    return 8;
  });
  const [tgBotUsername, setTgBotUsername] = useState('@mytravelwaybot');
  const [isSavingCommission, setIsSavingCommission] = useState(false);

  // Sync commission from backend
  useEffect(() => {
    fetch('/api/admin/commission')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && typeof data.commissionRate === 'number') {
          setCommissionRate(data.commissionRate);
          try {
            localStorage.setItem('travelway_agency_commission', String(data.commissionRate));
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCommission(true);

    try {
      // 1. Save commission (accessible to all admins: both Main Admin and Tour Admin)
      const cleanCommission = Math.max(0, Math.min(100, Number(commissionRate) || 0));
      setCommissionRate(cleanCommission);

      try {
        localStorage.setItem('travelway_agency_commission', String(cleanCommission));
      } catch (e) {}

      await fetch('/api/admin/commission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissionRate: cleanCommission })
      });

      if (isMainAdmin) {
        onShowToast(`Tizim sozlamalari va agentlik komissiyasi (${cleanCommission}%) muvaffaqiyatli saqlandi! ⚙️`, 'success');
      } else {
        onShowToast(`Agentlik komissiyasi (${cleanCommission}%) muvaffaqiyatli saqlandi! 💼`, 'success');
      }
    } catch (err) {
      onShowToast("Sozlamalarni saqlashda xatolik yuz berdi", 'error');
    } finally {
      setIsSavingCommission(false);
    }
  };

  const handleDownloadBackup = () => {
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        version: '2.5.0',
        tours: localStorage.getItem('travelway_tours'),
        bookings: localStorage.getItem('travelway_bookings'),
        staff: localStorage.getItem('travelway_admin_staff'),
        priceAlerts: localStorage.getItem('travelway_price_alerts'),
        commissionRate: localStorage.getItem('travelway_agency_commission') || 8
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
          Kompas Tour agregatsiya mexanizmi, agentlik komissiyasi va bildirishnomalar
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Agency Commission (Editable and Savable by BOTH Tour Admins & Main Admin) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                💼
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Agentlik Komissiyasi</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Turpaketlar va biletlar narxiga qo'llaniladigan agentlik ustamasi
                </p>
              </div>
            </div>

            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-800/60">
              Faol: {commissionRate}%
            </span>
          </div>

          <div className="max-w-md">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Agentlik Komissiyasi (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 font-bold text-sm rounded-xl pl-3 pr-10 py-2.5 border border-slate-200/80 dark:border-slate-700/80 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                placeholder="Masalan: 8"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                %
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
              {isMainAdmin 
                ? "Tur adminlar hamda bosh admin tomonidan istalgan vaqtda o'zgartirilishi mumkin."
                : "Tur Admin sifatida siz ushbu komissiya foizini o'zgartirish va saqlash huquqiga egasiz."}
            </p>
          </div>
        </div>

        {/* 2. Kompas Tour Integration */}
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
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Kompas Tour Qidiruv URL {isMainAdmin ? '' : '(Faqat Bosh Admin tahrirlay oladi)'}
            </label>
            <input
              type="text"
              disabled={!isMainAdmin}
              value={kompasUrl}
              onChange={(e) => setKompasUrl(e.target.value)}
              className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent font-mono focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none disabled:opacity-60"
            />
          </div>
        </div>

        {/* 3. Telegram Notifications */}
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
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Rasmiy Bot Username {isMainAdmin ? '' : '(Faqat Bosh Admin tahrirlay oladi)'}
            </label>
            <input
              type="text"
              disabled={!isMainAdmin}
              value={tgBotUsername}
              onChange={(e) => setTgBotUsername(e.target.value)}
              className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none disabled:opacity-60"
            />
          </div>
        </div>

        {/* 4. Backup & System Data */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
                📦
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Ma'lumotlar Bazasi Zaxirasi</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Barcha turlar, bronlar va ma'lumotlarni JSON fayl qilib saqlash</p>
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

        {/* Save Button: Available for BOTH Main Admin and Tour Admin */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSavingCommission}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-2xs transition-all tap-bounce disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>
              {isMainAdmin ? "Barcha Sozlamalarni Saqlash" : "Agentlik Komissiyasini Saqlash"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

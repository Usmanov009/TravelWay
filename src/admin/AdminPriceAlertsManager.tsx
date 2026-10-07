import React, { useState } from 'react';
import { PriceAlert, TourPackage } from '../types';
import { AdminRole, AdminUser } from './adminTypes';

interface AdminPriceAlertsManagerProps {
  currentRole: AdminRole;
  currentAdmin: AdminUser;
  priceAlerts: PriceAlert[];
  tours: TourPackage[];
  onSimulatePriceDrop: (tourId: string, price: number) => void;
  onDeletePriceAlert?: (alertId: string) => void;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  globalSearch?: string;
}

export const AdminPriceAlertsManager: React.FC<AdminPriceAlertsManagerProps> = ({
  currentRole,
  currentAdmin,
  priceAlerts,
  tours,
  onSimulatePriceDrop,
  onDeletePriceAlert,
  onShowToast,
  globalSearch = ''
}) => {
  const [search, setSearch] = useState('');

  const handleApplyDiscount = (alert: PriceAlert) => {
    const newPrice = Math.max(100, alert.targetPrice - 20);
    onSimulatePriceDrop(alert.tourId, newPrice);
    onShowToast(
      `🔥 "${alert.tourTitle}" uchun narx $${newPrice} ga tushirildi! Mijozga bildirishnoma jo'natildi.`,
      'success'
    );
  };

  const effectiveSearch = (search || globalSearch).trim().toLowerCase();

  const filtered = priceAlerts.filter(a =>
    !effectiveSearch ||
    a.tourTitle.toLowerCase().includes(effectiveSearch) ||
    a.tourLocation.toLowerCase().includes(effectiveSearch) ||
    (a.userEmail && a.userEmail.toLowerCase().includes(effectiveSearch))
  );

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>🔔</span> Mijozlar Narx Signallari ({priceAlerts.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mijozlar ilovada narxi tushishini kutayotgan turlar va ularning target narxlari
          </p>
        </div>
      </div>

      {/* 2. Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tur nomi, joylashuv yoki mijoz emaili..."
            className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 pl-9 pr-7 py-2 rounded-xl text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. Table */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5">Tur Nomi</th>
                <th className="py-3.5 px-3">Hozirgi Narx</th>
                <th className="py-3.5 px-3">Kutilayotgan Narx</th>
                <th className="py-3.5 px-3">Mijoz / Kanal</th>
                <th className="py-3.5 px-3">Sana & Holat</th>
                <th className="py-3.5 pr-5 text-right">Aksiya Qo'llash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    Narx signallari topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={alert.tourImg}
                          alt=""
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-[200px]">
                            {alert.tourTitle}
                          </p>
                          <p className="text-[10px] text-slate-400">{alert.tourLocation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">${alert.currentPrice}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center text-xs font-bold font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60">
                        &lt; ${alert.targetPrice}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">{alert.userEmail || "Sayohatchi"}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-sky-600 dark:text-sky-400 font-semibold">
                        {alert.notifyViaTelegram && <span>Telegram ✈️</span>}
                        {alert.notifyViaPush && <span>Push 🔔</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{alert.createdAt}</span>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Faol signal</p>
                    </td>
                    <td className="py-3.5 pr-5 text-right">
                      <button
                        onClick={() => handleApplyDiscount(alert)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs transition-all tap-bounce"
                        title="Mijoz kutgan narxdan pastroq narx belgilash va darhol bildirishnoma jo'natish"
                      >
                        Aksiya Berish 🔥
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

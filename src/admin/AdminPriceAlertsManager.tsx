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
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminPriceAlertsManager: React.FC<AdminPriceAlertsManagerProps> = ({
  currentRole,
  currentAdmin,
  priceAlerts,
  tours,
  onSimulatePriceDrop,
  onDeletePriceAlert,
  onShowToast
}) => {
  const [search, setSearch] = useState('');

  const handleApplyDiscount = (alert: PriceAlert) => {
    // Discount the tour price to below the target price
    const newPrice = Math.max(100, alert.targetPrice - 20);
    onSimulatePriceDrop(alert.tourId, newPrice);
    onShowToast(
      `🔥 "${alert.tourTitle}" uchun narx $${newPrice} ga tushirildi! Mijozga bildirishnoma jo'natildi.`,
      'success'
    );
  };

  const filtered = priceAlerts.filter(a =>
    a.tourTitle.toLowerCase().includes(search.toLowerCase()) ||
    a.tourLocation.toLowerCase().includes(search.toLowerCase()) ||
    (a.userEmail && a.userEmail.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#11142d] dark:text-white flex items-center gap-2">
            <span>🔔</span> Mijozlar Narx Signallari ({priceAlerts.length})
          </h2>
          <p className="text-xs text-[#777e89] dark:text-[#a39db0] mt-0.5">
            Mijozlar ilovada narxi tushishini kutayotgan turlar va ularning target narxlari
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-[#1e1a23] border border-[#e5eaef] dark:border-white/10 shadow-sm">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#777e89] dark:text-[#a39db0] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tur nomi, joylashuv yoki mijoz emaili..."
            className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white placeholder-[#777e89] dark:placeholder-[#a39db0] pl-9 pr-3 py-2 rounded-xl text-xs border border-[#e5eaef] dark:border-white/10 focus:outline-none focus:border-[#0891b2]"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e1a23] rounded-2xl border border-[#e5eaef] dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fafbfb] dark:bg-white/5 border-b border-[#e5eaef] dark:border-white/10 text-[#777e89] dark:text-[#a39db0] text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-4">Tur Nomi</th>
                <th className="py-3.5">Hozirgi Narx</th>
                <th className="py-3.5">Kutilayotgan Narx</th>
                <th className="py-3.5">Mijoz / Kanal</th>
                <th className="py-3.5">Sana / Holat</th>
                <th className="py-3.5 pr-4 text-right">Aksiya Qo'llash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5eaef] dark:divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#777e89] dark:text-[#a39db0]">
                    Narx signallari topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((alert) => (
                  <tr key={alert.id} className="hover:bg-[#f4f6f9]/60 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 pl-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={alert.tourImg}
                          alt=""
                          className="w-11 h-11 rounded-xl object-cover border border-[#e5eaef] dark:border-white/10 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[#11142d] dark:text-white text-xs truncate max-w-[200px]">
                            {alert.tourTitle}
                          </p>
                          <p className="text-[10px] text-[#777e89] dark:text-[#a39db0]">{alert.tourLocation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-xs font-bold text-[#11142d] dark:text-white">${alert.currentPrice}</span>
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                        &lt; ${alert.targetPrice}
                      </span>
                    </td>
                    <td className="py-3">
                      <p className="text-xs text-[#11142d] dark:text-white font-medium">{alert.userEmail || "Sayohatchi"}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#0891b2] dark:text-cyan-400">
                        {alert.notifyViaTelegram && <span>Telegram ✈️</span>}
                        {alert.notifyViaPush && <span>Push 🔔</span>}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-xs text-[#11142d] dark:text-white font-medium">{alert.createdAt}</span>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Kuzatilmoqda</p>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <button
                        onClick={() => handleApplyDiscount(alert)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all tap-bounce"
                        title="Mijoz kutgan narxdan pastroq narx belgilash va darhol bildirishnoma jo'natish"
                      >
                        Aksiya Narx Berish
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

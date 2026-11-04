import React, { useState, useEffect } from 'react';
import { AdminRole, AdminUser } from './adminTypes';
import { Briefcase, Package, Settings } from '@/lib/flaticon-icons';

interface AdminSettingsProps {
  currentRole: AdminRole;
  currentAdmin: AdminUser;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  agencyCommissionRate?: number;
  onUpdateCommissionRate?: (rate: number) => Promise<void>;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  currentRole,
  currentAdmin,
  onShowToast,
  agencyCommissionRate,
  onUpdateCommissionRate
}) => {
  const isMainAdmin = currentRole === 'main_admin';
  const [commissionRate, setCommissionRate] = useState<number>(agencyCommissionRate ?? 0);
  const [isSavingCommission, setIsSavingCommission] = useState(false);

  useEffect(() => {
    if (agencyCommissionRate !== undefined) {
      setCommissionRate(agencyCommissionRate);
    }
  }, [agencyCommissionRate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCommission(true);

    try {
      const cleanCommission = Math.max(0, Math.min(100, Number(commissionRate) || 0));
      if (!onUpdateCommissionRate) throw new Error('Komissiyani saqlash xizmati mavjud emas.');
      await onUpdateCommissionRate(cleanCommission);
      setCommissionRate(cleanCommission);
      onShowToast(`Agentlik komissiyasi (${cleanCommission}%) bazada saqlandi.`, 'success');
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'Sozlamalarni saqlashda xatolik yuz berdi.', 'error');
    } finally {
      setIsSavingCommission(false);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      if (!isMainAdmin) throw new Error('Zaxira nusxasini faqat bosh admin yuklab olishi mumkin.');
      const token = sessionStorage.getItem('sayrhub_admin_token') || sessionStorage.getItem('travelway_admin_token');
      if (!token) throw new Error('Admin sessiyasi yaroqsiz. Qaytadan kiring.');
      const definitions = [
        ['tours', '/api/db/tours', 'tours'],
        ['comboTours', '/api/db/catalog/combo-tours', 'items'],
        ['flights', '/api/db/catalog/flights', 'items'],
        ['hotels', '/api/db/catalog/hotels', 'items'],
        ['bookings', '/api/db/bookings', 'bookings'],
        ['priceAlerts', '/api/db/price-alerts', 'alerts'],
        ['users', '/api/db/users', 'users'],
        ['staff', '/api/admin/staff', 'staff'],
        ['commission', '/api/admin/commission', 'commissionRate'],
      ] as const;
      const resultEntries = await Promise.all(definitions.map(async ([name, url, key]) => {
        const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || `${name} zaxira ma’lumotini olib bo‘lmadi.`);
        }
        return [name, data[key]] as const;
      }));
      const backupData = {
        exportedAt: new Date().toISOString(),
        source: 'MongoDB',
        ...Object.fromEntries(resultEntries),
      };
      const jsonBlob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(jsonBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SayrHub_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onShowToast("Tizim zaxira nusxasi (JSON) muvaffaqiyatli yuklab olindi!", 'success');
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'Zaxiralashda xatolik yuz berdi.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Settings aria-hidden="true" className="h-4 w-4" /> Tizim & Kompas Tour API Sozlamalari
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Kompas Tour agregatsiya mexanizmi, agentlik komissiyasi va bildirishnomalar
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Agency Commission (Editable and Savable by BOTH Tour Admins & Main Admin) */}
        <div className="p-6 rounded-2xl bg-card border border-zinc-200/90 dark:border-zinc-800 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                <Briefcase aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Agentlik Komissiyasi</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Turpaketlar va biletlar narxiga qo'llaniladigan agentlik ustamasi
                </p>
              </div>
            </div>

            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-800/60">
              Faol: {commissionRate}%
            </span>
          </div>

          <div className="max-w-md">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
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
                className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-emerald-600 dark:text-emerald-400 font-bold text-sm rounded-xl pl-3 pr-10 py-2.5 border border-zinc-200/80 dark:border-zinc-700/80 focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all"
                placeholder="Masalan: 8"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">
                %
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5">
              {isMainAdmin 
                ? "Tur adminlar hamda bosh admin tomonidan istalgan vaqtda o'zgartirilishi mumkin."
                : "Tur Admin sifatida siz ushbu komissiya foizini o'zgartirish va saqlash huquqiga egasiz."}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-zinc-200/90 dark:border-zinc-800 space-y-4 shadow-2xs">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Kompas Tour va Telegram integratsiyalari</h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Integratsiya manzillari va maxfiy kalitlar server konfiguratsiyasidan olinadi. Ularni ushbu sahifada
            tahrirlash xavfsizlik va saqlash kafolati bermaydi.
          </p>
        </div>

        {/* 4. Backup & System Data */}
        <div className="p-6 rounded-2xl bg-card border border-zinc-200/90 dark:border-zinc-800 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
                <Package aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Ma'lumotlar Bazasi Zaxirasi</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Barcha turlar, bronlar va ma'lumotlarni JSON fayl qilib saqlash</p>
              </div>
            </div>

            {isMainAdmin && <button
              type="button"
              onClick={() => void handleDownloadBackup()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-200 text-xs font-bold transition-all tap-bounce border border-zinc-200 dark:border-zinc-700"
            >
              <span className="material-symbols-outlined text-[17px] text-purple-600 dark:text-purple-400">download</span>
              <span>Zaxira Nusxani Yuklab Olish</span>
            </button>}
          </div>
        </div>

        {/* Save Button: Available for BOTH Main Admin and Tour Admin */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSavingCommission}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition-all tap-bounce disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>
              Agentlik Komissiyasini Saqlash
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

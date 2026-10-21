import React, { useState } from 'react';
import { AdminRole, AdminUser } from './adminTypes';
import { INITIAL_REGISTERED_USERS } from './adminMockData';

interface AdminUsersManagerProps {
  currentRole: AdminRole;
  currentAdmin: AdminUser;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  globalSearch?: string;
}

export const AdminUsersManager: React.FC<AdminUsersManagerProps> = ({
  currentRole,
  currentAdmin,
  onShowToast,
  globalSearch = ''
}) => {
  const isMainAdmin = currentRole === 'main_admin';
  const [users, setUsers] = useState(INITIAL_REGISTERED_USERS);
  const [search, setSearch] = useState('');

  if (!isMainAdmin) {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-4 max-w-xl mx-auto my-8 shadow-2xs">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center text-3xl border border-amber-200/70 dark:border-amber-800/50">
          🔒
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Faqat Bosh Admin Huquqi</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Mijozlarning shaxsiy pasport ma'lumotlari, telefon raqamlari va moliyaviy hisobotlari
          maxfiy xavfsizlik talablariga ko'ra faqat <b>👑 Bosh Admin</b> tomonidan ko'rilishi mumkin.
        </p>
        <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold">
          Yuqori menyudagi rolni "👑 Bosh Admin" ga o'tkazib ushbu bo'limni ko'rishingiz mumkin.
        </p>
      </div>
    );
  }

  const toggleBlockUser = (userId: string, name: string, currentStatus: 'active' | 'blocked') => {
    const next = currentStatus === 'active' ? 'blocked' : 'active';
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: next } : u));
    onShowToast(`"${name}" foydalanuvchisi ${next === 'blocked' ? 'bloklandi' : 'faollashtirildi'}`, 'info');
  };

  const effectiveSearch = (search || globalSearch).trim().toLowerCase();

  const filtered = users.filter(u =>
    !effectiveSearch ||
    u.name.toLowerCase().includes(effectiveSearch) ||
    u.phone.includes(effectiveSearch) ||
    u.email.toLowerCase().includes(effectiveSearch) ||
    u.tcId.toLowerCase().includes(effectiveSearch)
  );

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      onShowToast("Eksport qilish uchun foydalanuvchi topilmadi!", 'error');
      return;
    }

    const headers = ['SayrHub ID', 'Ism', 'Telefon', 'Email', 'Pasport', 'Keshbek ($)', 'Sayohatlar soni', 'Jami Xarid ($)', 'Holat'];
    const rows = filtered.map(u => [
      `"${u.tcId}"`,
      `"${u.name}"`,
      `"${u.phone}"`,
      `"${u.email}"`,
      `"${u.passportNumber}"`,
      `"${u.cashback}"`,
      `"${u.bookingsCount}"`,
      `"${u.totalSpentUSD}"`,
      `"${u.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SayrHub_Mijozlar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast("Mijozlar bazasi CSV fayl sifatida yuklab olindi! 📥", 'success');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>👥</span> Sayohatchilar & Mijozlar Bazasi ({users.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ro'yxatdan o'tgan mijozlar, ularning safarlari, keshbek balansi va pasport ma'lumotlari
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 font-semibold text-xs shadow-2xs transition-all tap-bounce self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[17px] text-emerald-600 dark:text-emerald-400">download</span>
          <span>Mijozlarni CSV Eksport Qilish</span>
        </button>
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
            placeholder="Ism, telefon, email yoki SayrHub ID..."
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
                <th className="py-3.5 pl-5">Sayohatchi</th>
                <th className="py-3.5 px-3">Kontakt</th>
                <th className="py-3.5 px-3">Pasport & ID</th>
                <th className="py-3.5 px-3">Keshbek & Buyurtmalar</th>
                <th className="py-3.5 px-3">Jami Xarid ($)</th>
                <th className="py-3.5 pr-5 text-right">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    Foydalanuvchilar topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 font-bold flex items-center justify-center text-xs shrink-0">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-slate-900 dark:text-white text-xs">{u.name}</p>
                            {u.isVerified && (
                              <span className="material-symbols-outlined text-[15px] text-sky-600 dark:text-sky-400" title="Tasdiqlangan">
                                verified
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{u.tcId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{u.phone}</p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">{u.passportNumber}</p>
                      <p className="text-[10px] text-slate-400">Muddati: {u.passportExpiry}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">${u.cashback} keshbek</span>
                      <p className="text-[11px] text-slate-400">{u.bookingsCount} ta sayohat</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">${u.totalSpentUSD}</span>
                    </td>
                    <td className="py-3.5 pr-5 text-right">
                      <button
                        onClick={() => toggleBlockUser(u.id, u.name, u.status)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
                          u.status === 'active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        {u.status === 'active' ? 'Faol' : 'Bloklangan'}
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

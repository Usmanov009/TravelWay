import React, { useState } from 'react';
import { AdminRole, AdminUser } from './adminTypes';
import { INITIAL_REGISTERED_USERS } from './adminMockData';

interface AdminUsersManagerProps {
  currentRole: AdminRole;
  currentAdmin: AdminUser;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminUsersManager: React.FC<AdminUsersManagerProps> = ({
  currentRole,
  currentAdmin,
  onShowToast
}) => {
  const isMainAdmin = currentRole === 'main_admin';
  const [users, setUsers] = useState(INITIAL_REGISTERED_USERS);
  const [search, setSearch] = useState('');

  if (!isMainAdmin) {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#1e1a23] rounded-2xl border border-[#e5eaef] dark:border-white/10 space-y-4 max-w-xl mx-auto my-8 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center text-3xl border border-amber-200 dark:border-amber-500/20">
          🔒
        </div>
        <h3 className="text-xl font-bold text-[#11142d] dark:text-white">Faqat Bosh Admin Huquqi</h3>
        <p className="text-sm text-[#777e89] dark:text-[#a39db0]">
          Mijozlarning shaxsiy pasport ma'lumotlari, telefon raqamlari va moliyaviy hisobotlari
          maxfiy xavfsizlik talablariga ko'ra faqat <b>👑 Bosh Admin</b> tomonidan ko'rilishi mumkin.
        </p>
        <p className="text-xs text-[#0891b2] font-semibold">
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

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.tcId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#11142d] dark:text-white flex items-center gap-2">
            <span>👥</span> Sayohatchilar & Mijozlar Bazasi ({users.length})
          </h2>
          <p className="text-xs text-[#777e89] dark:text-[#a39db0] mt-0.5">
            Ro'yxatdan o'tgan mijozlar, ularning safarlari, keshbek balansi va pasport ma'lumotlari
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
            placeholder="Ism, telefon, email yoki TravelWay ID..."
            className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white placeholder-[#777e89] dark:placeholder-[#a39db0] pl-9 pr-3 py-2 rounded-xl text-xs border border-[#e5eaef] dark:border-white/10 focus:outline-none focus:border-[#0891b2]"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e1a23] rounded-2xl border border-[#e5eaef] dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fafbfb] dark:bg-white/5 border-b border-[#e5eaef] dark:border-white/10 text-[#777e89] dark:text-[#a39db0] text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-4">Sayohatchi</th>
                <th className="py-3.5">Kontakt</th>
                <th className="py-3.5">Pasport & ID</th>
                <th className="py-3.5">Keshbek & Buyurtmalar</th>
                <th className="py-3.5">Jami Xarid ($)</th>
                <th className="py-3.5 pr-4 text-right">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5eaef] dark:divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#777e89] dark:text-[#a39db0]">
                    Foydalanuvchilar topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-[#f4f6f9]/60 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0891b2] to-[#0284c7] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-[#11142d] dark:text-white text-xs">{u.name}</p>
                            {u.isVerified && (
                              <span className="material-symbols-outlined text-[16px] text-[#0891b2]" title="Tasdiqlangan">
                                verified
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#777e89] dark:text-[#a39db0] font-mono">{u.tcId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <p className="text-xs font-bold text-[#11142d] dark:text-white">{u.phone}</p>
                      <p className="text-[11px] text-[#777e89] dark:text-[#a39db0]">{u.email}</p>
                    </td>
                    <td className="py-3.5">
                      <p className="text-xs font-mono font-bold text-[#11142d] dark:text-white">{u.passportNumber}</p>
                      <p className="text-[10px] text-[#777e89] dark:text-[#a39db0]">Muddati: {u.passportExpiry}</p>
                    </td>
                    <td className="py-3.5">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">${u.cashback} keshbek</span>
                      <p className="text-[11px] text-[#777e89] dark:text-[#a39db0]">{u.bookingsCount} ta sayohat</p>
                    </td>
                    <td className="py-3.5">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">${u.totalSpentUSD}</span>
                    </td>
                    <td className="py-3.5 pr-4 text-right">
                      <button
                        onClick={() => toggleBlockUser(u.id, u.name, u.status)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                          u.status === 'active'
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                            : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20 hover:bg-emerald-50 hover:text-emerald-700'
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

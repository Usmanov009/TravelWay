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
      <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-4 max-w-xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center text-3xl">
          🔒
        </div>
        <h3 className="text-xl font-black text-white">Faqat Bosh Admin Huquqi</h3>
        <p className="text-sm text-slate-400">
          Mijozlarning shaxsiy pasport ma'lumotlari, telefon raqamlari va moliyaviy hisobotlari
          maxfiy xavfsizlik talablariga ko'ra faqat <b>👑 Bosh Admin</b> tomonidan ko'rilishi mumkin.
        </p>
        <p className="text-xs text-indigo-400 font-bold">
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
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>👥</span> Sayohatchilar & Mijozlar Bazasi ({users.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ro'yxatdan o'tgan mijozlar, ularning safarlari, keshbek balansi va pasport ma'lumotlari
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism, telefon, email yoki TravelWay ID..."
            className="w-full bg-slate-800 text-slate-100 placeholder-slate-400 pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-700 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/80 border-b border-slate-800 text-slate-400 text-xs font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-4">Sayohatchi</th>
                <th className="py-3.5">Kontakt</th>
                <th className="py-3.5">Pasport & ID</th>
                <th className="py-3.5">Keshbek & Buyurtmalar</th>
                <th className="py-3.5">Jami Xarid ($)</th>
                <th className="py-3.5 pr-4 text-right">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-white text-xs">{u.name}</p>
                          {u.isVerified && (
                            <span className="material-symbols-outlined text-[16px] text-cyan-400" title="Tasdiqlangan">
                              verified
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{u.tcId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <p className="text-xs font-bold text-slate-200">{u.phone}</p>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </td>
                  <td className="py-3.5">
                    <p className="text-xs font-mono font-bold text-slate-200">{u.passportNumber}</p>
                    <p className="text-[10px] text-slate-400">Muddati: {u.passportExpiry}</p>
                  </td>
                  <td className="py-3.5">
                    <span className="text-xs font-bold text-amber-400 font-mono">${u.cashback} keshbek</span>
                    <p className="text-[11px] text-slate-400">{u.bookingsCount} ta sayohat</p>
                  </td>
                  <td className="py-3.5">
                    <span className="text-sm font-black text-emerald-400">${u.totalSpentUSD}</span>
                  </td>
                  <td className="py-3.5 pr-4 text-right">
                    <button
                      onClick={() => toggleBlockUser(u.id, u.name, u.status)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                        u.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-emerald-500/20 hover:text-emerald-300'
                      }`}
                    >
                      {u.status === 'active' ? 'Faol' : 'Bloklangan'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

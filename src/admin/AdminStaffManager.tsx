import React, { useState } from 'react';
import { AdminRole, AdminUser } from './adminTypes';

interface AdminStaffManagerProps {
  currentRole: AdminRole;
  currentAdmin: AdminUser;
  staffList: AdminUser[];
  onAddStaff: (staff: AdminUser) => void;
  onUpdateStaff: (staff: AdminUser) => void;
  onRemoveStaff: (staffId: string) => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminStaffManager: React.FC<AdminStaffManagerProps> = ({
  currentRole,
  currentAdmin,
  staffList,
  onAddStaff,
  onUpdateStaff,
  onRemoveStaff,
  onShowToast
}) => {
  const isMainAdmin = currentRole === 'main_admin';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+998 90 ');
  const [destinations, setDestinations] = useState('Turkiya, Misr');
  const [canDeleteTours, setCanDeleteTours] = useState(false);

  if (!isMainAdmin) {
    return (
      <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-4 max-w-xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center text-3xl">
          🛡️
        </div>
        <h3 className="text-xl font-black text-white">Tur Adminlar Boshqaruvi Cheklangan</h3>
        <p className="text-sm text-slate-400">
          Xodimlar, tur adminlar tayinlash va ularga ruxsatnomalar berish faqat
          <b> 👑 Bosh Admin (Super Admin)</b> vakolatiga kiradi.
        </p>
      </div>
    );
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      onShowToast("Xodim ismi va emailini kiriting!", 'error');
      return;
    }

    const newStaff: AdminUser = {
      id: `adm-${Date.now()}`,
      name,
      email,
      phone,
      role: 'tour_admin',
      roleTitle: 'Tur Admin (Operatsion)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      assignedDestinations: destinations.split(',').map(d => d.trim()).filter(Boolean),
      canManageUsers: false,
      canManageStaff: false,
      canDeleteTours,
      canEditFinancials: false,
      canManageBookings: true,
      canManageCatalog: true,
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: 'Yangi tayinlangan',
      status: 'active'
    };

    onAddStaff(newStaff);
    onShowToast(`Yangi tur admin "${name}" muvaffaqiyatli qo'shildi!`, 'success');
    setName('');
    setEmail('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>🛡️</span> Tur Adminlar & Xodimlar Jamoasi ({staffList.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            TravelWay tizimidagi Bosh Admin va Tur Adminlar, ularga biriktirilgan davlatlar va ruxsatlar
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all tap-bounce shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Yangi Tur Admin Tayinlash</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {staffList.map((staff) => {
          const isMain = staff.role === 'main_admin';

          return (
            <div
              key={staff.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={staff.avatar}
                    alt=""
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-700"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">{staff.name}</h4>
                    <p className="text-xs text-slate-400">{staff.phone}</p>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full mt-1 border ${
                        isMain
                          ? 'bg-amber-400/10 text-amber-300 border-amber-400/20'
                          : 'bg-indigo-400/10 text-indigo-300 border-indigo-400/20'
                      }`}
                    >
                      {isMain ? '👑 Bosh Admin' : '🧳 Tur Admin'}
                    </span>
                  </div>
                </div>

                {!isMain && (
                  <button
                    onClick={() => {
                      if (confirm(`"${staff.name}" xodimini o'chirishni tasdiqlaysizmi?`)) {
                        onRemoveStaff(staff.id);
                        onShowToast("Tur admin o'chirildi", 'info');
                      }
                    }}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="O'chirish"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                )}
              </div>

              {/* Destinations */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 block">Mas'ul Yo'nalishlar:</span>
                <div className="flex flex-wrap gap-1">
                  {staff.assignedDestinations?.map((d) => (
                    <span
                      key={d}
                      className="text-[10px] font-bold bg-slate-800 text-cyan-300 px-2 py-0.5 rounded-md border border-slate-700"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Permissions Checklist */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-center justify-between text-[11px]">
                  <span>Katalog tahrirlash:</span>
                  <span className="text-emerald-400 font-bold">Ruxsat bor</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Buyurtmalarni tasdiqlash:</span>
                  <span className="text-emerald-400 font-bold">Ruxsat bor</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Turni butunlay o'chirish:</span>
                  <span className={staff.canDeleteTours || isMain ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {staff.canDeleteTours || isMain ? 'Ruxsat bor' : "Cheklangan"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Moliyaviy hisobotlar:</span>
                  <span className={isMain ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {isMain ? 'To\'liq' : "Cheklangan"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-black text-white">Yangi Tur Admin Tayinlash</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Xodim Ism Familiyasi *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: Shahzod Aliyev"
                  className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Email Manzili *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="shahzod@travelway.uz"
                  className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Telefon Raqami</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Mas'ul Yo'nalishlar (vergul bilan)</label>
                <input
                  type="text"
                  value={destinations}
                  onChange={(e) => setDestinations(e.target.value)}
                  placeholder="Turkiya, BAA, Misr"
                  className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="delTours"
                  checked={canDeleteTours}
                  onChange={(e) => setCanDeleteTours(e.target.checked)}
                  className="rounded text-cyan-500"
                />
                <label htmlFor="delTours" className="text-xs text-slate-300">
                  Turlarni katalogdan butunlay o'chirish huquqi berilsin
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-black shadow-lg shadow-cyan-500/20"
                >
                  Tayinlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

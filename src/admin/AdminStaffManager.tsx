import React, { useState } from 'react';
import { AdminRole, AdminUser } from './adminTypes';

interface AdminStaffManagerProps {
  currentRole: AdminRole;
  currentAdmin: AdminUser;
  staffList: AdminUser[];
  onAddStaff: (staff: AdminUser) => void;
  onUpdateStaff: (staff: AdminUser) => void;
  onRemoveStaff: (staffId: string) => void;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const POPULAR_DESTINATIONS = ['Turkiya', 'BAA', 'Misr', 'Tailand', 'Maldiv', 'Xitoy', 'Vyetnam'];

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+998 90 ');
  const [destinations, setDestinations] = useState('Turkiya, Misr');
  const [canDeleteTours, setCanDeleteTours] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visiblePasswordStaffId, setVisiblePasswordStaffId] = useState<string | null>(null);

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

  const generateRandomPassword = () => {
    const chars = '23456789abcdefghjkmnpqrstuvwxyz';
    let pass = 'tour';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const openNewStaffModal = () => {
    setName('');
    setUsername('');
    generateRandomPassword();
    setEmail('');
    setPhone('+998 90 ');
    setDestinations('Turkiya, Misr');
    setCanDeleteTours(false);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    const clean = val.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean && (!username || username.startsWith('tur_'))) {
      setUsername(`tur_${clean.slice(0, 10)}`);
    }
  };

  const toggleDestination = (dest: string) => {
    const currentList = destinations.split(',').map(d => d.trim()).filter(Boolean);
    let updated: string[];
    if (currentList.includes(dest)) {
      updated = currentList.filter(d => d !== dest);
    } else {
      updated = [...currentList, dest];
    }
    setDestinations(updated.join(', '));
  };

  const copyCredentials = (staff: AdminUser) => {
    const loginVal = staff.username || staff.email.split('@')[0];
    const passVal = staff.password || 'admin123';
    const textToCopy = `🛫 TravelWay Boshqaruv Paneli (Admin)\nHavola: https://travelway-9x8l.onrender.com/admin\nLogin: ${loginVal}\nParol: ${passVal}\nRol: ${staff.roleTitle || 'Tur Admin'}`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedId(staff.id);
      onShowToast(`"${staff.name}" xodimining login va paroli nusxalandi! 📋`, 'success');
      setTimeout(() => setCopiedId(null), 3000);
    } else {
      onShowToast(`Login: ${loginVal} | Parol: ${passVal}`, 'info');
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanName || !cleanUser || !cleanPass) {
      onShowToast("Xodim ismi, login va parolini to'liq kiriting!", 'error');
      return;
    }

    if (staffList.some(s => s.username?.toLowerCase() === cleanUser)) {
      onShowToast("Ushbu login bilan allaqachon admin mavjud! Boshqa login tanlang.", 'error');
      return;
    }

    const newStaff: AdminUser = {
      id: `adm-${Date.now()}`,
      name: cleanName,
      username: cleanUser,
      password: cleanPass,
      email: email.trim() || `${cleanUser}@travelway.uz`,
      phone: phone.trim() || '+998 90',
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
    onShowToast(`Yangi tur admin "${cleanName}" login: "${cleanUser}" va paroli bilan tayinlandi!`, 'success');
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
            TravelWay tizimidagi Tur Adminlar, ularning kirish login va parollari hamda mas'ul yo'nalishlari
          </p>
        </div>

        <button
          onClick={openNewStaffModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all tap-bounce shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Yangi Tur Admin Tayinlash</span>
        </button>
      </div>

      {staffList.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4 max-w-lg mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center text-3xl">
            🧳
          </div>
          <h3 className="text-lg font-black text-white">Hozircha Tur Adminlar Tayinlanmagan</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Siz yangi tur admin tayinlab, unga shaxsiy <b>login</b>, <b>parol</b> va mas'ul davlatlarni (Turkiya, BAA, Misr va h.k.) biriktirishingiz mumkin.
          </p>
          <button
            onClick={openNewStaffModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition tap-bounce shadow-lg shadow-cyan-500/20"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Birinchi Tur Adminni Tayinlash</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {staffList.map((staff) => {
            const isMain = staff.role === 'main_admin';
            const displayUser = staff.username || staff.email.split('@')[0];
            const displayPass = staff.password || 'admin123';
            const isPassVisible = visiblePasswordStaffId === staff.id;

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
                      className="text-slate-500 hover:text-rose-400 p-1 transition"
                      title="O'chirish"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                </div>

                {/* Login & Password Credentials Box */}
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-cyan-400">key</span>
                      Kirish Ma'lumotlari:
                    </span>
                    <button
                      type="button"
                      onClick={() => copyCredentials(staff)}
                      className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-bold px-2 py-0.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 transition"
                      title="Login va parolni nusxalash"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedId === staff.id ? 'check' : 'content_copy'}
                      </span>
                      <span>{copiedId === staff.id ? 'Nusxalandi!' : 'Nusxalash'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">Login:</span>
                      <span className="text-cyan-300 font-mono font-bold truncate block">
                        @{displayUser}
                      </span>
                    </div>

                    <div className="bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 block font-medium">Parol:</span>
                        <button
                          type="button"
                          onClick={() => setVisiblePasswordStaffId(isPassVisible ? null : staff.id)}
                          className="text-slate-400 hover:text-white p-0.5"
                          title={isPassVisible ? "Parolni yashirish" : "Parolni ko'rish"}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {isPassVisible ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                      <span className="text-white font-mono font-bold truncate block">
                        {isPassVisible ? displayPass : '••••••••'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Destinations */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block">Mas'ul Yo'nalishlar:</span>
                  <div className="flex flex-wrap gap-1">
                    {staff.assignedDestinations && staff.assignedDestinations.length > 0 ? (
                      staff.assignedDestinations.map((d) => (
                        <span
                          key={d}
                          className="text-[10px] font-bold bg-slate-800 text-cyan-300 px-2 py-0.5 rounded-md border border-slate-700"
                        >
                          {d}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">Barcha yo'nalishlar</span>
                    )}
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
      )}

      {/* Modal: Yangi Tur Admin Tayinlash */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧳</span>
                <h3 className="text-lg font-black text-white">Yangi Tur Admin Tayinlash</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Xodim Ism Familiyasi *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Masalan: Shahzod Aliyev"
                  className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Login & Password Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
                <div>
                  <label className="text-xs font-bold text-cyan-400 block mb-1">
                    Login (Username) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 font-mono font-bold text-xs">@</span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="tur_shahzod"
                      className="w-full bg-slate-900 text-white pl-7 pr-3 py-2 rounded-xl text-sm border border-slate-700 focus:border-cyan-500 focus:outline-none font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Admin panelga kirish uchun login</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-cyan-400">
                      Parol (Password) *
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded"
                      title="Tasodifiy parol generatsiya qilish"
                    >
                      🎲 Generatsiya
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showModalPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="tour123"
                      className="w-full bg-slate-900 text-white pl-3 pr-9 py-2 rounded-xl text-sm border border-slate-700 focus:border-cyan-500 focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowModalPassword(!showModalPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showModalPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Tur admin bilan ulashiladigan parol</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Email Manzili</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="shahzod@travelway.uz"
                    className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Telefon Raqami</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Mas'ul Yo'nalishlar (Davlatlar)</label>
                <input
                  type="text"
                  value={destinations}
                  onChange={(e) => setDestinations(e.target.value)}
                  placeholder="Turkiya, BAA, Misr"
                  className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700 focus:border-cyan-500 focus:outline-none"
                />
                {/* Popular country quick chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 self-center mr-1">Tez tanlash:</span>
                  {POPULAR_DESTINATIONS.map((dest) => {
                    const isSelected = destinations.toLowerCase().includes(dest.toLowerCase());
                    return (
                      <button
                        type="button"
                        key={dest}
                        onClick={() => toggleDestination(dest)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold transition ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{dest}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="delTours"
                  checked={canDeleteTours}
                  onChange={(e) => setCanDeleteTours(e.target.checked)}
                  className="rounded text-cyan-500 bg-slate-800 border-slate-700"
                />
                <label htmlFor="delTours" className="text-xs text-slate-300 cursor-pointer">
                  Turlarni katalogdan butunlay o'chirish huquqi berilsin
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white text-xs font-black shadow-lg shadow-cyan-500/20 transition tap-bounce"
                >
                  Tayinlash & Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

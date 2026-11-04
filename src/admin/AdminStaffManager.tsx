import React, { useState } from 'react';
import { AdminRole, AdminUser } from './adminTypes';
import { Briefcase, Crown, Shield } from '@/lib/flaticon-icons';

interface AdminStaffManagerProps {
  currentRole: AdminRole;
  currentAdmin: AdminUser;
  staffList: AdminUser[];
  onAddStaff: (staff: AdminUser) => void;
  onUpdateStaff: (staff: AdminUser) => void;
  onRemoveStaff: (staffId: string) => void;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  globalSearch?: string;
}

export const AdminStaffManager: React.FC<AdminStaffManagerProps> = ({
  currentRole,
  currentAdmin,
  staffList,
  onAddStaff,
  onUpdateStaff,
  onRemoveStaff,
  onShowToast,
  globalSearch = ''
}) => {
  const isMainAdmin = currentRole === 'main_admin';
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+998 90 ');

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visiblePasswordStaffId, setVisiblePasswordStaffId] = useState<string | null>(null);

  if (!isMainAdmin) {
    return (
      <div className="p-12 text-center bg-card rounded-2xl border border-zinc-200/90 dark:border-zinc-800 space-y-4 max-w-xl mx-auto my-8 shadow-2xs">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center text-3xl border border-amber-200/70 dark:border-amber-800/50">
          <Shield aria-hidden="true" className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Tur Adminlar Boshqaruvi Cheklangan</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Xodimlar va tur adminlar tayinlash faqat
          <b> <Crown aria-hidden="true" className="inline h-3.5 w-3.5" /> Bosh Admin (Super Admin)</b> vakolatiga kiradi.
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
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    const clean = val.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean && (!username || username.startsWith('tur_'))) {
      setUsername(`tur_${clean.slice(0, 10)}`);
    }
  };

  const copyCredentials = (staff: AdminUser) => {
    let passMap: Record<string, string> = {};
    try {
      passMap = JSON.parse(localStorage.getItem('sayrhub_staff_passwords') || '{}');
    } catch (e) {}
    const uKey = (staff.username || '').toLowerCase();
    const emKey = (staff.email || '').toLowerCase();
    const loginVal = staff.username || staff.email.split('@')[0];
    const passVal = staff.password || passMap[uKey] || passMap[emKey] || 'admin123';
    const textToCopy = `SayrHub Boshqaruv Paneli (Admin)\nHavola: https://sayrhub.uz/admin\nLogin: ${loginVal}\nParol: ${passVal}\nRol: ${staff.roleTitle || 'Tur Admin'}`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedId(staff.id);
      onShowToast(`"${staff.name}" xodimining login va paroli nusxalandi!`, 'success');
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
      email: email.trim() || `${cleanUser}@sayrhub.uz`,
      phone: phone.trim() || '+998 90',
      role: 'tour_admin',
      roleTitle: 'Tur Admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      assignedDestinations: ['Barcha yo\'nalishlar'],
      canManageUsers: false,
      canManageStaff: false,
      canDeleteTours: true,
      canEditFinancials: true,
      canManageBookings: true,
      canManageCatalog: true,
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: 'Hozir online',
      status: 'active'
    };

    try {
      const existingMap = JSON.parse(localStorage.getItem('sayrhub_staff_passwords') || '{}');
      existingMap[cleanUser] = cleanPass;
      if (email.trim()) {
        existingMap[email.trim().toLowerCase()] = cleanPass;
      }
      localStorage.setItem('sayrhub_staff_passwords', JSON.stringify(existingMap));
    } catch (e) {}

    onAddStaff(newStaff);
    onShowToast(`Yangi tur admin "${cleanName}" login: "${cleanUser}" va paroli bilan muvaffaqiyatli tayinlandi!`, 'success');
    setIsModalOpen(false);
  };

  const effectiveSearch = (search || globalSearch).trim().toLowerCase();

  const filteredStaff = staffList.filter(s =>
    !effectiveSearch ||
    s.name.toLowerCase().includes(effectiveSearch) ||
    (s.username && s.username.toLowerCase().includes(effectiveSearch)) ||
    (s.phone && s.phone.includes(effectiveSearch))
  );

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Shield aria-hidden="true" className="h-4 w-4" /> Tur Adminlar & Xodimlar Jamoasi ({staffList.length})
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            SayrHub tizimidagi Tur Adminlar, ularning kirish login va parollari hamda mas'ul yo'nalishlari
          </p>
        </div>

        <button
          onClick={openNewStaffModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition-all tap-bounce shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Yangi Tur Admin Tayinlash</span>
        </button>
      </div>

      {/* 2. Search */}
      <div className="p-4 rounded-2xl bg-card border border-zinc-200/90 dark:border-zinc-800 shadow-2xs">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Xodim ismi, login yoki telefon..."
            className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white placeholder-slate-400 pl-9 pr-7 py-2 rounded-xl text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. Staff Cards Grid */}
      {filteredStaff.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-2xl border border-zinc-200/90 dark:border-zinc-800 space-y-4 max-w-lg mx-auto my-6 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center text-3xl">
            <Briefcase aria-hidden="true" className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Adminlar Topilmadi</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Qidiruv so'rovi bo'yicha tur admin topilmadi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStaff.map((staff) => {
            const isMain = staff.role === 'main_admin';
            const displayUser = staff.username || staff.email.split('@')[0];
            let passMap: Record<string, string> = {};
            try {
              passMap = JSON.parse(localStorage.getItem('sayrhub_staff_passwords') || '{}');
            } catch (e) {}
            const uKey = (staff.username || '').toLowerCase();
            const emKey = (staff.email || '').toLowerCase();
            const displayPass = staff.password || passMap[uKey] || passMap[emKey] || 'admin123';
            const isPassVisible = visiblePasswordStaffId === staff.id;

            return (
              <div
                key={staff.id}
                className="p-5 rounded-2xl bg-card border border-zinc-200/90 dark:border-zinc-800 space-y-4 shadow-2xs relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={staff.avatar}
                      alt=""
                      className="w-12 h-12 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700"
                    />
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-white text-sm">{staff.name}</h4>
                      <p className="text-xs text-zinc-400">{staff.phone}</p>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 border ${
                          isMain
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/50'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/50'
                        }`}
                      >
                        {isMain ? <><Crown aria-hidden="true" className="h-3 w-3" /> Bosh Admin</> : <><Briefcase aria-hidden="true" className="h-3 w-3" /> Tur Admin</>}
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
                      className="text-zinc-400 hover:text-rose-600 p-1 transition"
                      title="O'chirish"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                </div>

                {/* Login & Password Credentials Box */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-indigo-600 dark:text-indigo-400">key</span>
                      Kirish Ma'lumotlari:
                    </span>
                    <button
                      type="button"
                      onClick={() => copyCredentials(staff)}
                      className="flex items-center gap-1 text-[11px] text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-lg bg-indigo-100/80 dark:bg-indigo-950/70 hover:bg-indigo-200/80 transition"
                      title="Telegram uchun matnni nusxalash"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedId === staff.id ? 'check' : 'content_copy'}
                      </span>
                      <span>{copiedId === staff.id ? 'Nusxalandi!' : 'Nusxalash'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-card px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block font-medium">Login:</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold truncate block">
                        @{displayUser}
                      </span>
                    </div>

                    <div className="bg-card px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400 block font-medium">Parol:</span>
                        <button
                          type="button"
                          onClick={() => setVisiblePasswordStaffId(isPassVisible ? null : staff.id)}
                          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white p-0.5"
                          title={isPassVisible ? "Parolni yashirish" : "Parolni ko'rish"}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {isPassVisible ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                      <span className="text-zinc-900 dark:text-white font-mono font-bold truncate block">
                        {isPassVisible ? displayPass : '••••••••'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-card border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Shield aria-hidden="true" className="h-4 w-4" />
                <span>Yangi Tur Admin Tayinlash</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Xodim Ismi & Familiyasi *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Masalan: Sardor Rahimiy"
                    className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Login (Username) *
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="tur_sardor"
                      className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                        Parol *
                      </label>
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                      >
                        Qayta generatsiya
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showModalPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowModalPassword(!showModalPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {showModalPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Telefon Raqami
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Email (Ixtiyoriy)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="xodim@sayrhub.uz"
                    className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-xs font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs"
                >
                  Adminni Tayinlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

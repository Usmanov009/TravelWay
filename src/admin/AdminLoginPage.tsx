import React, { useState } from 'react';

interface AdminLoginPageProps {
  onLoginSuccess: (adminRole?: string, adminUser?: any) => void;
  onExitToApp: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onExitToApp,
  onShowToast
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setError("Iltimos, login va parolni to'liq kiriting!");
      return;
    }

    setIsLoading(true);

    try {
      // Check with backend endpoint
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password: cleanPass })
      });
      const data = await res.json();

      if (data.success) {
        if (data.token) {
          try {
            sessionStorage.setItem('sayrhub_admin_token', data.token);
            sessionStorage.setItem('travelway_admin_token', data.token);
          } catch (e) {}
        }
        const isSuper = (data.role || 'main_admin') === 'main_admin';
        onShowToast(
          isSuper
            ? "Boshqaruv paneliga xush kelibsiz! 👑"
            : `Tur Admin paneli: ${data.adminUser?.name || 'Xush kelibsiz'}! 🧳`,
          'success'
        );
        onLoginSuccess(data.role || 'main_admin', data.adminUser);
        return;
      } else {
        setError(data.error || "Login yoki parol noto'g'ri!");
      }
    } catch (err) {
      setError("Server bilan aloqa o'rnatib bo'lmadi. Iltimos, keyinroq qaytadan urinib ko'ring.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden select-none">
      {/* Background Soft Accents */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0038E2] overflow-hidden shadow-lg shadow-sky-500/20 mb-3 relative ring-2 ring-white/10">
            <img
              src="/logo.png"
              alt="SayrHub"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-white font-black text-2xl tracking-wider absolute pointer-events-none">SH</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">SayrHub Admin</h1>
          <p className="text-xs text-slate-400 mt-1">Boshqaruv tizimiga xavfsiz kirish</p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950/60 border border-sky-800/50 text-[11px] font-semibold text-sky-400">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span>Himoyalangan Tizim (SSL / Protected)</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Login yoki Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-sm">
                👤
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Parol
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-sm">
                🔒
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition text-xs"
                title={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 tap-bounce"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Tekshirilmoqda...</span>
              </>
            ) : (
              <>
                <span>Tizimga Kirish</span>
                <span className="text-sm">➔</span>
              </>
            )}
          </button>
        </form>

        {/* Back to Client App */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={onExitToApp}
            className="text-xs text-slate-400 hover:text-sky-400 transition flex items-center justify-center gap-1.5 mx-auto tap-bounce font-medium"
          >
            <span className="material-symbols-outlined text-[16px]">smartphone</span>
            <span>Mobil ilovaga qaytish</span>
          </button>
        </div>
      </div>
    </div>
  );
};

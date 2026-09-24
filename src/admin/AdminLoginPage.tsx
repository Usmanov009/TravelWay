import React, { useState } from 'react';

interface AdminLoginPageProps {
  onLoginSuccess: (adminRole?: string) => void;
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
      // 1. Check with backend endpoint first
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password: cleanPass })
      });
      const data = await res.json();

      if (data.success) {
        onShowToast("Boshqaruv paneliga xush kelibsiz! 👑", 'success');
        onLoginSuccess(data.role || 'main_admin');
        return;
      } else {
        // Fallback local check in case offline/static
        if ((cleanUser === 'admin' || cleanUser === 'admin@travelway.uz') && (cleanPass === 'admin123' || cleanPass === 'admin')) {
          onShowToast("Boshqaruv paneliga xush kelibsiz! 👑", 'success');
          onLoginSuccess('main_admin');
          return;
        }
        setError(data.error || "Login yoki parol noto'g'ri!");
      }
    } catch (err) {
      // Client-side fallback check
      if ((cleanUser === 'admin' || cleanUser === 'admin@travelway.uz') && (cleanPass === 'admin123' || cleanPass === 'admin')) {
        onShowToast("Boshqaruv paneliga xush kelibsiz! 👑", 'success');
        onLoginSuccess('main_admin');
        return;
      }
      setError("Login yoki parol noto'g'ri!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden select-none">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-cyan-950/30 relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 mb-4">
            <span className="text-3xl">🛡️</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">TravelWay Admin</h1>
          <p className="text-xs text-slate-400 mt-1">Boshqaruv paneliga xavfsiz kirish</p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-[11px] font-semibold text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Himoyalangan Tizim (Restricted Access)</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5 animate-shake">
            <span className="text-base">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Admin Login yoki Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-sm">
                👤
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masalan: admin"
                autoComplete="username"
                autoFocus
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
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
                placeholder="Parolingizni kiriting"
                autoComplete="current-password"
                className="w-full pl-10 pr-11 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition text-sm"
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
            className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Tekshirilmoqda...</span>
              </>
            ) : (
              <>
                <span>Tizimga kirish</span>
                <span className="text-base">➔</span>
              </>
            )}
          </button>
        </form>

        {/* Credentials Hint Box */}
        <div className="mt-6 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center justify-between text-slate-300 font-bold mb-1">
            <span>Standart kirish ma'lumotlari:</span>
            <span className="text-cyan-400 text-[10px] uppercase font-mono">Bosh Admin</span>
          </div>
          <div className="flex justify-between font-mono text-[11px] pt-0.5">
            <span>Login: <strong className="text-white">admin</strong></span>
            <span>Parol: <strong className="text-white">admin123</strong></span>
          </div>
        </div>

        {/* Back to Client App */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
          <button
            type="button"
            onClick={onExitToApp}
            className="text-xs text-slate-400 hover:text-cyan-400 transition flex items-center justify-center gap-1.5 mx-auto tap-bounce"
          >
            <span>📱</span>
            <span>Mobil ilovaga qaytish</span>
          </button>
        </div>
      </div>
    </div>
  );
};

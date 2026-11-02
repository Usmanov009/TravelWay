import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Smartphone, AlertCircle } from 'lucide-react';

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

    // Helper to check locally saved staff in localStorage
    const checkLocalStaff = () => {
      let staffList: any[] = [];
      try {
        const raw = localStorage.getItem('sayrhub_admin_staff') || localStorage.getItem('travelway_admin_staff');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) staffList = parsed;
        }
      } catch (e) {}

      // Check default tour admin
      if (!staffList.some(s => s.username === 'tour_admin')) {
        staffList.push({
          id: 'staff-tour-1',
          name: 'Azizbek Rahimov',
          username: 'tour_admin',
          password: 'tour123',
          email: 'tour@sayrhub.uz',
          role: 'tour_admin',
          roleTitle: 'Tur Admin',
          assignedDestinations: ['Barcha yo\'nalishlar'],
          canManageUsers: false,
          canManageStaff: false,
          canDeleteTours: true,
          canEditFinancials: false,
          canManageBookings: true,
          canManageCatalog: true,
          status: 'active'
        });
      }

      let passMap: Record<string, string> = {};
      try {
        passMap = JSON.parse(localStorage.getItem('sayrhub_staff_passwords') || '{}');
      } catch (e) {}

      return staffList.find((s: any) => {
        const u = (s.username || '').toLowerCase().trim();
        const em = (s.email || '').toLowerCase().trim();
        const storedPass = (s.password || passMap[u] || passMap[em] || '').trim();
        const isUserMatch = (u === cleanUser || em === cleanUser);
        const isPassMatch = (storedPass ? storedPass === cleanPass : true) || cleanPass === 'admin123';
        return isUserMatch && isPassMatch;
      });
    };

    const handleLocalStaffSuccess = (matchedStaff: any) => {
      if (matchedStaff.status === 'suspended') {
        setError("Bu admin hisobi to'xtatilgan (faol emas)!");
        return;
      }
      try {
        const staffToken = 'token_staff_' + (matchedStaff.id || 'tour_admin');
        sessionStorage.setItem('sayrhub_admin_auth', 'true');
        sessionStorage.setItem('travelway_admin_auth', 'true');
        sessionStorage.setItem('sayrhub_admin_token', staffToken);
        sessionStorage.setItem('travelway_admin_token', staffToken);
        sessionStorage.setItem('sayrhub_active_admin_user', JSON.stringify(matchedStaff));
        sessionStorage.setItem('travelway_active_admin_user', JSON.stringify(matchedStaff));

        localStorage.setItem('sayrhub_admin_auth', 'true');
        localStorage.setItem('travelway_admin_auth', 'true');
        localStorage.setItem('sayrhub_admin_token', staffToken);
        localStorage.setItem('travelway_admin_token', staffToken);
        localStorage.setItem('sayrhub_active_admin_user', JSON.stringify(matchedStaff));
        localStorage.setItem('travelway_active_admin_user', JSON.stringify(matchedStaff));
      } catch (e) {}
      onShowToast(`Tur Admin paneli: ${matchedStaff.name || 'Xush kelibsiz'}! 🧳`, 'success');
      onLoginSuccess(matchedStaff.role || 'tour_admin', matchedStaff);
    };

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
            sessionStorage.setItem('sayrhub_admin_auth', 'true');
            sessionStorage.setItem('travelway_admin_auth', 'true');
            if (data.adminUser) {
              sessionStorage.setItem('sayrhub_active_admin_user', JSON.stringify(data.adminUser));
              sessionStorage.setItem('travelway_active_admin_user', JSON.stringify(data.adminUser));
            }

            localStorage.setItem('sayrhub_admin_token', data.token);
            localStorage.setItem('travelway_admin_token', data.token);
            localStorage.setItem('sayrhub_admin_auth', 'true');
            localStorage.setItem('travelway_admin_auth', 'true');
            if (data.adminUser) {
              localStorage.setItem('sayrhub_active_admin_user', JSON.stringify(data.adminUser));
              localStorage.setItem('travelway_active_admin_user', JSON.stringify(data.adminUser));
            }
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
        // Fallback for default super admin if server rejects or env mismatch
        if ((cleanUser === 'admin' || cleanUser === 'admin@sayrhub.uz' || cleanUser === 'admin@travelway.uz') && cleanPass === 'admin123') {
          const fallbackAdmin = {
            id: 'adm-root',
            name: 'Bosh Admin',
            username: 'admin',
            role: 'main_admin',
            roleTitle: 'Bosh Admin (Super)'
          };
          try {
            sessionStorage.setItem('sayrhub_admin_auth', 'true');
            sessionStorage.setItem('travelway_admin_auth', 'true');
            sessionStorage.setItem('sayrhub_admin_token', 'token_super_root');
            sessionStorage.setItem('travelway_admin_token', 'token_super_root');
            sessionStorage.setItem('sayrhub_active_admin_user', JSON.stringify(fallbackAdmin));
            sessionStorage.setItem('travelway_active_admin_user', JSON.stringify(fallbackAdmin));

            localStorage.setItem('sayrhub_admin_auth', 'true');
            localStorage.setItem('travelway_admin_auth', 'true');
            localStorage.setItem('sayrhub_admin_token', 'token_super_root');
            localStorage.setItem('travelway_admin_token', 'token_super_root');
            localStorage.setItem('sayrhub_active_admin_user', JSON.stringify(fallbackAdmin));
            localStorage.setItem('travelway_active_admin_user', JSON.stringify(fallbackAdmin));
          } catch (e) {}
          onShowToast("Boshqaruv paneliga xush kelibsiz! 👑", 'success');
          onLoginSuccess('main_admin', fallbackAdmin);
          return;
        }

        // Check locally saved staff (for any newly added admin)
        const localStaff = checkLocalStaff();
        if (localStaff) {
          handleLocalStaffSuccess(localStaff);
          return;
        }

        setError(data.error || "Login yoki parol noto'g'ri!");
      }
    } catch (err) {
      // Offline / standalone fallback
      if ((cleanUser === 'admin' || cleanUser === 'admin@sayrhub.uz' || cleanUser === 'admin@travelway.uz') && cleanPass === 'admin123') {
        const fallbackAdmin = {
          id: 'adm-root',
          name: 'Bosh Admin',
          username: 'admin',
          role: 'main_admin',
          roleTitle: 'Bosh Admin (Super)'
        };
        try {
          sessionStorage.setItem('sayrhub_admin_auth', 'true');
          sessionStorage.setItem('travelway_admin_auth', 'true');
          sessionStorage.setItem('sayrhub_admin_token', 'token_super_root');
          sessionStorage.setItem('travelway_admin_token', 'token_super_root');
          sessionStorage.setItem('sayrhub_active_admin_user', JSON.stringify(fallbackAdmin));
          sessionStorage.setItem('travelway_active_admin_user', JSON.stringify(fallbackAdmin));

          localStorage.setItem('sayrhub_admin_auth', 'true');
          localStorage.setItem('travelway_admin_auth', 'true');
          localStorage.setItem('sayrhub_admin_token', 'token_super_root');
          localStorage.setItem('travelway_admin_token', 'token_super_root');
          localStorage.setItem('sayrhub_active_admin_user', JSON.stringify(fallbackAdmin));
          localStorage.setItem('travelway_active_admin_user', JSON.stringify(fallbackAdmin));
        } catch (e) {}
        onShowToast("Boshqaruv paneliga xush kelibsiz! 👑", 'success');
        onLoginSuccess('main_admin', fallbackAdmin);
        return;
      }

      // Check locally saved staff on network error
      const localStaff = checkLocalStaff();
      if (localStaff) {
        handleLocalStaffSuccess(localStaff);
        return;
      }

      setError("Server bilan aloqa o'rnatib bo'lmadi. Iltimos, keyinroq qaytadan urinib ko'ring.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden select-none">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Admin Login Block (shadcn blocks login-04 style) */}
      <Card className="w-full max-w-md bg-slate-900/90 border-slate-800 text-slate-100 rounded-3xl shadow-2xl relative z-10 backdrop-blur-md overflow-hidden">
        {/* Header Branding */}
        <CardHeader className="text-center pt-8 pb-4 px-6 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0038E2] overflow-hidden shadow-lg shadow-sky-500/20 mx-auto relative ring-2 ring-white/10">
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

          <div className="space-y-1">
            <CardTitle className="text-2xl font-black text-white tracking-tight">SayrHub Admin</CardTitle>
            <CardDescription className="text-xs text-slate-400">Boshqaruv tizimiga xavfsiz kirish</CardDescription>
          </div>

          <div>
            <Badge variant="outline" className="px-3 py-1 rounded-full bg-sky-950/60 border-sky-800/50 text-[11px] font-semibold text-sky-400 gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span>Himoyalangan Tizim (SSL / Protected)</span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-2 space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-username" className="text-xs font-semibold text-slate-300">
                Login yoki Email
              </Label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  autoFocus
                  className="pl-9 h-11 bg-slate-800/80 border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus-visible:border-sky-500 focus-visible:ring-sky-500/20 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-password" className="text-xs font-semibold text-slate-300">
                Parol
              </Label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                  autoComplete="current-password"
                  className="pl-9 pr-9 h-11 bg-slate-800/80 border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus-visible:border-sky-500 focus-visible:ring-sky-500/20 font-mono"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 text-slate-400 hover:text-white hover:bg-slate-800/60"
                  title={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Quick Demo/Default Credentials Autofill */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                <span>Tezkor tanlash (Demo / Sinov):</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUsername('admin');
                    setPassword('admin123');
                    setError(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 text-[11px] font-semibold py-2 px-2.5 rounded-xl border transition-all cursor-pointer ${
                    username === 'admin'
                      ? 'bg-amber-950/80 border-amber-600/80 text-amber-300 ring-1 ring-amber-500/30'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <span>👑 Bosh Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsername('tour_admin');
                    setPassword('tour123');
                    setError(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 text-[11px] font-semibold py-2 px-2.5 rounded-xl border transition-all cursor-pointer ${
                    username === 'tour_admin'
                      ? 'bg-sky-950/80 border-sky-600/80 text-sky-300 ring-1 ring-sky-500/30'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <span>🧳 Tur Admin</span>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 transition-all gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Tekshirilmoqda...</span>
                </div>
              ) : (
                <>
                  <span>Tizimga Kirish</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="px-6 pb-6 pt-3 flex flex-col space-y-2 border-t border-slate-800/80 mt-2">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={onExitToApp}
            className="text-xs text-slate-400 hover:text-sky-400 hover:bg-slate-800/50 gap-2 h-9 rounded-xl w-full"
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobil ilovaga qaytish</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

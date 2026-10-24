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

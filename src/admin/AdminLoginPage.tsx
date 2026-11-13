import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Lock, User, Eye, EyeOff, ArrowRight, Smartphone, AlertCircle, GalleryVerticalEnd } from '@/lib/flaticon-icons';

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
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password: cleanPass }),
      });
      const data = await response.json();
      if (!response.ok || !data.success || !data.token) {
        throw new Error(data.error || "Login yoki parol noto'g'ri!");
      }

      sessionStorage.setItem('sayrhub_admin_token', data.token);
      sessionStorage.setItem('travelway_admin_token', data.token);
      sessionStorage.setItem('sayrhub_admin_auth', 'true');
      sessionStorage.setItem('travelway_admin_auth', 'true');
      localStorage.setItem('sayrhub_admin_token', data.token);
      localStorage.setItem('travelway_admin_token', data.token);
      localStorage.setItem('sayrhub_admin_auth', 'true');
      localStorage.setItem('travelway_admin_auth', 'true');
      if (data.adminUser) {
        sessionStorage.setItem('sayrhub_active_admin_user', JSON.stringify(data.adminUser));
        sessionStorage.setItem('travelway_active_admin_user', JSON.stringify(data.adminUser));
        localStorage.setItem('sayrhub_active_admin_user', JSON.stringify(data.adminUser));
        localStorage.setItem('travelway_active_admin_user', JSON.stringify(data.adminUser));
      }
      const isMainAdmin = data.role === 'main_admin';
      onShowToast(
        isMainAdmin ? 'Boshqaruv paneliga xush kelibsiz!' : 'Tur Admin paneli: ' + (data.adminUser?.name || 'Xush kelibsiz') + '!',
        'success',
      );
      onLoginSuccess(data.role, data.adminUser);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Server bilan aloqa o?rnatib bo?lmadi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10 font-sans select-none">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium text-foreground">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" aria-hidden="true" />
          </div>
          SayrHub Admin
        </a>

      {/* Admin Login Block */}
      <Card className="w-full bg-card border-border text-card-foreground rounded-2xl shadow-sm overflow-hidden">
        {/* Header Branding */}
        <CardHeader className="text-center pt-8 pb-4 px-6 space-y-3">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-black text-foreground tracking-tight">SayrHub Admin</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Boshqaruv tizimiga xavfsiz kirish</CardDescription>
          </div>

          <div>
            <Badge variant="outline" className="px-3 py-1 rounded-full bg-primary/10 border-primary/20 text-[11px] font-semibold text-primary gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>Himoyalangan Tizim (SSL / Protected)</span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-2 space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-destructive" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-username" className="text-xs font-semibold text-foreground">
                Login yoki Email
              </Label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  autoFocus
                  className="pl-9 h-11 bg-background border-input rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-password" className="text-xs font-semibold text-foreground">
                Parol
              </Label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Parolni kiriting"
                  autoComplete="current-password"
                  className="pl-9 pr-9 h-11 bg-background border-input rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/20 font-mono"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                  title={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl font-bold text-xs shadow-md shadow-primary/20 transition-all gap-2 cursor-pointer mt-2"
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

        <CardFooter className="px-6 pb-6 pt-3 flex flex-col space-y-2 border-t border-border mt-2">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={onExitToApp}
            className="text-xs text-muted-foreground hover:text-primary hover:bg-muted gap-2 h-9 rounded-xl w-full"
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobil ilovaga qaytish</span>
          </Button>
        </CardFooter>
      </Card>
      <a
        href="https://www.flaticon.com/uicons"
        target="_blank"
        rel="noreferrer"
        className="self-center text-xs text-muted-foreground hover:text-primary hover:underline"
      >
        Uicons by Flaticon
      </a>
      </div>
    </div>
  );
};

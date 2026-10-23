import React from 'react';
import { UserProfile, PaymentCard, LanguageCode, ThemeMode } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  User,
  CreditCard,
  Globe,
  Sun,
  Moon,
  Bell,
  MessageSquare,
  Smartphone,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Trash2,
  ChevronRight,
  Sparkles,
  FileText
} from 'lucide-react';

interface ProfileScreenProps {
  user: UserProfile;
  cards: PaymentCard[];
  tripsCount: number;
  savedCount: number;
  currentLang: LanguageCode;
  themeMode: ThemeMode;
  notificationsEnabled: boolean;
  onOpenEditProfile: () => void;
  onEditPassport: () => void;
  onOpenAddCard: () => void;
  onSetPrimaryCard: (id: string) => void;
  onDeleteCard: (id: string) => void;
  onSelectLang: (lang: LanguageCode) => void;
  onSelectTheme: (theme: ThemeMode) => void;
  onToggleNotifications: () => void;
  onOpenSupport: () => void;
  onLogout: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  cards,
  tripsCount,
  savedCount,
  currentLang,
  themeMode,
  notificationsEnabled,
  onOpenEditProfile,
  onEditPassport,
  onOpenAddCard,
  onSetPrimaryCard,
  onDeleteCard,
  onSelectLang,
  onSelectTheme,
  onToggleNotifications,
  onOpenSupport,
  onLogout,
  onShowToast
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-20 select-none">
      {/* 1. User Info Card */}
      <Card className="border-border bg-card shadow-xs relative overflow-hidden p-5">
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            <Avatar className="w-16 h-16 rounded-2xl border-2 border-primary/20 shadow-sm">
              <AvatarFallback className="rounded-2xl bg-primary/10 text-primary font-black text-2xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <Badge variant="default" className="absolute -bottom-1 -right-1 text-[9px] font-black px-1.5 py-0 h-4 uppercase shadow-xs">
              PRO
            </Badge>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <h2 className="text-base sm:text-lg font-bold truncate text-foreground" id="profile-display-name">
                  {user.name}
                </h2>
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenEditProfile}
                className="rounded-xl text-xs font-semibold h-7 px-2.5"
              >
                Tahrirlash
              </Button>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground" id="profile-display-phone">
                {user.phone}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground/80">
                ID: {user.tcId}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Identifikatsiyadan o'tgan mijoz</span>
            </div>
          </div>
        </div>

        {/* 3 Quick Metric Blocks */}
        <div className="grid grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-border text-center">
          <div className="rounded-xl p-3 bg-muted/40 border border-border/80">
            <p className="text-[11px] text-muted-foreground">Buyurtmalar</p>
            <p className="text-base font-bold text-foreground mt-0.5">{tripsCount} ta</p>
          </div>
          <div className="rounded-xl p-3 bg-muted/40 border border-border/80">
            <p className="text-[11px] text-muted-foreground">Saqlanganlar</p>
            <p className="text-base font-bold text-foreground mt-0.5">{savedCount} ta</p>
          </div>
          <div
            className="rounded-xl p-3 bg-muted/40 border border-border/80 cursor-pointer hover:bg-muted/70 transition-colors"
            onClick={() => onShowToast(`Keshbek miqdori: $${user.cashback}. Keyingi bron qilish uchun amal qiladi!`, 'success')}
          >
            <p className="text-[11px] text-muted-foreground">Keshbek</p>
            <p className="text-base font-bold text-primary mt-0.5">${user.cashback} ball</p>
          </div>
        </div>
      </Card>

      {/* 2. THEME MODE SELECTOR */}
      <Card className="border-border bg-card shadow-xs p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Ilova Rejimi (Theme Mode)
            </h3>
          </div>
          <Badge variant="secondary" className="text-[10px] font-semibold text-primary">
            {themeMode === 'light' ? 'Kunduzgi rejim faol' : 'Tungi rejim faol'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Button
            variant={themeMode === 'light' ? 'default' : 'outline'}
            id="btn-theme-light-mode"
            onClick={() => onSelectTheme('light')}
            className="justify-between h-auto p-3.5 rounded-xl cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-left">
              <Sun className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <p className="text-xs font-bold">Kunduzgi rejim (Light)</p>
                <p className="text-[10px] text-muted-foreground font-normal">Yorug' va qulay interfeys</p>
              </div>
            </div>
            {themeMode === 'light' && <CheckCircle2 className="w-4 h-4" />}
          </Button>

          <Button
            variant={themeMode === 'dark' ? 'default' : 'outline'}
            id="btn-theme-dark-mode"
            onClick={() => onSelectTheme('dark')}
            className="justify-between h-auto p-3.5 rounded-xl cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-left">
              <Moon className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <p className="text-xs font-bold">Tungi rejim (Dark)</p>
                <p className="text-[10px] text-muted-foreground font-normal">Ko'zga yoqimli to'q palitra</p>
              </div>
            </div>
            {themeMode === 'dark' && <CheckCircle2 className="w-4 h-4" />}
          </Button>
        </div>
      </Card>

      {/* 3. Travel Documents */}
      <Card className="border-border bg-card shadow-xs p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Sayohatchi Hujjatlari
            </h3>
          </div>
          <Badge variant="outline" className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
            Saqlangan
          </Badge>
        </div>

        <div className="rounded-xl p-3.5 bg-muted/40 border border-border/80 flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-foreground">
              Xorijga chiqish pasporti (Zagran)
            </p>
            <p className="text-xs font-mono tracking-wider text-muted-foreground" id="passport-number-text">
              {user.passportNumber}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Amal qilish muddati: <span className="font-semibold text-foreground">{user.passportExpiry} gacha</span>
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onEditPassport}
            className="rounded-xl text-xs font-semibold h-8"
          >
            Yangilash
          </Button>
        </div>
      </Card>

      {/* 4. Payment Cards Section */}
      <Card className="border-border bg-card shadow-xs p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Mening To'lov Kartalarim
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {cards.length} ta karta
          </span>
        </div>

        <div className="space-y-2" id="payment-cards-list">
          {cards.map((card) => {
            const isHumo = card.type === 'HUMO';
            const isVisa = card.type === 'VISA';
            const badgeGradient = isHumo
              ? 'from-emerald-600 to-teal-700'
              : isVisa
              ? 'from-sky-600 to-blue-700'
              : 'from-purple-600 to-indigo-700';

            return (
              <div
                key={card.id}
                className={`rounded-xl p-3 border flex items-center justify-between transition-colors ${
                  card.isPrimary ? 'border-primary bg-primary/5' : 'border-border bg-muted/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-7 bg-gradient-to-r ${badgeGradient} rounded-md flex items-center justify-center text-[9px] font-black text-white tracking-widest shadow-xs`}>
                    {card.type}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold font-mono text-foreground">
                        •••• {card.last4}
                      </p>
                      {card.isPrimary && (
                        <Badge variant="default" className="text-[8px] font-extrabold px-1.5 py-0 h-4">
                          Asosiy
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{card.bank}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {!card.isPrimary ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSetPrimaryCard(card.id)}
                      className="rounded-lg text-[10px] font-semibold h-7 px-2"
                    >
                      Tanlash
                    </Button>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteCard(card.id)}
                    className="text-muted-foreground hover:text-destructive h-7 w-7 p-0"
                    title="O'chirish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenAddCard}
          className="w-full border-dashed rounded-xl h-10 gap-2 text-xs font-semibold text-primary hover:text-primary"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi to'lov kartasi qo'shish</span>
        </Button>
      </Card>

      {/* 5. Language Selector */}
      <Card className="border-border bg-card shadow-xs p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Ilova Tili (Language)
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {currentLang === 'UZ' ? "O'zbek tili" : currentLang === 'RU' ? 'Русский язык' : 'English'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { code: 'UZ' as LanguageCode, label: "O'zbek tili", flag: '🇺🇿' },
            { code: 'RU' as LanguageCode, label: 'Русский', flag: '🇷🇺' },
            { code: 'EN' as LanguageCode, label: 'English', flag: '🇬🇧' }
          ].map((item) => {
            const isSelected = currentLang === item.code;
            return (
              <Button
                key={item.code}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSelectLang(item.code)}
                className="justify-between rounded-xl h-10 px-3 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{item.flag}</span>
                  <span className="text-xs font-semibold">{item.label}</span>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4" />}
              </Button>
            );
          })}
        </div>
      </Card>

      {/* 6. Security, Notifications & Support */}
      <Card className="border-border bg-card shadow-xs p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
          Xavfsizlik va Qo'llab-quvvatlash
        </h3>

        <div className="space-y-2">
          {/* Notification Toggle */}
          <div className="rounded-xl p-3 bg-muted/40 border border-border/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Push bildirishnomalar
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Turpaket va narx pasayishi signallari
                </p>
              </div>
            </div>
            <Button
              variant={notificationsEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleNotifications}
              className="rounded-xl text-xs h-8 px-3"
            >
              {notificationsEnabled ? 'Yoqilgan ✓' : "O'chirilgan"}
            </Button>
          </div>

          {/* 24/7 Support */}
          <Button
            variant="outline"
            onClick={onOpenSupport}
            className="w-full justify-between rounded-xl h-12 px-3.5 cursor-pointer bg-muted/40 border-border/80"
          >
            <div className="flex items-center gap-3 text-left">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <div>
                <p className="text-xs font-semibold text-foreground">24/7 Qo'llab-quvvatlash</p>
                <p className="text-[10px] text-muted-foreground font-normal">Onlayn Telegram maslahat xizmati</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Button>

          {/* App Version Info */}
          <div className="rounded-xl p-3 bg-muted/40 border border-border/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs font-semibold text-foreground">SayrHub Mobile Edition</p>
                <p className="text-[10px] text-muted-foreground">iOS / Android / Flutter v3.2.0</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
              {user.tcId ? `ID: ${user.tcId}` : 'Mehmon'}
            </Badge>
          </div>

          {/* Logout Button */}
          <Button
            variant="destructive"
            onClick={onLogout}
            className="w-full rounded-xl h-10 gap-2 text-xs font-bold mt-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Ilovadan chiqish (Akkauntni almashtirish)</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

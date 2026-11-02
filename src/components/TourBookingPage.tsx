import React, { useState, useEffect } from 'react';
import { TourPackage } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  ArrowLeft,
  Calendar,
  Plane,
  Building2,
  Users,
  CheckCircle2,
  Copy,
  Send,
  Bell,
  ShieldCheck,
  Luggage,
  Utensils,
  CreditCard,
  Sparkles,
  Phone,
  User,
  FileText,
  MapPin,
  Star,
  Clock,
  ChevronRight,
  Info,
  Lock,
  HeartHandshake
} from 'lucide-react';

interface TourBookingPageProps {
  tour: TourPackage;
  initialAdults?: number;
  initialChildren?: number;
  initialTravelers?: number;
  currentName?: string;
  currentPhone?: string;
  currentPassport?: string;
  onBack: () => void;
  onConfirmBooking: (bookingData: {
    tour: TourPackage;
    travelerName: string;
    phone?: string;
    passport: string;
    dob: string;
    payType: string;
    discount: number;
    travelersCount?: number;
    adultsCount?: number;
    childrenCount?: number;
  }) => void;
  onShowToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
  onOpenPriceAlert?: (tour: TourPackage) => void;
}

export const TourBookingPage: React.FC<TourBookingPageProps> = ({
  tour,
  initialAdults = 2,
  initialChildren = 0,
  initialTravelers = 2,
  currentName = '',
  currentPhone = '',
  currentPassport = '',
  onBack,
  onConfirmBooking,
  onShowToast,
  onOpenPriceAlert
}) => {
  // Steppers state
  const [adultsCount, setAdultsCount] = useState<number>(initialAdults || 2);
  const [childrenCount, setChildrenCount] = useState<number>(initialChildren || 0);

  // Form fields
  const [leadName, setLeadName] = useState<string>(currentName || '');
  const [leadPhone, setLeadPhone] = useState<string>(currentPhone || '+998 ');
  const [leadPassport, setLeadPassport] = useState<string>(currentPassport || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (currentName && !leadName) setLeadName(currentName);
    if (currentPhone && (!leadPhone || leadPhone === '+998 ')) setLeadPhone(currentPhone);
    if (currentPassport && !leadPassport) setLeadPassport(currentPassport);
  }, [currentName, currentPhone, currentPassport]);

  // Calculations
  const totalTravelers = adultsCount + childrenCount;
  const perAdult = tour.isLiveKompas
    ? Math.round(tour.price / 2)
    : tour.price;
  const perChild = Math.round(perAdult * 0.5);
  const finalPackagePrice = (adultsCount * perAdult) + (childrenCount * perChild);
  const perPersonEstimate = Math.round(finalPackagePrice / (totalTravelers || 1));
  const uzsEstimate = finalPackagePrice * 12950;

  // Nights count helper
  const parsedNights = tour.nightsCount || (tour.nights?.match(/\d+/) ? parseInt(tour.nights.match(/\d+/)![0], 10) : 7);

  const handleBookingSubmit = () => {
    if (!leadName.trim()) {
      onShowToast("Iltimos, asosiy sayohatchining ism va familiyasini kiriting!", 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      onConfirmBooking({
        tour,
        travelerName: leadName.trim(),
        phone: leadPhone.trim(),
        passport: leadPassport.trim() || 'N/A',
        dob: '',
        payType: 'online_booking',
        discount: 0,
        travelersCount: totalTravelers,
        adultsCount,
        childrenCount
      });
      onShowToast(`"${tour.title}" turi muvaffaqiyatli bron qilindi! 🎉`, 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copySmetaToClipboard = () => {
    const smeta = `SAYRHUB — TUR SPESIFIKATSIYASI VA SMETASI\n--------------------------------\n🌴 Mehmonxona: ${tour.title}\n📍 Manzil: ${tour.location} (${tour.resort || ''})\n✈️ Reys: ${tour.flightNumber || tour.flight} (${tour.airline || "O'zbekiston Havo Yo'llari"})\n📅 Jo'nash sanasi: ${tour.departureDate || 'Yaqin kunlarda'}\n🌙 Davomiyligi: ${parsedNights} kecha / ${parsedNights + 1} kun\n👥 Sayohatchilar: ${totalTravelers} kishi (${adultsCount} katta, ${childrenCount} bola)\n👤 Buyurtmachi: ${leadName || 'Mijoz'}\n📞 Telefon: ${leadPhone}\n🪪 Pasport: ${leadPassport || 'Kiritilmagan'}\n💰 Yakuniy narx: $${finalPackagePrice} (~${uzsEstimate.toLocaleString()} UZS)\n🆔 Turoperator kodi: ${tour.kompasTourCode || 'SH-UZ-9021'}\n--------------------------------\nSayrHub bilan qulay va xavfsiz sayohat!`;
    navigator.clipboard.writeText(smeta);
    onShowToast("Tur hisob-kitobi va smetasi nusxalandi! 📋", "success");
  };

  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(`https://sayrhub.uz`)}&text=${encodeURIComponent(
    `Assalomu alaykum! SayrHub orqali ushbu turni bron qilish bo'yicha savolim bor edi:\n\n🌴 Mehmonxona: ${tour.title}\n📍 Manzil: ${tour.location}\n✈️ Reys: ${tour.flightNumber || tour.flight}\n🌙 Muddat: ${tour.nights}\n👥 Sayohatchilar: ${totalTravelers} kishi (${adultsCount} katta, ${childrenCount} bola)\n👤 Ism: ${leadName}\n💵 Narx: $${finalPackagePrice}\n🆔 Kod: ${tour.kompasTourCode || 'SH-TR'}`
  )}`;

  return (
    <div className="min-h-screen pb-28 animate-fadeIn">
      {/* 1. TOP APP BAR (Dedicated page navigation) */}
      <div className="sticky top-0 z-40 backdrop-blur-md border-b bg-card/95 border-border transition-colors">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2 -ml-2 rounded-xl text-xs font-semibold hover:bg-muted text-card-foreground"
            type="button"
          >
            <ArrowLeft className="w-4 h-4 text-primary" />
            <span>Orqaga</span>
          </Button>

          <div className="flex flex-col items-center">
            <span className="text-xs font-black tracking-tight text-card-foreground">
              Turni bron qilish
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500 inline" />
              100% Rasmiy kafolatlangan vaucher
            </span>
          </div>

          <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0.5 rounded-lg border-border">
            {tour.kompasTourCode || 'SH-UZ-9021'}
          </Badge>
        </div>
      </div>

      {/* 2. MAIN BODY CONTENT */}
      <div className="max-w-3xl mx-auto px-4 pt-4 space-y-4">
        {/* HERO TOUR CARD */}
        <Card className="rounded-2xl border-border bg-card shadow-xs overflow-hidden">
          <div className="relative h-48 sm:h-56 w-full overflow-hidden">
            <img
              src={tour.img}
              alt={tour.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
            
            {/* Top Badges */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <Badge className="bg-primary text-primary-foreground font-black text-[11px] shadow-sm">
                SAYRHUB JONLI TUR
              </Badge>
              <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md text-amber-300 font-bold text-xs px-2.5 py-1 rounded-full border border-white/10">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                <span>{tour.rating || 5.0}</span>
                <span className="text-[10px] text-white/80">({tour.hotelStars || '5★'})</span>
              </div>
            </div>

            {/* Bottom Title on Image */}
            <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
              <h1 className="text-lg sm:text-xl font-extrabold leading-tight drop-shadow-md">
                {tour.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/90">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {tour.location} {tour.resort ? `• ${tour.resort}` : ''}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  {parsedNights} kecha / {parsedNights + 1} kun
                </span>
              </div>
            </div>
          </div>

          <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-muted/30">
            <div className="p-2.5 rounded-xl border border-border bg-card">
              <span className="text-[10px] text-muted-foreground block font-medium">Reys & Aviakompaniya</span>
              <p className="font-bold text-xs truncate text-card-foreground mt-0.5">
                {tour.flightNumber || tour.flight}
              </p>
              <p className="text-[10px] text-primary truncate">
                {tour.airline || "O'zbekiston Havo Yo'llari"}
              </p>
            </div>

            <div className="p-2.5 rounded-xl border border-border bg-card">
              <span className="text-[10px] text-muted-foreground block font-medium">Ovqatlanish</span>
              <p className="font-bold text-xs text-card-foreground mt-0.5">
                {tour.mealType || 'AI'} — {tour.mealDesc || tour.tag || 'All Inclusive'}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                Restoran & Bar bepul
              </p>
            </div>

            <div className="p-2.5 rounded-xl border border-border bg-card col-span-2 sm:col-span-1">
              <span className="text-[10px] text-muted-foreground block font-medium">Xona toifasi</span>
              <p className="font-bold text-xs text-card-foreground mt-0.5">
                {tour.roomType || 'Standard Room'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Barcha qulayliklar bilan
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 1. TRAVELERS STEPPER CARD */}
        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-card-foreground">
                    Sayohatchilar soni va tarkibi
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Narxlar avtomatik tarzda qayta hisoblanadi
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-bold border-primary/30 text-primary bg-primary/5">
                Jami: {totalTravelers} kishi
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pt-0">
            {/* Adults Stepper */}
            <div className="p-3 rounded-xl border border-border bg-muted/40 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-card-foreground">🧑 Katta yoshdagilar</span>
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-sky-500/10 text-sky-600 dark:text-sky-400 border-none">
                    12+ yosh
                  </Badge>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  To'liq tarif: <b className="text-card-foreground">${perAdult}</b> / kishi
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setAdultsCount(num)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all tap-bounce border ${
                        adultsCount === num
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-card text-card-foreground border-border hover:bg-muted'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <div className="flex items-center border border-border rounded-lg overflow-hidden bg-card">
                  <button
                    type="button"
                    onClick={() => setAdultsCount((prev) => Math.max(1, prev - 1))}
                    className="w-7 h-7 flex items-center justify-center font-bold text-sm hover:bg-muted text-card-foreground transition"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-card-foreground">
                    {adultsCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAdultsCount((prev) => Math.min(10, prev + 1))}
                    className="w-7 h-7 flex items-center justify-center font-bold text-sm hover:bg-muted text-card-foreground transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Children Stepper */}
            <div className="p-3 rounded-xl border border-border bg-muted/40 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-card-foreground">👶 Yosh bolalar</span>
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none">
                    0-11 yosh
                  </Badge>
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  50% maxsus chegirma: <b className="text-card-foreground">${perChild}</b>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setChildrenCount(num)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all tap-bounce border ${
                        childrenCount === num
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-card text-card-foreground border-border hover:bg-muted'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <div className="flex items-center border border-border rounded-lg overflow-hidden bg-card">
                  <button
                    type="button"
                    onClick={() => setChildrenCount((prev) => Math.max(0, prev - 1))}
                    className="w-7 h-7 flex items-center justify-center font-bold text-sm hover:bg-muted text-card-foreground transition"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-card-foreground">
                    {childrenCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setChildrenCount((prev) => Math.min(6, prev + 1))}
                    className="w-7 h-7 flex items-center justify-center font-bold text-sm hover:bg-muted text-card-foreground transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. LEAD TRAVELER FORM CARD */}
        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-card-foreground">
                  Asosiy buyurtmachi ma'lumotlari
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Aviachipta va turistik vaucher ushbu ma'lumotlar bilan rasmiylashtiriladi
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3.5 pt-0">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-card-foreground flex items-center gap-1.5">
                <span>F.I.SH (Ism va Familiya)</span>
                <span className="text-destructive">*</span>
              </Label>
              <Input
                type="text"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                placeholder="Masalan: Jasur Rahimov"
                className="rounded-xl h-10 text-xs bg-muted/40 border-border focus:bg-card"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-card-foreground flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-muted-foreground" />
                  <span>Telefon raqami</span>
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="rounded-xl h-10 text-xs bg-muted/40 border-border focus:bg-card font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-card-foreground flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-muted-foreground" />
                  <span>Pasport / ID seriya</span>
                  <span className="text-xs text-muted-foreground font-normal">(ixtiyoriy)</span>
                </Label>
                <Input
                  type="text"
                  value={leadPassport}
                  onChange={(e) => setLeadPassport(e.target.value)}
                  placeholder="FA 9842104"
                  className="rounded-xl h-10 text-xs bg-muted/40 border-border focus:bg-card font-mono uppercase"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/15 flex items-start gap-2 text-[11px] text-muted-foreground">
              <Lock className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                Ma'lumotlaringiz 100% himoyalangan va faqat xalqaro turoperator hamda sug'urta polisini ochish uchun ishlatiladi.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 3. FLIGHT & LOGISTICS DETAILS */}
        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Plane className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-card-foreground">
                  Parvoz va logistika spesifikatsiyasi
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  To'g'ridan-to'g'ri charter qatnovi va aeroport transferi
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-2.5 pt-0">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl border border-border bg-muted/30">
                <span className="text-[10px] text-muted-foreground block font-medium">Yo'nalish va reys</span>
                <p className="font-bold text-card-foreground mt-0.5">{tour.flightNumber || tour.flight}</p>
                <p className="text-[10px] text-primary mt-0.5 font-medium">{tour.airline || "Uzbekistan Airways"}</p>
              </div>

              <div className="p-3 rounded-xl border border-border bg-muted/30">
                <span className="text-[10px] text-muted-foreground block font-medium">Yuk me'yori (Baggage)</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {tour.baggage || "20 kg + 8 kg qo'l yuki"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Har bir sayyoh uchun</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-border bg-card flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-card-foreground font-medium">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                Aeroport ⇄ Mehmonxona qulay transferi:
              </span>
              <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] border-none font-bold">
                Kiritilgan (0$)
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 4. INCLUSIONS CHECKLIST */}
        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-card-foreground">
                  Paket tarkibiga to'liq kiritilgan xizmatlar
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  SayrHub orqali ortiqcha yashirin to'lovlar mavjud emas
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { title: 'To\'g\'ridan-to\'g\'ri aviaparvoz (Borish & Qaytish)', icon: '✈️' },
                { title: 'Aeroport — Mehmonxona — Aeroport transferi', icon: '🚐' },
                { title: `${tour.title} mehmonxonasida ${parsedNights} kecha`, icon: '🏨' },
                { title: `${tour.mealType || 'AI'} — Barcha ovqatlanish va ichimliklar`, icon: '🍽️' },
                { title: 'Xalqaro tibbiy sug\'urta polisi ($30,000)', icon: '🛡️' },
                { title: '24/7 SayrHub kuratori va gid hamrohligi', icon: '🧑‍💼' }
              ].map((inc, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-muted/40 border border-border">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-card-foreground font-medium text-[11px]">{inc.title}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 5. TRANSPARENT PRICE CALCULATION CARD */}
        <Card className="rounded-2xl border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-card-foreground">
                    Rasmiy narx hisob-kitobi (Smeta)
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    1:1 Turoperator kafolati bilan shaffof hisoblash
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none font-bold text-[10px]">
                Jonli narx
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-2 pt-0 text-xs">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Katta yoshdagilar ({adultsCount} kishi):</span>
              <span className="font-bold text-card-foreground">
                {adultsCount} × ${perAdult} = ${adultsCount * perAdult}
              </span>
            </div>

            {childrenCount > 0 && (
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                <span>Yosh bolalar ({childrenCount} bola - 50%):</span>
                <span className="font-bold">
                  {childrenCount} × ${perChild} = ${childrenCount * perChild}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-muted-foreground">
              <span>Jami sayohatchilar:</span>
              <span className="font-bold text-card-foreground">
                {totalTravelers} kishi ({adultsCount} katta{childrenCount > 0 ? `, ${childrenCount} bola` : ''})
              </span>
            </div>

            {totalTravelers > 1 && (
              <div className="flex justify-between items-center text-muted-foreground">
                <span>1 kishiga o'rtacha:</span>
                <span className="font-semibold text-card-foreground">
                  ~${perPersonEstimate} / kishi
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
              <span>Aeroport va yonilg'i yig'imlari:</span>
              <span className="font-bold">Kiritilgan ($0)</span>
            </div>

            <Separator className="my-2" />

            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-[11px] text-muted-foreground block font-medium">Jami yakuniy qiymat:</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                  ~{uzsEstimate.toLocaleString()} UZS
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-primary leading-none">
                  ${finalPackagePrice}
                </span>
                <span className="text-[9px] block text-emerald-600 dark:text-emerald-400 font-bold">
                  Kafolatlangan rasmiy narx
                </span>
              </div>
            </div>
          </CardContent>

          {/* Quick Share / Tools row inside Card Footer */}
          <CardFooter className="pt-0 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copySmetaToClipboard}
              className="flex-1 rounded-xl text-xs font-semibold gap-1.5 h-9"
              type="button"
            >
              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Smetani nusxalash</span>
            </Button>

            <a
              href={telegramShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-xl text-xs font-semibold gap-1.5 h-9 text-[#24A1DE] border-[#24A1DE]/30 hover:bg-[#24A1DE]/10"
                type="button"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Operatorga yozish</span>
              </Button>
            </a>

            {onOpenPriceAlert && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenPriceAlert(tour)}
                className="w-full rounded-xl text-xs font-semibold gap-1.5 h-8 text-primary hover:bg-primary/10"
                type="button"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Ushbu tur narxi tushganda signal berish</span>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* 3. STICKY BOTTOM ACTION BAR (Native Mobile UX) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-card/95 border-t border-border shadow-lg transition-colors">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-primary leading-none">
                ${finalPackagePrice}
              </span>
              <span className="text-[10px] text-muted-foreground">
                ({totalTravelers} kishi uchun)
              </span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold block">
              ~{uzsEstimate.toLocaleString()} UZS
            </span>
          </div>

          <Button
            size="lg"
            id="btn-confirm-page-booking"
            disabled={isSubmitting}
            onClick={handleBookingSubmit}
            className="flex-1 max-w-xs rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider h-12 gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20 active:scale-98 transition"
            type="button"
          >
            <Calendar className="w-4 h-4" />
            <span>{isSubmitting ? "Bron qilinmoqda..." : "Turni Bron Qilish"}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};


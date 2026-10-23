import React, { useState } from 'react';
import { Booking, TourPackage } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  XCircle,
  Heart,
  MapPin,
  Calendar,
  Users,
  Plane,
  Download,
  Trash2,
  Luggage,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface TripsScreenProps {
  bookings: Booking[];
  savedTours: TourPackage[];
  onOpenTourModal: (tour: TourPackage) => void;
  onDownloadVoucher: (voucherId: string, booking: Booking) => void;
  onCancelBooking: (bookingId: string) => void;
  onRemoveBooking?: (bookingId: string) => void;
  onRemoveSaved: (tourId: string) => void;
  onNavigateToSearch: () => void;
}

export const TripsScreen: React.FC<TripsScreenProps> = ({
  bookings,
  savedTours,
  onOpenTourModal,
  onDownloadVoucher,
  onCancelBooking,
  onRemoveBooking,
  onRemoveSaved,
  onNavigateToSearch
}) => {
  const [subTab, setSubTab] = useState<'active' | 'cancelled' | 'saved'>('active');

  const activeBookings = bookings.filter(
    (b) => b.type === 'active' && b.status !== 'Bekor qilingan'
  );
  const cancelledBookings = bookings.filter(
    (b) => b.type === 'cancelled' || b.status === 'Bekor qilingan'
  );

  return (
    <div className="space-y-4 pb-24 select-none">
      {/* Trips Navigation Tabs */}
      <div className="flex items-center p-1 rounded-2xl bg-muted/60 border border-border/80">
        <Button
          id="ttab-active"
          variant={subTab === 'active' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSubTab('active')}
          className="flex-1 rounded-xl text-xs font-bold h-9 gap-1.5 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Faol turlar ({activeBookings.length})</span>
        </Button>

        <Button
          id="ttab-cancelled"
          variant={subTab === 'cancelled' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSubTab('cancelled')}
          className="flex-1 rounded-xl text-xs font-bold h-9 gap-1.5 cursor-pointer"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Bekor qilingan ({cancelledBookings.length})</span>
        </Button>

        <Button
          id="ttab-saved"
          variant={subTab === 'saved' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSubTab('saved')}
          className="flex-1 rounded-xl text-xs font-bold h-9 gap-1.5 cursor-pointer"
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Saqlanganlar ({savedTours.length})</span>
        </Button>
      </div>

      {/* 1. ACTIVE BOOKINGS LIST VIEW */}
      {subTab === 'active' && (
        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4" id="trips-list-container">
          {activeBookings.length === 0 ? (
            <Card className="text-center py-12 p-6 col-span-full border-border bg-card">
              <Luggage className="w-12 h-12 mx-auto text-muted-foreground/60 mb-2" />
              <p className="text-sm font-semibold text-foreground">
                Sizda hozircha faol buyurtmalar yo'q
              </p>
              <Button
                variant="link"
                size="sm"
                onClick={onNavigateToSearch}
                className="text-xs font-bold text-primary mt-1"
              >
                SayrHub turpaketlarini qidirish va bron qilish →
              </Button>
            </Card>
          ) : (
            activeBookings.map((b) => {
              const totalGuests = b.guestsCount || (b.adultsCount ? b.adultsCount + (b.childrenCount || 0) : 1);
              return (
                <Card key={b.id} className="p-4 space-y-3.5 border-border bg-card shadow-xs">
                  <div className="flex items-center justify-between pb-2.5 border-b border-border">
                    <div>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        ID: {b.voucherId}
                      </span>
                      <h4 className="text-sm font-bold text-foreground">
                        {b.tourTitle}
                      </h4>
                    </div>
                    <Badge variant="secondary" className="gap-1 font-bold text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      {b.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Yo'nalish:</span>
                      <span className="font-semibold text-foreground flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        {b.dest}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Sanalar:</span>
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-primary shrink-0" />
                        {b.dates}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted-foreground block">Sayohatchilar:</span>
                      <span className="font-semibold text-foreground truncate block">
                        <Users className="w-3 h-3 inline mr-1 text-primary" />
                        {totalGuests} kishi
                        {b.adultsCount !== undefined && (
                          <span className="text-[10px] text-muted-foreground block font-normal">
                            {b.adultsCount} katta{b.childrenCount ? `, ${b.childrenCount} bola` : ''}
                          </span>
                        )}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted-foreground block">Sayyoh:</span>
                      <span className="font-semibold text-foreground truncate block">
                        {b.travelerName || 'Sayohatchi'}
                      </span>
                    </div>
                  </div>

                  {b.flight && (
                    <div className="p-2 rounded-xl text-xs bg-muted/50 flex items-center justify-between border border-border text-muted-foreground">
                      <span className="truncate flex items-center gap-1">
                        <Plane className="w-3.5 h-3.5 text-primary" />
                        {b.flight}
                      </span>
                      <span className="font-bold text-primary shrink-0">
                        {b.nightsCount || 7} kecha
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Jami:</span>
                      <span className="text-sm font-black text-primary">
                        {b.price}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownloadVoucher(b.voucherId, b)}
                        className="rounded-xl text-xs h-8 px-2.5 gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Vaucher</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onCancelBooking(b.id)}
                        className="rounded-xl text-xs h-8 px-2.5"
                      >
                        Bekor qilish
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* 2. CANCELLED BOOKINGS LIST VIEW */}
      {subTab === 'cancelled' && (
        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
          {cancelledBookings.length === 0 ? (
            <Card className="text-center py-12 p-6 col-span-full border-border bg-card">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-foreground">
                Sizda bekor qilingan buyurtmalar mavjud emas
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Barcha faol bronlaringiz "Faol turlar" bo'limida saqlanadi.
              </p>
            </Card>
          ) : (
            cancelledBookings.map((b) => {
              const totalGuests = b.guestsCount || (b.adultsCount ? b.adultsCount + (b.childrenCount || 0) : 1);
              return (
                <Card key={b.id} className="p-4 space-y-3.5 border-border bg-card shadow-xs opacity-90">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        ID: {b.voucherId}
                      </span>
                      <h4 className="text-sm font-bold text-muted-foreground line-through">
                        {b.tourTitle}
                      </h4>
                    </div>
                    <Badge variant="destructive" className="text-[10px] font-bold">
                      Bekor qilingan
                    </Badge>
                  </div>

                  <div className="p-2 rounded-xl text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-between font-semibold">
                    <span>💸 Mablag' to'liq qaytarilgan (100%)</span>
                    <span>Qaytarildi ✓</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Yo'nalish:</span>
                      <span className="font-semibold text-foreground truncate block">{b.dest}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Sanalar:</span>
                      <span className="font-semibold text-foreground block">{b.dates}</span>
                    </div>

                    {b.cancellationReason && (
                      <div className="col-span-2 p-2 rounded-lg bg-destructive/10 text-destructive text-xs">
                        <span className="font-bold">Sabab:</span> {b.cancellationReason}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Summa:</span>
                      <span className="text-xs font-bold line-through text-muted-foreground">
                        {b.price}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={onNavigateToSearch}
                        className="rounded-xl text-xs h-8"
                      >
                        Qayta bron qilish
                      </Button>
                      {onRemoveBooking && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveBooking(b.id)}
                          className="text-destructive hover:text-destructive text-xs h-8 px-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* 3. SAVED TOURS VIEW */}
      {subTab === 'saved' && (
        <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
          {savedTours.length === 0 ? (
            <Card className="text-center py-12 p-6 col-span-full border-border bg-card">
              <Heart className="w-12 h-12 mx-auto text-muted-foreground/60 mb-2" />
              <p className="text-sm font-semibold text-muted-foreground">
                Hech qanday turpaket saqlanmagan
              </p>
              <Button
                variant="link"
                size="sm"
                onClick={onNavigateToSearch}
                className="text-xs font-bold text-primary mt-1"
              >
                Turpaketlarni kashf etish →
              </Button>
            </Card>
          ) : (
            savedTours.map((tour) => (
              <Card key={tour.id} className="p-3 flex items-center justify-between gap-3 border-border bg-card shadow-xs">
                <img src={tour.img} className="w-16 h-16 rounded-xl object-cover" alt={tour.title} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold truncate text-foreground">
                    {tour.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-red-500" />
                    {tour.location}
                  </p>
                  <p className="text-sm font-black text-primary mt-1">
                    ${tour.price}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onOpenTourModal(tour)}
                    className="rounded-xl text-xs h-7 px-3"
                  >
                    Ko'rish
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveSaved(tour.id)}
                    className="text-destructive hover:text-destructive text-[11px] h-6 px-2"
                  >
                    O'chirish
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

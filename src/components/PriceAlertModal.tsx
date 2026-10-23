import React, { useState, useEffect } from 'react';
import { TourPackage, PriceAlert } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bell,
  X,
  Mail,
  Send,
  Check,
  TrendingDown,
  Sparkles,
  Trash2,
  MapPin,
  Clock,
  Zap
} from 'lucide-react';

interface PriceAlertModalProps {
  isOpen: boolean;
  tour: TourPackage | null;
  existingAlert?: PriceAlert;
  userEmail?: string;
  onClose: () => void;
  onSaveAlert: (alertData: {
    tourId: string;
    tourTitle: string;
    tourLocation: string;
    tourImg: string;
    currentPrice: number;
    targetPrice: number;
    notifyViaPush: boolean;
    notifyViaTelegram: boolean;
    userEmail?: string;
  }) => void;
  onDeleteAlert: (alertId: string) => void;
  onSimulatePriceDrop: (tourId: string, simulatedPrice: number) => void;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  tour,
  existingAlert,
  userEmail = 'jasur.travel@gmail.com',
  onClose,
  onSaveAlert,
  onDeleteAlert,
  onSimulatePriceDrop
}) => {
  if (!isOpen || !tour) return null;

  const currentPrice = tour.price;
  const initialTarget = existingAlert
    ? existingAlert.targetPrice
    : Math.max(200, Math.round((currentPrice * 0.9) / 10) * 10);

  const [targetPrice, setTargetPrice] = useState<number>(initialTarget);
  const [notifyViaPush, setNotifyViaPush] = useState<boolean>(existingAlert ? existingAlert.notifyViaPush : true);
  const [notifyViaTelegram, setNotifyViaTelegram] = useState<boolean>(
    existingAlert ? existingAlert.notifyViaTelegram : true
  );
  const [emailInput, setEmailInput] = useState<string>(existingAlert?.userEmail || userEmail);
  const [enableEmail, setEnableEmail] = useState<boolean>(Boolean(existingAlert?.userEmail));

  useEffect(() => {
    if (existingAlert) {
      setTargetPrice(existingAlert.targetPrice);
      setNotifyViaPush(existingAlert.notifyViaPush);
      setNotifyViaTelegram(existingAlert.notifyViaTelegram);
      setEnableEmail(Boolean(existingAlert.userEmail));
      if (existingAlert.userEmail) setEmailInput(existingAlert.userEmail);
    } else {
      setTargetPrice(Math.max(200, Math.round((currentPrice * 0.9) / 10) * 10));
      setNotifyViaPush(true);
      setNotifyViaTelegram(true);
    }
  }, [existingAlert, currentPrice]);

  const savings = Math.max(0, currentPrice - targetPrice);
  const savingsPercent = Math.round((savings / currentPrice) * 100);

  const discountPresets = [
    { label: '-5%', price: Math.round((currentPrice * 0.95) / 5) * 5 },
    { label: '-10%', price: Math.round((currentPrice * 0.9) / 5) * 5 },
    { label: '-15%', price: Math.round((currentPrice * 0.85) / 5) * 5 },
    { label: '-20%', price: Math.round((currentPrice * 0.8) / 5) * 5 }
  ];

  const handleSave = () => {
    if (targetPrice >= currentPrice) {
      alert("Chegara narxi hozirgi narxdan kamida $1 arzon bo'lishi kerak.");
      return;
    }

    onSaveAlert({
      tourId: tour.id,
      tourTitle: tour.title,
      tourLocation: tour.location,
      tourImg: tour.img,
      currentPrice,
      targetPrice,
      notifyViaPush,
      notifyViaTelegram,
      userEmail: enableEmail ? emailInput : undefined
    });
    onClose();
  };

  const handleSimulate = () => {
    const dropTo = Math.max(150, targetPrice - 15);
    onSimulatePriceDrop(tour.id, dropTo);
    onClose();
  };

  return (
    <div
      id="modal-price-alert"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md border-border bg-card shadow-2xl rounded-t-[28px] sm:rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Narx Pasayishi Signali</h3>
              <p className="text-[11px] text-muted-foreground">
                {existingAlert ? "Faol obunani boshqarish" : "Tur arzonlashganda birinchi bo'lib biling"}
              </p>
            </div>
          </div>
          <Button
            id="btn-close-price-alert"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tour mini card */}
        <div className="p-3 rounded-xl border border-border bg-muted/40 flex items-center gap-3">
          <img
            src={tour.img}
            alt={tour.title}
            className="w-14 h-14 rounded-xl object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold truncate text-foreground">{tour.title}</h4>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-red-500" />
              {tour.location}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-muted-foreground">Hozirgi narx:</span>
              <span className="text-xs font-black font-mono text-primary">${currentPrice}</span>
            </div>
          </div>
        </div>

        {/* Existing Alert Status */}
        {existingAlert && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-500" />
              <div>
                <span className="font-bold block">Obuna faol: ${existingAlert.targetPrice} dan arzon</span>
                <span className="text-[10px] text-emerald-600/80">O'rnatilgan sana: {existingAlert.createdAt}</span>
              </div>
            </div>
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold text-[10px]">
              Kutilmoqda
            </Badge>
          </div>
        )}

        {/* Target Threshold Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground">
              Kutilayotgan chegara narxi:
            </label>
            <Badge variant="default" className="text-sm font-black font-mono px-2.5 py-0.5">
              ${targetPrice}
            </Badge>
          </div>

          {/* Stepper & Slider */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/40 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTargetPrice((p) => Math.max(150, p - 10))}
                className="w-8 h-8 rounded-lg font-black text-sm"
              >
                -
              </Button>
              <div className="flex-1 text-center">
                <input
                  id="range-target-price"
                  type="range"
                  min={150}
                  max={currentPrice - 10}
                  step={10}
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(parseInt(e.target.value, 10))}
                  className="w-full cursor-pointer h-2 rounded-lg accent-primary"
                />
                <div className="flex justify-between text-[9px] font-mono mt-1 text-muted-foreground">
                  <span>$150</span>
                  <span>O'rta: ${Math.round(currentPrice * 0.75)}</span>
                  <span>Maks: ${currentPrice - 10}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTargetPrice((p) => Math.min(currentPrice - 10, p + 10))}
                className="w-8 h-8 rounded-lg font-black text-sm"
              >
                +
              </Button>
            </div>

            {/* Savings projection */}
            <div className="p-2 rounded-lg border border-border bg-card flex items-center justify-between text-xs">
              <span className="text-[11px] text-muted-foreground">Kutilayotgan tejov:</span>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">+${savings}</span>
                <Badge variant="secondary" className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                  ({savingsPercent}% chegirma)
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="grid grid-cols-4 gap-1.5 text-[11px]">
            {discountPresets.map((preset) => {
              const isSelected = targetPrice === preset.price;
              return (
                <Button
                  key={preset.label}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTargetPrice(preset.price)}
                  className="h-auto py-1 px-1 rounded-xl flex flex-col items-center"
                >
                  <span className="font-bold">{preset.label}</span>
                  <span className="text-[9px] font-mono opacity-80">${preset.price}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Notification Channels */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground">
            Xabarnoma yuborish kanallari:
          </label>
          <div className="space-y-2">
            {/* Push */}
            <label className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/40 cursor-pointer">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-primary" />
                <div>
                  <span className="text-xs font-bold text-foreground block">Ilova Push-bildirishnomasi</span>
                  <span className="text-[10px] text-muted-foreground">Tezkor ekran xabarnomasi</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyViaPush}
                onChange={(e) => setNotifyViaPush(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer accent-primary"
              />
            </label>

            {/* Telegram */}
            <label className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/40 cursor-pointer">
              <div className="flex items-center gap-2.5">
                <Send className="w-4 h-4 text-sky-500" />
                <div>
                  <span className="text-xs font-bold text-foreground block">Telegram Bot (@sayrhub_bot)</span>
                  <span className="text-[10px] text-muted-foreground">Telegram orqali to'g'ridan-to'g'ri xabar</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyViaTelegram}
                onChange={(e) => setNotifyViaTelegram(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer accent-primary"
              />
            </label>

            {/* Email */}
            <div className="p-2.5 rounded-xl border border-border bg-muted/40 space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-primary" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">Elektron pochta (Email)</span>
                    <span className="text-[10px] text-muted-foreground">Batafsil xat sifatida jo'natiladi</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableEmail}
                  onChange={(e) => setEnableEmail(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer accent-primary"
                />
              </label>
              {enableEmail && (
                <Input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@gmail.com"
                  className="h-8 text-xs bg-background rounded-lg"
                />
              )}
            </div>
          </div>
        </div>

        {/* Live Simulation */}
        <div className="border border-border p-3 rounded-xl bg-muted/40 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold text-foreground">Sinov rejimi (Test alert)</span>
            </div>
            <Badge variant="outline" className="text-[9px] font-mono text-primary">
              Live Demo
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground leading-tight">
            Ushbu tur narxini hozirning o'zida kutilayotgan chegaradan <b>(${Math.max(150, targetPrice - 15)})</b> pastga
            tushirib, bildirishnoma ishlashini sinab ko'ring.
          </p>
          <Button
            variant="outline"
            size="sm"
            id="btn-simulate-price-drop"
            onClick={handleSimulate}
            className="w-full text-xs font-semibold h-8 rounded-lg gap-1.5 text-primary"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Narx tushishini hozir sinab ko'rish</span>
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          {existingAlert && (
            <Button
              variant="destructive"
              size="sm"
              id="btn-delete-price-alert"
              onClick={() => {
                onDeleteAlert(existingAlert.id);
                onClose();
              }}
              className="h-10 px-3 rounded-xl gap-1 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>O'chirish</span>
            </Button>
          )}

          <Button
            variant="default"
            size="lg"
            id="btn-save-price-alert"
            onClick={handleSave}
            className="flex-1 h-10 rounded-xl text-xs font-bold gap-2"
          >
            <span>{existingAlert ? "O'zgarishlarni saqlash" : "Obuna bo'lish"}</span>
            <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[10px] font-mono">
              &lt; ${targetPrice}
            </Badge>
          </Button>
        </div>
      </Card>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { TourPackage, PriceAlert } from '../types';

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

  // Sync when existingAlert or tour changes
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
    // Drop price to $10 below the target threshold
    const dropTo = Math.max(150, targetPrice - 15);
    onSimulatePriceDrop(tour.id, dropTo);
    onClose();
  };

  return (
    <div
      id="modal-price-alert"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end max-w-[420px] mx-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="border-t rounded-t-[32px] p-5 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl animate-slideUp"
        style={{
          backgroundColor: 'var(--tw-surface)',
          borderColor: 'var(--tw-border)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--tw-border)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center border shadow-xs"
              style={{
                backgroundColor: 'var(--tw-accent-light)',
                borderColor: 'var(--tw-accent)',
                color: 'var(--tw-accent)'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.75 9h16.5"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-extrabold" style={{ color: 'var(--tw-text-main)' }}>Narx Pasayishi Signali</h3>
              <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>
                {existingAlert ? "Faol obunani boshqarish" : "Tur arzonlashganda birinchi bo'lib biling"}
              </p>
            </div>
          </div>
          <button
            id="btn-close-price-alert"
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold tap-bounce transition border"
            style={{
              backgroundColor: 'var(--tw-subtle)',
              borderColor: 'var(--tw-border)',
              color: 'var(--tw-text-main)'
            }}
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Tour mini card */}
        <div
          className="p-3 rounded-2xl border flex items-center gap-3"
          style={{
            backgroundColor: 'var(--tw-subtle)',
            borderColor: 'var(--tw-border)'
          }}
        >
          <img
            src={tour.img}
            alt={tour.title}
            className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-700/30"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold truncate" style={{ color: 'var(--tw-text-main)' }}>{tour.title}</h4>
            <p className="text-[10px] truncate" style={{ color: 'var(--tw-text-sub)' }}>📍 {tour.location}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>Hozirgi narx:</span>
              <span className="text-xs font-black font-mono" style={{ color: 'var(--tw-accent)' }}>${currentPrice}</span>
            </div>
          </div>
        </div>

        {/* Existing Alert Status Badge if any */}
        {existingAlert && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <span className="text-base">🔔</span>
              <div>
                <span className="font-bold block">Obuna faol: ${existingAlert.targetPrice} dan arzon</span>
                <span className="text-[10px] text-emerald-500/80">O'rnatilgan sana: {existingAlert.createdAt}</span>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
              Kutilmoqda
            </span>
          </div>
        )}

        {/* Target Threshold Selector */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--tw-text-main)' }}>
              <span>🎯</span>
              <span>Kutilayotgan chegara narxi:</span>
            </label>
            <div className="flex items-center gap-1.5">
              <span
                className="text-sm font-black px-2.5 py-0.5 rounded-full border font-mono"
                style={{
                  backgroundColor: 'var(--tw-accent-light)',
                  borderColor: 'var(--tw-accent)',
                  color: 'var(--tw-accent)'
                }}
              >
                ${targetPrice}
              </span>
            </div>
          </div>

          {/* Stepper & Slider */}
          <div
            className="p-3.5 rounded-2xl border space-y-3"
            style={{
              backgroundColor: 'var(--tw-subtle)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setTargetPrice((p) => Math.max(150, p - 10))}
                className="w-9 h-9 rounded-xl font-black text-base flex items-center justify-center border tap-bounce"
                style={{
                  backgroundColor: 'var(--tw-surface)',
                  borderColor: 'var(--tw-border)',
                  color: 'var(--tw-text-main)'
                }}
              >
                -
              </button>
              <div className="flex-1 text-center">
                <input
                  id="range-target-price"
                  type="range"
                  min={150}
                  max={currentPrice - 10}
                  step={10}
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(parseInt(e.target.value, 10))}
                  className="w-full cursor-pointer h-2 rounded-lg"
                  style={{ accentColor: 'var(--tw-accent)' }}
                />
                <div className="flex justify-between text-[9px] font-mono mt-1" style={{ color: 'var(--tw-text-sub)' }}>
                  <span>$150</span>
                  <span>O'rta: ${Math.round(currentPrice * 0.75)}</span>
                  <span>Maks: ${currentPrice - 10}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTargetPrice((p) => Math.min(currentPrice - 10, p + 10))}
                className="w-9 h-9 rounded-xl font-black text-base flex items-center justify-center border tap-bounce"
                style={{
                  backgroundColor: 'var(--tw-surface)',
                  borderColor: 'var(--tw-border)',
                  color: 'var(--tw-text-main)'
                }}
              >
                +
              </button>
            </div>

            {/* Savings projection */}
            <div
              className="p-2 rounded-xl border flex items-center justify-between text-xs"
              style={{
                backgroundColor: 'var(--tw-surface)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <span className="text-[11px]" style={{ color: 'var(--tw-text-sub)' }}>Kutilayotgan tejov:</span>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-emerald-500 font-mono">+${savings}</span>
                <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded font-bold">
                  ({savingsPercent}% chegirma)
                </span>
              </div>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="grid grid-cols-4 gap-1.5 text-[11px]">
            {discountPresets.map((preset) => {
              const isSelected = targetPrice === preset.price;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setTargetPrice(preset.price)}
                  className="py-1.5 px-1 rounded-xl text-center border font-bold transition tap-bounce"
                  style={{
                    backgroundColor: isSelected ? 'var(--tw-accent-light)' : 'var(--tw-subtle)',
                    borderColor: isSelected ? 'var(--tw-accent)' : 'var(--tw-border)',
                    color: isSelected ? 'var(--tw-accent)' : 'var(--tw-text-main)'
                  }}
                >
                  <div>{preset.label}</div>
                  <div className="text-[9px] font-normal font-mono" style={{ color: 'var(--tw-text-sub)' }}>${preset.price}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notification Channels */}
        <div className="space-y-2">
          <label className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--tw-text-main)' }}>
            <span>📢</span>
            <span>Xabarnoma yuborish kanallari:</span>
          </label>
          <div className="space-y-1.5">
            {/* Push Notification */}
            <label
              className="flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">🔔</span>
                <div>
                  <span className="text-xs font-bold block" style={{ color: 'var(--tw-text-main)' }}>Ilova Push-bildirishnomasi</span>
                  <span className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>Tezkor ekran xabarnomasi va status paneli</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyViaPush}
                onChange={(e) => setNotifyViaPush(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: 'var(--tw-accent)' }}
              />
            </label>

            {/* Telegram Bot */}
            <label
              className="flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">✈️</span>
                <div>
                  <span className="text-xs font-bold block" style={{ color: 'var(--tw-text-main)' }}>Telegram Bot (@travelway_bot)</span>
                  <span className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>Telegram orqali to'g'ridan-to'g'ri xabar</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyViaTelegram}
                onChange={(e) => setNotifyViaTelegram(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: 'var(--tw-accent)' }}
              />
            </label>

            {/* Email */}
            <div
              className="p-2.5 rounded-2xl border space-y-2"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">✉️</span>
                  <div>
                    <span className="text-xs font-bold block" style={{ color: 'var(--tw-text-main)' }}>Elektron pochta (Email)</span>
                    <span className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>Batafsil ma'lumot xat sifatida jo'natiladi</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableEmail}
                  onChange={(e) => setEnableEmail(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer"
                  style={{ accentColor: 'var(--tw-accent)' }}
                />
              </label>
              {enableEmail && (
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full text-xs border rounded-xl px-3 py-2 focus:outline-none"
                  style={{
                    backgroundColor: 'var(--tw-surface)',
                    borderColor: 'var(--tw-border)',
                    color: 'var(--tw-text-main)'
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Simulation / Demo Section */}
        <div
          className="border p-3 rounded-2xl space-y-1.5"
          style={{
            backgroundColor: 'var(--tw-subtle)',
            borderColor: 'var(--tw-border)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">⚡️</span>
              <span className="text-[11px] font-bold" style={{ color: 'var(--tw-text-main)' }}>Sinov rejimi (Test alert)</span>
            </div>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded border font-mono"
              style={{
                backgroundColor: 'var(--tw-accent-light)',
                borderColor: 'var(--tw-accent)',
                color: 'var(--tw-accent)'
              }}
            >
              Live Demo
            </span>
          </div>
          <p className="text-[10px] leading-tight" style={{ color: 'var(--tw-text-sub)' }}>
            Ushbu tur narxini hozirning o'zida kutilayotgan chegaradan <b>(${Math.max(150, targetPrice - 15)})</b> pastga
            tushirib, bildirishnoma ishlashini darhol sinab ko'ring.
          </p>
          <button
            type="button"
            id="btn-simulate-price-drop"
            onClick={handleSimulate}
            className="w-full py-1.5 px-3 rounded-xl text-[11px] font-bold tap-bounce flex items-center justify-center gap-1.5 transition border"
            style={{
              backgroundColor: 'var(--tw-accent-light)',
              borderColor: 'var(--tw-accent)',
              color: 'var(--tw-accent)'
            }}
          >
            <span>📉 Narx tushishini hozir sinab ko'rish</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: 'var(--tw-border)' }}>
          {existingAlert && (
            <button
              type="button"
              id="btn-delete-price-alert"
              onClick={() => {
                onDeleteAlert(existingAlert.id);
                onClose();
              }}
              className="px-3 py-3 bg-red-500/15 hover:bg-red-500/25 text-red-500 border border-red-500/30 rounded-2xl text-xs font-bold tap-bounce transition flex items-center gap-1"
              title="Obunani bekor qilish"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span>O'chirish</span>
            </button>
          )}

          <button
            type="button"
            id="btn-save-price-alert"
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl text-xs font-extrabold tap-bounce shadow-md flex items-center justify-center gap-2 transition"
            style={{
              backgroundColor: 'var(--tw-accent)',
              color: 'var(--tw-accent-contrast)'
            }}
          >
            <span>{existingAlert ? "O'zgarishlarni saqlash" : "Obuna bo'lish"}</span>
            <span className="bg-black/20 px-2 py-0.5 rounded-full text-[10px] font-mono">
              &lt; ${targetPrice}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Booking } from '../types';
import { AdminRole, AdminUser } from './adminTypes';

interface AdminBookingsManagerProps {
  currentRole: AdminRole;
  currentAdmin: AdminUser;
  bookings: Booking[];
  onUpdateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  onCancelBooking: (bookingId: string) => void;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  globalSearch?: string;
}

export const AdminBookingsManager: React.FC<AdminBookingsManagerProps> = ({
  currentRole,
  currentAdmin,
  bookings,
  onUpdateBookingStatus,
  onCancelBooking,
  onShowToast,
  globalSearch = ''
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const effectiveSearch = (search || globalSearch).trim().toLowerCase();

  const filteredBookings = bookings.filter((b) => {
    const matchSearch =
      !effectiveSearch ||
      (b.tourTitle && b.tourTitle.toLowerCase().includes(effectiveSearch)) ||
      (b.travelerName && b.travelerName.toLowerCase().includes(effectiveSearch)) ||
      (b.voucherId && b.voucherId.toLowerCase().includes(effectiveSearch)) ||
      (b.dest && b.dest.toLowerCase().includes(effectiveSearch));

    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = (bookingId: string, newStatus: Booking['status']) => {
    onUpdateBookingStatus(bookingId, newStatus);
    onShowToast(`Buyurtma holati "${newStatus}" ga o'zgartirildi!`, 'success');
    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking({ ...selectedBooking, status: newStatus });
    }
  };

  const handleCancel = (bookingId: string, title: string) => {
    if (confirm(`"${title}" buyurtmasini bekor qilishni xohlaysizmi?`)) {
      onCancelBooking(bookingId);
      onShowToast(`Buyurtma bekor qilindi`, 'info');
      setSelectedBooking(null);
    }
  };

  // CSV Export utility
  const handleExportCSV = () => {
    if (filteredBookings.length === 0) {
      onShowToast("Eksport qilish uchun ma'lumot topilmadi!", 'error');
      return;
    }

    const headers = ['Vaucher ID', 'Sayohatchi', 'Tur Nomi', 'Yo\'nalish', 'Sana', 'Summa', 'Status'];
    const rows = filteredBookings.map(b => [
      `"${b.voucherId || ''}"`,
      `"${b.travelerName || ''}"`,
      `"${b.tourTitle || ''}"`,
      `"${b.dest || ''}"`,
      `"${b.dates || ''}"`,
      `"${b.price || ''}"`,
      `"${b.status || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SayrHub_Buyurtmalar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast("Buyurtmalar ro'yxati CSV fayl sifatida yuklab olindi! 📥", 'success');
  };

  const handlePrintVoucher = () => {
    window.print();
  };

  const pendingCount = bookings.filter(b => b.status === 'Jarayonda').length;
  const confirmedCount = bookings.filter(b => b.status === 'Tasdiqlangan').length;
  const readyCount = bookings.filter(b => b.status === 'Vaucher tayyor').length;

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>📋</span> Mijozlar Buyurtmalari & Vaucherlar ({bookings.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ilovadan tushgan barcha bronlar, to'lovlar va elektron vaucherlar nazorati
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 font-semibold text-xs shadow-2xs transition-all tap-bounce"
            type="button"
            title="Excel va CSV formatida hisobotni yuklab olish"
          >
            <span className="material-symbols-outlined text-[17px] text-emerald-600 dark:text-emerald-400">download</span>
            <span>CSV Eksport</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Pills & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 dark:bg-sky-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Barchasi ({bookings.length})
          </button>

          <button
            onClick={() => setStatusFilter('Jarayonda')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
              statusFilter === 'Jarayonda'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60'
            }`}
          >
            <span>⏳ Kutilmoqda</span>
            <span className="font-bold">({pendingCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('Tasdiqlangan')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
              statusFilter === 'Tasdiqlangan'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60'
            }`}
          >
            <span>✅ Tasdiqlangan</span>
            <span className="font-bold">({confirmedCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('Vaucher tayyor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
              statusFilter === 'Vaucher tayyor'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800/60'
            }`}
          >
            <span>🎟️ Vaucher tayyor</span>
            <span className="font-bold">({readyCount})</span>
          </button>
        </div>

        {/* Local Search input */}
        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Vaucher, sayohatchi yoki tur..."
            className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 pl-9 pr-7 py-1.5 rounded-xl text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. Bookings Table */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5">Vaucher / Tur</th>
                <th className="py-3.5 px-3">Sayohatchi</th>
                <th className="py-3.5 px-3">Marshrut & Muddat</th>
                <th className="py-3.5 px-3">Narx (USD)</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 pr-5 text-right">Boshqarish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    Qidiruv bo'yicha hech qanday buyurtma topilmadi
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const isApproved = b.status === 'Tasdiqlangan';
                  const isVoucher = b.status === 'Vaucher tayyor';
                  const isPending = b.status === 'Jarayonda';

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          {b.hotelImg ? (
                            <img
                              src={b.hotelImg}
                              alt=""
                              className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 text-base">
                              🏖️
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-[200px]">
                              {b.tourTitle}
                            </p>
                            <span className="font-mono text-sky-600 dark:text-sky-400 text-[11px] font-bold">
                              {b.voucherId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-slate-900 dark:text-white text-xs">{b.travelerName}</p>
                        <p className="text-[11px] text-slate-400">{b.flight || 'Charter reys kiritilgan'}</p>
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{b.dest}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{b.dates}</p>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-sm font-bold font-mono text-sky-600 dark:text-sky-400">{b.price}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Tasdiqlangan
                          </span>
                        ) : isVoucher ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 px-2.5 py-0.5 rounded-full border border-sky-200/80 dark:border-sky-800/60">
                            🎟️ Vaucher tayyor
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full border border-amber-200/80 dark:border-amber-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Kutilmoqda
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-0.5 rounded-full border border-rose-200/80 dark:border-rose-800/60">
                            Bekor qilindi
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <button
                              onClick={() => handleStatusChange(b.id, 'Tasdiqlangan')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all tap-bounce shadow-2xs"
                              title="Tezkor tasdiqlash"
                            >
                              ✓ Tasdiqlash
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 hover:text-sky-700 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all"
                          >
                            Batafsil
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. BOOKING DETAILS & VOUCHER MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 tracking-wider">
                  Bron Tafsilotlari & Vaucher
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">{selectedBooking.tourTitle}</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Voucher Card preview */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Elektron Vaucher:</span>
                <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
                  {selectedBooking.voucherId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Asosiy Sayohatchi:</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{selectedBooking.travelerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Yo'nalish & Manzil:</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{selectedBooking.dest}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sana & Muddat:</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{selectedBooking.dates}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Reys / Aviatransport:</span>
                <span className="text-xs font-semibold text-sky-700 dark:text-sky-300">
                  {selectedBooking.flight || 'Charter HY-3501 (Toshkent ➔ Antalya)'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">To'langan Summa:</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  {selectedBooking.price}
                </span>
              </div>
            </div>

            {/* Change Status Buttons */}
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-2">
                Buyurtma Holatini O'zgartirish:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedBooking.id, 'Jarayonda')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedBooking.status === 'Jarayonda'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900'
                  }`}
                >
                  ⏳ Jarayonda
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedBooking.id, 'Tasdiqlangan')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedBooking.status === 'Tasdiqlangan'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900'
                  }`}
                >
                  ✅ Tasdiqlangan
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedBooking.id, 'Vaucher tayyor')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedBooking.status === 'Vaucher tayyor'
                      ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900'
                  }`}
                >
                  🎟️ Vaucher tayyor
                </button>
              </div>
            </div>

            {/* Print & Cancel Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handlePrintVoucher}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 text-slate-700 dark:text-slate-200 text-xs font-semibold"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Chop Etish</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCancel(selectedBooking.id, selectedBooking.tourTitle)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 py-1.5 px-2"
                >
                  Bekor qilish
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-sky-600 text-white text-xs font-bold shadow-2xs"
                >
                  Saqlash & Yopish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

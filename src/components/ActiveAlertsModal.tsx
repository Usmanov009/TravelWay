import React from 'react';
import { PriceAlert, TourPackage } from '../types';

interface ActiveAlertsModalProps {
  isOpen: boolean;
  alerts: PriceAlert[];
  tours: TourPackage[];
  onClose: () => void;
  onEditAlert: (tour: TourPackage) => void;
  onDeleteAlert: (alertId: string) => void;
  onSimulatePriceDrop: (tourId: string, simulatedPrice: number) => void;
}

export const ActiveAlertsModal: React.FC<ActiveAlertsModalProps> = ({
  isOpen,
  alerts,
  tours,
  onClose,
  onEditAlert,
  onDeleteAlert,
  onSimulatePriceDrop
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="modal-active-alerts"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end max-w-[420px] mx-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="border-t rounded-t-[32px] p-5 space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl animate-slideUp"
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
              <span className="text-base">🔔</span>
            </div>
            <div>
              <h3 className="text-sm font-extrabold" style={{ color: 'var(--tw-text-main)' }}>Mening Narx Signallarim</h3>
              <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>
                {alerts.length > 0 ? `${alerts.length} ta tur paket kuzatuvda` : "Hozircha faol signallar yo'q"}
              </p>
            </div>
          </div>
          <button
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

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <div
            className="p-8 text-center space-y-3 rounded-2xl border"
            style={{
              backgroundColor: 'var(--tw-subtle)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto text-xl border"
              style={{
                backgroundColor: 'var(--tw-accent-light)',
                borderColor: 'var(--tw-accent)',
                color: 'var(--tw-accent)'
              }}
            >
              🔔
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold" style={{ color: 'var(--tw-text-main)' }}>Faol narx signallari yo'q</h4>
              <p className="text-[11px] max-w-[240px] mx-auto" style={{ color: 'var(--tw-text-sub)' }}>
                Qidiruv natijalaridagi istalgan tur kartasidagi <b>qo'ng'iroqcha (🔔)</b> belgisini bosib, narx
                tushishiga obuna bo'ling!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const currentTour = tours.find((t) => t.id === alert.tourId);
              const currentPrice = currentTour ? currentTour.price : alert.currentPrice;
              const isThresholdMet = currentPrice <= alert.targetPrice;
              const diff = currentPrice - alert.targetPrice;

              return (
                <div
                  key={alert.id}
                  className="border rounded-2xl p-3 space-y-2.5 transition"
                  style={{
                    backgroundColor: isThresholdMet ? 'var(--tw-accent-light)' : 'var(--tw-subtle)',
                    borderColor: isThresholdMet ? 'var(--tw-accent)' : 'var(--tw-border)'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={alert.tourImg}
                      alt={alert.tourTitle}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-700/30"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded"
                          style={{
                            backgroundColor: 'var(--tw-accent-light)',
                            color: 'var(--tw-accent)'
                          }}
                        >
                          {isThresholdMet ? '🎉 Narx Tushdi!' : 'Kuzatuvda'}
                        </span>
                        <span className="text-[9px] font-mono" style={{ color: 'var(--tw-text-sub)' }}>{alert.createdAt}</span>
                      </div>
                      <h4 className="text-xs font-bold truncate mt-0.5" style={{ color: 'var(--tw-text-main)' }}>{alert.tourTitle}</h4>
                      <p className="text-[10px] truncate" style={{ color: 'var(--tw-text-sub)' }}>📍 {alert.tourLocation}</p>

                      <div className="flex items-center gap-2 mt-1.5 text-xs">
                        <div>
                          <span className="text-[9px] block" style={{ color: 'var(--tw-text-sub)' }}>Joriy narx:</span>
                          <span className="font-bold font-mono" style={{ color: 'var(--tw-text-main)' }}>${currentPrice}</span>
                        </div>
                        <div className="font-bold" style={{ color: 'var(--tw-text-sub)' }}>→</div>
                        <div>
                          <span className="text-[9px] block font-semibold" style={{ color: 'var(--tw-accent)' }}>Chegara:</span>
                          <span className="font-bold font-mono" style={{ color: 'var(--tw-accent)' }}>&lt; ${alert.targetPrice}</span>
                        </div>
                        {diff > 0 ? (
                          <span
                            className="text-[9px] ml-auto px-2 py-0.5 rounded-lg border"
                            style={{
                              backgroundColor: 'var(--tw-surface)',
                              borderColor: 'var(--tw-border)',
                              color: 'var(--tw-text-sub)'
                            }}
                          >
                            Yana ${diff}
                          </span>
                        ) : (
                          <span className="text-[9px] text-emerald-500 font-bold ml-auto bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                            Chegaradan past!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notification channels active pills */}
                  <div
                    className="flex items-center gap-1.5 text-[9px] p-1.5 rounded-xl border"
                    style={{
                      backgroundColor: 'var(--tw-surface)',
                      borderColor: 'var(--tw-border)',
                      color: 'var(--tw-text-sub)'
                    }}
                  >
                    <span>Kanallar:</span>
                    {alert.notifyViaPush && (
                      <span
                        className="px-1.5 py-0.2 rounded font-semibold"
                        style={{
                          backgroundColor: 'var(--tw-accent-light)',
                          color: 'var(--tw-accent)'
                        }}
                      >
                        📱 Push
                      </span>
                    )}
                    {alert.notifyViaTelegram && (
                      <span className="bg-sky-500/15 text-sky-500 px-1.5 py-0.2 rounded font-semibold">
                        ✈️ Telegram
                      </span>
                    )}
                    {alert.userEmail && (
                      <span className="bg-purple-500/15 text-purple-500 px-1.5 py-0.2 rounded font-semibold truncate max-w-[120px]">
                        ✉️ {alert.userEmail}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-1 border-t" style={{ borderColor: 'var(--tw-border)' }}>
                    <button
                      type="button"
                      onClick={() => onSimulatePriceDrop(alert.tourId, alert.targetPrice - 10)}
                      className="flex-1 py-1.5 px-2 rounded-xl text-[10px] font-bold tap-bounce transition flex items-center justify-center gap-1 border"
                      style={{
                        backgroundColor: 'var(--tw-accent-light)',
                        borderColor: 'var(--tw-accent)',
                        color: 'var(--tw-accent)'
                      }}
                    >
                      <span>⚡️ Sinash (-$10)</span>
                    </button>
                    {currentTour && (
                      <button
                        type="button"
                        onClick={() => {
                          onEditAlert(currentTour);
                          onClose();
                        }}
                        className="py-1.5 px-2.5 rounded-xl text-[10px] font-bold tap-bounce transition border"
                        style={{
                          backgroundColor: 'var(--tw-surface)',
                          borderColor: 'var(--tw-border)',
                          color: 'var(--tw-text-main)'
                        }}
                      >
                        Tahrirlash
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteAlert(alert.id)}
                      className="py-1.5 px-2 bg-red-500/15 hover:bg-red-500/25 text-red-500 border border-red-500/30 rounded-xl text-[10px] font-bold tap-bounce transition"
                      title="O'chirish"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Percent, Check, Sparkles, Building2, ShieldCheck, ArrowRight, Zap } from '@/lib/flaticon-icons';

interface PriceMarkupModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle: string;
  itemSubtitle?: string;
  itemImage?: string;
  originalCostPrice: number;
  currentPrice: number;
  currentMarkupType?: 'percent' | 'manual';
  currentMarkupValue?: number;
  onSave: (newPrice: number, markupType: 'percent' | 'manual', markupValue: number) => void;
  tourOperator?: string;
  agencyName?: string;
  agencyCommissionRate?: number;
  onApplyToAllCommission?: (rate: number) => void;
}

export const PriceMarkupModal: React.FC<PriceMarkupModalProps> = ({
  isOpen,
  onClose,
  itemTitle,
  itemSubtitle,
  itemImage,
  originalCostPrice,
  currentPrice,
  currentMarkupType = 'percent',
  currentMarkupValue,
  onSave,
  tourOperator = 'Kompas Tour',
  agencyName = 'SayrHub',
  agencyCommissionRate = 8,
  onApplyToAllCommission
}) => {
  const [markupType, setMarkupType] = useState<'percent' | 'manual'>(currentMarkupType);
  const [percentValue, setPercentValue] = useState<number>(() => {
    if (currentMarkupType === 'percent' && currentMarkupValue !== undefined) {
      return currentMarkupValue;
    }
    if (originalCostPrice > 0 && currentPrice > originalCostPrice) {
      return Math.round(((currentPrice - originalCostPrice) / originalCostPrice) * 100);
    }
    return 8;
  });
  const [manualPrice, setManualPrice] = useState<number>(currentPrice || originalCostPrice || 500);

  useEffect(() => {
    if (isOpen) {
      setMarkupType(currentMarkupType);
      if (currentMarkupType === 'percent' && currentMarkupValue !== undefined) {
        setPercentValue(currentMarkupValue);
      } else if (originalCostPrice > 0 && currentPrice > originalCostPrice) {
        setPercentValue(Math.round(((currentPrice - originalCostPrice) / originalCostPrice) * 100));
      } else {
        setPercentValue(8);
      }
      setManualPrice(currentPrice || Math.round(originalCostPrice * 1.08));
    }
  }, [isOpen, currentPrice, originalCostPrice, currentMarkupType, currentMarkupValue]);

  if (!isOpen) return null;

  const cost = originalCostPrice > 0 ? originalCostPrice : Math.round(currentPrice / 1.08);

  // Calculated values
  let finalCustomerPrice = currentPrice;
  let profitAmount = 0;
  let effectivePercent = 0;

  if (markupType === 'percent') {
    profitAmount = Math.round(cost * (percentValue / 100));
    finalCustomerPrice = cost + profitAmount;
    effectivePercent = percentValue;
  } else {
    finalCustomerPrice = Math.max(1, Number(manualPrice) || cost);
    profitAmount = finalCustomerPrice - cost;
    effectivePercent = cost > 0 ? Math.round((profitAmount / cost) * 100) : 0;
  }

  const handleApply = () => {
    onSave(
      finalCustomerPrice,
      markupType,
      markupType === 'percent' ? percentValue : finalCustomerPrice
    );
    onClose();
  };

  const quickPercentages = [5, 8, 10, 12, 15, 20];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in select-none">
      <Card className="w-full max-w-lg bg-card border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-3xl overflow-hidden">
        {/* Header */}
        <CardHeader className="p-5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {itemImage && (
                <img
                  src={itemImage}
                  alt={itemTitle}
                  className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold gap-1">
                    <Building2 className="w-3 h-3" />
                    <span>{tourOperator}</span>
                  </Badge>
                  <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                    {agencyName} Sotuv Narxi
                  </Badge>
                </div>
                <CardTitle className="text-sm font-bold text-zinc-900 dark:text-white truncate mt-1">
                  {itemTitle}
                </CardTitle>
                {itemSubtitle && (
                  <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {itemSubtitle}
                  </CardDescription>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 h-8 w-8 rounded-full"
            >
              ✕
            </Button>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-5 space-y-4">
          {/* 1. Comparison Summary Box */}
          <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-center">
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Asl Narx (Kompas)
              </span>
              <span className="text-base font-extrabold text-zinc-800 dark:text-zinc-200 font-mono">
                ${cost}
              </span>
            </div>

            <div className="space-y-0.5 border-x border-zinc-200 dark:border-zinc-700 px-2">
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                Ustama Foyda
              </span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                +${profitAmount} ({effectivePercent > 0 ? `+${effectivePercent}%` : `${effectivePercent}%`})
              </span>
            </div>

            <div className="space-y-0.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl py-0.5 px-1 border border-indigo-200 dark:border-indigo-800/50">
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">
                Mijozga Ko'rinadi
              </span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                ${finalCustomerPrice}
              </span>
            </div>
          </div>

          {/* 2. Mode Selector: Percent vs Manual */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Narxni belgilash usuli:
            </Label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setMarkupType('percent')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  markupType === 'percent'
                    ? 'bg-card text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Foizda (% Ustama)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMarkupType('manual');
                  setManualPrice(finalCustomerPrice);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  markupType === 'manual'
                    ? 'bg-card text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Qo'lda Kiritish ($)</span>
              </button>
            </div>
          </div>

          {/* 3. Inputs based on Mode */}
          {markupType === 'percent' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-600 dark:text-zinc-300">
                  Ustama foizini tanlang:
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                  +{percentValue}%
                </span>
              </div>

              {/* Quick Pills */}
              <div className="flex flex-wrap gap-1.5">
                {quickPercentages.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPercentValue(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      percentValue === p
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    +{p}%
                  </button>
                ))}
              </div>

              {/* Slider & Input */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={percentValue}
                  onChange={(e) => setPercentValue(Number(e.target.value))}
                  className="flex-1 accent-sky-600 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
                />
                <div className="relative w-20">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={percentValue}
                    onChange={(e) => setPercentValue(Math.max(0, Number(e.target.value)))}
                    className="h-9 pr-6 text-center text-xs font-bold"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                    %
                  </span>
                </div>
              </div>

              {/* Apply as global agency commission button */}
              {onApplyToAllCommission && (
                <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 text-[11px]">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    Tizimdagi umumiy komissiya: <b>{agencyCommissionRate}%</b>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Ushbu ${percentValue}% komissiyani barcha katalogdagi turlar, mehmonxonalar va reyslarga qo'llansinmi?`)) {
                        onApplyToAllCommission(percentValue);
                      }
                    }}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-1"><Zap aria-hidden="true" className="h-3.5 w-3.5" /> Barchasiga {percentValue}% qo'llash</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="manual-price-input" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Mijozga ko'rinadigan yakuniy narx (USD):
              </Label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  id="manual-price-input"
                  type="number"
                  min="1"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(Number(e.target.value))}
                  placeholder="750"
                  className="pl-9 h-11 text-base font-bold font-mono text-indigo-600 dark:text-indigo-400"
                />
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Asl Kompas narxi: <b>${cost}</b>. Foyda: <b>+${profitAmount}</b> ({effectivePercent}%).
              </p>
            </div>
          )}

          {/* Agency Info Note */}
          <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 text-xs text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <span className="text-[11px]">
              Kiritilgan narx mijozlarga (mobil ilovada va veb saytda) darhol ko'rinadi. Turoperator (<b>{tourOperator}</b>) va sotuvchi agentlik (<b>{agencyName}</b>) nomi birga ko'rsatiladi.
            </span>
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="p-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={onClose}
            className="text-xs font-semibold"
          >
            Bekor qilish
          </Button>

          <Button
            size="sm"
            type="button"
            onClick={handleApply}
            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-xs cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Saqlash & Mobil Ilovada Ko'rsatish (${finalCustomerPrice})</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

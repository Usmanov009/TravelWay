import mongoose from 'mongoose';

let cachedCommissionRate = 0;
let isLoaded = false;

export async function initAgencySettings(): Promise<void> {
  const AgencySettingsModel = mongoose.models.AgencySettings;
  if (!AgencySettingsModel) throw new Error('AgencySettings model is unavailable');
  const doc = await AgencySettingsModel.findOneAndUpdate(
    { key: 'global_settings' },
    { $setOnInsert: { agencyCommissionRate: 0 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean() as { agencyCommissionRate?: number } | null;
  if (!doc || typeof doc.agencyCommissionRate !== 'number') {
    throw new Error('Agency commission settings are missing or invalid');
  }
  cachedCommissionRate = doc.agencyCommissionRate;
  isLoaded = true;
}

export function getAgencyCommissionRate(): number {
  if (!isLoaded) throw new Error('Agency commission settings have not been loaded from MongoDB.');
  return cachedCommissionRate;
}

export async function setAgencyCommissionRate(rate: number, updatedBy?: string): Promise<number> {
  const cleanRate = Math.max(0, Math.min(100, Number(rate) || 0));
  const AgencySettingsModel = mongoose.models.AgencySettings;
  if (!AgencySettingsModel) throw new Error('AgencySettings model is unavailable');
  const doc = await AgencySettingsModel.findOneAndUpdate(
    { key: 'global_settings' },
    {
      agencyCommissionRate: cleanRate,
      updatedBy: updatedBy || 'admin',
      updatedAt: new Date()
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean() as { agencyCommissionRate?: number } | null;
  if (!doc || typeof doc.agencyCommissionRate !== 'number') {
    throw new Error('Failed to persist agency commission settings');
  }
  cachedCommissionRate = doc.agencyCommissionRate;
  isLoaded = true;
  return cachedCommissionRate;
}

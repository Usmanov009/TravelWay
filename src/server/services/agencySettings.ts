import mongoose from 'mongoose';

let cachedCommissionRate: number = 8;
let isLoaded = false;

export async function initAgencySettings(): Promise<void> {
  try {
    const AgencySettingsModel = mongoose.models.AgencySettings;
    if (AgencySettingsModel) {
      const doc = await AgencySettingsModel.findOne({ key: 'global_settings' }).lean() as any;
      if (doc && typeof doc.agencyCommissionRate === 'number') {
        cachedCommissionRate = doc.agencyCommissionRate;
        isLoaded = true;
        console.log(`💼 Loaded agency commission from MongoDB: ${cachedCommissionRate}%`);
      }
    }
  } catch (err: any) {
    console.warn('⚠️ Could not load agency commission from DB:', err.message);
  }
}

export function getAgencyCommissionRate(): number {
  return cachedCommissionRate;
}

export async function setAgencyCommissionRate(rate: number, updatedBy?: string): Promise<number> {
  const cleanRate = Math.max(0, Math.min(100, Number(rate) || 0));
  cachedCommissionRate = cleanRate;
  try {
    const AgencySettingsModel = mongoose.models.AgencySettings;
    if (AgencySettingsModel) {
      await AgencySettingsModel.findOneAndUpdate(
        { key: 'global_settings' },
        { 
          agencyCommissionRate: cleanRate,
          updatedBy: updatedBy || 'admin',
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );
      console.log(`💼 Persisted agency commission to MongoDB: ${cleanRate}%`);
    }
  } catch (err: any) {
    console.warn('⚠️ Could not persist agency commission to DB:', err.message);
  }
  return cachedCommissionRate;
}

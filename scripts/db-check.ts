/**
 * MongoDB (Atlas) ulanishini tashxislash skripti.
 *
 *   npm run db:check
 *
 * Xato sababini (IP allowlist, parol, DNS, pauza) aniq ko'rsatadi.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB, getDBStatus } from '../db.js';

const uri = process.env.MONGODB_URI;

function maskUri(value: string) {
  return value.replace(/\/\/([^:/@]+):([^@]*)@/, (_match, user: string, pass: string) =>
    `//${user}:${'*'.repeat(Math.min(pass.length, 10))}@`
  );
}

if (!uri) {
  console.error('❌ MONGODB_URI belgilanmagan. .env fayliga yoki hosting env sozlamalariga qo‘shing.');
  process.exit(1);
}

console.log('🔎 MongoDB ulanish tekshiruvi');
console.log('   URI:', maskUri(uri));

const startedAt = Date.now();
await connectDB();
const status = getDBStatus();

console.log('   Holat:', JSON.stringify(status, null, 2));

if (status.connected) {
  console.log(`✅ Ulandi (${Date.now() - startedAt} ms) → baza: ${status.dbName}`);
  await mongoose.disconnect();
  process.exit(0);
}

console.error('❌ Ulanmadi.');
if (status.hint) console.error('💡', status.hint);
await mongoose.disconnect().catch(() => {});
process.exit(1);

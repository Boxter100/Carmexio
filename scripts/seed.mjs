#!/usr/bin/env node
// Seembra el catálogo desde datos/vehiculos_normalizados.json.
// - Con SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY: carga en Supabase (upsert por slug).
// - Sin Supabase: escribe el almacén local en .data/vehicles.json (modo desarrollo).
//   El almacén local también se siembra solo en la primera ejecución del dev server.

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const seedFile = path.join(root, 'datos', 'vehiculos_normalizados.json');

// Carga .env si no se ha hecho (no pisa variables ya exportadas en el shell).
function loadEnvFile() {
  const envFile = path.join(root, '.env');
  if (!existsSync(envFile)) return;
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const idx = trimmed.indexOf('=');
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!(key in process.env) && key !== 'SUPABASE_SERVICE_ROLE_KEY') process.env[key] = value;
    if (key === 'SUPABASE_SERVICE_ROLE_KEY' && !process.env[key] && value) process.env[key] = value;
  }
}

loadEnvFile();

function normalize(raw) {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    slug: raw.slug,
    title: raw.title,
    brand: raw.brand,
    model: raw.model ?? null,
    year: raw.year ?? null,
    vehicle_type: raw.vehicle_type ?? null,
    mileage: raw.mileage ?? null,
    fuel_type: raw.fuel_type ?? null,
    engine: raw.engine ?? null,
    transmission: raw.transmission ?? null,
    drive_type: raw.drive_type ?? null,
    exterior_color: raw.exterior_color ?? null,
    interior_color: raw.interior_color ?? null,
    stock_id: raw.stock_id ?? null,
    branch: raw.branch ?? null,
    reservation_amount: raw.reservation?.amount ?? null,
    cash_delivery_price: raw.prices?.cash_delivery ?? null,
    advance_payment_price: raw.prices?.advance_payment ?? null,
    registered: raw.registered ?? null,
    history: raw.history ?? null,
    features: Array.isArray(raw.features) ? raw.features : [],
    description: Array.isArray(raw.description) ? raw.description : [],
    images: Array.isArray(raw.images)
      ? raw.images
          .filter((i) => i && typeof i.url === 'string')
          .map((i) => ({
            url: i.url,
            display_url: i.display_url ?? i.url,
            alt: i.alt ?? null,
            order: typeof i.order === 'number' ? i.order : 0,
          }))
      : [],
    source: raw.source ?? null,
    available: true,
    created_at: now,
    updated_at: now,
  };
}

async function seedSupabase(rows) {
  const url = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.');
  }
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@carmexio.mx';
  const adminPassword = process.env.ADMIN_PASSWORD || 'carmexio123';
  const service = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: upsertError } = await service.from('vehicles').upsert(rows, { onConflict: 'slug' });
  if (upsertError) {
    console.error('[seed] Error al sembrar vehículos:', upsertError.message);
    process.exit(1);
  }

  const { data: existing } = await service.auth.admin.listUsers({ perPage: 200 });
  const found = existing?.users.find((u) => u.email === adminEmail);
  let userId = found?.id;
  if (!userId) {
    console.log(`[seed] Creando usuario admin ${adminEmail}…`);
    const created = await service.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });
    userId = created.error ? null : created.data.user?.id;
    if (!userId) {
      console.error('[seed] No se pudo crear el admin:', created.error?.message);
      process.exit(1);
    }
  }
  // No degradar un rol admin/super_admin ya existente.
  const existingRole = found?.app_metadata?.role;
  const role = existingRole === 'super_admin' || existingRole === 'admin' ? existingRole : 'admin';
  if (role !== existingRole) {
    await service.auth.admin.updateUserById(userId, { app_metadata: { role } });
  }
  const { error: profileError } = await service
    .from('profiles')
    .upsert({ id: userId, email: adminEmail, name: 'Administrador', role }, { onConflict: 'id' });
  if (profileError) {
    console.error('[seed] No se pudo actualizar el perfil del admin:', profileError.message);
    process.exit(1);
  }
  console.log(`[seed] OK · ${rows.length} vehículos en Supabase · admin: ${adminEmail}`);
}

async function seedLocal(rows) {
  const dataDir = path.join(root, '.data');
  const file = path.join(dataDir, 'vehicles.json');
  mkdirSync(dataDir, { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(rows, null, 2), 'utf8');
  renameSync(tmp, file);
  console.log(`[seed] OK · ${rows.length} vehículos en almacén local → ${file}`);
}

async function main() {
  const raw = JSON.parse(readFileSync(seedFile, 'utf8'));
  if (!Array.isArray(raw)) {
    console.error('[seed] datos/vehiculos_normalizados.json no contiene un arreglo.');
    process.exit(1);
  }
  const rows = raw.map(normalize);
  if (process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[seed] Falta SUPABASE_SERVICE_ROLE_KEY para sembrar en Supabase.');
      process.exit(1);
    }
    await seedSupabase(rows);
  } else {
    await seedLocal(rows);
  }
}

main().catch((err) => {
  console.error('[seed]', err);
  process.exit(1);
});
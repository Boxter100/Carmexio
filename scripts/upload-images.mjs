#!/usr/bin/env node
// Sube las imágenes locales (datos/imagenes/<slug>/*.webp) al bucket
// "vehicle-images" de Supabase Storage y reescribe la URL de cada imagen
// en datos/vehiculos_normalizados.json para que apunte al storage.
// Después ejecuta scripts/seed.mjs para cargar los vehículos en la BD.

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const seedFile = path.join(root, 'datos', 'vehiculos_normalizados.json');
const imagesRoot = path.join(root, 'datos', 'imagenes');
const bucketName = 'vehicle-images';

function loadEnvFile() {
  const envFile = path.join(root, '.env');
  if (!existsSync(envFile)) return;
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const idx = trimmed.indexOf('=');
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile();

const url = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('[upload-images] Faltan PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const service = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const publicPath = (slug, file) => `${url}/storage/v1/object/public/${bucketName}/${slug}/${file}`;

function sortFiles(folder) {
  return readdirSync(folder)
    .filter((f) => f.toLowerCase().endsWith('.webp'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

async function main() {
  const raw = JSON.parse(readFileSync(seedFile, 'utf8'));
  if (!Array.isArray(raw)) {
    console.error('[upload-images] datos/vehiculos_normalizados.json no contiene un arreglo.');
    process.exit(1);
  }

  let totalUploaded = 0;
  for (const vehicle of raw) {
    const folder = path.join(imagesRoot, vehicle.slug);
    if (!existsSync(folder)) {
      console.warn(`[upload-images] Sin carpeta de imágenes para ${vehicle.slug}`);
      continue;
    }

    const files = sortFiles(folder);
    const existing = Array.isArray(vehicle.images) ? vehicle.images : [];
    const imgByOrder = new Map(
      existing
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((img, i) => [i, img]),
    );

    const newImages = [];
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const data = readFileSync(path.join(folder, file));
      const { error } = await service.storage
        .from(bucketName)
        .upload(`${vehicle.slug}/${file}`, data, {
          contentType: 'image/webp',
          upsert: true,
        });
      if (error) {
        console.error(`[upload-images] Error subiendo ${vehicle.slug}/${file}:`, error.message);
        process.exit(1);
      }

      const prev = imgByOrder.get(i) ?? {};
      newImages.push({
        url: publicPath(vehicle.slug, file),
        display_url: publicPath(vehicle.slug, file),
        alt: prev.alt ?? null,
        order: prev.order ?? i + 1,
      });
      totalUploaded += 1;
    }

    vehicle.images = newImages;
    console.log(`[upload-images] ${vehicle.slug}: ${newImages.length} imágenes → ${bucketName}/${vehicle.slug}`);
  }

  writeFileSync(seedFile, JSON.stringify(raw, null, 2), 'utf8');
  console.log(`[upload-images] Listo · ${totalUploaded} imágenes en ${bucketName} y JSON actualizado.`);
}

main().catch((err) => {
  console.error('[upload-images]', err);
  process.exit(1);
});
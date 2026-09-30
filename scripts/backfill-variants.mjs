#!/usr/bin/env node
// Genera los derivados responsive de las imágenes ya subidas y reescribe
// datos/vehiculos_normalizados.json con `display_url` (el derivado de 640 px) y
// las dimensiones intrínsecas de cada original.
//
// Es idempotente: lista lo que ya hay en el bucket y solo sube lo que falta, así
// que se puede relanzar sin duplicar objetos ni volver a comprimir 288 archivos.
// Es complementario a scripts/upload-images.mjs, que sube los originales.
//
//   node scripts/backfill-variants.mjs            # sube lo que falta y sincroniza images
//   node scripts/backfill-variants.mjs --force    # regenera y re-sube todo
//   node scripts/backfill-variants.mjs --dry-run  # no sube nada, solo informa
//   node scripts/backfill-variants.mjs --no-db    # no toca Postgres
//
// No se usa `npm run seed` a propósito: ese script hace upsert de la fila completa
// desde el JSON y machacaría los campos que se hayan editado desde el panel. Aquí
// solo se escribe la columna `images`.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const seedFile = path.join(root, 'datos', 'vehiculos_normalizados.json');
const imagesRoot = path.join(root, 'datos', 'imagenes');
const bucketName = 'vehicle-images';

/** Debe coincidir con VARIANT_WIDTHS de src/lib/images.ts (este script es .mjs y no
 *  puede importar el módulo TS; si cambias uno, cambia el otro). */
const VARIANT_WIDTHS = [320, 640, 960, 1280];
const DISPLAY_WIDTH = 640;
const WEBP_QUALITY = 72;

const force = process.argv.includes('--force');
const dryRun = process.argv.includes('--dry-run');
const syncDb = !process.argv.includes('--no-db');

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
  console.error('[backfill-variants] Faltan PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const service = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const publicPath = (objectPath) => `${url}/storage/v1/object/public/${bucketName}/${objectPath}`;
const variantName = (fileName, width) => fileName.replace(/\.webp$/i, `-${width}.webp`);

/** Ruta de objeto dentro del bucket, a partir de su URL pública. */
function objectPathFromUrl(publicUrl) {
  const marker = `/storage/v1/object/public/${bucketName}/`;
  const idx = publicUrl.indexOf(marker);
  return idx === -1 ? null : publicUrl.slice(idx + marker.length);
}

/** Derivado más grande que no supere DISPLAY_WIDTH, o el original si ninguno cabe. */
function displayObjectPath(objectPath, intrinsicWidth) {
  const fit = VARIANT_WIDTHS.filter((w) => w <= DISPLAY_WIDTH && w < intrinsicWidth).pop();
  return fit ? objectPath.replace(/\.webp$/i, `-${fit}.webp`) : objectPath;
}

const bytes = (n) => `${(n / 1024).toFixed(0)} KiB`;

async function listFolder(folder) {
  const { data, error } = await service.storage.from(bucketName).list(folder, { limit: 1000 });
  if (error) throw new Error(`No se pudo listar ${folder}: ${error.message}`);
  return new Set((data ?? []).map((o) => o.name));
}

async function main() {
  const raw = JSON.parse(readFileSync(seedFile, 'utf8'));
  if (!Array.isArray(raw)) {
    console.error('[backfill-variants] datos/vehiculos_normalizados.json no contiene un arreglo.');
    process.exit(1);
  }

  let uploaded = 0;
  let skipped = 0;
  let bytesOriginal = 0;
  let bytesDisplay = 0;
  let bytesVariants = 0;
  const missing = [];

  for (const vehicle of raw) {
    const folder = path.join(imagesRoot, vehicle.slug);
    if (!existsSync(folder)) {
      console.warn(`[backfill-variants] Sin carpeta local para ${vehicle.slug}, se omite.`);
      continue;
    }
    if (!Array.isArray(vehicle.images) || vehicle.images.length === 0) continue;

    // Un listado por vehículo en vez de un HEAD por variante: 288×4 peticiones
    // de red se reducen a 29.
    const existing = force ? new Set() : await listFolder(vehicle.slug);

    let vehicleUploaded = 0;
    for (const image of vehicle.images) {
      const objectPath = objectPathFromUrl(image.url);
      if (!objectPath) {
        missing.push(`${vehicle.slug}: URL fuera del bucket -> ${image.url}`);
        continue;
      }
      const fileName = objectPath.slice(objectPath.lastIndexOf('/') + 1);
      const localFile = path.join(folder, fileName);
      if (!existsSync(localFile)) {
        missing.push(`${vehicle.slug}: no existe el original local ${fileName}`);
        continue;
      }

      const input = readFileSync(localFile);
      const meta = await sharp(input, { failOn: 'none' }).metadata();
      const width = meta.width ?? 0;
      const height = meta.height ?? 0;
      if (!width || !height) {
        missing.push(`${vehicle.slug}/${fileName}: no se pudo leer el tamaño`);
        continue;
      }

      image.width = width;
      image.height = height;
      bytesOriginal += input.length;
      // display_url debe apuntar siempre a un objeto que exista. Si el original es
      // más estrecho que DISPLAY_WIDTH, el único derivado posible es más pequeño.
      const displayPath = displayObjectPath(objectPath, width);
      image.display_url = publicPath(displayPath);

      // Lo que se baja hoy en una card es el original completo; con display_url pasa
      // a ser el derivado de 640 px. Se mide ese par, que es la comparación honesta.
      bytesDisplay += displayPath === objectPath ? input.length : 0;

      for (const target of VARIANT_WIDTHS) {
        if (target >= width) continue;
        const name = variantName(fileName, target);
        if (existing.has(name)) {
          skipped += 1;
          continue;
        }
        const data = await sharp(input, { failOn: 'none' })
          .resize({ width: target, withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY, effort: 4 })
          .toBuffer();
        if (!dryRun) {
          const { error } = await service.storage
            .from(bucketName)
            .upload(`${vehicle.slug}/${name}`, data, {
              contentType: 'image/webp',
              upsert: true,
            });
          if (error) throw new Error(`Error subiendo ${vehicle.slug}/${name}: ${error.message}`);
        }
        uploaded += 1;
        vehicleUploaded += 1;
        bytesVariants += data.length;
        if (name === displayPath.slice(displayPath.lastIndexOf('/') + 1)) bytesDisplay += data.length;
      }
    }

    if (vehicleUploaded) {
      console.log(
        `[backfill-variants] ${vehicle.slug}: ${vehicleUploaded} derivados${
          dryRun ? ' (simulados)' : ''
        }`,
      );
    }
  }

  if (!dryRun) writeFileSync(seedFile, JSON.stringify(raw, null, 2), 'utf8');

  // Sync de la columna `images` nada más. Es lo que lee la app, y hacerlo aquí
  // evita el upsert de fila completa de `npm run seed`.
  let synced = 0;
  if (syncDb && !dryRun) {
    for (const vehicle of raw) {
      if (!Array.isArray(vehicle.images) || vehicle.images.length === 0) continue;
      const images = [...vehicle.images]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((img, i) => ({
          url: img.url,
          display_url: img.display_url ?? img.url,
          alt: img.alt ?? null,
          order: i,
          width: img.width ?? null,
          height: img.height ?? null,
        }));
      const { error } = await service.from('vehicles').update({ images }).eq('slug', vehicle.slug);
      if (error) {
        console.error(`[backfill-variants] Error al sincronizar ${vehicle.slug}: ${error.message}`);
        process.exit(1);
      }
      synced += 1;
    }
  }

  console.log('');
  console.log(`[backfill-variants] ${dryRun ? 'SIMULACIÓN' : 'Listo'}`);
  console.log(`[backfill-variants]   derivados subidos: ${uploaded}`);
  console.log(`[backfill-variants]   ya existentes:      ${skipped}`);
  if (synced) console.log(`[backfill-variants]   vehículos sincronizados en Postgres: ${synced}`);
  if (uploaded) {
    const saving = ((1 - bytesDisplay / bytesOriginal) * 100).toFixed(0);
    console.log(`[backfill-variants]   storage añadido:    ${bytes(bytesVariants)}`);
    console.log(
      `[backfill-variants]   por imagen (display_url): ${bytes(bytesOriginal)} -> ${bytes(
        bytesDisplay,
      )}  (-${saving}%)`,
    );
  }
  if (missing.length) {
    console.log(`[backfill-variants]   ${missing.length} incidencias:`);
    for (const m of missing) console.log(`[backfill-variants]     - ${m}`);
  }
  if (!dryRun && !syncDb) {
    console.log('[backfill-variants] JSON actualizado; falta sincronizar Postgres (--no-db).');
  }
}

main().catch((err) => {
  console.error('[backfill-variants]', err);
  process.exit(1);
});

import { slugify } from './format';

export const VEHICLE_IMAGE_BUCKET = 'vehicle-images';

/**
 * Margen deliberado bajo el límite de 4.5 MB por petición de Vercel: el body
 * multipart lleva el archivo más la sobrecarga del formulario. El bucket aplica
 * el mismo techo (migración 0003) como segunda barrera.
 */
export const MAX_IMAGE_BYTES = Math.floor(3.5 * 1024 * 1024);

export const ACCEPTED_IMAGE_MIME = 'image/webp';
export const ACCEPTED_IMAGE_EXT = '.webp';

/** Coincide con el techo de src/lib/validation.ts. */
export const MAX_IMAGES_PER_VEHICLE = 40;

/** Carpeta destino: reutiliza slugify() para que coincida exactamente con el slug del vehículo. */
export function sanitizeFolder(slug: string): string {
	return slugify(slug) || 'sin-slug';
}

/** Nombre único por archivo: no requiere listar la carpeta ni renumerar al reordenar. */
export function buildObjectPath(folder: string, fileName: string): string {
	const ext = fileName.toLowerCase().endsWith(ACCEPTED_IMAGE_EXT) ? ACCEPTED_IMAGE_EXT : '.webp';
	return `${sanitizeFolder(folder)}/${crypto.randomUUID().slice(0, 8)}${ext}`;
}

/**
 * Extrae la clave del objeto de una URL pública de nuestro bucket.
 * Devuelve null si la URL no apunta a `vehicle-images`: es la guarda que evita
 * que un DELETE toque una clave arbitraria o un objeto ajeno al bucket.
 * No necesita la URL del proyecto (solo el marcador), así que este módulo es
 * seguro para el bundle del navegador.
 */
export function storagePathFromUrl(url: string): string | null {
	if (!url) return null;
	const marker = `/storage/v1/object/public/${VEHICLE_IMAGE_BUCKET}/`;
	const idx = url.indexOf(marker);
	if (idx === -1) return null;
	const path = url.slice(idx + marker.length);
	return isValidObjectPath(path) ? path : null;
}

export function isValidObjectPath(path: string): boolean {
	return /^[a-z0-9-]+\/[a-z0-9]+\.webp$/.test(path);
}

export function isWebpName(name: string): boolean {
	return name.toLowerCase().endsWith(ACCEPTED_IMAGE_EXT);
}

/**
 * Verifica la cabecera real del archivo (RIFF....WEBP). Es la única comprobación
 * que no se puede falsear simplemente renombrando un .jpg a .webp.
 */
export async function hasWebpMagicBytes(file: File): Promise<boolean> {
	try {
		const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
		if (header.length < 12) return false;
		const riff = String.fromCharCode(header[0]!, header[1]!, header[2]!, header[3]!);
		const webp = String.fromCharCode(header[8]!, header[9]!, header[10]!, header[11]!);
		return riff === 'RIFF' && webp === 'WEBP';
	} catch {
		return false;
	}
}

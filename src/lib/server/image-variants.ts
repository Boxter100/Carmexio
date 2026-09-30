import sharp from 'sharp';
import { displayObjectPath, variantObjectPath, variantObjectPaths, VARIANT_WIDTHS } from '../images';
import { storagePathFromUrl } from '../storage';

const WEBP_QUALITY = 72;

export interface ImageVariant {
	/** Ancho solicitado; coincide con el ancho real del derivative. */
	width: number;
	/** Ruta de objeto en el bucket, p. ej. `mi-vehiculo/01-640.webp`. */
	path: string;
	data: Buffer;
}

export interface ImageDerivatives {
	/** Dimensiones intrínsecas del original. */
	width: number;
	height: number;
	/** Derivados generados, en orden de ancho ascendente. */
	variants: ImageVariant[];
	/** Ruta de objeto del derivado de DISPLAY_WIDTH, o el original si ninguno cabe. */
	displayPath: string;
}

/**
 * Lee un .webp y produce un derivado por cada ancho de VARIANT_WIDTHS que sea menor
 * que su ancho intrínseco. Nunca amplía: estirar una imagen de 622 px hasta 1280
 * solo gasta bytes y emborrona, y en este proyecto 180 de los 288 archivos están
 * por debajo de 1000 px.
 */
export async function buildDerivatives(
	input: Buffer | Uint8Array,
	originalObjectPath: string,
): Promise<ImageDerivatives> {
	const meta = await sharp(input, { failOn: 'none' }).metadata();
	const width = meta.width ?? 0;
	const height = meta.height ?? 0;
	if (!width || !height) {
		throw new Error('No se pudo leer el tamaño de la imagen.');
	}

	const variants: ImageVariant[] = [];
	for (const target of VARIANT_WIDTHS) {
		if (target >= width) continue;
		const data = await sharp(input, { failOn: 'none' })
			.resize({ width: target, withoutEnlargement: true })
			.webp({ quality: WEBP_QUALITY, effort: 4 })
			.toBuffer();
		variants.push({ width: target, path: variantObjectPath(originalObjectPath, target), data });
	}

	return { width, height, variants, displayPath: displayObjectPath(originalObjectPath, width) };
}

/**
 * Rutas de derivado a borrar junto con el original. Se pasan todas sin filtrar:
 * Supabase ignora las que no existen, y así no hay que persistir cuáles se
 * generaron para un ancho concreto.
 */
export function derivativeObjectPaths(originalObjectPath: string): string[] {
	return variantObjectPaths(originalObjectPath);
}

/** Extrae la ruta de objeto de una URL pública, o lanza si no es del bucket. */
export function requireObjectPath(url: string): string {
	const path = storagePathFromUrl(url);
	if (!path) throw new Error(`La URL no apunta al bucket de imágenes: ${url}`);
	return path;
}

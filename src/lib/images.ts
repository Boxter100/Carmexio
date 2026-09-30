import { storagePathFromUrl } from './storage';
import type { VehicleImage } from './types';

/**
 * Anchos de los derivados que genera sharp (src/lib/server/image-variants.ts).
 * Cubren 1x y 2x de las cajas reales: la card del garage mide 384 px en xl y la
 * del hero de portada ~583 px, así que 2x cae en 960/1280.
 */
export const VARIANT_WIDTHS = [320, 640, 960, 1280] as const;

/** Ancho del derivado que se guarda en `display_url`. */
export const DISPLAY_WIDTH = 640;

/** `vehicle/01.webp` + 640 -> `vehicle/01-640.webp`. */
export function variantObjectPath(path: string, width: number): string {
	return path.replace(/\.webp$/i, `-${width}.webp`);
}

export function isVariantObjectPath(path: string): boolean {
	return /-\d+\.webp$/i.test(path);
}

/** Todas las variantes de un objeto, en orden de ancho. */
export function variantObjectPaths(path: string, widths: readonly number[] = VARIANT_WIDTHS): string[] {
	return widths.map((width) => variantObjectPath(path, width));
}

/**
 * Anchos que existen de verdad para una imagen: los de VARIANT_WIDTHS menores que
 * su ancho intrínseco, más el original (que siempre está). Devuelve null si no se
 * conoce el ancho intrínseco, porque entonces no se puede garantizar que exista
 * ningún derivado y un srcset con rutas 404 es peor que no tener srcset.
 */
export function widthsFor(image: Pick<VehicleImage, 'width'>): number[] | null {
	if (!image.width || image.width < 1) return null;
	return [...VARIANT_WIDTHS.filter((w) => w < image.width!), image.width!];
}

/** El derivado más grande que no supere DISPLAY_WIDTH; el original si no hay ninguno. */
export function displayObjectPath(path: string, intrinsicWidth: number | null | undefined): string {
	if (!intrinsicWidth) return path;
	const fit = VARIANT_WIDTHS.filter((w) => w <= DISPLAY_WIDTH && w < intrinsicWidth).pop();
	return fit ? variantObjectPath(path, fit) : path;
}

/**
 * `srcset` para un <img>. Se deriva SIEMPRE de `url` (el original), nunca de
 * `display_url`: `display_url` ya es un derivado y encadenar variantes sobre él
 * produciría rutas del tipo `01-640-320.webp`.
 */
export function imageSrcSet(image: VehicleImage | null | undefined): string | undefined {
	if (!image?.url) return undefined;
	const path = storagePathFromUrl(image.url);
	if (!path || isVariantObjectPath(path)) return undefined;
	const widths = widthsFor(image);
	if (!widths) return undefined;
	// Todo lo anterior al nombre del objeto es la URL pública del bucket.
	const base = image.url.slice(0, image.url.length - path.length);
	return widths
		.map((w) => (w === image.width ? `${base}${path} ${w}w` : `${base}${variantObjectPath(path, w)} ${w}w`))
		.join(', ');
}

/** `sizes` por defecto de una card de la retícula de garage (wrap max 80rem). */
export const CARD_SIZES =
	'(min-width: 1280px) 384px, (min-width: 640px) 288px, 335px';

/** `sizes` de las cards destacadas de portada (4 columnas en xl). */
export const FEATURED_SIZES =
	'(min-width: 1280px) 282px, (min-width: 640px) 288px, 335px';

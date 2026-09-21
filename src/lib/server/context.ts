import type { AstroCookies } from 'astro';

/** Contexto de servidor compartido entre páginas SSR y rutas de API. */
export interface ServerContext {
	request: Request;
	cookies: AstroCookies;
}
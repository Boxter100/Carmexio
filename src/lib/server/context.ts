import type { APIContext, AstroCookies } from 'astro';

/** Contexto de servidor compartido entre páginas SSR y rutas de API. */
export interface ServerContext {
	request: Request;
	cookies: AstroCookies;
	/** Sesión ya resuelta por el middleware; evita repetir consultas de auth. */
	locals: App.Locals;
}

/** Adapta el contexto de Astro (páginas, guards y endpoints) a `ServerContext`. */
export function toServerContext(
	ctx: Pick<APIContext, 'request' | 'cookies' | 'locals'>,
): ServerContext {
	return { request: ctx.request, cookies: ctx.cookies, locals: ctx.locals };
}

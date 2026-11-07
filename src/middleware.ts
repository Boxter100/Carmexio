import { defineMiddleware } from 'astro:middleware';
import { isSupabaseConfigured } from './lib/env';
import { resolveSession } from './lib/server/auth';
import type { ServerContext } from './lib/server/context';

/**
 * Resuelve la sesión una sola vez por petición, antes de renderizar.
 *
 * Es importante que el refresco de tokens de Supabase ocurra aquí y no en el
 * `Layout`: así `@supabase/ssr` escribe las cookies cuando la respuesta todavía
 * no se ha enviado. Hacerlo durante el render provocaba `ResponseSentError`
 * ("The response has already been sent to the browser and cannot be altered").
 */
export const onRequest = defineMiddleware(async (context, next) => {
	const ctx: ServerContext = {
		request: context.request,
		cookies: context.cookies,
		locals: context.locals,
	};

	context.locals.user = null;

	try {
		context.locals.user = await resolveSession(ctx);
	} catch (err) {
		// Un fallo de red con Supabase no debe tumbar las páginas públicas: se
		// continúa como anónimo y la siguiente petición reintenta el refresco.
		if (isSupabaseConfigured()) {
			console.error('[auth] No se pudo resolver la sesión:', err);
		}
	}

	return next();
});

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { AstroCookies } from 'astro';
import { supabaseAnonKey, supabaseUrl } from '../env';

export function parseCookieHeader(request: Request): { name: string; value: string }[] {
	const header = request.headers.get('cookie');
	if (!header) return [];
	return header
		.split(';')
		.filter(Boolean)
		.map((part) => {
			const idx = part.indexOf('=');
			const name = part.slice(0, idx).trim();
			const value = idx === -1 ? '' : part.slice(idx + 1).trim();
			return { name, value: decodeURIComponent(value) };
		});
}

/** Cliente ligado a la petición/sesión (para páginas SSR y mutaciones autenticadas). */
export function createServerSupabase(request: Request, cookies: AstroCookies) {
	return createServerClient(supabaseUrl()!, supabaseAnonKey()!, {
		cookies: {
			getAll() {
				return parseCookieHeader(request);
			},
			setAll(cookiesToSet) {
				for (const { name, value, options } of cookiesToSet) {
					try {
						cookies.set(name, value, options);
					} catch (err) {
						// El middleware refresca la sesión antes del render, así que esto
						// solo puede pasar en una escritura tardía (p. ej. un refresh en
						// segundo plano). No hay forma de alterar la respuesta ya enviada;
						// se ignora en vez de tumbar la petición.
						if ((err as Error)?.name !== 'ResponseSentError') throw err;
					}
				}
			},
		},
	});
}

/** Cliente público de lectura (RLS permite lectura pública de la tabla vehículos). */
export function createPublicSupabase() {
	return createClient(supabaseUrl()!, supabaseAnonKey()!);
}
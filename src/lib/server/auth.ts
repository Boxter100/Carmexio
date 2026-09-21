import type { AstroCookies } from 'astro';
import { isSupabaseConfigured } from '../env';
import {
	SESSION_COOKIE,
	localSession,
	localSignIn,
	localSignOut,
} from '../db/local';
import { createServerSupabase } from './supabase';
import type { ServerContext } from './context';
import type { AdminUser } from '../types';
import { isAdminRole } from '../roles';

const COOKIE_OPTIONS = {
	httpOnly: true,
	sameSite: 'lax',
	path: '/',
	maxAge: 60 * 60 * 24 * 7,
	secure: import.meta.env.PROD,
} as const;

function localToken(cookies: AstroCookies): string | null {
	return cookies.get(SESSION_COOKIE)?.value ?? null;
}

function clearLocalToken(cookies: AstroCookies) {
	cookies.delete(SESSION_COOKIE, { path: '/' });
}

export async function currentSession(ctx: ServerContext): Promise<AdminUser | null> {
	if (isSupabaseConfigured()) {
		const sb = createServerSupabase(ctx.request, ctx.cookies);
		const {
			data: { user },
		} = await sb.auth.getUser();
		if (!user) return null;
		let role = (user.app_metadata?.role as string) ?? 'user';
		// Si el metadata no indica rol admin, utiliza el propio perfil
		// (RLS permite a cada usuario leer su propia fila).
		if (!isAdminRole(role)) {
			const { data: profile } = await sb
				.from('profiles')
				.select('role')
				.eq('id', user.id)
				.maybeSingle();
			if (profile?.role) role = String(profile.role);
		}
		return {
			id: user.id,
			email: user.email ?? '',
			name: (user.user_metadata?.name as string) ?? null,
			role,
		};
	}
	return localSession(localToken(ctx.cookies));
}

export async function loginAdmin(
	ctx: ServerContext,
	email: string,
	password: string,
): Promise<{ ok: true; user: AdminUser } | { ok: false; error: string }> {
	const normalizedEmail = email.trim().toLowerCase();
	if (!normalizedEmail || !password) {
		return { ok: false, error: 'Ingresa tu correo y contraseña.' };
	}
	if (isSupabaseConfigured()) {
		const sb = createServerSupabase(ctx.request, ctx.cookies);
		const { data, error } = await sb.auth.signInWithPassword({ email: normalizedEmail, password });
		if (error || !data.user) {
			const msg = error?.message ?? '';
			if (/not confirmed|no fue confirmado/i.test(msg)) {
				return {
					ok: false,
					error:
						'Correo no confirmado. Revisa tu bandeja de entrada (o el panel de Supabase) para confirmar tu usuario y vuelve a intentarlo.',
				};
			}
			if (/very new|recent signup|nuevo/i.test(msg) || /too new/i.test(msg)) {
				return { ok: false, error: 'La cuenta se creó hace muy poco. Espera unos segundos e inténtalo de nuevo.' };
			}
			return { ok: false, error: 'Credenciales inválidas.' };
		}
		return {
			ok: true,
			user: {
				id: data.user.id,
				email: data.user.email ?? normalizedEmail,
				name: (data.user.user_metadata?.name as string) ?? null,
				role: (data.user.app_metadata?.role as string) ?? 'user',
			},
		};
	}
	const { user, token } = await localSignIn(normalizedEmail, password);
	if (!user || !token) {
		return { ok: false, error: 'Credenciales inválidas.' };
	}
	ctx.cookies.set(SESSION_COOKIE, token, COOKIE_OPTIONS);
	return { ok: true, user };
}

export async function logoutAdmin(ctx: ServerContext): Promise<void> {
	if (isSupabaseConfigured()) {
		const sb = createServerSupabase(ctx.request, ctx.cookies);
		await sb.auth.signOut();
		return;
	}
	const token = localToken(ctx.cookies);
	await localSignOut(token);
	clearLocalToken(ctx.cookies);
}

/** Devuelve el usuario admin o lanza un error con status 401/403. */
export async function requireAdmin(ctx: ServerContext): Promise<AdminUser> {
	const user = await currentSession(ctx);
	if (!user) {
		const err = new Error('No autorizado.') as Error & { status: number };
		err.status = 401;
		throw err;
	}
	if (!isAdminRole(user.role)) {
		const err = new Error('Requiere permisos de administrador.') as Error & { status: number };
		err.status = 403;
		throw err;
	}
	return user;
}
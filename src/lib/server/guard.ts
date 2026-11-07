import type { APIContext } from 'astro';
import type { AdminUser } from '../types';
import { requireAdmin, currentSession } from './auth';
import { toServerContext } from './context';
import { isAdminRole } from '../roles';

/** Protege una página /admin: devuelve el usuario o un Response de redirección. */
export async function guardAdmin(Astro: APIContext): Promise<{ user: AdminUser } | Response> {
	try {
		const user = await requireAdmin(toServerContext(Astro));
		return { user };
	} catch {
		return Astro.redirect('/admin/login');
	}
}

/** Redirige a /admin si ya hay sesión (para la página de login). */
export async function guardGuest(Astro: APIContext): Promise<AdminUser | null | Response> {
	const user = await currentSession(toServerContext(Astro));
	if (user && isAdminRole(user.role)) return Astro.redirect('/admin/vehiculos');
	return null;
}

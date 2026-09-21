import type { APIContext } from 'astro';
import type { AdminUser } from '../types';
import { requireAdmin, currentSession } from './auth';
import { isAdminRole } from '../roles';

/** Protege una página /admin: devuelve el usuario o un Response de redirección. */
export function guardAdmin(Astro: APIContext): Promise<{ user: AdminUser } | Response> {
	return new Promise<{ user: AdminUser } | Response>((resolve) => {
		requireAdmin({ request: Astro.request, cookies: Astro.cookies })
			.then((user) => resolve({ user }))
			.catch(() => resolve(Astro.redirect('/admin/login')));
	});
}

/** Redirige a /admin si ya hay sesión (para la página de login). */
export async function guardGuest(Astro: APIContext): Promise<AdminUser | null | Response> {
	const user = await currentSession({ request: Astro.request, cookies: Astro.cookies });
	if (user && isAdminRole(user.role)) return Astro.redirect('/admin/vehiculos');
	return null;
}
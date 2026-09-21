// Roles con acceso al panel administrativo.
export const ADMIN_ROLES = ['admin', 'super_admin'] as const;

export function isAdminRole(role: string | null | undefined): boolean {
	return ADMIN_ROLES.some((r) => role?.toLowerCase() === r);
}

/** Normaliza hacia el rol-base 'admin'/'user' para comparaciones genéricas. */
export function adminBaseRole(role: string | null | undefined): string {
	return isAdminRole(role) ? 'admin' : 'user';
}
export function supabaseUrl(): string | null {
	return import.meta.env.SUPABASE_URL ?? import.meta.env.PUBLIC_SUPABASE_URL ?? null;
}

export function supabaseAnonKey(): string | null {
	return import.meta.env.SUPABASE_ANON_KEY ?? import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? null;
}

export function supabaseServiceRoleKey(): string | null {
	return import.meta.env.SUPABASE_SERVICE_ROLE_KEY ?? null;
}

/** Modo Supabase requiere URL + anon key. Sin ellos el sistema cae a un almacén local de desarrollo. */
export function isSupabaseConfigured(): boolean {
	return Boolean(supabaseUrl() && supabaseAnonKey());
}

export function adminEmail(): string {
	return import.meta.env.ADMIN_EMAIL ?? 'admin@carmexio.mx';
}

export function adminPassword(): string {
	return import.meta.env.ADMIN_PASSWORD ?? 'carmexio123';
}
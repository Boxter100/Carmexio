// Repositorio de vehículos sobre Supabase.
// - Lecturas públicas: cliente anónimo (RLS permite SELECT público).
// - Escrituras (admin CRUD): cliente ligado a la sesión; las políticas RLS exigen rol admin.

import { randomUUID } from 'node:crypto';
import type { ServerContext } from '../server/context';
import { createPublicSupabase, createServerSupabase } from '../server/supabase';
import type { Vehicle, VehicleFilters, VehicleInput, VehicleList } from '../types';
import { inputToVehicle, rowToVehicle, vehicleToRow, type VehicleRow } from './map';
import { queryVehicles } from './query';
import type { RawVehicle } from './transform';
import { isAdminRole } from '../roles';

async function fetchAllVehicles(): Promise<Vehicle[]> {
	const sb = createPublicSupabase();
	const { data, error } = await sb.from('vehicles').select('*').order('updated_at', { ascending: false });
	if (error) throw new Error(error.message);
	return (data ?? []).map((row) => rowToVehicle(row as VehicleRow));
}

export async function supabaseList(filters: VehicleFilters = {}): Promise<VehicleList> {
	return queryVehicles(await fetchAllVehicles(), filters);
}

export async function supabaseGetBySlug(slug: string): Promise<Vehicle | null> {
	const vehicles = await fetchAllVehicles();
	return vehicles.find((v) => v.slug === slug) ?? null;
}

export async function supabaseGetById(id: string): Promise<Vehicle | null> {
	const sb = createPublicSupabase();
	const { data, error } = await sb.from('vehicles').select('*').eq('id', id).maybeSingle();
	if (error) throw new Error(error.message);
	return data ? rowToVehicle(data as VehicleRow) : null;
}

async function withAdmin(ctx: ServerContext) {
	const sb = createServerSupabase(ctx.request, ctx.cookies);
	const {
		data: { user },
	} = await sb.auth.getUser();
	if (!user) {
		const err: { status: number } & Error = new Error('No autorizado.') as never;
		err.status = 401;
		throw err;
	}
	let role: string = user.app_metadata?.role ?? 'user';
	if (!isAdminRole(role)) {
		// Fallback al propio perfil (RLS permite leer la fila propia).
		const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).maybeSingle();
		if (profile?.role) role = String(profile.role);
	}
	if (!isAdminRole(role)) {
		const err: { status: number } & Error = new Error('Requiere permisos de administrador.') as never;
		err.status = 403;
		throw err;
	}
	return { sb, user };
}

export async function supabaseCreate(ctx: ServerContext, input: VehicleInput): Promise<Vehicle> {
	const { sb } = await withAdmin(ctx);
	const row: VehicleRow = vehicleToRow(
		inputToVehicle(input, randomUUID()),
	);
	const { data, error } = await sb.from('vehicles').insert(row).select().single();
	if (error) {
		if (error.code === '23505') throw new Error('Ya existe un vehículo con ese slug.');
		throw new Error(error.message);
	}
	return rowToVehicle(data as VehicleRow);
}

export async function supabaseUpdate(ctx: ServerContext, id: string, input: VehicleInput): Promise<Vehicle | null> {
	const { sb } = await withAdmin(ctx);
	const { data, error } = await sb
		.from('vehicles')
		.update({ ...vehicleToRow(inputToVehicle(input, id)), updated_at: new Date().toISOString() })
		.eq('id', id)
		.select();
	if (error) {
		if (error.code === '23505') throw new Error('Ya existe un vehículo con ese slug.');
		throw new Error(error.message);
	}
	return data?.[0] ? rowToVehicle(data[0] as VehicleRow) : null;
}

export async function supabaseRemove(ctx: ServerContext, id: string): Promise<boolean> {
	const { sb } = await withAdmin(ctx);
	const { error } = await sb.from('vehicles').delete().eq('id', id);
	if (error) throw new Error(error.message);
	return true;
}

export async function supabaseSetAvailable(ctx: ServerContext, id: string, available: boolean): Promise<Vehicle | null> {
	const { sb } = await withAdmin(ctx);
	const { data, error } = await sb
		.from('vehicles')
		.update({ available, updated_at: new Date().toISOString() })
		.eq('id', id)
		.select();
	if (error) throw new Error(error.message);
	return data?.[0] ? rowToVehicle(data[0] as VehicleRow) : null;
}

export async function supabaseSeed(raw: RawVehicle[]): Promise<number> {
	const { supabaseServiceRoleKey, supabaseUrl } = await import('../env');
	const serviceKey = supabaseServiceRoleKey();
	if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY no está configurada para sembrar datos.');
	const { createClient } = await import('@supabase/supabase-js');
	const service = createClient(supabaseUrl()!, serviceKey);
	const rows = raw.map((r, i) => {
		const v = inputToVehicle(
			{
				slug: r.slug,
				title: r.title,
				brand: r.brand,
				model: r.model ?? null,
				year: r.year ?? null,
				vehicle_type: r.vehicle_type ?? null,
				mileage: r.mileage ?? null,
				fuel_type: r.fuel_type ?? null,
				engine: r.engine ?? null,
				transmission: r.transmission ?? null,
				drive_type: r.drive_type ?? null,
				exterior_color: r.exterior_color ?? null,
				interior_color: r.interior_color ?? null,
				stock_id: r.stock_id ?? null,
				branch: r.branch ?? null,
				reservation_amount: r.reservation?.amount ?? null,
				cash_delivery_price: r.prices?.cash_delivery ?? null,
				advance_payment_price: r.prices?.advance_payment ?? null,
				registered: r.registered ?? null,
				history: r.history ?? null,
				features: r.features ?? [],
				description: r.description ?? [],
				images: r.images ?? [],
				source: r.source ?? null,
				available: true,
			},
			randomUUID(),
			new Date(Date.now() + i).toISOString(),
		);
		return vehicleToRow(v);
	});
	const { error } = await service.from('vehicles').upsert(rows, { onConflict: 'slug' });
	if (error) throw new Error(error.message);
	return rows.length;
}

export async function supabaseSeedAdmin(): Promise<{ email: string; password: string }> {
	const { supabaseServiceRoleKey, supabaseUrl, adminEmail, adminPassword } = await import('../env');
	const { createClient } = await import('@supabase/supabase-js');
	const serviceKey = supabaseServiceRoleKey();
	if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY no está configurada.');
	const service = createClient(supabaseUrl()!, serviceKey);
	const email = adminEmail();
	const password = adminPassword();

	const { data: existing } = await service.auth.admin.listUsers({ perPage: 200 });
	const found = existing?.users.find((u) => u.email === email);
	const userId = found?.id ?? (await service.auth.admin.createUser({ email, password, email_confirm: true })).data.user?.id;
	if (!userId) throw new Error('No se pudo crear el usuario administrador.');

	await service.auth.admin.updateUserById(userId, { app_metadata: { role: 'admin' } });
	await service.from('profiles').upsert(
		{ id: userId, email, name: 'Administrador', role: 'admin' },
		{ onConflict: 'id' },
	);
	return { email, password };
}

export function supabaseForeignKey(): string {
	return 'slug';
}
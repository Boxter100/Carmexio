import { isSupabaseConfigured } from '../env';
import type { ServerContext } from '../server/context';
import {
	supabaseCreate,
	supabaseGetById,
	supabaseGetBySlug,
	supabaseList,
	supabaseRemove,
	supabaseSetAvailable,
	supabaseUpdate,
} from './supabase';
import {
	localCreate,
	localGetById,
	localGetBySlug,
	localList,
	localRemove,
	localSetAvailable,
	localUpdate,
} from './local';
import type { Vehicle, VehicleFilters, VehicleInput, VehicleList } from '../types';

export type { RawVehicle } from './transform';
export * from './local';
export * from './supabase';

/** Lecturas públicas: no requieren sesión. */
export function listVehicles(filters: VehicleFilters = {}): Promise<VehicleList> {
	return isSupabaseConfigured() ? supabaseList(filters) : localList(filters);
}

export function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
	return isSupabaseConfigured() ? supabaseGetBySlug(slug) : localGetBySlug(slug);
}

export function getVehicleById(id: string): Promise<Vehicle | null> {
	return isSupabaseConfigured() ? supabaseGetById(id) : localGetById(id);
}

/** Escrituras de administración: exigen sesión admin (verificada por RLS en Supabase). */
export async function createVehicle(ctx: ServerContext, input: VehicleInput): Promise<Vehicle> {
	return isSupabaseConfigured() ? supabaseCreate(ctx, input) : localCreate(input);
}

export async function updateVehicle(ctx: ServerContext, id: string, input: VehicleInput): Promise<Vehicle | null> {
	return isSupabaseConfigured() ? supabaseUpdate(ctx, id, input) : localUpdate(id, input);
}

export async function removeVehicle(ctx: ServerContext, id: string): Promise<boolean> {
	return isSupabaseConfigured() ? supabaseRemove(ctx, id) : localRemove(id);
}

export async function setVehicleAvailable(ctx: ServerContext, id: string, available: boolean): Promise<Vehicle | null> {
	return isSupabaseConfigured() ? supabaseSetAvailable(ctx, id, available) : localSetAvailable(id, available);
}
import type { APIRoute } from 'astro';
import { listVehicles, createVehicle } from '../../../lib/db';
import { requireAdmin } from '../../../lib/server/auth';
import type { ServerContext } from '../../../lib/server/context';
import type { VehicleFilters } from '../../../lib/types';
import { vehicleInputSchema, toVehicleInput } from '../../../lib/validation';

function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'content-type': 'application/json' },
	});
}

function parseStringList(value: string | null): string[] | undefined {
	if (!value) return undefined;
	const parts = value
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
	return parts.length ? parts : undefined;
}

function parseNumber(value: string | null): number | undefined {
	if (!value) return undefined;
	const n = Number(value);
	return Number.isFinite(n) ? n : undefined;
}

function parseFilters(url: URL): VehicleFilters {
	const p = url.searchParams;
	return {
		search: p.get('search') || undefined,
		brands: parseStringList(p.get('brands')),
		vehicle_types: parseStringList(p.get('vehicle_types')),
		transmissions: parseStringList(p.get('transmissions')),
		drive_types: parseStringList(p.get('drive_types')),
		branches: parseStringList(p.get('branches')),
		available: p.get('available') !== null ? p.get('available') === 'true' : undefined,
		min_price: parseNumber(p.get('min_price')),
		max_price: parseNumber(p.get('max_price')),
		min_year: parseNumber(p.get('min_year')),
		max_year: parseNumber(p.get('max_year')),
		sort: (p.get('sort') as VehicleFilters['sort']) || 'recent',
		limit: parseNumber(p.get('limit')),
		offset: parseNumber(p.get('offset')),
	};
}

export const GET: APIRoute = async ({ request, url }) => {
	try {
		const result = await listVehicles(parseFilters(url));
		return json(result);
	} catch (err) {
		const status = (err as { status?: number })?.status ?? 500;
		return json({ error: err instanceof Error ? err.message : 'Error interno.' }, status);
	}
};

export const POST: APIRoute = async ({ request, cookies }) => {
	const ctx: ServerContext = { request, cookies };
	try {
		await requireAdmin(ctx);
		const parsed = vehicleInputSchema.safeParse(await request.json());
		if (!parsed.success) {
			return json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }, 400);
		}
		const vehicle = await createVehicle(ctx, toVehicleInput(parsed.data));
		return json({ vehicle }, 201);
	} catch (err) {
		const status = (err as { status?: number })?.status ?? 500;
		return json({ error: err instanceof Error ? err.message : 'Error interno.' }, status);
	}
};
import type { APIRoute } from 'astro';
import { getVehicleById, updateVehicle, removeVehicle } from '../../../lib/db';
import { requireAdmin } from '../../../lib/server/auth';
import type { ServerContext } from '../../../lib/server/context';
import { vehicleInputSchema, toVehicleInput } from '../../../lib/validation';

function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'content-type': 'application/json' },
	});
}

function notFound() {
	return json({ error: 'Vehículo no encontrado.' }, 404);
}

export const GET: APIRoute = async ({ request, cookies, params }) => {
	const ctx: ServerContext = { request, cookies };
	try {
		const vehicle = await getVehicleById(params.id!);
		if (!vehicle) return notFound();
		return json({ vehicle });
	} catch (err) {
		const status = (err as { status?: number })?.status ?? 500;
		return json({ error: err instanceof Error ? err.message : 'Error interno.' }, status);
	}
};

export const PUT: APIRoute = async ({ request, cookies, params }) => {
	const ctx: ServerContext = { request, cookies };
	try {
		await requireAdmin(ctx);
		const parsed = vehicleInputSchema.safeParse(await request.json());
		if (!parsed.success) {
			return json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }, 400);
		}
		const vehicle = await updateVehicle(ctx, params.id!, toVehicleInput(parsed.data));
		if (!vehicle) return notFound();
		return json({ vehicle });
	} catch (err) {
		const status = (err as { status?: number })?.status ?? 500;
		return json(
			{ error: err instanceof Error ? err.message : 'Error interno.' },
			status === 401 || status === 403 ? status : 500,
		);
	}
};

export const DELETE: APIRoute = async ({ request, cookies, params }) => {
	const ctx: ServerContext = { request, cookies };
	try {
		await requireAdmin(ctx);
		const ok = await removeVehicle(ctx, params.id!);
		if (!ok) return notFound();
		return json({ ok: true });
	} catch (err) {
		const status = (err as { status?: number })?.status ?? 500;
		return json({ error: err instanceof Error ? err.message : 'Error interno.' }, status);
	}
};
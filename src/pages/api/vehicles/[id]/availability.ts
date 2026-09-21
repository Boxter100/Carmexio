import type { APIRoute } from 'astro';
import { setVehicleAvailable } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/server/auth';
import type { ServerContext } from '../../../../lib/server/context';

function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'content-type': 'application/json' },
	});
}

export const PATCH: APIRoute = async ({ request, cookies, params }) => {
	const ctx: ServerContext = { request, cookies };
	try {
		await requireAdmin(ctx);
		const body = (await request.json()) as { available?: unknown };
		if (typeof body.available !== 'boolean') {
			return json({ error: 'El campo available debe ser booleano.' }, 400);
		}
		const vehicle = await setVehicleAvailable(ctx, params.id!, body.available);
		if (!vehicle) return json({ error: 'Vehículo no encontrado.' }, 404);
		return json({ vehicle });
	} catch (err) {
		const status = (err as { status?: number })?.status ?? 500;
		return json(
			{ error: err instanceof Error ? err.message : 'Error interno.' },
			status === 401 || status === 403 ? status : 500,
		);
	}
};
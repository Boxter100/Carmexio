import type { APIRoute } from 'astro';
import { loginAdmin } from '../../../lib/server/auth';
import type { ServerContext } from '../../../lib/server/context';
import { loginSchema } from '../../../lib/validation';

export const POST: APIRoute = async ({ request, cookies }) => {
	const ctx: ServerContext = { request, cookies };
	const json = (data: unknown, status: number) =>
		new Response(JSON.stringify(data), {
			status,
			headers: { 'content-type': 'application/json' },
		});

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Solicitud inválida.' }, 400);
	}

	const parsed = loginSchema.safeParse(body);
	if (!parsed.success) {
		return json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }, 400);
	}

	const result = await loginAdmin(ctx, parsed.data.email, parsed.data.password);
	if (!result.ok) {
		return json({ error: result.error }, 401);
	}
	return json({ user: result.user }, 200);
};
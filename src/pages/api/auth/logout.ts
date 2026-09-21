import type { APIRoute } from 'astro';
import { logoutAdmin } from '../../../lib/server/auth';
import type { ServerContext } from '../../../lib/server/context';

export const POST: APIRoute = async ({ request, cookies }) => {
	const ctx: ServerContext = { request, cookies };
	await logoutAdmin(ctx);
	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: { 'content-type': 'application/json' },
	});
};
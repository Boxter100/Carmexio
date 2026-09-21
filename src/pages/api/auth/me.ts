import type { APIRoute } from 'astro';
import { currentSession } from '../../../lib/server/auth';
import type { ServerContext } from '../../../lib/server/context';

export const GET: APIRoute = async ({ request, cookies }) => {
	const ctx: ServerContext = { request, cookies };
	const user = await currentSession(ctx);
	if (!user) {
		return new Response(JSON.stringify({ user: null }), {
			status: 200,
			headers: { 'content-type': 'application/json' },
		});
	}
	return new Response(JSON.stringify({ user }), {
		status: 200,
		headers: { 'content-type': 'application/json' },
	});
};
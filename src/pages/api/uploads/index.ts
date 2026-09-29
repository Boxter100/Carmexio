import type { APIRoute } from 'astro';
import { isSupabaseConfigured, supabaseUrl } from '../../../lib/env';
import { createServerSupabase } from '../../../lib/server/supabase';
import { requireAdmin } from '../../../lib/server/auth';
import type { ServerContext } from '../../../lib/server/context';
import {
	ACCEPTED_IMAGE_MIME,
	buildObjectPath,
	hasWebpMagicBytes,
	isValidObjectPath,
	isWebpName,
	MAX_IMAGE_BYTES,
	VEHICLE_IMAGE_BUCKET,
} from '../../../lib/storage';

function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'content-type': 'application/json' },
	});
}

/** URL pública estable, equivalente a storage.getPublicUrl() pero sin cliente. */
function publicImageUrl(path: string): string {
	const base = (supabaseUrl() ?? '').replace(/\/+$/, '');
	return `${base}/storage/v1/object/public/${VEHICLE_IMAGE_BUCKET}/${path}`;
}

/** Un archivo por petición: severalos together superaría el límite de 4.5 MB de Vercel. */
export const POST: APIRoute = async ({ request, cookies }) => {
	const ctx: ServerContext = { request, cookies };
	try {
		await requireAdmin(ctx);
		if (!isSupabaseConfigured()) {
			return json({ error: 'Las subidas de imágenes requieren Supabase configurado.' }, 503);
		}

		const form = await request.formData();
		const file = form.get('file');
		const folder = form.get('folder');
		if (!(file instanceof File)) {
			return json({ error: 'No se recibió ningún archivo.' }, 400);
		}
		if (file.size === 0) {
			return json({ error: `El archivo «${file.name}» está vacío.` }, 400);
		}
		if (file.size > MAX_IMAGE_BYTES) {
			const mb = (MAX_IMAGE_BYTES / (1024 * 1024)).toFixed(1);
			return json({ error: `El archivo «${file.name}» supera el límite de ${mb} MB.` }, 413);
		}
		// La extensión y la cabecera real (RIFF/WEBP) son la puerta: el MIME declarado
		// por el cliente no es una prueba (curl y algunos SO envían octet-stream), así que
		// no se exige aquí, solo se usa como filtro rápido en el navegador.
		if (!isWebpName(file.name)) {
			return json({ error: `«${file.name}» no es un archivo .webp.` }, 415);
		}
		if (!(await hasWebpMagicBytes(file))) {
			return json({ error: `El contenido de «${file.name}» no es WebP.` }, 415);
		}

		// storage-js solo aplica `options.contentType` cuando el body NO es un Blob
		// (ver uploadOrUpdate en @supabase/storage-js). Si se le pasa el File tal cual,
		// se guarda el MIME que declara el cliente, que no es una fuente fiable.
		// Como los magic bytes ya confirmaron que es WebP, se reempaqueta con el tipo
		// correcto para que el objeto se sirva como image/webp.
		const bytes = new Uint8Array(await file.arrayBuffer());
		const payload = new File([bytes], file.name, { type: ACCEPTED_IMAGE_MIME });

		const path = buildObjectPath(typeof folder === 'string' ? folder : '', file.name);
		const sb = createServerSupabase(request, cookies);
		const { error } = await sb.storage
			.from(VEHICLE_IMAGE_BUCKET)
			.upload(path, payload, { contentType: ACCEPTED_IMAGE_MIME, upsert: false });
		if (error) throw new Error(error.message);

		return json({ url: publicImageUrl(path), path }, 201);
	} catch (err) {
		const status = (err as { status?: number })?.status ?? 500;
		return json(
			{ error: err instanceof Error ? err.message : 'Error interno.' },
			status === 401 || status === 403 ? status : 500,
		);
	}
};

export const DELETE: APIRoute = async ({ request, cookies, url }) => {
	const ctx: ServerContext = { request, cookies };
	try {
		await requireAdmin(ctx);
		const path = url.searchParams.get('path');
		if (!path || !isValidObjectPath(path)) {
			return json({ error: 'Ruta de objeto inválida.' }, 400);
		}
		const sb = createServerSupabase(request, cookies);
		const { error } = await sb.storage.from(VEHICLE_IMAGE_BUCKET).remove([path]);
		if (error) throw new Error(error.message);
		return json({ ok: true, path });
	} catch (err) {
		const status = (err as { status?: number })?.status ?? 500;
		return json(
			{ error: err instanceof Error ? err.message : 'Error interno.' },
			status === 401 || status === 403 ? status : 500,
		);
	}
};

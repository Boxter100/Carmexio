import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as requireAdmin } from "./auth_CCbTrT4O.mjs";
import { n as toVehicleInput, r as vehicleInputSchema } from "./validation_CSvmmUdY.mjs";
import { a as removeVehicle, n as getVehicleById, s as updateVehicle } from "./db_BGXn1kfm.mjs";
//#region src/pages/api/vehicles/[id].ts
var _id__exports = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE,
	GET: () => GET,
	PUT: () => PUT
});
function json(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { "content-type": "application/json" }
	});
}
function notFound() {
	return json({ error: "Vehículo no encontrado." }, 404);
}
var GET = async ({ request, cookies, params }) => {
	try {
		const vehicle = await getVehicleById(params.id);
		if (!vehicle) return notFound();
		return json({ vehicle });
	} catch (err) {
		const status = err?.status ?? 500;
		return json({ error: err instanceof Error ? err.message : "Error interno." }, status);
	}
};
var PUT = async ({ request, cookies, params }) => {
	const ctx = {
		request,
		cookies
	};
	try {
		await requireAdmin(ctx);
		const parsed = vehicleInputSchema.safeParse(await request.json());
		if (!parsed.success) return json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos." }, 400);
		const vehicle = await updateVehicle(ctx, params.id, toVehicleInput(parsed.data));
		if (!vehicle) return notFound();
		return json({ vehicle });
	} catch (err) {
		const status = err?.status ?? 500;
		return json({ error: err instanceof Error ? err.message : "Error interno." }, status === 401 || status === 403 ? status : 500);
	}
};
var DELETE = async ({ request, cookies, params }) => {
	const ctx = {
		request,
		cookies
	};
	try {
		await requireAdmin(ctx);
		if (!await removeVehicle(ctx, params.id)) return notFound();
		return json({ ok: true });
	} catch (err) {
		const status = err?.status ?? 500;
		return json({ error: err instanceof Error ? err.message : "Error interno." }, status);
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/vehicles/[id]@_@ts
var page = () => _id__exports;
//#endregion
export { page };

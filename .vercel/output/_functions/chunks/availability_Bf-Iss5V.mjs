import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as requireAdmin } from "./auth_CCbTrT4O.mjs";
import { o as setVehicleAvailable } from "./db_BGXn1kfm.mjs";
//#region src/pages/api/vehicles/[id]/availability.ts
var availability_exports = /* @__PURE__ */ __exportAll({ PATCH: () => PATCH });
function json(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { "content-type": "application/json" }
	});
}
var PATCH = async ({ request, cookies, params }) => {
	const ctx = {
		request,
		cookies
	};
	try {
		await requireAdmin(ctx);
		const body = await request.json();
		if (typeof body.available !== "boolean") return json({ error: "El campo available debe ser booleano." }, 400);
		const vehicle = await setVehicleAvailable(ctx, params.id, body.available);
		if (!vehicle) return json({ error: "Vehículo no encontrado." }, 404);
		return json({ vehicle });
	} catch (err) {
		const status = err?.status ?? 500;
		return json({ error: err instanceof Error ? err.message : "Error interno." }, status === 401 || status === 403 ? status : 500);
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/vehicles/[id]/availability@_@ts
var page = () => availability_exports;
//#endregion
export { page };

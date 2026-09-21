import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { i as requireAdmin } from "./auth_CCbTrT4O.mjs";
import { n as toVehicleInput, r as vehicleInputSchema } from "./validation_CSvmmUdY.mjs";
import { i as listVehicles, t as createVehicle } from "./db_BGXn1kfm.mjs";
//#region src/pages/api/vehicles/index.ts
var vehicles_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST
});
function json(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { "content-type": "application/json" }
	});
}
function parseStringList(value) {
	if (!value) return void 0;
	const parts = value.split(",").map((s) => s.trim()).filter(Boolean);
	return parts.length ? parts : void 0;
}
function parseNumber(value) {
	if (!value) return void 0;
	const n = Number(value);
	return Number.isFinite(n) ? n : void 0;
}
function parseFilters(url) {
	const p = url.searchParams;
	return {
		search: p.get("search") || void 0,
		brands: parseStringList(p.get("brands")),
		vehicle_types: parseStringList(p.get("vehicle_types")),
		transmissions: parseStringList(p.get("transmissions")),
		drive_types: parseStringList(p.get("drive_types")),
		branches: parseStringList(p.get("branches")),
		available: p.get("available") !== null ? p.get("available") === "true" : void 0,
		min_price: parseNumber(p.get("min_price")),
		max_price: parseNumber(p.get("max_price")),
		min_year: parseNumber(p.get("min_year")),
		max_year: parseNumber(p.get("max_year")),
		sort: p.get("sort") || "recent",
		limit: parseNumber(p.get("limit")),
		offset: parseNumber(p.get("offset"))
	};
}
var GET = async ({ request, url }) => {
	try {
		return json(await listVehicles(parseFilters(url)));
	} catch (err) {
		const status = err?.status ?? 500;
		return json({ error: err instanceof Error ? err.message : "Error interno." }, status);
	}
};
var POST = async ({ request, cookies }) => {
	const ctx = {
		request,
		cookies
	};
	try {
		await requireAdmin(ctx);
		const parsed = vehicleInputSchema.safeParse(await request.json());
		if (!parsed.success) return json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos." }, 400);
		return json({ vehicle: await createVehicle(ctx, toVehicleInput(parsed.data)) }, 201);
	} catch (err) {
		const status = err?.status ?? 500;
		return json({ error: err instanceof Error ? err.message : "Error interno." }, status);
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/vehicles/index@_@ts
var page = () => vehicles_exports;
//#endregion
export { page };

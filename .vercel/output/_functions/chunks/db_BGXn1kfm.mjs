import { _ as rowToVehicle, a as localCreate, c as localList, d as localSetAvailable, g as inputToVehicle, h as queryVehicles, l as localRemove, m as localUpdate, n as createPublicSupabase, o as localGetById, r as createServerSupabase, s as localGetBySlug, t as isAdminRole, v as vehicleToRow, y as isSupabaseConfigured } from "./roles_CIjRyDdg.mjs";
import { randomUUID } from "node:crypto";
//#region src/lib/db/supabase.ts
async function fetchAllVehicles() {
	const { data, error } = await createPublicSupabase().from("vehicles").select("*").order("updated_at", { ascending: false });
	if (error) throw new Error(error.message);
	return (data ?? []).map((row) => rowToVehicle(row));
}
async function supabaseList(filters = {}) {
	return queryVehicles(await fetchAllVehicles(), filters);
}
async function supabaseGetBySlug(slug) {
	return (await fetchAllVehicles()).find((v) => v.slug === slug) ?? null;
}
async function supabaseGetById(id) {
	const { data, error } = await createPublicSupabase().from("vehicles").select("*").eq("id", id).maybeSingle();
	if (error) throw new Error(error.message);
	return data ? rowToVehicle(data) : null;
}
async function withAdmin(ctx) {
	const sb = createServerSupabase(ctx.request, ctx.cookies);
	const { data: { user } } = await sb.auth.getUser();
	if (!user) {
		const err = /* @__PURE__ */ new Error("No autorizado.");
		err.status = 401;
		throw err;
	}
	let role = user.app_metadata?.role ?? "user";
	if (!isAdminRole(role)) {
		const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
		if (profile?.role) role = String(profile.role);
	}
	if (!isAdminRole(role)) {
		const err = /* @__PURE__ */ new Error("Requiere permisos de administrador.");
		err.status = 403;
		throw err;
	}
	return {
		sb,
		user
	};
}
async function supabaseCreate(ctx, input) {
	const { sb } = await withAdmin(ctx);
	const row = vehicleToRow(inputToVehicle(input, randomUUID()));
	const { data, error } = await sb.from("vehicles").insert(row).select().single();
	if (error) {
		if (error.code === "23505") throw new Error("Ya existe un vehículo con ese slug.");
		throw new Error(error.message);
	}
	return rowToVehicle(data);
}
async function supabaseUpdate(ctx, id, input) {
	const { sb } = await withAdmin(ctx);
	const { data, error } = await sb.from("vehicles").update({
		...vehicleToRow(inputToVehicle(input, id)),
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", id).select();
	if (error) {
		if (error.code === "23505") throw new Error("Ya existe un vehículo con ese slug.");
		throw new Error(error.message);
	}
	return data?.[0] ? rowToVehicle(data[0]) : null;
}
async function supabaseRemove(ctx, id) {
	const { sb } = await withAdmin(ctx);
	const { error } = await sb.from("vehicles").delete().eq("id", id);
	if (error) throw new Error(error.message);
	return true;
}
async function supabaseSetAvailable(ctx, id, available) {
	const { sb } = await withAdmin(ctx);
	const { data, error } = await sb.from("vehicles").update({
		available,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", id).select();
	if (error) throw new Error(error.message);
	return data?.[0] ? rowToVehicle(data[0]) : null;
}
//#endregion
//#region src/lib/db/index.ts
/** Lecturas públicas: no requieren sesión. */
function listVehicles(filters = {}) {
	return isSupabaseConfigured() ? supabaseList(filters) : localList(filters);
}
function getVehicleBySlug(slug) {
	return isSupabaseConfigured() ? supabaseGetBySlug(slug) : localGetBySlug(slug);
}
function getVehicleById(id) {
	return isSupabaseConfigured() ? supabaseGetById(id) : localGetById(id);
}
/** Escrituras de administración: exigen sesión admin (verificada por RLS en Supabase). */
async function createVehicle(ctx, input) {
	return isSupabaseConfigured() ? supabaseCreate(ctx, input) : localCreate(input);
}
async function updateVehicle(ctx, id, input) {
	return isSupabaseConfigured() ? supabaseUpdate(ctx, id, input) : localUpdate(id, input);
}
async function removeVehicle(ctx, id) {
	return isSupabaseConfigured() ? supabaseRemove(ctx, id) : localRemove(id);
}
async function setVehicleAvailable(ctx, id, available) {
	return isSupabaseConfigured() ? supabaseSetAvailable(ctx, id, available) : localSetAvailable(id, available);
}
//#endregion
export { removeVehicle as a, listVehicles as i, getVehicleById as n, setVehicleAvailable as o, getVehicleBySlug as r, updateVehicle as s, createVehicle as t };

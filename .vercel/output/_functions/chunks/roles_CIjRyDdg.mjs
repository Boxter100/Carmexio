import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import nodePath from "node:path";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
//#region src/lib/env.ts
function supabaseUrl() {
	return "https://wernsadegxrjosvpxclj.supabase.co";
}
function supabaseAnonKey() {
	return "sb_publishable_Fq46khm4OPfJ6Vz9lJQJlw__6Eu1u-a";
}
function isSupabaseConfigured() {
	return Boolean(supabaseUrl() && supabaseAnonKey());
}
function adminEmail() {
	return "admin@carmexio.mx";
}
function adminPassword() {
	return "carmexio123";
}
//#endregion
//#region src/lib/db/map.ts
function asStringArray(value) {
	if (Array.isArray(value)) return value.filter((x) => typeof x === "string");
	if (typeof value === "string") try {
		return asStringArray(JSON.parse(value));
	} catch {
		return [];
	}
	return [];
}
function asImages(value) {
	if (Array.isArray(value)) return value.filter((x) => typeof x === "object" && x !== null).map((img) => ({
		url: String(img.url ?? ""),
		display_url: img.display_url ? String(img.display_url) : null,
		alt: img.alt ? String(img.alt) : null,
		order: typeof img.order === "number" ? img.order : 0
	})).filter((img) => img.url.length > 0).sort((a, b) => a.order - b.order);
	return [];
}
function rowToVehicle(row) {
	return {
		id: row.id,
		slug: row.slug,
		title: row.title,
		brand: row.brand,
		model: row.model,
		year: row.year,
		vehicle_type: row.vehicle_type,
		mileage: row.mileage,
		fuel_type: row.fuel_type,
		engine: row.engine,
		transmission: row.transmission,
		drive_type: row.drive_type,
		exterior_color: row.exterior_color,
		interior_color: row.interior_color,
		stock_id: row.stock_id,
		branch: row.branch,
		reservation_amount: row.reservation_amount,
		cash_delivery_price: row.cash_delivery_price,
		advance_payment_price: row.advance_payment_price,
		registered: row.registered,
		history: row.history,
		features: asStringArray(row.features),
		description: asStringArray(row.description),
		images: asImages(row.images),
		source: row.source && typeof row.source === "object" && typeof row.source.url === "string" ? { url: row.source.url } : null,
		available: Boolean(row.available),
		created_at: row.created_at ?? (/* @__PURE__ */ new Date()).toISOString(),
		updated_at: row.updated_at ?? (/* @__PURE__ */ new Date()).toISOString()
	};
}
function vehicleToRow(v) {
	return {
		id: v.id,
		slug: v.slug,
		title: v.title,
		brand: v.brand,
		model: v.model ?? null,
		year: v.year ?? null,
		vehicle_type: v.vehicle_type ?? null,
		mileage: v.mileage ?? null,
		fuel_type: v.fuel_type ?? null,
		engine: v.engine ?? null,
		transmission: v.transmission ?? null,
		drive_type: v.drive_type ?? null,
		exterior_color: v.exterior_color ?? null,
		interior_color: v.interior_color ?? null,
		stock_id: v.stock_id ?? null,
		branch: v.branch ?? null,
		reservation_amount: v.reservation_amount ?? null,
		cash_delivery_price: v.cash_delivery_price ?? null,
		advance_payment_price: v.advance_payment_price ?? null,
		registered: v.registered ?? null,
		history: v.history ?? null,
		features: v.features ?? [],
		description: v.description ?? [],
		images: v.images ?? [],
		source: v.source ?? null,
		available: v.available,
		created_at: v.created_at,
		updated_at: v.updated_at
	};
}
function inputToVehicle(input, id, now = (/* @__PURE__ */ new Date()).toISOString()) {
	return {
		...input,
		id,
		created_at: now,
		updated_at: now
	};
}
//#endregion
//#region src/lib/db/query.ts
function includesAny(value, list) {
	if (!list || list.length === 0) return true;
	return value != null && list.includes(value);
}
function inRange(value, min, max) {
	if (value == null) return true;
	if (min != null && value < min) return false;
	if (max != null && value > max) return false;
	return true;
}
function matchesFilters(v, f) {
	const q = (f.search ?? "").trim().toLowerCase();
	if (q) {
		if (![
			v.brand,
			v.model,
			v.title,
			v.year,
			v.vehicle_type,
			v.engine,
			v.stock_id,
			v.exterior_color,
			v.branch
		].filter(Boolean).join(" ").toLowerCase().includes(q)) return false;
	}
	if (!includesAny(v.brand, f.brands)) return false;
	if (!includesAny(v.vehicle_type, f.vehicle_types)) return false;
	if (!includesAny(v.transmission, f.transmissions)) return false;
	if (!includesAny(v.drive_type, f.drive_types)) return false;
	if (!includesAny(v.branch, f.branches)) return false;
	if (f.available !== void 0 && v.available !== f.available) return false;
	if (!inRange(v.cash_delivery_price, f.min_price, f.max_price)) return false;
	if (!inRange(v.year, f.min_year, f.max_year)) return false;
	return true;
}
function sortVehicles(vehicles, sort) {
	const list = [...vehicles];
	switch (sort) {
		case "price-asc":
			list.sort((a, b) => (a.cash_delivery_price ?? Infinity) - (b.cash_delivery_price ?? Infinity));
			break;
		case "price-desc":
			list.sort((a, b) => (b.cash_delivery_price ?? -Infinity) - (a.cash_delivery_price ?? -Infinity));
			break;
		case "year-desc":
			list.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
			break;
		case "year-asc":
			list.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
			break;
		default: list.sort((a, b) => new Date(b.updated_at ?? b.created_at).getTime() - new Date(a.updated_at ?? a.created_at).getTime());
	}
	return list;
}
function computeFacets(vehicles) {
	const push = (map, value) => {
		if (!value) return;
		map[value] = (map[value] ?? 0) + 1;
	};
	const facets = {
		brands: {},
		vehicle_types: {},
		transmissions: {},
		drive_types: {},
		branches: {}
	};
	for (const v of vehicles) {
		push(facets.brands, v.brand);
		push(facets.vehicle_types, v.vehicle_type);
		push(facets.transmissions, v.transmission);
		push(facets.drive_types, v.drive_type);
		push(facets.branches, v.branch);
	}
	return facets;
}
function queryVehicles(vehicles, filters = {}) {
	const sorted = sortVehicles(vehicles.filter((v) => matchesFilters(v, filters)), filters.sort);
	const limit = filters.limit ?? sorted.length;
	const offset = filters.offset ?? 0;
	return {
		vehicles: sorted.slice(offset, offset + limit),
		total: sorted.length,
		facets: computeFacets(vehicles)
	};
}
//#endregion
//#region src/lib/db/transform.ts
function rawToVehicle(raw, now = (/* @__PURE__ */ new Date()).toISOString()) {
	return {
		id: raw.slug,
		slug: raw.slug,
		title: raw.title,
		brand: raw.brand,
		model: raw.model ?? null,
		year: raw.year ?? null,
		vehicle_type: raw.vehicle_type ?? null,
		mileage: raw.mileage ?? null,
		fuel_type: raw.fuel_type ?? null,
		engine: raw.engine ?? null,
		transmission: raw.transmission ?? null,
		drive_type: raw.drive_type ?? null,
		exterior_color: raw.exterior_color ?? null,
		interior_color: raw.interior_color ?? null,
		stock_id: raw.stock_id ?? null,
		branch: raw.branch ?? null,
		reservation_amount: raw.reservation?.amount ?? null,
		cash_delivery_price: raw.prices?.cash_delivery ?? null,
		advance_payment_price: raw.prices?.advance_payment ?? null,
		registered: raw.registered ?? null,
		history: raw.history ?? null,
		features: Array.isArray(raw.features) ? [...raw.features] : [],
		description: Array.isArray(raw.description) ? [...raw.description] : [],
		images: Array.isArray(raw.images) ? raw.images.map((img) => ({
			url: img.url,
			display_url: img.display_url ?? img.url,
			alt: img.alt ?? null,
			order: img.order ?? 0
		})) : [],
		source: raw.source ?? null,
		available: true,
		created_at: now,
		updated_at: now
	};
}
//#endregion
//#region src/lib/db/local.ts
var DATA_DIR = nodePath.join(process.cwd(), ".data");
var VEHICLES_FILE = nodePath.join(DATA_DIR, "vehicles.json");
var USERS_FILE = nodePath.join(DATA_DIR, "users.json");
var SESSIONS_FILE = nodePath.join(DATA_DIR, "sessions.json");
var SEED_FILE = nodePath.join(process.cwd(), "datos", "vehiculos_normalizados.json");
var SESSION_COOKIE = "carmexio_session";
var SESSION_TTL_MS = 6048e5;
function ensureDir() {
	mkdirSync(DATA_DIR, { recursive: true });
}
function readJson(file, fallback) {
	if (!existsSync(file)) return fallback;
	try {
		return JSON.parse(readFileSync(file, "utf8"));
	} catch {
		return fallback;
	}
}
function writeJson(file, data) {
	ensureDir();
	const tmp = `${file}.${process.pid}.tmp`;
	writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
	renameSync(tmp, file);
}
var vehiclesCache = null;
function seedFromRaw() {
	if (!existsSync(SEED_FILE)) return [];
	const raw = JSON.parse(readFileSync(SEED_FILE, "utf8"));
	if (!Array.isArray(raw)) return [];
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return raw.map((r) => rawToVehicle(r, now));
}
function loadRawOrStored() {
	const raw = readJson(VEHICLES_FILE, null);
	if (raw && Array.isArray(raw) && raw.length > 0) return raw.map(rowToVehicle);
	return seedFromRaw();
}
function loadVehicles() {
	if (vehiclesCache) return vehiclesCache;
	vehiclesCache = loadRawOrStored();
	if (vehiclesCache.length > 0 && !existsSync(VEHICLES_FILE)) persistVehicles();
	return vehiclesCache;
}
function persistVehicles() {
	if (!vehiclesCache) return;
	writeJson(VEHICLES_FILE, vehiclesCache.map((v) => ({ ...v })));
}
function now() {
	return (/* @__PURE__ */ new Date()).toISOString();
}
function assertSlugUnique(slug, ignoreId) {
	if (vehiclesCache?.some((v) => v.slug === slug && v.id !== ignoreId)) throw new Error("Ya existe un vehículo con ese slug.");
}
async function localList(filters = {}) {
	return queryVehicles(loadVehicles(), filters);
}
async function localGetBySlug(slug) {
	return loadVehicles().find((v) => v.slug === slug) ?? null;
}
async function localGetById(id) {
	return loadVehicles().find((v) => v.id === id) ?? null;
}
async function localCreate(input) {
	const vehicles = loadVehicles();
	assertSlugUnique(input.slug);
	const vehicle = inputToVehicle(input, randomUUID(), now());
	vehicles.push(vehicle);
	vehiclesCache = vehicles;
	persistVehicles();
	return vehicle;
}
async function localUpdate(id, input) {
	const vehicles = loadVehicles();
	assertSlugUnique(input.slug, id);
	const index = vehicles.findIndex((v) => v.id === id);
	if (index === -1) return null;
	const updated = {
		...vehicles[index],
		...input,
		images: renumberedImages(input.images),
		updated_at: now()
	};
	vehicles[index] = updated;
	vehiclesCache = vehicles;
	persistVehicles();
	return updated;
}
async function localRemove(id) {
	const vehicles = loadVehicles();
	const next = vehicles.filter((v) => v.id !== id);
	if (next.length === vehicles.length) return false;
	vehiclesCache = next;
	persistVehicles();
	return true;
}
async function localSetAvailable(id, available) {
	const vehicles = loadVehicles();
	const index = vehicles.findIndex((v) => v.id === id);
	if (index === -1) return null;
	vehicles[index] = {
		...vehicles[index],
		available,
		updated_at: now()
	};
	vehiclesCache = vehicles;
	persistVehicles();
	return vehicles[index];
}
function renumberedImages(images) {
	return images.map((img, i) => ({
		...img,
		order: i
	})).filter((img) => img.url.trim().length > 0);
}
function hashPassword(password) {
	const salt = randomBytes(16).toString("hex");
	return `scrypt$${salt}$${scryptSync(password, salt, 64).toString("hex")}`;
}
function verifyPassword(password, stored) {
	const [algo, salt, hash] = stored.split("$");
	if (algo !== "scrypt" || !salt || !hash) return false;
	const candidate = scryptSync(password, salt, 64);
	const expected = Buffer.from(hash, "hex");
	return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}
function ensureUsers() {
	const users = readJson(USERS_FILE, null);
	if (users && Array.isArray(users) && users.length > 0) return users;
	const seed = [{
		id: randomUUID(),
		email: adminEmail().toLowerCase(),
		name: "Administrador",
		role: "admin",
		password_hash: hashPassword(adminPassword())
	}];
	writeJson(USERS_FILE, seed);
	return seed;
}
function loadUsers() {
	const users = ensureUsers();
	try {
		return JSON.parse(readFileSync(USERS_FILE, "utf8"));
	} catch {
		return users;
	}
}
function loadSessions() {
	return readJson(SESSIONS_FILE, []);
}
function persistSessions(sessions) {
	writeJson(SESSIONS_FILE, sessions);
}
function toAdminUser(u) {
	return {
		id: u.id,
		email: u.email,
		name: u.name ?? null,
		role: u.role
	};
}
async function localSignIn(email, password) {
	const user = loadUsers().find((u) => u.email === email.toLowerCase());
	if (!user || !verifyPassword(password, user.password_hash)) return {
		user: null,
		token: null
	};
	const token = randomBytes(32).toString("hex");
	const sessions = loadSessions().filter((s) => s.expires_at > (/* @__PURE__ */ new Date()).toISOString());
	sessions.push({
		token,
		user_id: user.id,
		expires_at: new Date(Date.now() + SESSION_TTL_MS).toISOString()
	});
	persistSessions(sessions);
	return {
		user: toAdminUser(user),
		token
	};
}
async function localSignOut(token) {
	if (!token) return;
	persistSessions(loadSessions().filter((s) => s.token !== token));
}
async function localSession(token) {
	if (!token) return null;
	const sessions = loadSessions().filter((s) => s.expires_at > (/* @__PURE__ */ new Date()).toISOString());
	if (sessions.some((s) => s.expires_at <= (/* @__PURE__ */ new Date()).toISOString())) persistSessions(sessions);
	const session = sessions.find((s) => s.token === token);
	if (!session) return null;
	return loadUsers().find((u) => u.id === session.user_id)?.email ? toAdminUser(loadUsers().find((u) => u.id === session.user_id)) : null;
}
//#endregion
//#region src/lib/server/supabase.ts
function parseCookieHeader(request) {
	const header = request.headers.get("cookie");
	if (!header) return [];
	return header.split(";").filter(Boolean).map((part) => {
		const idx = part.indexOf("=");
		const name = part.slice(0, idx).trim();
		const value = idx === -1 ? "" : part.slice(idx + 1).trim();
		return {
			name,
			value: decodeURIComponent(value)
		};
	});
}
/** Cliente ligado a la petición/sesión (para páginas SSR y mutaciones autenticadas). */
function createServerSupabase(request, cookies) {
	return createServerClient(supabaseUrl(), supabaseAnonKey(), { cookies: {
		getAll() {
			return parseCookieHeader(request);
		},
		setAll(cookiesToSet) {
			for (const { name, value, options } of cookiesToSet) cookies.set(name, value, options);
		}
	} });
}
/** Cliente público de lectura (RLS permite lectura pública de la tabla vehículos). */
function createPublicSupabase() {
	return createClient(supabaseUrl(), supabaseAnonKey());
}
//#endregion
//#region src/lib/roles.ts
var ADMIN_ROLES = ["admin", "super_admin"];
function isAdminRole(role) {
	return ADMIN_ROLES.some((r) => role?.toLowerCase() === r);
}
//#endregion
export { rowToVehicle as _, localCreate as a, localList as c, localSetAvailable as d, localSignIn as f, inputToVehicle as g, queryVehicles as h, SESSION_COOKIE as i, localRemove as l, localUpdate as m, createPublicSupabase as n, localGetById as o, localSignOut as p, createServerSupabase as r, localGetBySlug as s, isAdminRole as t, localSession as u, vehicleToRow as v, isSupabaseConfigured as y };

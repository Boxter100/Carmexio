// Almacén local de desarrollo. Se usa únicamente cuando no hay credenciales de
// Supabase configuradas. Persiste en `.data/` y se siembra desde el JSON de seed.

import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { AdminUser, Vehicle, VehicleFilters, VehicleInput, VehicleList } from '../types';
import { adminEmail, adminPassword } from '../env';
import { inputToVehicle, rowToVehicle, type VehicleRow } from './map';
import { queryVehicles } from './query';
import { rawToVehicle, type RawVehicle } from './transform';

const DATA_DIR = path.join(process.cwd(), '.data');
const VEHICLES_FILE = path.join(DATA_DIR, 'vehicles.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const SEED_FILE = path.join(process.cwd(), 'datos', 'vehiculos_normalizados.json');

const SESSION_COOKIE = 'carmexio_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

interface LocalUser extends AdminUser {
	password_hash: string;
}

interface LocalSession {
	token: string;
	user_id: string;
	expires_at: string;
}

function ensureDir() {
	mkdirSync(DATA_DIR, { recursive: true });
}

function readJson<T>(file: string, fallback: T): T {
	if (!existsSync(file)) return fallback;
	try {
		return JSON.parse(readFileSync(file, 'utf8')) as T;
	} catch {
		return fallback;
	}
}

function writeJson(file: string, data: unknown) {
	ensureDir();
	const tmp = `${file}.${process.pid}.tmp`;
	writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
	renameSync(tmp, file);
}

// --------------------------- Vehículos ---------------------------

let vehiclesCache: Vehicle[] | null = null;

function seedFromRaw(): Vehicle[] {
	if (!existsSync(SEED_FILE)) return [];
	const raw = JSON.parse(readFileSync(SEED_FILE, 'utf8')) as RawVehicle[];
	if (!Array.isArray(raw)) return [];
	const now = new Date().toISOString();
	return raw.map((r) => rawToVehicle(r, now));
}

function loadRawOrStored(): Vehicle[] {
	const raw = readJson<VehicleRow[] | null>(VEHICLES_FILE, null);
	if (raw && Array.isArray(raw) && raw.length > 0) {
		return raw.map(rowToVehicle);
	}
	return seedFromRaw();
}

function loadVehicles(): Vehicle[] {
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
	return new Date().toISOString();
}

function assertSlugUnique(slug: string, ignoreId?: string): void {
	if (vehiclesCache?.some((v) => v.slug === slug && v.id !== ignoreId)) {
		throw new Error('Ya existe un vehículo con ese slug.');
	}
}

export async function localList(filters: VehicleFilters = {}): Promise<VehicleList> {
	return queryVehicles(loadVehicles(), filters);
}

export async function localGetBySlug(slug: string): Promise<Vehicle | null> {
	return loadVehicles().find((v) => v.slug === slug) ?? null;
}

export async function localGetById(id: string): Promise<Vehicle | null> {
	return loadVehicles().find((v) => v.id === id) ?? null;
}

export async function localCreate(input: VehicleInput): Promise<Vehicle> {
	const vehicles = loadVehicles();
	assertSlugUnique(input.slug);
	const vehicle = inputToVehicle(input, randomUUID(), now());
	vehicles.push(vehicle);
	vehiclesCache = vehicles;
	persistVehicles();
	return vehicle;
}

export async function localUpdate(id: string, input: VehicleInput): Promise<Vehicle | null> {
	const vehicles = loadVehicles();
	assertSlugUnique(input.slug, id);
	const index = vehicles.findIndex((v) => v.id === id);
	if (index === -1) return null;
	const updated: Vehicle = {
		...vehicles[index],
		...input,
		images: renumberedImages(input.images),
		updated_at: now(),
	};
	vehicles[index] = updated;
	vehiclesCache = vehicles;
	persistVehicles();
	return updated;
}

export async function localRemove(id: string): Promise<boolean> {
	const vehicles = loadVehicles();
	const next = vehicles.filter((v) => v.id !== id);
	if (next.length === vehicles.length) return false;
	vehiclesCache = next;
	persistVehicles();
	return true;
}

export async function localSetAvailable(id: string, available: boolean): Promise<Vehicle | null> {
	const vehicles = loadVehicles();
	const index = vehicles.findIndex((v) => v.id === id);
	if (index === -1) return null;
	vehicles[index] = { ...vehicles[index], available, updated_at: now() };
	vehiclesCache = vehicles;
	persistVehicles();
	return vehicles[index];
}

export async function localSeed(raw: RawVehicle[]): Promise<number> {
	vehiclesCache = raw.map((r) => rawToVehicle(r, now()));
	persistVehicles();
	return vehiclesCache.length;
}

export async function localCount(): Promise<number> {
	return loadVehicles().length;
}

function renumberedImages(images: VehicleInput['images']): VehicleInput['images'] {
	return images.map((img, i) => ({ ...img, order: i })).filter((img) => img.url.trim().length > 0);
}

// --------------------------- Usuarios / sesiones ---------------------------

function hashPassword(password: string): string {
	const salt = randomBytes(16).toString('hex');
	const hash = scryptSync(password, salt, 64).toString('hex');
	return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
	const [algo, salt, hash] = stored.split('$');
	if (algo !== 'scrypt' || !salt || !hash) return false;
	const candidate = scryptSync(password, salt, 64);
	const expected = Buffer.from(hash, 'hex');
	return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

function ensureUsers(): LocalUser[] {
	const users = readJson<LocalUser[] | null>(USERS_FILE, null);
	if (users && Array.isArray(users) && users.length > 0) return users;
	const seed: LocalUser[] = [
		{
			id: randomUUID(),
			email: adminEmail().toLowerCase(),
			name: 'Administrador',
			role: 'admin',
			password_hash: hashPassword(adminPassword()),
		},
	];
	writeJson(USERS_FILE, seed);
	return seed;
}

function loadUsers(): LocalUser[] {
	const users = ensureUsers();
	try {
		return JSON.parse(readFileSync(USERS_FILE, 'utf8')) as LocalUser[];
	} catch {
		return users;
	}
}

function loadSessions(): LocalSession[] {
	return readJson<LocalSession[]>(SESSIONS_FILE, []);
}

function persistSessions(sessions: LocalSession[]) {
	writeJson(SESSIONS_FILE, sessions);
}

function toAdminUser(u: LocalUser): AdminUser {
	return { id: u.id, email: u.email, name: u.name ?? null, role: u.role };
}

export async function localSignIn(email: string, password: string): Promise<{ user: AdminUser | null; token: string | null }> {
	const user = loadUsers().find((u) => u.email === email.toLowerCase());
	if (!user || !verifyPassword(password, user.password_hash)) {
		return { user: null, token: null };
	}
	const token = randomBytes(32).toString('hex');
	const sessions = loadSessions().filter((s) => s.expires_at > new Date().toISOString());
	sessions.push({ token, user_id: user.id, expires_at: new Date(Date.now() + SESSION_TTL_MS).toISOString() });
	persistSessions(sessions);
	return { user: toAdminUser(user), token };
}

export async function localSignOut(token: string | null): Promise<void> {
	if (!token) return;
	const sessions = loadSessions().filter((s) => s.token !== token);
	persistSessions(sessions);
}

export async function localSession(token: string | null): Promise<AdminUser | null> {
	if (!token) return null;
	const sessions = loadSessions().filter((s) => s.expires_at > new Date().toISOString());
	if (sessions.some((s) => s.expires_at <= new Date().toISOString())) persistSessions(sessions);
	const session = sessions.find((s) => s.token === token);
	if (!session) return null;
	return loadUsers().find((u) => u.id === session.user_id)?.email
		? toAdminUser(loadUsers().find((u) => u.id === session.user_id)!)
		: null;
}

export { SESSION_COOKIE };
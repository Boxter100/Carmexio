import type { Vehicle, VehicleImage, VehicleInput } from '../types';

export type VehicleRow = {
	id: string;
	slug: string;
	title: string;
	brand: string;
	model: string | null;
	year: number | null;
	vehicle_type: string | null;
	mileage: number | null;
	fuel_type: string | null;
	engine: string | null;
	transmission: string | null;
	drive_type: string | null;
	exterior_color: string | null;
	interior_color: string | null;
	stock_id: string | null;
	branch: string | null;
	reservation_amount: number | null;
	cash_delivery_price: number | null;
	advance_payment_price: number | null;
	registered: string | null;
	history: string | null;
	features: unknown;
	description: unknown;
	images: unknown;
	source: unknown;
	available: boolean;
	created_at: string | null;
	updated_at: string | null;
};

function asStringArray(value: unknown): string[] {
	if (Array.isArray(value)) return value.filter((x): x is string => typeof x === 'string');
	if (typeof value === 'string') {
		try {
			const parsed = JSON.parse(value);
			return asStringArray(parsed);
		} catch {
			return [];
		}
	}
	return [];
}

function asImages(value: unknown): VehicleImage[] {
	if (Array.isArray(value)) {
		return value
			.filter((x): x is Record<string, unknown> => typeof x === 'object' && x !== null)
			.map((img) => ({
				url: String(img.url ?? ''),
				display_url: img.display_url ? String(img.display_url) : null,
				alt: img.alt ? String(img.alt) : null,
				order: typeof img.order === 'number' ? img.order : 0,
				width: typeof img.width === 'number' && img.width > 0 ? img.width : null,
				height: typeof img.height === 'number' && img.height > 0 ? img.height : null,
			}))
			.filter((img) => img.url.length > 0)
			.sort((a, b) => a.order - b.order);
	}
	return [];
}

export function rowToVehicle(row: VehicleRow): Vehicle {
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
		source:
			row.source && typeof row.source === 'object' && typeof (row.source as { url?: unknown }).url === 'string'
				? { url: (row.source as { url: string }).url }
				: null,
		available: Boolean(row.available),
		created_at: row.created_at ?? new Date().toISOString(),
		updated_at: row.updated_at ?? new Date().toISOString(),
	};
}

export function vehicleToRow(v: Vehicle): VehicleRow {
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
		updated_at: v.updated_at,
	};
}

export function inputToVehicle(input: VehicleInput, id: string, now = new Date().toISOString()): Vehicle {
	return {
		...input,
		id,
		created_at: now,
		updated_at: now,
	};
}
import type { Vehicle, VehicleFacets, VehicleFilters, VehicleList } from '../types';

function includesAny<T>(value: T | null | undefined, list?: T[]): boolean {
	if (!list || list.length === 0) return true;
	return value != null && list.includes(value);
}

function inRange(value: number | null, min?: number, max?: number): boolean {
	if (value == null) return true;
	if (min != null && value < min) return false;
	if (max != null && value > max) return false;
	return true;
}

export function matchesFilters(v: Vehicle, f: VehicleFilters): boolean {
	const q = (f.search ?? '').trim().toLowerCase();
	if (q) {
		const haystack =
			[
				v.brand,
				v.model,
				v.title,
				v.year,
				v.vehicle_type,
				v.engine,
				v.stock_id,
				v.exterior_color,
				v.branch,
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();
		if (!haystack.includes(q)) return false;
	}
	if (!includesAny(v.brand, f.brands)) return false;
	if (!includesAny(v.vehicle_type, f.vehicle_types)) return false;
	if (!includesAny(v.transmission, f.transmissions)) return false;
	if (!includesAny(v.drive_type, f.drive_types)) return false;
	if (!includesAny(v.branch, f.branches)) return false;
	if (f.available !== undefined && v.available !== f.available) return false;
	if (!inRange(v.cash_delivery_price, f.min_price, f.max_price)) return false;
	if (!inRange(v.year, f.min_year, f.max_year)) return false;
	return true;
}

export function sortVehicles(vehicles: Vehicle[], sort?: VehicleFilters['sort']): Vehicle[] {
	const list = [...vehicles];
	switch (sort) {
		case 'price-asc':
			list.sort((a, b) => (a.cash_delivery_price ?? Infinity) - (b.cash_delivery_price ?? Infinity));
			break;
		case 'price-desc':
			list.sort((a, b) => (b.cash_delivery_price ?? -Infinity) - (a.cash_delivery_price ?? -Infinity));
			break;
		case 'year-desc':
			list.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
			break;
		case 'year-asc':
			list.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
			break;
		default:
			list.sort(
				(a, b) => new Date(b.updated_at ?? b.created_at).getTime() - new Date(a.updated_at ?? a.created_at).getTime(),
			);
	}
	return list;
}

export function computeFacets(vehicles: Vehicle[]): VehicleFacets {
	const push = (map: Record<string, number>, value: string | null | undefined) => {
		if (!value) return;
		map[value] = (map[value] ?? 0) + 1;
	};
	const facets: VehicleFacets = {
		brands: {},
		vehicle_types: {},
		transmissions: {},
		drive_types: {},
		branches: {},
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

export function queryVehicles(vehicles: Vehicle[], filters: VehicleFilters = {}): VehicleList {
	const all = vehicles.filter((v) => matchesFilters(v, filters));
	const sorted = sortVehicles(all, filters.sort);
	const limit = filters.limit ?? sorted.length;
	const offset = filters.offset ?? 0;
	return {
		vehicles: sorted.slice(offset, offset + limit),
		total: sorted.length,
		facets: computeFacets(vehicles),
	};
}
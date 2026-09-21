import type { Vehicle, VehicleImage, VehicleInput } from '../types';

export interface RawVehicle {
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
	reservation?: { amount: number | null } | null;
	prices?: { cash_delivery: number | null; advance_payment: number | null } | null;
	registered?: string | null;
	history?: string | null;
	features?: string[];
	description?: string[];
	images?: VehicleImage[];
	source?: { url: string } | null;
}

export function rawToVehicle(raw: RawVehicle, now = new Date().toISOString()): Vehicle {
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
		images: Array.isArray(raw.images)
			? raw.images.map((img) => ({
					url: img.url,
					display_url: img.display_url ?? img.url,
					alt: img.alt ?? null,
					order: img.order ?? 0,
				}))
			: [],
		source: raw.source ?? null,
		available: true,
		created_at: now,
		updated_at: now,
	};
}

export function toInput(v: Vehicle): VehicleInput {
	return {
		slug: v.slug,
		title: v.title,
		brand: v.brand,
		model: v.model,
		year: v.year,
		vehicle_type: v.vehicle_type,
		mileage: v.mileage,
		fuel_type: v.fuel_type,
		engine: v.engine,
		transmission: v.transmission,
		drive_type: v.drive_type,
		exterior_color: v.exterior_color,
		interior_color: v.interior_color,
		stock_id: v.stock_id,
		branch: v.branch,
		reservation_amount: v.reservation_amount,
		cash_delivery_price: v.cash_delivery_price,
		advance_payment_price: v.advance_payment_price,
		registered: v.registered,
		history: v.history,
		features: v.features,
		description: v.description,
		images: v.images,
		source: v.source,
		available: v.available,
	};
}
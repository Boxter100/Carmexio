export interface VehicleImage {
	url: string;
	/** Derivado de `url` de DISPLAY_WIDTH. Es lo que se pinta cuando no hay srcset. */
	display_url?: string | null;
	alt?: string | null;
	order: number;
	/**
	 * Ancho/alto intrínsecos del original. Viven en el jsonb de `images`, así que
	 * añadirlos no requiere migración. `width` es lo que hace posible un srcset
	 * fiable: sin él no se sabe qué derivados existen de verdad.
	 */
	width?: number | null;
	height?: number | null;
}

export interface Vehicle {
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
	/** Monto para apartar (reservation.amount) */
	reservation_amount: number | null;
	/** Precio pagando contra entrega (prices.cash_delivery) */
	cash_delivery_price: number | null;
	/** Precio apartado / pago anticipado (prices.advance_payment) */
	advance_payment_price: number | null;
	registered: string | null;
	history: string | null;
	features: string[];
	description: string[];
	images: VehicleImage[];
	source?: { url: string } | null;
	available: boolean;
	created_at: string;
	updated_at: string;
}

export interface VehicleInput {
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
	features: string[];
	description: string[];
	images: VehicleImage[];
	source?: { url: string } | null;
	available: boolean;
}

export type VehicleSort = 'recent' | 'price-asc' | 'price-desc' | 'year-desc' | 'year-asc';

export interface VehicleFilters {
	search?: string;
	brands?: string[];
	vehicle_types?: string[];
	transmissions?: string[];
	drive_types?: string[];
	branches?: string[];
	available?: boolean;
	min_price?: number;
	max_price?: number;
	min_year?: number;
	max_year?: number;
	sort?: VehicleSort;
	limit?: number;
	offset?: number;
}

export interface VehicleFacets {
	brands: Record<string, number>;
	vehicle_types: Record<string, number>;
	transmissions: Record<string, number>;
	drive_types: Record<string, number>;
	branches: Record<string, number>;
}

export interface VehicleList {
	vehicles: Vehicle[];
	total: number;
	facets: VehicleFacets;
}

export interface AdminUser {
	id: string;
	email: string;
	name?: string | null;
	role: string;
}

export interface Session {
	user: AdminUser;
}

export type ApiError = { error: string; code?: string };
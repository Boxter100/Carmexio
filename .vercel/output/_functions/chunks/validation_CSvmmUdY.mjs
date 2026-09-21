import { z } from "zod";
//#region src/lib/validation.ts
var vehicleInputSchema = z.object({
	slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/i, "El slug solo admite letras, números y guiones."),
	title: z.string().trim().min(2, "El título es obligatorio.").max(220),
	brand: z.string().trim().min(1, "La marca es obligatoria.").max(80),
	model: z.string().trim().max(140).nullish(),
	year: z.number().int().min(1950).max(2100).nullish(),
	vehicle_type: z.string().trim().max(80).nullish(),
	mileage: z.number().int().min(0).nullish(),
	fuel_type: z.string().trim().max(60).nullish(),
	engine: z.string().trim().max(80).nullish(),
	transmission: z.string().trim().max(60).nullish(),
	drive_type: z.string().trim().max(60).nullish(),
	exterior_color: z.string().trim().max(80).nullish(),
	interior_color: z.string().trim().max(80).nullish(),
	stock_id: z.string().trim().max(60).nullish(),
	branch: z.string().trim().max(80).nullish(),
	reservation_amount: z.number().int().min(0).nullish(),
	cash_delivery_price: z.number().int().min(0).nullish(),
	advance_payment_price: z.number().int().min(0).nullish(),
	registered: z.string().trim().max(200).nullish(),
	history: z.string().trim().max(500).nullish(),
	features: z.array(z.string().trim().min(1).max(120)).max(120).default([]),
	description: z.array(z.string().trim().min(1).max(8e3)).max(40).default([]),
	images: z.array(z.object({
		url: z.string().trim().min(1, "La URL de la imagen es obligatoria.").max(500),
		display_url: z.string().trim().max(500).nullish(),
		alt: z.string().trim().max(300).nullish(),
		order: z.number().int().min(0).nullish()
	})).max(40).default([]),
	source: z.object({ url: z.string().trim().min(1).max(500) }).nullish().transform((v) => v ?? null),
	available: z.boolean().default(true)
});
/** Normaliza la salida del schema (campos opcionales) a un VehicleInput completo. */
function toVehicleInput(data) {
	return {
		slug: data.slug,
		title: data.title,
		brand: data.brand,
		model: data.model ?? null,
		year: data.year ?? null,
		vehicle_type: data.vehicle_type ?? null,
		mileage: data.mileage ?? null,
		fuel_type: data.fuel_type ?? null,
		engine: data.engine ?? null,
		transmission: data.transmission ?? null,
		drive_type: data.drive_type ?? null,
		exterior_color: data.exterior_color ?? null,
		interior_color: data.interior_color ?? null,
		stock_id: data.stock_id ?? null,
		branch: data.branch ?? null,
		reservation_amount: data.reservation_amount ?? null,
		cash_delivery_price: data.cash_delivery_price ?? null,
		advance_payment_price: data.advance_payment_price ?? null,
		registered: data.registered ?? null,
		history: data.history ?? null,
		features: data.features,
		description: data.description,
		images: data.images.map((img) => ({
			url: img.url,
			display_url: img.display_url ?? null,
			alt: img.alt ?? null,
			order: img.order ?? 0
		})),
		source: data.source,
		available: data.available
	};
}
var loginSchema = z.object({
	email: z.string().trim().email("Correo inválido.").min(3).max(255),
	password: z.string().min(1, "Contraseña requerida.").max(200)
});
//#endregion
export { toVehicleInput as n, vehicleInputSchema as r, loginSchema as t };

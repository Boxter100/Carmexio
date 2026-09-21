const currency = new Intl.NumberFormat('es-MX', {
	style: 'currency',
	currency: 'MXN',
	maximumFractionDigits: 0,
});

export function formatMXN(value: number | null | undefined): string {
	if (value == null) return '—';
	return currency.format(value);
}

export function formatPrice(value: number | null | undefined): string {
	if (value == null) return 'Precio a consultar';
	return formatMXN(value);
}

export function formatMiles(value: number | null | undefined): string {
	if (value == null) return '—';
	return `${new Intl.NumberFormat('es-MX').format(value)} km`;
}

export function formatDate(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '';
	return new Intl.DateTimeFormat('es-MX', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	}).format(d);
}

export function slugify(input: string): string {
	return input
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '')
		.slice(0, 80);
}

export function displayPrice(vehicle: { cash_delivery_price: number | null; advance_payment_price: number | null }): {
	main: string;
	secondary: string | null;
} {
	if (vehicle.advance_payment_price != null && vehicle.cash_delivery_price != null) {
		return {
			main: formatMXN(vehicle.advance_payment_price),
			secondary: `Contra entrega ${formatMXN(vehicle.cash_delivery_price)}`,
		};
	}
	if (vehicle.cash_delivery_price != null) {
		return { main: formatMXN(vehicle.cash_delivery_price), secondary: null };
	}
	return { main: 'Precio a consultar', secondary: null };
}
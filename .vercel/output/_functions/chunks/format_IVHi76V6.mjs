//#region src/lib/format.ts
var currency = new Intl.NumberFormat("es-MX", {
	style: "currency",
	currency: "MXN",
	maximumFractionDigits: 0
});
function formatMXN(value) {
	if (value == null) return "—";
	return currency.format(value);
}
function formatMiles(value) {
	if (value == null) return "—";
	return `${new Intl.NumberFormat("es-MX").format(value)} km`;
}
function formatDate(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	return new Intl.DateTimeFormat("es-MX", {
		day: "2-digit",
		month: "short",
		year: "numeric"
	}).format(d);
}
function slugify(input) {
	return input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}
function displayPrice(vehicle) {
	if (vehicle.advance_payment_price != null && vehicle.cash_delivery_price != null) return {
		main: formatMXN(vehicle.advance_payment_price),
		secondary: `Contra entrega ${formatMXN(vehicle.cash_delivery_price)}`
	};
	if (vehicle.cash_delivery_price != null) return {
		main: formatMXN(vehicle.cash_delivery_price),
		secondary: null
	};
	return {
		main: "Precio a consultar",
		secondary: null
	};
}
//#endregion
export { slugify as a, formatMiles as i, formatDate as n, formatMXN as r, displayPrice as t };

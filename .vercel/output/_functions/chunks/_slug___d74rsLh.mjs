import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { S as createAstro, d as renderTemplate, f as maybeRenderHead, i as renderComponent, m as addAttribute } from "./server_tknsmTu_.mjs";
import { t as createComponent } from "./compiler_ChNlsBvO.mjs";
import { n as SITE, t as $$Layout } from "./Layout_C5QsuY54.mjs";
import { i as formatMiles, n as formatDate, r as formatMXN, t as displayPrice } from "./format_IVHi76V6.mjs";
import { i as listVehicles, r as getVehicleBySlug } from "./db_BGXn1kfm.mjs";
import { t as VehicleCard } from "./VehicleCard_BpQKcELy.mjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowsOutSimple, Calendar, Car, CaretLeft, CaretRight, Check, Crosshair, Engine, Fingerprint, GasPump, Gauge, GearSix, MapPin, Palette, SealCheck, ShieldCheck, WhatsappLogo } from "@phosphor-icons/react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/garage/VehicleGallery.tsx
function VehicleGallery({ images }) {
	const sorted = useMemo(() => [...images].sort((a, b) => a.order - b.order), [images]);
	const [index, setIndex] = useState(0);
	const [lightbox, setLightbox] = useState(false);
	const current = sorted[Math.min(index, Math.max(0, sorted.length - 1))];
	const currentIndex = Math.max(0, sorted.indexOf(current));
	const prev = useCallback(() => setIndex((i) => (i - 1 + sorted.length) % sorted.length), [sorted.length]);
	const next = useCallback(() => setIndex((i) => (i + 1) % sorted.length), [sorted.length]);
	useEffect(() => {
		if (!lightbox) return;
		const onKey = (e) => {
			if (e.key === "Escape") setLightbox(false);
			if (e.key === "ArrowLeft") prev();
			if (e.key === "ArrowRight") next();
		};
		document.addEventListener("keydown", onKey);
		const overflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = overflow;
		};
	}, [
		lightbox,
		prev,
		next
	]);
	if (sorted.length === 0) return /* @__PURE__ */ jsx("div", {
		className: "grid aspect-[4/3] place-items-center rounded-2xl border border-line bg-surface-2 text-muted",
		children: "Sin imágenes disponibles"
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "group relative overflow-hidden rounded-2xl border border-line bg-surface-2",
				children: [
					/* @__PURE__ */ jsx("img", {
						src: current.display_url ?? current.url,
						alt: current.alt || "Imagen del vehículo",
						className: "aspect-[4/3] w-full object-cover"
					}, current.url),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						className: "absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg bg-surface/90 text-soft backdrop-blur transition-colors hover:text-ink",
						onClick: () => setLightbox(true),
						"aria-label": "Ver imagen a pantalla completa",
						children: /* @__PURE__ */ jsx(ArrowsOutSimple, {
							size: 16,
							weight: "regular"
						})
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: (e) => {
							e.stopPropagation();
							prev();
						},
						className: "absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-surface/85 text-soft opacity-0 backdrop-blur transition-opacity duration-200 hover:text-ink focus-visible:opacity-100 group-hover:opacity-100",
						"aria-label": "Imagen anterior",
						disabled: sorted.length <= 1,
						children: /* @__PURE__ */ jsx(CaretLeft, {
							size: 18,
							weight: "bold"
						})
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: (e) => {
							e.stopPropagation();
							next();
						},
						className: "absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-surface/85 text-soft opacity-0 backdrop-blur transition-opacity duration-200 hover:text-ink focus-visible:opacity-100 group-hover:opacity-100",
						"aria-label": "Imagen siguiente",
						disabled: sorted.length <= 1,
						children: /* @__PURE__ */ jsx(CaretRight, {
							size: 18,
							weight: "bold"
						})
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "absolute bottom-3 right-3 rounded-md bg-black/55 px-2 py-1 font-mono text-xs font-medium text-white",
						children: [
							currentIndex + 1,
							" / ",
							sorted.length
						]
					})
				]
			}),
			lightbox && /* @__PURE__ */ jsxs("div", {
				className: "fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4",
				role: "dialog",
				"aria-modal": "true",
				"aria-label": "Vista ampliada del vehículo",
				onClick: () => setLightbox(false),
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20",
					"aria-label": "Cerrar vista ampliada",
					onClick: () => setLightbox(false),
					children: /* @__PURE__ */ jsx(ArrowsOutSimple, {
						size: 18,
						weight: "regular",
						className: "rotate-45"
					})
				}), /* @__PURE__ */ jsx("img", {
					src: current.url || current.display_url || current.url,
					alt: current.alt || "Imagen del vehículo",
					className: "max-h-[85dvh] max-w-full rounded-xl object-contain shadow-2xl",
					onClick: (e) => e.stopPropagation()
				})]
			}),
			sorted.length > 1 && /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-5",
				children: sorted.map((img, i) => /* @__PURE__ */ jsx("button", {
					type: "button",
					className: "relative aspect-[4/3] overflow-hidden rounded-xl border bg-surface-2 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-accent",
					style: { borderColor: i === currentIndex ? "var(--accent)" : "var(--border)" },
					onClick: () => setIndex(i),
					"aria-label": `Ver imagen ${i + 1}`,
					"aria-current": i === currentIndex,
					children: /* @__PURE__ */ jsx("img", {
						src: img.display_url ?? img.url,
						alt: "",
						loading: "lazy",
						className: "h-full w-full object-cover"
					})
				}, img.url))
			})
		]
	});
}
//#endregion
//#region src/pages/garage/[slug].astro
var _slug__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Slug,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Slug = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Slug;
	const { slug } = Astro.params;
	if (!slug) return Astro.redirect("/404");
	const vehicle = await getVehicleBySlug(slug);
	if (!vehicle) {
		Astro.response.status = 404;
		return new Response(null, { status: 404 });
	}
	const price = displayPrice(vehicle);
	const specs = [
		{
			icon: Calendar,
			label: "Año",
			value: vehicle.year != null ? String(vehicle.year) : "—"
		},
		{
			icon: Gauge,
			label: "Kilometraje",
			value: formatMiles(vehicle.mileage)
		},
		{
			icon: GasPump,
			label: "Combustible",
			value: vehicle.fuel_type ?? "—"
		},
		{
			icon: Engine,
			label: "Motor",
			value: vehicle.engine ?? "—"
		},
		{
			icon: GearSix,
			label: "Transmisión",
			value: vehicle.transmission ?? "—"
		},
		{
			icon: Crosshair,
			label: "Tracción",
			value: vehicle.drive_type ?? "—"
		},
		{
			icon: Palette,
			label: "Color exterior",
			value: vehicle.exterior_color ?? "—"
		},
		{
			icon: Palette,
			label: "Color interior",
			value: vehicle.interior_color ?? "—"
		},
		{
			icon: Car,
			label: "Tipo",
			value: vehicle.vehicle_type ?? "—"
		},
		{
			icon: Fingerprint,
			label: "ID / Unidad",
			value: vehicle.stock_id ?? "—"
		},
		{
			icon: MapPin,
			label: "Sucursal",
			value: vehicle.branch ?? "—"
		},
		{
			icon: SealCheck,
			label: "Historial",
			value: vehicle.history ?? vehicle.registered ?? "Título limpio"
		}
	];
	const relatedVehicles = (await listVehicles({
		brands: [vehicle.brand],
		limit: 4,
		sort: "recent"
	})).vehicles.filter((v) => v.id !== vehicle.id).slice(0, 3);
	const paragraphs = vehicle.description.filter((p) => {
		return !(/💵|🇲🇽|📄|✅|ID\s*\/\s*Unidad|Enganche\s*mínimo|PRECIO/.test(p) || p.includes("☎"));
	});
	const metaDescription = `Compra ${vehicle.title} en Carmexio${vehicle.cash_delivery_price ? ` · Precio contra entrega ${formatMXN(vehicle.cash_delivery_price)}` : ""}. ${vehicle.vehicle_type ?? ""} ${vehicle.transmission ?? ""} ${vehicle.drive_type ?? ""}`.trim();
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {
		"title": vehicle.title,
		"description": metaDescription
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="wrap pb-16 pt-6 lg:pt-8"><nav aria-label="Ruta de navegación" class="mb-6"><ol class="flex flex-wrap items-center gap-1 text-xs text-muted"><li><a href="/" class="transition-colors hover:text-accent">Inicio</a></li><li>${renderComponent($$result, "CaretRight", CaretRight, {
		"size": 12,
		"weight": "bold"
	})}</li><li><a href="/garage" class="transition-colors hover:text-accent">Garage</a></li><li>${renderComponent($$result, "CaretRight", CaretRight, {
		"size": 12,
		"weight": "bold"
	})}</li><li aria-current="page" class="truncate text-soft">${vehicle.title}</li></ol></nav><div class="grid gap-10 lg:grid-cols-[1.22fr_1fr] lg:gap-12"><div class="min-w-0">${renderComponent($$result, "VehicleGallery", VehicleGallery, {
		"client:load": true,
		"images": vehicle.images,
		"client:component-hydration": "load",
		"client:component-path": "/home/boxter/Dev/Carmexio/src/components/garage/VehicleGallery.tsx",
		"client:component-export": "default"
	})}<div class="mt-10"><h2 class="font-display text-xl font-semibold tracking-tight text-ink">Descripción</h2><div class="mt-4 space-y-4 text-[0.9375rem] leading-relaxed text-soft">${paragraphs.map((paragraph) => renderTemplate`<p>${paragraph}</p>`)}${paragraphs.length === 0 && renderTemplate`<p>Este vehículo está listo para entregarse. Contáctanos para agendar una visita.</p>`}</div></div>${vehicle.features.length > 0 && renderTemplate`<div class="mt-10"><h2 class="font-display text-xl font-semibold tracking-tight text-ink">Equipamiento destacado</h2><ul class="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">${vehicle.features.map((feature) => renderTemplate`<li class="flex items-start gap-2.5 text-sm text-soft"><span class="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-tint text-accent">${renderComponent($$result, "Check", Check, {
		"size": 12,
		"weight": "bold"
	})}</span>${feature}</li>`)}</ul></div>`}<div class="mt-10"><h2 class="font-display text-xl font-semibold tracking-tight text-ink">Ficha técnica</h2><dl class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">${specs.map((spec) => renderTemplate`<div class="rounded-xl border border-line bg-surface p-4"><dt class="flex items-center gap-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-muted">${renderComponent($$result, "spec.icon", spec.icon, {
		"size": 13,
		"weight": "regular"
	})}${spec.label}</dt><dd class="mt-1.5 text-sm font-semibold text-ink">${spec.value}</dd></div>`)}</dl></div></div><aside class="lg:sticky lg:top-24 lg:self-start"><div class="rounded-2xl border border-line bg-surface p-6 lg:p-7"><div class="flex items-center justify-between gap-3">${vehicle.available ? renderTemplate`<span class="badge badge-available">Disponible</span>` : renderTemplate`<span class="badge badge-neutral">Apartado</span>`}${vehicle.vehicle_type && renderTemplate`<span class="text-xs font-medium uppercase tracking-[0.12em] text-muted">${vehicle.vehicle_type}</span>`}</div><h1 class="mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-ink lg:text-[1.65rem]">${vehicle.title}</h1><div class="mt-5 border-t border-line pt-5"><p class="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-muted">${vehicle.advance_payment_price != null && vehicle.cash_delivery_price != null ? "Precio apartado" : "Precio contra entrega"}</p><p class="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">${price.main}</p>${price.secondary && renderTemplate`<p class="mt-1 text-sm text-muted">${price.secondary}</p>`}${vehicle.reservation_amount != null && renderTemplate`<p class="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-accent-tint px-2.5 py-1.5 text-xs font-semibold text-accent">Aparta con ${formatMXN(vehicle.reservation_amount)}</p>`}</div><div class="mt-6 grid gap-2.5"><a href="/financiamiento" class="btn btn-primary btn-lg btn-block">Financiar este vehículo</a><a${addAttribute(`mailto:${SITE.email}?subject=${encodeURIComponent(`Quiero información del ${vehicle.title}`)}`, "href")} class="btn btn-outline btn-lg btn-block">Solicitar información</a></div><ul class="mt-6 space-y-2 text-[0.8125rem] text-soft"><li class="flex items-center gap-2">${renderComponent($$result, "ShieldCheck", ShieldCheck, {
		"size": 15,
		"weight": "regular",
		"className": "text-accent"
	})}Título verificado y revisión de 170 puntos</li><li class="flex items-center gap-2">${renderComponent($$result, "SealCheck", SealCheck, {
		"size": 15,
		"weight": "regular",
		"className": "text-accent"
	})}Se entrega detallada, facturada y listo para emplacar</li><li class="flex items-center gap-2">${renderComponent($$result, "WhatsappLogo", WhatsappLogo, {
		"size": 15,
		"weight": "regular",
		"className": "text-accent"
	})}Actualizado el ${formatDate(vehicle.updated_at)}</li></ul></div></aside></div>${relatedVehicles.length > 0 && renderTemplate`<div class="mt-16 border-t border-line pt-12"><div class="flex items-end justify-between gap-4"><div><p class="eyebrow">También en el Garage</p><h2 class="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">Más ${vehicle.brand === "FORD" ? "Ford" : vehicle.brand}</h2></div><a${addAttribute(`/garage?brands=${encodeURIComponent(vehicle.brand)}`, "href")} class="btn btn-ghost btn-sm">Ver todos</a></div><ul class="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">${relatedVehicles.map((v) => renderTemplate`<li>${renderComponent($$result, "VehicleCard", VehicleCard, { "vehicle": v })}</li>`)}</ul></div>`}</section>` })}`;
}, "/home/boxter/Dev/Carmexio/src/pages/garage/[slug].astro", void 0);
var $$file = "/home/boxter/Dev/Carmexio/src/pages/garage/[slug].astro";
var $$url = "/garage/[slug]";
//#endregion
//#region \0virtual:astro:page:src/pages/garage/[slug]@_@astro
var page = () => _slug__exports;
//#endregion
export { page };

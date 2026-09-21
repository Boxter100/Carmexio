import { i as formatMiles, t as displayPrice } from "./format_IVHi76V6.mjs";
import { ArrowUpRight, Calendar, Crosshair, Gauge, GearSix } from "@phosphor-icons/react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/garage/VehicleCard.tsx
function firstImages(v) {
	const sorted = [...v.images].sort((a, b) => a.order - b.order);
	return {
		cover: sorted[0] ?? null,
		hover: sorted[1] ?? null
	};
}
function VehicleCard({ vehicle }) {
	const { cover, hover } = firstImages(vehicle);
	const price = displayPrice(vehicle);
	const href = `/garage/${vehicle.slug}`;
	const alt = cover?.alt || `${vehicle.brand} ${vehicle.model ?? ""} ${vehicle.year ?? ""}`.trim();
	return /* @__PURE__ */ jsxs("article", {
		className: "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.35)]",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "relative aspect-[4/3] overflow-hidden bg-surface-2",
			children: [/* @__PURE__ */ jsxs("a", {
				href,
				tabIndex: -1,
				"aria-hidden": "true",
				className: "block h-full w-full",
				children: [cover ? /* @__PURE__ */ jsx("img", {
					src: cover.display_url ?? cover.url,
					alt,
					loading: "lazy",
					decoding: "async",
					className: "h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
				}) : /* @__PURE__ */ jsx("div", {
					className: "grid h-full w-full place-items-center text-muted",
					children: /* @__PURE__ */ jsx(GearSix, {
						size: 40,
						weight: "thin"
					})
				}), hover && /* @__PURE__ */ jsx("img", {
					src: hover.display_url ?? hover.url,
					alt: "",
					loading: "lazy",
					decoding: "async",
					className: "absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3",
				children: [/* @__PURE__ */ jsxs("span", {
					className: "chip bg-surface/90 backdrop-blur",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "font-semibold",
							children: vehicle.brand
						}),
						/* @__PURE__ */ jsx("span", {
							className: "text-muted",
							children: "·"
						}),
						/* @__PURE__ */ jsx("span", { children: vehicle.year ?? "—" })
					]
				}), vehicle.available ? /* @__PURE__ */ jsx("span", {
					className: "badge badge-available bg-surface/90 backdrop-blur",
					children: "Disponible"
				}) : /* @__PURE__ */ jsx("span", {
					className: "badge badge-neutral bg-surface/90 backdrop-blur",
					children: "Apartado"
				})]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex flex-1 flex-col p-5",
			children: [
				/* @__PURE__ */ jsx("h3", {
					className: "font-display text-lg font-semibold leading-snug tracking-tight",
					children: /* @__PURE__ */ jsx("a", {
						href,
						className: "transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-accent",
						children: vehicle.title
					})
				}),
				vehicle.vehicle_type && /* @__PURE__ */ jsx("p", {
					className: "mt-0.5 text-xs font-medium uppercase tracking-[0.12em] text-muted",
					children: vehicle.vehicle_type
				}),
				/* @__PURE__ */ jsxs("ul", {
					className: "mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-[0.8125rem] text-soft",
					children: [
						/* @__PURE__ */ jsxs("li", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ jsx(Calendar, {
								size: 14,
								weight: "regular",
								className: "text-muted"
							}), vehicle.year ?? "—"]
						}),
						/* @__PURE__ */ jsxs("li", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ jsx(Gauge, {
								size: 14,
								weight: "regular",
								className: "text-muted"
							}), formatMiles(vehicle.mileage)]
						}),
						/* @__PURE__ */ jsxs("li", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ jsx(GearSix, {
								size: 14,
								weight: "regular",
								className: "text-muted"
							}), vehicle.transmission ?? "—"]
						}),
						/* @__PURE__ */ jsxs("li", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ jsx(Crosshair, {
								size: 14,
								weight: "regular",
								className: "text-muted"
							}), vehicle.drive_type ?? "—"]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-auto flex items-end justify-between gap-3 border-t border-line pt-4",
					children: [/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("p", {
							className: "text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-muted",
							children: vehicle.advance_payment_price != null && vehicle.cash_delivery_price != null ? "Apartado" : "Contra entrega"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "font-display text-xl font-semibold tracking-tight text-ink",
							children: price.main
						}),
						price.secondary && /* @__PURE__ */ jsx("p", {
							className: "mt-0.5 text-xs text-muted",
							children: price.secondary
						})
					] }), /* @__PURE__ */ jsxs("a", {
						href,
						className: "mb-0.5 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-accent transition-colors hover:text-accent-strong",
						children: ["Ver detalle", /* @__PURE__ */ jsx(ArrowUpRight, {
							size: 14,
							weight: "bold",
							className: "transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
						})]
					})]
				})
			]
		})]
	});
}
//#endregion
export { VehicleCard as t };

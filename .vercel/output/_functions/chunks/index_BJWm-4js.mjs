import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { d as renderTemplate, i as renderComponent } from "./server_tknsmTu_.mjs";
import { t as createComponent } from "./compiler_ChNlsBvO.mjs";
import { t as $$Layout } from "./Layout_C5QsuY54.mjs";
import { i as listVehicles } from "./db_BGXn1kfm.mjs";
import { t as VehicleCard } from "./VehicleCard_BpQKcELy.mjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CaretDown, Funnel, MagnifyingGlass, SlidersHorizontal, X } from "@phosphor-icons/react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/garage/GarageExplorer.tsx
var SORTS = [
	{
		value: "recent",
		label: "Más recientes"
	},
	{
		value: "price-asc",
		label: "Precio: menor a mayor"
	},
	{
		value: "price-desc",
		label: "Precio: mayor a menor"
	},
	{
		value: "year-desc",
		label: "Año: más nuevo"
	},
	{
		value: "year-asc",
		label: "Año: más antiguo"
	}
];
function toOptions(map) {
	return Object.entries(map).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([value, count]) => ({
		value,
		count
	}));
}
var INITIAL = {
	search: "",
	brands: [],
	vehicle_types: [],
	transmissions: [],
	drive_types: [],
	branches: [],
	available: null,
	min_price: "",
	max_price: "",
	min_year: "",
	max_year: "",
	sort: "recent"
};
function stateToQuery(s, extra = {}) {
	const p = new URLSearchParams();
	if (s.search.trim()) p.set("search", s.search.trim());
	if (s.brands.length) p.set("brands", s.brands.join(","));
	if (s.vehicle_types.length) p.set("vehicle_types", s.vehicle_types.join(","));
	if (s.transmissions.length) p.set("transmissions", s.transmissions.join(","));
	if (s.drive_types.length) p.set("drive_types", s.drive_types.join(","));
	if (s.branches.length) p.set("branches", s.branches.join(","));
	if (s.available !== null) p.set("available", String(s.available));
	if (s.min_price) p.set("min_price", s.min_price);
	if (s.max_price) p.set("max_price", s.max_price);
	if (s.min_year) p.set("min_year", s.min_year);
	if (s.max_year) p.set("max_year", s.max_year);
	p.set("sort", s.sort);
	Object.entries(extra).forEach(([k, v]) => p.set(k, v));
	return p.toString();
}
function hasActiveFilters(s) {
	return Boolean(s.search || s.brands.length || s.vehicle_types.length || s.transmissions.length || s.drive_types.length || s.branches.length || s.available !== null || s.min_price || s.max_price || s.min_year || s.max_year || s.sort !== "recent");
}
function initialFromQuery() {
	if (typeof window === "undefined") return INITIAL;
	const p = new URLSearchParams(window.location.search);
	const list = (k) => p.get(k)?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
	const av = p.get("available");
	return {
		search: p.get("search") ?? "",
		brands: list("brands"),
		vehicle_types: list("vehicle_types"),
		transmissions: list("transmissions"),
		drive_types: list("drive_types"),
		branches: list("branches"),
		available: av === "true" ? true : av === "false" ? false : null,
		min_price: p.get("min_price") ?? "",
		max_price: p.get("max_price") ?? "",
		min_year: p.get("min_year") ?? "",
		max_year: p.get("max_year") ?? "",
		sort: p.get("sort") || "recent"
	};
}
function toggle(list, value) {
	return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
function FacetGroup({ title, options, selected, onToggle }) {
	const [open, setOpen] = useState(true);
	if (options.length === 0) return null;
	return /* @__PURE__ */ jsxs("fieldset", {
		className: "border-b border-line py-4 last:border-b-0",
		children: [/* @__PURE__ */ jsxs("legend", {
			className: "flex w-full items-center justify-between",
			children: [/* @__PURE__ */ jsx("span", {
				className: "text-[0.8125rem] font-semibold text-ink",
				children: title
			}), /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "grid h-7 w-7 place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-ink",
				"aria-expanded": open,
				onClick: () => setOpen((o) => !o),
				children: /* @__PURE__ */ jsx(CaretDown, {
					size: 14,
					weight: "bold",
					className: `transition-transform duration-200 ${open ? "" : "-rotate-90"}`
				})
			})]
		}), open && /* @__PURE__ */ jsx("div", {
			className: "mt-2 flex flex-col gap-1",
			children: options.map((opt) => {
				const checked = selected.includes(opt.value);
				return /* @__PURE__ */ jsxs("label", {
					className: "flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5 text-sm text-soft transition-colors hover:bg-surface-2 hover:text-ink",
					children: [
						/* @__PURE__ */ jsx("input", {
							type: "checkbox",
							className: "h-4 w-4 shrink-0 appearance-none rounded border border-line-strong bg-surface transition-all checked:border-accent checked:bg-accent",
							checked,
							onChange: () => onToggle(opt.value)
						}),
						/* @__PURE__ */ jsx("span", {
							className: "flex-1",
							children: opt.value
						}),
						/* @__PURE__ */ jsx("span", {
							className: "text-xs text-muted",
							children: opt.count
						})
					]
				}, opt.value);
			})
		})]
	});
}
function SkeletonCard() {
	return /* @__PURE__ */ jsxs("div", {
		className: "overflow-hidden rounded-2xl border border-line bg-surface",
		children: [/* @__PURE__ */ jsx("div", { className: "skeleton aspect-[4/3]" }), /* @__PURE__ */ jsxs("div", {
			className: "space-y-3 p-5",
			children: [
				/* @__PURE__ */ jsx("div", { className: "skeleton h-4 w-2/3 rounded" }),
				/* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-1/3 rounded" }),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-4 space-y-2",
					children: [/* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-full rounded" }), /* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-2/3 rounded" })]
				}),
				/* @__PURE__ */ jsx("div", { className: "skeleton h-7 w-1/2 rounded" })
			]
		})]
	});
}
function GarageExplorer({ initial }) {
	const [state, setState] = useState(initialFromQuery);
	const [vehicles, setVehicles] = useState(initial?.vehicles ?? []);
	const [facets, setFacets] = useState(initial?.facets ?? {
		brands: {},
		vehicle_types: {},
		transmissions: {},
		drive_types: {},
		branches: {}
	});
	const [total, setTotal] = useState(initial?.total ?? 0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [open, setOpen] = useState(false);
	const searchTimer = useRef(null);
	const mounted = useRef(false);
	const patch = useCallback((partial) => {
		setState((s) => ({
			...s,
			...partial
		}));
	}, []);
	const fetchBrands = useCallback(async (query) => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/vehicles?${query}`);
			if (!res.ok) throw new Error("No se pudo cargar el inventario.");
			const data = await res.json();
			setVehicles(data.vehicles);
			setFacets(data.facets);
			setTotal(data.total);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error inesperado.");
		} finally {
			setLoading(false);
		}
	}, []);
	useEffect(() => {
		if (!mounted.current) return;
		const query = stateToQuery(state);
		if (searchTimer.current) clearTimeout(searchTimer.current);
		searchTimer.current = setTimeout(() => void fetchBrands(query), 220);
		return () => {
			if (searchTimer.current) clearTimeout(searchTimer.current);
		};
	}, [state, fetchBrands]);
	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	const reset = useCallback(() => {
		setState(INITIAL);
	}, []);
	const active = hasActiveFilters(state);
	const predicateGroups = useMemo(() => [
		{
			title: "Marca",
			options: toOptions(facets.brands),
			selected: state.brands,
			key: "brands"
		},
		{
			title: "Tipo de vehículo",
			options: toOptions(facets.vehicle_types),
			selected: state.vehicle_types,
			key: "vehicle_types"
		},
		{
			title: "Transmisión",
			options: toOptions(facets.transmissions),
			selected: state.transmissions,
			key: "transmissions"
		},
		{
			title: "Tracción",
			options: toOptions(facets.drive_types),
			selected: state.drive_types,
			key: "drive_types"
		},
		{
			title: "Sucursal",
			options: toOptions(facets.branches),
			selected: state.branches,
			key: "branches"
		}
	], [facets, state]);
	const filterPanel = /* @__PURE__ */ jsxs("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between border-b border-line px-5 py-4",
				children: [/* @__PURE__ */ jsx("span", {
					className: "font-display text-sm font-semibold text-ink",
					children: "Filtros"
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					className: "grid h-8 w-8 place-items-center rounded-lg text-soft hover:bg-surface-2 hover:text-ink lg:hidden",
					"aria-label": "Cerrar filtros",
					onClick: () => setOpen(false),
					children: /* @__PURE__ */ jsx(X, {
						size: 18,
						weight: "regular"
					})
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex-1 overflow-y-auto px-5",
				children: [
					/* @__PURE__ */ jsxs("fieldset", {
						className: "border-b border-line py-4",
						children: [/* @__PURE__ */ jsx("legend", { children: /* @__PURE__ */ jsx("span", {
							className: "text-[0.8125rem] font-semibold text-ink",
							children: "Disponibilidad"
						}) }), /* @__PURE__ */ jsx("div", {
							className: "mt-2",
							children: /* @__PURE__ */ jsxs("label", {
								className: "flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5 text-sm text-soft",
								children: [/* @__PURE__ */ jsx("input", {
									type: "checkbox",
									checked: state.available === true,
									onChange: () => patch({ available: state.available === true ? null : true }),
									className: "h-4 w-4 appearance-none rounded border border-line-strong bg-surface transition-all checked:border-accent checked:bg-accent"
								}), "Solo disponibles"]
							})
						})]
					}),
					predicateGroups.map((g) => /* @__PURE__ */ jsx(FacetGroup, {
						title: g.title,
						options: g.options,
						selected: g.selected,
						onToggle: (value) => patch({ [g.key]: toggle(g.selected, value) })
					}, g.key)),
					/* @__PURE__ */ jsxs("fieldset", {
						className: "border-b border-line py-4 last:border-b-0",
						children: [/* @__PURE__ */ jsx("legend", {
							className: "text-[0.8125rem] font-semibold text-ink",
							children: "Precio (MXN)"
						}), /* @__PURE__ */ jsxs("div", {
							className: "mt-2 grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ jsxs("label", {
								className: "field-label",
								children: [/* @__PURE__ */ jsx("span", {
									className: "mb-1 block text-xs text-muted",
									children: "Mínimo"
								}), /* @__PURE__ */ jsx("input", {
									type: "number",
									inputMode: "numeric",
									className: "input input-sm",
									placeholder: "0",
									value: state.min_price,
									onChange: (e) => patch({ min_price: e.target.value })
								})]
							}), /* @__PURE__ */ jsxs("label", {
								className: "field-label",
								children: [/* @__PURE__ */ jsx("span", {
									className: "mb-1 block text-xs text-muted",
									children: "Máximo"
								}), /* @__PURE__ */ jsx("input", {
									type: "number",
									inputMode: "numeric",
									className: "input input-sm",
									placeholder: "Sin límite",
									value: state.max_price,
									onChange: (e) => patch({ max_price: e.target.value })
								})]
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("fieldset", {
						className: "border-b border-line py-4 last:border-b-0",
						children: [/* @__PURE__ */ jsx("legend", {
							className: "text-[0.8125rem] font-semibold text-ink",
							children: "Año"
						}), /* @__PURE__ */ jsxs("div", {
							className: "mt-2 grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ jsxs("label", {
								className: "field-label",
								children: [/* @__PURE__ */ jsx("span", {
									className: "mb-1 block text-xs text-muted",
									children: "Desde"
								}), /* @__PURE__ */ jsx("input", {
									type: "number",
									inputMode: "numeric",
									className: "input input-sm",
									placeholder: "2015",
									value: state.min_year,
									onChange: (e) => patch({ min_year: e.target.value })
								})]
							}), /* @__PURE__ */ jsxs("label", {
								className: "field-label",
								children: [/* @__PURE__ */ jsx("span", {
									className: "mb-1 block text-xs text-muted",
									children: "Hasta"
								}), /* @__PURE__ */ jsx("input", {
									type: "number",
									inputMode: "numeric",
									className: "input input-sm",
									placeholder: "2024",
									value: state.max_year,
									onChange: (e) => patch({ max_year: e.target.value })
								})]
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "border-t border-line p-4",
				children: /* @__PURE__ */ jsx("button", {
					type: "button",
					className: "btn btn-ghost btn-block",
					onClick: () => {
						reset();
						setOpen(false);
					},
					children: "Limpiar filtros"
				})
			})
		]
	});
	return /* @__PURE__ */ jsxs("section", {
		className: "wrap pb-20 pt-10 lg:pt-14",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
			children: [/* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsx("p", {
					className: "eyebrow",
					children: "Inventario"
				}),
				/* @__PURE__ */ jsx("h1", {
					className: "mt-2 font-display text-4xl font-semibold tracking-tight text-ink",
					children: "Garage"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 max-w-md text-[0.9375rem] text-soft",
					children: "Cada unidad pasa por una revisión de 170 puntos y se entrega detallada, lista y documentada."
				})
			] }), /* @__PURE__ */ jsxs("form", {
				className: "relative w-full sm:max-w-xs",
				role: "search",
				onSubmit: (e) => e.preventDefault(),
				children: [/* @__PURE__ */ jsx(MagnifyingGlass, {
					size: 16,
					weight: "regular",
					className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
				}), /* @__PURE__ */ jsx("input", {
					type: "search",
					className: "input pl-9",
					placeholder: "Buscar marca, modelo, motor…",
					value: state.search,
					onChange: (e) => patch({ search: e.target.value }),
					"aria-label": "Buscar vehículos"
				})]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "mt-10 flex flex-col gap-8 lg:flex-row",
			children: [
				/* @__PURE__ */ jsx("aside", {
					className: "hidden w-64 shrink-0 lg:block",
					children: /* @__PURE__ */ jsx("div", {
						className: "sticky top-24 rounded-2xl border border-line bg-surface",
						children: filterPanel
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: `fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`,
					children: [/* @__PURE__ */ jsx("div", {
						className: `absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`,
						onClick: () => setOpen(false),
						"aria-hidden": "true"
					}), /* @__PURE__ */ jsx("aside", {
						className: `absolute left-0 top-0 flex h-full w-[min(21rem,90vw)] max-w-full flex-col border-r border-line bg-background shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${open ? "translate-x-0" : "-translate-x-full"}`,
						role: "dialog",
						"aria-modal": "true",
						"aria-label": "Filtros del Garage",
						children: filterPanel
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center justify-between gap-3",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-sm text-soft",
								"aria-live": "polite",
								children: loading ? "Actualizando…" : /* @__PURE__ */ jsxs(Fragment$1, { children: [
									/* @__PURE__ */ jsx("strong", {
										className: "font-semibold text-ink",
										children: total
									}),
									" ",
									total === 1 ? "vehículo" : "vehículos"
								] })
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ jsxs("button", {
										type: "button",
										className: "btn btn-outline btn-sm lg:hidden",
										onClick: () => setOpen(true),
										children: [
											/* @__PURE__ */ jsx(Funnel, {
												size: 15,
												weight: "regular"
											}),
											"Filtros",
											active && /* @__PURE__ */ jsx("span", {
												className: "grid h-4 w-4 place-items-center rounded-full bg-accent text-[10px] font-bold text-accent-contrast",
												children: "!"
											})
										]
									}),
									active && /* @__PURE__ */ jsxs("button", {
										type: "button",
										className: "btn btn-ghost btn-sm",
										onClick: reset,
										children: [/* @__PURE__ */ jsx(X, {
											size: 14,
											weight: "bold"
										}), "Limpiar"]
									}),
									/* @__PURE__ */ jsxs("label", {
										className: "relative",
										children: [
											/* @__PURE__ */ jsx("span", {
												className: "sr-only",
												children: "Ordenar"
											}),
											/* @__PURE__ */ jsx(SlidersHorizontal, {
												size: 15,
												weight: "regular",
												className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
											}),
											/* @__PURE__ */ jsx("select", {
												className: "input input-sm cursor-pointer appearance-none pl-9 pr-9",
												value: state.sort,
												onChange: (e) => patch({ sort: e.target.value }),
												"aria-label": "Ordenar resultados",
												children: SORTS.map((s) => /* @__PURE__ */ jsx("option", {
													value: s.value,
													children: s.label
												}, s.value))
											}),
											/* @__PURE__ */ jsx(CaretDown, {
												size: 13,
												weight: "bold",
												className: "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
											})
										]
									})
								]
							})]
						}),
						error ? /* @__PURE__ */ jsxs("div", {
							className: "mt-8 flex flex-col items-center gap-4 rounded-2xl border border-line bg-surface px-6 py-14 text-center",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "grid h-12 w-12 place-items-center rounded-xl bg-accent-tint text-accent",
									children: /* @__PURE__ */ jsx(SlidersHorizontal, {
										size: 22,
										weight: "regular"
									})
								}),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
									className: "font-display text-lg font-semibold text-ink",
									children: "No pudimos cargar el inventario"
								}), /* @__PURE__ */ jsx("p", {
									className: "mt-1 text-sm text-soft",
									children: error
								})] }),
								/* @__PURE__ */ jsx("button", {
									type: "button",
									className: "btn btn-primary btn-sm",
									onClick: () => void fetchBrands(stateToQuery(state)),
									children: "Reintentar"
								})
							]
						}) : loading && vehicles.length === 0 ? /* @__PURE__ */ jsx("div", {
							className: "mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3",
							children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsx(SkeletonCard, {}, i))
						}) : vehicles.length === 0 ? /* @__PURE__ */ jsxs("div", {
							className: "mt-8 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "grid h-12 w-12 place-items-center rounded-xl bg-surface-2 text-muted",
									children: /* @__PURE__ */ jsx(MagnifyingGlass, {
										size: 22,
										weight: "regular"
									})
								}),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
									className: "font-display text-lg font-semibold text-ink",
									children: "Sin resultados"
								}), /* @__PURE__ */ jsx("p", {
									className: "mt-1 max-w-sm text-sm text-soft",
									children: "Ningún vehículo coincide con tu búsqueda. Prueba con otros filtros o consulta el Garage completo."
								})] }),
								/* @__PURE__ */ jsx("button", {
									type: "button",
									className: "btn btn-primary btn-sm",
									onClick: () => {
										reset();
										setOpen(false);
									},
									children: "Ver todo el inventario"
								})
							]
						}) : /* @__PURE__ */ jsx("ul", {
							className: `mt-8 grid grid-cols-1 gap-6 transition-opacity duration-200 sm:grid-cols-2 xl:grid-cols-3 ${loading ? "pointer-events-none opacity-60" : ""}`,
							children: vehicles.map((v) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(VehicleCard, { vehicle: v }) }, v.id))
						}),
						!loading && vehicles.length > 0 && total > vehicles.length && /* @__PURE__ */ jsxs("p", {
							className: "mt-8 text-center text-sm text-muted",
							children: [
								"Mostrando ",
								vehicles.length,
								" de ",
								total,
								" vehículos"
							]
						})
					]
				})
			]
		})]
	});
}
//#endregion
//#region src/pages/garage/index.astro
var garage_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	const initial = await listVehicles({
		sort: "recent",
		limit: 24
	});
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {
		"title": "Garage",
		"description": "Catálogo de vehículos seleccionados de Carmexio con precio claro, historial verificado y disponibilidad en tiempo real."
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "GarageExplorer", GarageExplorer, {
		"client:load": true,
		"initial": initial,
		"client:component-hydration": "load",
		"client:component-path": "/home/boxter/Dev/Carmexio/src/components/garage/GarageExplorer.tsx",
		"client:component-export": "default"
	})}` })}`;
}, "/home/boxter/Dev/Carmexio/src/pages/garage/index.astro", void 0);
var $$file = "/home/boxter/Dev/Carmexio/src/pages/garage/index.astro";
var $$url = "/garage";
//#endregion
//#region \0virtual:astro:page:src/pages/garage/index@_@astro
var page = () => garage_exports;
//#endregion
export { page };

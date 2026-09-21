import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { S as createAstro, a as Fragment$2, d as renderTemplate, f as maybeRenderHead, i as renderComponent } from "./server_tknsmTu_.mjs";
import { t as createComponent } from "./compiler_ChNlsBvO.mjs";
import { t as guardAdmin } from "./guard_CyOI69Fs.mjs";
import { t as $$Layout } from "./Layout_C5QsuY54.mjs";
import { t as $$AdminShell } from "./AdminShell_C9YvTrgN.mjs";
import { r as formatMXN } from "./format_IVHi76V6.mjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { CaretRight, MagnifyingGlass, PencilSimple, Plus, Trash, WarningCircle } from "@phosphor-icons/react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/admin/ConfirmDialog.tsx
function ConfirmDialog({ open, title, description, confirmLabel = "Confirmar", busy = false, onCancel, onConfirm }) {
	const cancelRef = useRef(null);
	useEffect(() => {
		if (open) cancelRef.current?.focus();
	}, [open]);
	useEffect(() => {
		if (!open) return;
		function onKey(e) {
			if (e.key === "Escape" && !busy) onCancel();
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		open,
		busy,
		onCancel
	]);
	if (!open) return null;
	return /* @__PURE__ */ jsxs("div", {
		className: "fixed inset-0 z-50 grid place-items-center p-4",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": title,
		children: [/* @__PURE__ */ jsx("button", {
			type: "button",
			className: "absolute inset-0 bg-black/50 backdrop-blur-sm",
			onClick: () => !busy && onCancel(),
			tabIndex: -1,
			"aria-label": "Cerrar"
		}), /* @__PURE__ */ jsxs("div", {
			className: "relative w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-2xl",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "grid h-11 w-11 place-items-center rounded-xl bg-accent-tint text-accent",
					children: /* @__PURE__ */ jsx(Trash, {
						size: 20,
						weight: "regular"
					})
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "mt-4 font-display text-lg font-semibold tracking-tight text-ink",
					children: title
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-1.5 text-sm leading-relaxed text-soft",
					children: description
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 flex justify-end gap-2.5",
					children: [/* @__PURE__ */ jsx("button", {
						ref: cancelRef,
						type: "button",
						className: "btn btn-ghost",
						onClick: onCancel,
						disabled: busy,
						children: "Cancelar"
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						className: "btn btn-danger",
						onClick: onConfirm,
						disabled: busy,
						children: busy ? "Eliminando…" : confirmLabel
					})]
				})
			]
		})]
	});
}
//#endregion
//#region src/components/admin/VehiclesAdmin.tsx
function rowImage(v) {
	const img = [...v.images].sort((a, b) => a.order - b.order)[0];
	return img ? img.display_url ?? img.url : null;
}
function Switch({ checked, onChange, disabled, label }) {
	return /* @__PURE__ */ jsx("button", {
		type: "button",
		role: "switch",
		"aria-checked": checked,
		"aria-label": label,
		disabled,
		onClick: () => onChange(!checked),
		className: `relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-50 ${checked ? "bg-emerald-500" : "bg-surface-2 ring-1 ring-line-strong"}`,
		children: /* @__PURE__ */ jsx("span", { className: `absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${checked ? "left-6" : "left-1"}` })
	});
}
function SkeletonRow() {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center gap-4 border-b border-line px-4 py-4 last:border-b-0",
		children: [
			/* @__PURE__ */ jsx("div", { className: "skeleton h-14 w-20 shrink-0 rounded-lg" }),
			/* @__PURE__ */ jsxs("div", {
				className: "flex-1 space-y-2",
				children: [/* @__PURE__ */ jsx("div", { className: "skeleton h-3.5 w-2/3 rounded" }), /* @__PURE__ */ jsx("div", { className: "skeleton h-3 w-1/3 rounded" })]
			}),
			/* @__PURE__ */ jsx("div", { className: "skeleton h-6 w-24 rounded" })
		]
	});
}
function VehiclesAdmin() {
	const [vehicles, setVehicles] = useState(null);
	const [error, setError] = useState(null);
	const [search, setSearch] = useState("");
	const [pending, setPending] = useState(null);
	const [deleting, setDeleting] = useState(null);
	const [deleteBusy, setDeleteBusy] = useState(false);
	const load = useCallback(async () => {
		setError(null);
		try {
			const res = await fetch("/api/vehicles?sort=recent&limit=500");
			if (!res.ok) {
				const data = await res.json().catch(() => null);
				if (res.status === 401) {
					window.location.assign("/admin/login");
					return;
				}
				throw new Error(data?.error ?? "No se pudo cargar el inventario.");
			}
			const data = await res.json();
			setVehicles(data.vehicles);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error inesperado.");
		}
	}, []);
	useEffect(() => {
		load();
	}, [load]);
	const q = search.trim().toLowerCase();
	const filtered = (vehicles ?? []).filter((v) => q ? [
		v.title,
		v.brand,
		v.branch,
		v.stock_id,
		v.engine,
		String(v.year)
	].filter(Boolean).join(" ").toLowerCase().includes(q) : true);
	async function toggleAvailable(v, next) {
		setPending(v.id);
		const previous = {
			...v,
			available: v.available
		};
		setVehicles((list) => (list ?? []).map((item) => item.id === v.id ? {
			...item,
			available: next
		} : item));
		try {
			const res = await fetch(`/api/vehicles/${v.id}/availability`, {
				method: "PATCH",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ available: next })
			});
			if (!res.ok) {
				if (res.status === 401) window.location.assign("/admin/login");
				throw new Error("No se pudo actualizar la disponibilidad.");
			}
		} catch {
			setVehicles((list) => (list ?? []).map((item) => item.id === previous.id ? previous : item));
		} finally {
			setPending(null);
		}
	}
	async function confirmDelete() {
		if (!deleting) return;
		setDeleteBusy(true);
		try {
			const res = await fetch(`/api/vehicles/${deleting.id}`, { method: "DELETE" });
			if (!res.ok) {
				if (res.status === 401) window.location.assign("/admin/login");
				throw new Error("No se pudo eliminar el vehículo.");
			}
			setVehicles((list) => (list ?? []).filter((v) => v.id !== deleting.id));
			setDeleting(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error al eliminar.");
		} finally {
			setDeleteBusy(false);
		}
	}
	const mobileCard = (v) => /* @__PURE__ */ jsxs("div", {
		className: "flex gap-4 border-b border-line p-4 last:border-b-0",
		children: [/* @__PURE__ */ jsxs("a", {
			href: `/garage/${v.slug}`,
			className: "relative block h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-surface-2",
			children: [rowImage(v) ? /* @__PURE__ */ jsx("img", {
				src: rowImage(v),
				alt: "",
				loading: "lazy",
				className: "h-full w-full object-cover"
			}) : null, v.available && /* @__PURE__ */ jsx("span", {
				className: "absolute left-1.5 top-1.5 rounded bg-emerald-500/90 px-1.5 py-0.5 text-[0.625rem] font-bold text-white",
				children: "DISPONIBLE"
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "min-w-0 flex-1",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "flex items-start justify-between gap-2",
					children: /* @__PURE__ */ jsx("a", {
						href: `/admin/vehiculos/${v.id}`,
						className: "font-display text-sm font-semibold leading-snug text-ink hover:text-accent",
						children: v.title
					})
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "mt-0.5 text-xs text-muted",
					children: [
						v.year ?? "—",
						" · ",
						v.branch ?? "—"
					]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-1.5 font-display text-sm font-semibold text-ink",
					children: formatMXN(v.cash_delivery_price)
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-2 flex items-center gap-1",
					children: [
						/* @__PURE__ */ jsx(Switch, {
							checked: v.available,
							disabled: pending === v.id,
							label: `Disponibilidad de ${v.title}`,
							onChange: (next) => void toggleAvailable(v, next)
						}),
						/* @__PURE__ */ jsxs("a", {
							href: `/admin/vehiculos/${v.id}`,
							className: "ml-auto inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-2.5 py-1.5 text-xs font-medium text-soft hover:text-ink",
							children: [/* @__PURE__ */ jsx(PencilSimple, {
								size: 13,
								weight: "regular"
							}), "Editar"]
						}),
						/* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => setDeleting(v),
							className: "inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-2.5 py-1.5 text-xs font-medium text-soft hover:border-accent hover:text-accent",
							children: [/* @__PURE__ */ jsx(Trash, {
								size: 13,
								weight: "regular"
							}), "Eliminar"]
						})
					]
				})
			]
		})]
	}, v.id);
	return /* @__PURE__ */ jsxs("div", { children: [
		error && /* @__PURE__ */ jsxs("div", {
			className: "mb-5 flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-center",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-tint text-accent",
					children: /* @__PURE__ */ jsx(WarningCircle, {
						size: 20,
						weight: "regular"
					})
				}),
				/* @__PURE__ */ jsx("p", {
					className: "flex-1 text-sm text-soft",
					children: error
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "btn btn-outline btn-sm",
					onClick: () => void load(),
					children: "Reintentar"
				})
			]
		}),
		/* @__PURE__ */ jsxs("form", {
			className: "relative mb-5 w-full max-w-sm",
			role: "search",
			onSubmit: (e) => e.preventDefault(),
			children: [/* @__PURE__ */ jsx(MagnifyingGlass, {
				size: 16,
				weight: "regular",
				className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
			}), /* @__PURE__ */ jsx("input", {
				type: "search",
				className: "input pl-9",
				placeholder: "Buscar por título, marca, ID…",
				value: search,
				onChange: (e) => setSearch(e.target.value),
				"aria-label": "Buscar vehículos en el panel"
			})]
		}),
		vehicles === null ? /* @__PURE__ */ jsx("div", {
			className: "overflow-hidden rounded-2xl border border-line bg-surface",
			children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsx(SkeletonRow, {}, i))
		}) : vehicles.length === 0 ? /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center",
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
					children: "Aún no hay vehículos"
				}), /* @__PURE__ */ jsxs("p", {
					className: "mt-1 max-w-sm text-sm text-soft",
					children: [
						"Agrega tu primera unidad para empezar a mostrar el Garage, o siembra el catálogo inicial con",
						" ",
						/* @__PURE__ */ jsx("code", {
							className: "font-mono text-xs",
							children: "pnpm seed"
						}),
						"."
					]
				})] }),
				/* @__PURE__ */ jsxs("a", {
					href: "/admin/vehiculos/nuevo",
					className: "btn btn-primary btn-sm",
					children: [/* @__PURE__ */ jsx(Plus, {
						size: 15,
						weight: "bold"
					}), "Agregar vehículo"]
				})
			]
		}) : filtered.length === 0 ? /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center",
			children: [
				/* @__PURE__ */ jsx("p", {
					className: "font-display text-base font-semibold text-ink",
					children: "Sin resultados"
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "text-sm text-soft",
					children: [
						"Ningún vehículo coincide con «",
						search,
						"»."
					]
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "btn btn-ghost btn-sm",
					onClick: () => setSearch(""),
					children: "Limpiar búsqueda"
				})
			]
		}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("div", {
			className: "hidden overflow-hidden rounded-2xl border border-line bg-surface md:block",
			children: /* @__PURE__ */ jsxs("table", {
				className: "w-full text-left",
				children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", {
					className: "border-b border-line text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted",
					children: [
						/* @__PURE__ */ jsx("th", {
							scope: "col",
							className: "px-5 py-3.5",
							children: "Unidad"
						}),
						/* @__PURE__ */ jsx("th", {
							scope: "col",
							className: "px-5 py-3.5",
							children: "Año / Sucursal"
						}),
						/* @__PURE__ */ jsx("th", {
							scope: "col",
							className: "px-5 py-3.5",
							children: "Precio"
						}),
						/* @__PURE__ */ jsx("th", {
							scope: "col",
							className: "px-5 py-3.5",
							children: "Disponible"
						}),
						/* @__PURE__ */ jsx("th", {
							scope: "col",
							className: "px-5 py-3.5 text-right",
							children: "Acciones"
						})
					]
				}) }), /* @__PURE__ */ jsx("tbody", { children: filtered.map((v) => /* @__PURE__ */ jsxs("tr", {
					className: "group border-b border-line transition-colors last:border-b-0 hover:bg-surface-2/50",
					children: [
						/* @__PURE__ */ jsx("td", {
							className: "px-5 py-4",
							children: /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-4",
								children: [/* @__PURE__ */ jsx("a", {
									href: `/garage/${v.slug}`,
									className: "relative block h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-2",
									children: rowImage(v) ? /* @__PURE__ */ jsx("img", {
										src: rowImage(v),
										alt: "",
										loading: "lazy",
										className: "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
									}) : null
								}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("a", {
									href: `/admin/vehiculos/${v.id}`,
									className: "font-display text-sm font-semibold text-ink transition-colors hover:text-accent",
									children: v.title
								}), /* @__PURE__ */ jsxs("p", {
									className: "mt-0.5 text-xs text-muted",
									children: ["ID ", v.stock_id ?? v.id.slice(0, 8)]
								})] })]
							})
						}),
						/* @__PURE__ */ jsxs("td", {
							className: "px-5 py-4 text-sm text-soft",
							children: [v.year ?? "—", /* @__PURE__ */ jsxs("span", {
								className: "text-muted",
								children: [" · ", v.branch ?? "—"]
							})]
						}),
						/* @__PURE__ */ jsxs("td", {
							className: "px-5 py-4",
							children: [/* @__PURE__ */ jsx("p", {
								className: "font-display text-sm font-semibold text-ink",
								children: formatMXN(v.cash_delivery_price)
							}), v.advance_payment_price != null && /* @__PURE__ */ jsxs("p", {
								className: "text-xs text-muted",
								children: ["Apartado ", formatMXN(v.advance_payment_price)]
							})]
						}),
						/* @__PURE__ */ jsx("td", {
							className: "px-5 py-4",
							children: /* @__PURE__ */ jsx(Switch, {
								checked: v.available,
								disabled: pending === v.id,
								label: `Disponibilidad de ${v.title}`,
								onChange: (next) => void toggleAvailable(v, next)
							})
						}),
						/* @__PURE__ */ jsx("td", {
							className: "px-5 py-4",
							children: /* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-end gap-2",
								children: [
									/* @__PURE__ */ jsxs("a", {
										href: `/admin/vehiculos/${v.id}`,
										className: "inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-2.5 py-1.5 text-xs font-medium text-soft transition-colors hover:text-ink",
										children: [/* @__PURE__ */ jsx(PencilSimple, {
											size: 13,
											weight: "regular"
										}), /* @__PURE__ */ jsx("span", {
											className: "hidden lg:inline",
											children: "Editar"
										})]
									}),
									/* @__PURE__ */ jsxs("button", {
										type: "button",
										onClick: () => setDeleting(v),
										className: "inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-2.5 py-1.5 text-xs font-medium text-soft transition-colors hover:border-accent hover:text-accent",
										children: [/* @__PURE__ */ jsx(Trash, {
											size: 13,
											weight: "regular"
										}), /* @__PURE__ */ jsx("span", {
											className: "hidden lg:inline",
											children: "Eliminar"
										})]
									}),
									/* @__PURE__ */ jsx("a", {
										href: `/garage/${v.slug}`,
										className: "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line-strong text-soft transition-colors hover:text-ink",
										"aria-label": `Ver ${v.title} en el sitio`,
										children: /* @__PURE__ */ jsx(CaretRight, {
											size: 14,
											weight: "bold"
										})
									})
								]
							})
						})
					]
				}, v.id)) })]
			})
		}), /* @__PURE__ */ jsx("div", {
			className: "overflow-hidden rounded-2xl border border-line bg-surface md:hidden",
			children: filtered.map(mobileCard)
		})] }),
		/* @__PURE__ */ jsx(ConfirmDialog, {
			open: deleting !== null,
			title: "Eliminar vehículo",
			description: deleting ? `Se eliminará «${deleting.title}» de forma permanente. Esta acción no se puede deshacer.` : "",
			confirmLabel: "Eliminar",
			busy: deleteBusy,
			onCancel: () => !deleteBusy && setDeleting(null),
			onConfirm: () => void confirmDelete()
		})
	] });
}
//#endregion
//#region src/pages/admin/vehiculos/index.astro
var vehiculos_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Index = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Index;
	const guard = await guardAdmin(Astro);
	if (guard instanceof Response) return guard;
	const { user } = guard;
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {
		"title": "Vehículos — Panel",
		"description": "Administración de vehículos de Carmexio."
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "AdminShell", $$AdminShell, {
		"user": user,
		"pathname": Astro.url.pathname,
		"title": "Vehículos"
	}, {
		"default": ($$result) => renderTemplate`${renderComponent($$result, "VehiclesAdmin", VehiclesAdmin, {
			"client:load": true,
			"client:component-hydration": "load",
			"client:component-path": "/home/boxter/Dev/Carmexio/src/components/admin/VehiclesAdmin.tsx",
			"client:component-export": "default"
		})}`,
		"actions": ($$result) => renderTemplate`${renderComponent($$result, "Fragment", Fragment$2, { "slot": "actions" }, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<a href="/admin/vehiculos/nuevo" class="btn btn-primary btn-sm">${renderComponent($$result, "Plus", Plus, {
			"size": 15,
			"weight": "bold"
		})}Nuevo vehículo</a>` })}`
	})}` })}`;
}, "/home/boxter/Dev/Carmexio/src/pages/admin/vehiculos/index.astro", void 0);
var $$file = "/home/boxter/Dev/Carmexio/src/pages/admin/vehiculos/index.astro";
var $$url = "/admin/vehiculos";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/vehiculos/index@_@astro
var page = () => vehiculos_exports;
//#endregion
export { page };

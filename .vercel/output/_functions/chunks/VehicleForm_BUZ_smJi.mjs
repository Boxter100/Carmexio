import { a as slugify } from "./format_IVHi76V6.mjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, CheckCircle, FloppyDisk, ImageSquare, Plus, Trash, WarningCircle } from "@phosphor-icons/react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/admin/VehicleForm.tsx
var blank = () => ({
	title: "",
	slug: "",
	brand: "",
	model: "",
	year: "",
	vehicle_type: "",
	mileage: "",
	fuel_type: "",
	engine: "",
	transmission: "",
	drive_type: "",
	exterior_color: "",
	interior_color: "",
	stock_id: "",
	branch: "",
	reservation_amount: "",
	cash_delivery_price: "",
	advance_payment_price: "",
	registered: "",
	history: "",
	featuresText: "",
	descriptionText: "",
	available: true,
	images: []
});
var toNum = (s) => {
	const t = s.trim();
	if (!t) return null;
	const n = Number(t.replace(/,/g, ""));
	return Number.isFinite(n) ? n : null;
};
var num = (v) => v == null ? "" : String(v);
var price = (v) => v == null ? "" : v.toLocaleString("es-MX");
function Field({ label, hint, required, children }) {
	return /* @__PURE__ */ jsxs("label", {
		className: "block text-sm",
		children: [
			/* @__PURE__ */ jsxs("span", {
				className: "field-label",
				children: [label, required && /* @__PURE__ */ jsx("span", {
					className: "text-accent",
					children: " *"
				})]
			}),
			children,
			hint && /* @__PURE__ */ jsx("span", {
				className: "mt-1 block text-xs text-muted",
				children: hint
			})
		]
	});
}
function Section({ title, children }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "rounded-2xl border border-line bg-surface p-5 sm:p-6",
		children: [/* @__PURE__ */ jsx("h2", {
			className: "font-display text-base font-semibold tracking-tight text-ink",
			children: title
		}), /* @__PURE__ */ jsx("div", {
			className: "mt-5",
			children
		})]
	});
}
function textClass() {
	return "input";
}
function VehicleForm({ mode = "create", vehicleId }) {
	const [d, setD] = useState(blank);
	const [loading, setLoading] = useState(mode === "edit");
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const [error, setError] = useState(null);
	const [errors, setErrors] = useState({});
	const titleTouched = useRef(false);
	const set = (key, value) => {
		setD((prev) => {
			const next = {
				...prev,
				[key]: value
			};
			if (key === "title" && !titleTouched.current && !next.slug.trim()) next.slug = slugify(String(value));
			return next;
		});
	};
	const setImg = (index, key, value) => setD((prev) => {
		const images = prev.images.map((img, i) => i === index ? {
			...img,
			[key]: value
		} : img);
		return {
			...prev,
			images
		};
	});
	useEffect(() => {
		if (mode !== "edit" || !vehicleId) return;
		let active = true;
		(async () => {
			try {
				const res = await fetch(`/api/vehicles/${vehicleId}`);
				if (res.status === 401) {
					window.location.assign("/admin/login");
					return;
				}
				if (!res.ok) throw new Error("No se pudo cargar el vehículo.");
				const v = await res.json();
				if (!active) return;
				setD({
					title: v.title,
					slug: v.slug,
					brand: v.brand ?? "",
					model: v.model ?? "",
					year: num(v.year),
					vehicle_type: v.vehicle_type ?? "",
					mileage: num(v.mileage),
					fuel_type: v.fuel_type ?? "",
					engine: v.engine ?? "",
					transmission: v.transmission ?? "",
					drive_type: v.drive_type ?? "",
					exterior_color: v.exterior_color ?? "",
					interior_color: v.interior_color ?? "",
					stock_id: v.stock_id ?? "",
					branch: v.branch ?? "",
					reservation_amount: price(v.reservation_amount),
					cash_delivery_price: price(v.cash_delivery_price),
					advance_payment_price: price(v.advance_payment_price),
					registered: v.registered ?? "",
					history: v.history ?? "",
					featuresText: v.features.join("\n"),
					descriptionText: v.description.join("\n\n"),
					available: v.available,
					images: [...v.images].sort((a, b) => a.order - b.order).map((img) => ({
						url: img.url,
						display_url: img.display_url ?? "",
						alt: img.alt ?? ""
					}))
				});
			} catch (err) {
				if (active) setError(err instanceof Error ? err.message : "Error al cargar.");
			} finally {
				if (active) setLoading(false);
			}
		})();
		return () => {
			active = false;
		};
	}, [mode, vehicleId]);
	const validate = useCallback(() => {
		const e = {};
		if (!d.title.trim()) e.title = "El título es obligatorio.";
		if (!d.brand.trim()) e.brand = "La marca es obligatoria.";
		if (!d.year.trim()) e.year = "El año es obligatorio.";
		else if (toNum(d.year) == null) e.year = "Año inválido.";
		if (!d.vehicle_type.trim()) e.vehicle_type = "El tipo de vehículo es obligatorio.";
		if (d.slug.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d.slug.trim())) e.slug = "Solo minúsculas, números y guiones.";
		if (!d.cash_delivery_price.trim()) e.cash_delivery_price = "El precio es obligatorio.";
		else if (toNum(d.cash_delivery_price) == null) e.cash_delivery_price = "Precio inválido.";
		const badImg = d.images.findIndex((img) => !img.url.trim() || !/^https?:\/\//.test(img.url.trim()));
		if (badImg >= 0) e.images = `La imagen ${badImg + 1} necesita una URL válida (https://…).`;
		setErrors(e);
		return Object.keys(e).length === 0;
	}, [d]);
	async function submit(e) {
		e.preventDefault();
		if (!validate()) return;
		setSaving(true);
		setError(null);
		setSaved(false);
		try {
			const payload = {
				slug: d.slug.trim() || slugify(d.title),
				title: d.title.trim(),
				brand: d.brand.trim(),
				model: d.model.trim() || null,
				year: toNum(d.year),
				vehicle_type: d.vehicle_type.trim() || null,
				mileage: toNum(d.mileage),
				fuel_type: d.fuel_type.trim() || null,
				engine: d.engine.trim() || null,
				transmission: d.transmission.trim() || null,
				drive_type: d.drive_type.trim() || null,
				exterior_color: d.exterior_color.trim() || null,
				interior_color: d.interior_color.trim() || null,
				stock_id: d.stock_id.trim() || null,
				branch: d.branch.trim() || null,
				reservation_amount: toNum(d.reservation_amount),
				cash_delivery_price: toNum(d.cash_delivery_price),
				advance_payment_price: toNum(d.advance_payment_price),
				registered: d.registered.trim() || null,
				history: d.history.trim() || null,
				features: d.featuresText.split("\n").map((s) => s.trim()).filter(Boolean),
				description: d.descriptionText.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean),
				images: d.images.map((img, i) => ({
					url: img.url.trim(),
					display_url: img.display_url.trim() || null,
					alt: img.alt.trim() || null,
					order: i
				})).filter((img) => img.url),
				available: d.available
			};
			const url = mode === "edit" && vehicleId ? `/api/vehicles/${vehicleId}` : "/api/vehicles";
			const res = await fetch(url, {
				method: mode === "edit" ? "PUT" : "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(payload)
			});
			const data = await res.json().catch(() => null);
			if (!res.ok) {
				if (res.status === 401) {
					window.location.assign("/admin/login");
					return;
				}
				throw new Error(data?.error ?? "No se pudo guardar el vehículo.");
			}
			setSaved(true);
			if (mode === "create" && data?.vehicle) window.setTimeout(() => {
				window.location.assign(`/admin/vehiculos/${data.vehicle.id}`);
			}, 650);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error inesperado.");
		} finally {
			setSaving(false);
		}
	}
	if (loading) return /* @__PURE__ */ jsx("div", {
		className: "space-y-5",
		children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ jsxs("div", {
			className: "rounded-2xl border border-line bg-surface p-6",
			children: [/* @__PURE__ */ jsx("div", { className: "skeleton h-4 w-1/3 rounded" }), /* @__PURE__ */ jsxs("div", {
				className: "mt-5 grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ jsx("div", { className: "skeleton h-11 rounded-xl" }), /* @__PURE__ */ jsx("div", { className: "skeleton h-11 rounded-xl" })]
			})]
		}, i))
	});
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: submit,
		noValidate: true,
		children: [
			error && /* @__PURE__ */ jsxs("p", {
				className: "mb-5 flex items-start gap-2 rounded-xl bg-accent-tint px-4 py-3 text-sm font-medium text-accent",
				role: "alert",
				children: [/* @__PURE__ */ jsx(WarningCircle, {
					size: 17,
					weight: "regular",
					className: "mt-0.5 shrink-0"
				}), error]
			}),
			saved && /* @__PURE__ */ jsxs("p", {
				className: "mb-5 flex items-start gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400",
				role: "status",
				children: [/* @__PURE__ */ jsx(CheckCircle, {
					size: 17,
					weight: "fill",
					className: "mt-0.5 shrink-0"
				}), "Vehículo guardado correctamente."]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "space-y-5",
				children: [
					/* @__PURE__ */ jsx(Section, {
						title: "Identificación",
						children: /* @__PURE__ */ jsxs("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ jsx("div", {
									className: "sm:col-span-2",
									children: /* @__PURE__ */ jsxs(Field, {
										label: "Título",
										required: true,
										children: [/* @__PURE__ */ jsx("input", {
											className: "input",
											"aria-invalid": Boolean(errors.title),
											value: d.title,
											onChange: (e) => {
												titleTouched.current = true;
												set("title", e.target.value);
											},
											placeholder: "Ej. BMW Serie 3 328i 2019"
										}), errors.title && /* @__PURE__ */ jsx("span", {
											className: "field-error",
											children: errors.title
										})]
									})
								}),
								/* @__PURE__ */ jsxs(Field, {
									label: "Slug",
									hint: "Se genera del título si lo dejas vacío. Para la URL pública.",
									children: [/* @__PURE__ */ jsx("input", {
										className: "input",
										"aria-invalid": Boolean(errors.slug),
										value: d.slug,
										onChange: (e) => set("slug", e.target.value),
										placeholder: "auto-slug-unico"
									}), errors.slug && /* @__PURE__ */ jsx("span", {
										className: "field-error",
										children: errors.slug
									})]
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Stock ID",
									children: /* @__PURE__ */ jsx("input", {
										className: textClass(),
										value: d.stock_id,
										onChange: (e) => set("stock_id", e.target.value),
										placeholder: "CAR-2401"
									})
								}),
								/* @__PURE__ */ jsxs(Field, {
									label: "Marca",
									required: true,
									children: [/* @__PURE__ */ jsx("input", {
										className: "input",
										"aria-invalid": Boolean(errors.brand),
										value: d.brand,
										onChange: (e) => set("brand", e.target.value),
										placeholder: "BMW"
									}), errors.brand && /* @__PURE__ */ jsx("span", {
										className: "field-error",
										children: errors.brand
									})]
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Modelo",
									children: /* @__PURE__ */ jsx("input", {
										className: textClass(),
										value: d.model,
										onChange: (e) => set("model", e.target.value),
										placeholder: "328i"
									})
								}),
								/* @__PURE__ */ jsxs(Field, {
									label: "Año",
									required: true,
									children: [/* @__PURE__ */ jsx("input", {
										inputMode: "numeric",
										className: "input",
										"aria-invalid": Boolean(errors.year),
										value: d.year,
										onChange: (e) => set("year", e.target.value),
										placeholder: "2019"
									}), errors.year && /* @__PURE__ */ jsx("span", {
										className: "field-error",
										children: errors.year
									})]
								}),
								/* @__PURE__ */ jsxs(Field, {
									label: "Tipo de vehículo",
									required: true,
									children: [/* @__PURE__ */ jsxs("select", {
										className: "input",
										"aria-invalid": Boolean(errors.vehicle_type),
										value: d.vehicle_type,
										onChange: (e) => set("vehicle_type", e.target.value),
										children: [
											/* @__PURE__ */ jsx("option", {
												value: "",
												children: "Selecciona…"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "Sedán",
												children: "Sedán"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "SUV",
												children: "SUV"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "Camioneta",
												children: "Camioneta"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "Pickup",
												children: "Pickup"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "Hatchback",
												children: "Hatchback"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "Deportivo",
												children: "Deportivo"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "Compacto",
												children: "Compacto"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "Otro",
												children: "Otro"
											})
										]
									}), errors.vehicle_type && /* @__PURE__ */ jsx("span", {
										className: "field-error",
										children: errors.vehicle_type
									})]
								}),
								/* @__PURE__ */ jsxs(Field, {
									label: "Sucursal",
									children: [/* @__PURE__ */ jsx("input", {
										className: textClass(),
										value: d.branch,
										onChange: (e) => set("branch", e.target.value),
										list: "branches",
										placeholder: "CDMX"
									}), /* @__PURE__ */ jsxs("datalist", {
										id: "branches",
										children: [
											/* @__PURE__ */ jsx("option", { value: "CDMX" }),
											/* @__PURE__ */ jsx("option", { value: "PRE-VENTA" }),
											/* @__PURE__ */ jsx("option", { value: "GDL" }),
											/* @__PURE__ */ jsx("option", { value: "MTY" })
										]
									})]
								})
							]
						})
					}),
					/* @__PURE__ */ jsx(Section, {
						title: "Técnica",
						children: /* @__PURE__ */ jsxs("div", {
							className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
							children: [
								/* @__PURE__ */ jsx(Field, {
									label: "Kilometraje (km)",
									children: /* @__PURE__ */ jsx("input", {
										className: textClass(),
										inputMode: "numeric",
										value: d.mileage,
										onChange: (e) => set("mileage", e.target.value),
										placeholder: "45000"
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Motor",
									children: /* @__PURE__ */ jsx("input", {
										className: textClass(),
										value: d.engine,
										onChange: (e) => set("engine", e.target.value),
										placeholder: "2.0L Turbo"
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Combustible",
									children: /* @__PURE__ */ jsxs("select", {
										className: textClass(),
										value: d.fuel_type,
										onChange: (e) => set("fuel_type", e.target.value),
										children: [
											/* @__PURE__ */ jsx("option", {
												value: "",
												children: "Selecciona…"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "Gasolina",
												children: "Gasolina"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "Diésel",
												children: "Diésel"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "Híbrido",
												children: "Híbrido"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "Eléctrico",
												children: "Eléctrico"
											})
										]
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Transmisión",
									children: /* @__PURE__ */ jsxs("select", {
										className: textClass(),
										value: d.transmission,
										onChange: (e) => set("transmission", e.target.value),
										children: [
											/* @__PURE__ */ jsx("option", {
												value: "",
												children: "Selecciona…"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "Automática",
												children: "Automática"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "Manual",
												children: "Manual"
											})
										]
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Tracción",
									children: /* @__PURE__ */ jsxs("select", {
										className: textClass(),
										value: d.drive_type,
										onChange: (e) => set("drive_type", e.target.value),
										children: [
											/* @__PURE__ */ jsx("option", {
												value: "",
												children: "Selecciona…"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "4x4",
												children: "4x4"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "RWD",
												children: "RWD"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "FWD",
												children: "FWD"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "AWD",
												children: "AWD"
											})
										]
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Registro / standard",
									children: /* @__PURE__ */ jsx("input", {
										className: textClass(),
										value: d.registered,
										onChange: (e) => set("registered", e.target.value),
										placeholder: "Nuevo / Usado"
									})
								})
							]
						})
					}),
					/* @__PURE__ */ jsx(Section, {
						title: "Apariencia",
						children: /* @__PURE__ */ jsxs("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ jsx(Field, {
								label: "Color exterior",
								children: /* @__PURE__ */ jsx("input", {
									className: textClass(),
									value: d.exterior_color,
									onChange: (e) => set("exterior_color", e.target.value),
									placeholder: "Rojo"
								})
							}), /* @__PURE__ */ jsx(Field, {
								label: "Color interior",
								children: /* @__PURE__ */ jsx("input", {
									className: textClass(),
									value: d.interior_color,
									onChange: (e) => set("interior_color", e.target.value),
									placeholder: "Negro"
								})
							})]
						})
					}),
					/* @__PURE__ */ jsxs(Section, {
						title: "Precios",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
							children: [
								/* @__PURE__ */ jsxs(Field, {
									label: "Precio contra entrega (MXN)",
									required: true,
									children: [/* @__PURE__ */ jsx("input", {
										className: "input",
										"aria-invalid": Boolean(errors.cash_delivery_price),
										inputMode: "numeric",
										value: d.cash_delivery_price,
										onChange: (e) => set("cash_delivery_price", e.target.value),
										placeholder: "562,000"
									}), errors.cash_delivery_price && /* @__PURE__ */ jsx("span", {
										className: "field-error",
										children: errors.cash_delivery_price
									})]
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Precio de apartado (MXN)",
									hint: "Precio si se aparta con anticipo.",
									children: /* @__PURE__ */ jsx("input", {
										className: textClass(),
										inputMode: "numeric",
										value: d.advance_payment_price,
										onChange: (e) => set("advance_payment_price", e.target.value),
										placeholder: "548,000"
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Enganche mínimo (MXN)",
									children: /* @__PURE__ */ jsx("input", {
										className: textClass(),
										inputMode: "numeric",
										value: d.reservation_amount,
										onChange: (e) => set("reservation_amount", e.target.value),
										placeholder: "70,000"
									})
								})
							]
						}), /* @__PURE__ */ jsxs("label", {
							className: "mt-5 flex items-center justify-between gap-4 rounded-xl bg-surface-2 px-4 py-3.5",
							children: [/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
								className: "block text-sm font-semibold text-ink",
								children: "Disponible en el Garage"
							}), /* @__PURE__ */ jsx("span", {
								className: "mt-0.5 block text-xs text-muted",
								children: "Si está apagado, no aparece en el catálogo público."
							})] }), /* @__PURE__ */ jsx("input", {
								type: "checkbox",
								role: "switch",
								checked: d.available,
								onChange: (e) => set("available", e.target.checked),
								className: "h-6 w-11 appearance-none rounded-full bg-surface-2 ring-1 ring-line-strong transition-colors checked:bg-emerald-500 checked:ring-emerald-500 before:absolute before:left-1 before:top-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:shadow before:transition-all checked:before:left-6 relative"
							})]
						})]
					}),
					/* @__PURE__ */ jsx(Section, {
						title: "Descripción y equipamiento",
						children: /* @__PURE__ */ jsxs("div", {
							className: "grid gap-4",
							children: [
								/* @__PURE__ */ jsx(Field, {
									label: "Descripción",
									hint: "Cada párrafo va separado por una línea en blanco. Se muestra como bloque de texto en la página de detalle.",
									children: /* @__PURE__ */ jsx("textarea", {
										className: "input min-h-32",
										value: d.descriptionText,
										onChange: (e) => set("descriptionText", e.target.value),
										placeholder: "Descripción corta.\n\nHistorial y condiciones de la unidad."
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Equipamiento",
									hint: "Un elemento por línea. Aparecen como lista de características.",
									children: /* @__PURE__ */ jsx("textarea", {
										className: "input min-h-28 font-mono text-sm",
										value: d.featuresText,
										onChange: (e) => set("featuresText", e.target.value),
										placeholder: "6 cilindros en línea\nSistema de sonido premium\nAsientos de piel"
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Historial",
									hint: "Texto opcional (accidentes, servicios, dueños).",
									children: /* @__PURE__ */ jsx("textarea", {
										className: "input min-h-24",
										value: d.history,
										onChange: (e) => set("history", e.target.value),
										placeholder: "1 propietario, servicio en agencia…"
									})
								})
							]
						})
					}),
					/* @__PURE__ */ jsx(Section, {
						title: "Imágenes",
						children: /* @__PURE__ */ jsxs("div", {
							className: "grid gap-4",
							children: [
								/* @__PURE__ */ jsxs("p", {
									className: "text-xs leading-relaxed text-muted",
									children: [
										"La primera es la portada. Usa ",
										/* @__PURE__ */ jsx("code", {
											className: "font-mono",
											children: "display_url"
										}),
										" si la foto pública está optimizada (p. ej. Brightcove) y ",
										/* @__PURE__ */ jsx("code", {
											className: "font-mono",
											children: "url"
										}),
										" para la original."
									]
								}),
								errors.images && /* @__PURE__ */ jsxs("p", {
									className: "flex items-center gap-2 rounded-xl bg-accent-tint px-4 py-3 text-sm font-medium text-accent",
									children: [/* @__PURE__ */ jsx(WarningCircle, {
										size: 16,
										weight: "regular"
									}), errors.images]
								}),
								/* @__PURE__ */ jsx("div", {
									className: "space-y-3",
									children: d.images.map((img, i) => /* @__PURE__ */ jsxs("div", {
										className: "rounded-xl border border-line bg-surface-2/60 p-4",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-start gap-3",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-line bg-surface",
												children: [img.url ? /* @__PURE__ */ jsx("img", {
													src: img.url,
													alt: "",
													loading: "lazy",
													className: "h-full w-full object-cover",
													onError: (e) => e.currentTarget.style.display = "none",
													onLoad: (e) => e.currentTarget.style.display = ""
												}) : /* @__PURE__ */ jsx("span", {
													className: "grid h-full place-items-center text-muted",
													children: /* @__PURE__ */ jsx(ImageSquare, {
														size: 20,
														weight: "regular"
													})
												}), i === 0 && /* @__PURE__ */ jsx("span", {
													className: "absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[0.625rem] font-bold text-white",
													children: "PORTA"
												})]
											}), /* @__PURE__ */ jsxs("div", {
												className: "min-w-0 flex-1 space-y-2",
												children: [
													/* @__PURE__ */ jsx("input", {
														className: "input",
														value: img.url,
														onChange: (e) => setImg(i, "url", e.target.value),
														placeholder: "https://…/foto.jpg",
														"aria-label": `URL de la imagen ${i + 1}`
													}),
													/* @__PURE__ */ jsx("input", {
														className: "input",
														value: img.display_url,
														onChange: (e) => setImg(i, "display_url", e.target.value),
														placeholder: "https://… (URL optimizada, opcional)",
														"aria-label": `URL optimizada de la imagen ${i + 1}`
													}),
													/* @__PURE__ */ jsx("input", {
														className: "input",
														value: img.alt,
														onChange: (e) => setImg(i, "alt", e.target.value),
														placeholder: "Texto alternativo (accesibilidad)",
														"aria-label": `Texto alternativo de la imagen ${i + 1}`
													})
												]
											})]
										}), /* @__PURE__ */ jsxs("div", {
											className: "mt-3 flex items-center gap-2",
											children: [
												/* @__PURE__ */ jsx("button", {
													type: "button",
													disabled: i === 0,
													onClick: () => setD((p) => {
														const images = [...p.images];
														[images[i - 1], images[i]] = [images[i], images[i - 1]];
														return {
															...p,
															images
														};
													}),
													className: "btn btn-ghost btn-sm disabled:opacity-40",
													"aria-label": "Subir imagen",
													children: /* @__PURE__ */ jsx(ArrowUp, {
														size: 14,
														weight: "regular"
													})
												}),
												/* @__PURE__ */ jsx("button", {
													type: "button",
													disabled: i === d.images.length - 1,
													onClick: () => setD((p) => {
														const images = [...p.images];
														[images[i + 1], images[i]] = [images[i], images[i + 1]];
														return {
															...p,
															images
														};
													}),
													className: "btn btn-ghost btn-sm disabled:opacity-40",
													"aria-label": "Bajar imagen",
													children: /* @__PURE__ */ jsx(ArrowDown, {
														size: 14,
														weight: "regular"
													})
												}),
												/* @__PURE__ */ jsxs("span", {
													className: "ml-auto text-xs text-muted",
													children: [
														"Imagen ",
														i + 1,
														" de ",
														d.images.length
													]
												}),
												/* @__PURE__ */ jsxs("button", {
													type: "button",
													onClick: () => setD((p) => ({
														...p,
														images: p.images.filter((_, j) => j !== i)
													})),
													className: "btn btn-ghost btn-sm text-accent",
													"aria-label": `Quitar imagen ${i + 1}`,
													children: [/* @__PURE__ */ jsx(Trash, {
														size: 14,
														weight: "regular"
													}), "Quitar"]
												})
											]
										})]
									}, i))
								}),
								/* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: () => setD((p) => ({
										...p,
										images: [...p.images, {
											url: "",
											display_url: "",
											alt: ""
										}]
									})),
									className: "btn btn-outline btn-sm self-start",
									children: [/* @__PURE__ */ jsx(Plus, {
										size: 14,
										weight: "bold"
									}), "Agregar imagen"]
								})
							]
						})
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "sticky bottom-4 z-10 mt-6",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-3 rounded-2xl border border-line bg-surface/95 p-4 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.5)] backdrop-blur sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ jsx("p", {
						className: "hidden text-xs text-muted sm:block",
						children: mode === "edit" ? "Los cambios se publican de inmediato." : "Se creará una unidad nueva en el Garage."
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ jsx("a", {
							href: "/admin/vehiculos",
							className: "btn btn-ghost",
							children: "Cancelar"
						}), /* @__PURE__ */ jsxs("button", {
							type: "submit",
							className: "btn btn-primary",
							disabled: saving,
							children: [/* @__PURE__ */ jsx(FloppyDisk, {
								size: 16,
								weight: "regular"
							}), saving ? "Guardando…" : mode === "edit" ? "Guardar cambios" : "Crear vehículo"]
						})]
					})]
				})
			})
		]
	});
}
//#endregion
export { VehicleForm as t };

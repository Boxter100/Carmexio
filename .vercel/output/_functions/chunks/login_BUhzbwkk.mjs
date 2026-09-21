import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { S as createAstro, d as renderTemplate, f as maybeRenderHead, i as renderComponent } from "./server_tknsmTu_.mjs";
import { t as createComponent } from "./compiler_ChNlsBvO.mjs";
import { y as isSupabaseConfigured } from "./roles_CIjRyDdg.mjs";
import { n as guardGuest } from "./guard_CyOI69Fs.mjs";
import { t as $$Layout } from "./Layout_C5QsuY54.mjs";
import { useState } from "react";
import { ArrowRight, Info, LockKey, WarningCircle } from "@phosphor-icons/react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/admin/AdminLogin.tsx
function AdminLogin({ developmentHint }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState(null);
	async function submit(e) {
		e.preventDefault();
		if (busy) return;
		setBusy(true);
		setError(null);
		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					email,
					password
				})
			});
			const data = await res.json();
			if (!res.ok) {
				setError(data.error ?? "No se pudo iniciar sesión.");
				setBusy(false);
				return;
			}
			window.location.assign("/admin/vehiculos");
		} catch {
			setError("Error de conexión. Intenta de nuevo.");
			setBusy(false);
		}
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "mx-auto w-full max-w-sm",
		children: [/* @__PURE__ */ jsxs("form", {
			className: "rounded-2xl border border-line bg-surface p-7 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.4)]",
			onSubmit: submit,
			noValidate: true,
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "mb-6 text-center",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent-tint text-accent",
							children: /* @__PURE__ */ jsx(LockKey, {
								size: 22,
								weight: "regular"
							})
						}),
						/* @__PURE__ */ jsx("h2", {
							className: "mt-4 font-display text-xl font-semibold tracking-tight text-ink",
							children: "Panel de administración"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-sm text-muted",
							children: "Inicia sesión para gestionar Carmexio."
						})
					]
				}),
				error && /* @__PURE__ */ jsxs("p", {
					className: "mb-5 flex items-start gap-2 rounded-xl bg-accent-tint px-3.5 py-3 text-sm font-medium text-accent",
					role: "alert",
					children: [/* @__PURE__ */ jsx(WarningCircle, {
						size: 17,
						weight: "regular",
						className: "mt-0.5 shrink-0"
					}), error]
				}),
				/* @__PURE__ */ jsx("label", {
					className: "field-label",
					htmlFor: "admin-email",
					children: "Correo electrónico"
				}),
				/* @__PURE__ */ jsx("input", {
					id: "admin-email",
					type: "email",
					autoComplete: "email",
					className: "input",
					placeholder: "admin@carmexio.mx",
					value: email,
					onChange: (e) => setEmail(e.target.value),
					required: true
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "field-group",
					children: [/* @__PURE__ */ jsx("label", {
						className: "field-label",
						htmlFor: "admin-password",
						children: "Contraseña"
					}), /* @__PURE__ */ jsx("input", {
						id: "admin-password",
						type: "password",
						autoComplete: "current-password",
						className: "input",
						placeholder: "••••••••••",
						value: password,
						onChange: (e) => setPassword(e.target.value),
						required: true
					})]
				}),
				/* @__PURE__ */ jsxs("button", {
					type: "submit",
					className: "btn btn-primary btn-lg btn-block mt-6",
					disabled: busy,
					children: [busy ? "Entrando…" : "Entrar al panel", !busy && /* @__PURE__ */ jsx(ArrowRight, {
						size: 16,
						weight: "bold"
					})]
				})
			]
		}), developmentHint && /* @__PURE__ */ jsxs("p", {
			className: "mt-5 flex items-start gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-xs leading-relaxed text-muted",
			children: [
				/* @__PURE__ */ jsx(Info, {
					size: 15,
					weight: "regular",
					className: "mt-0.5 shrink-0 text-accent"
				}),
				"Modo desarrollo: ",
				/* @__PURE__ */ jsx("code", {
					className: "font-mono",
					children: "admin@carmexio.mx"
				}),
				" con contraseña",
				" ",
				/* @__PURE__ */ jsx("code", {
					className: "font-mono",
					children: "carmexio123"
				}),
				" (configurable en ",
				/* @__PURE__ */ jsx("code", {
					className: "font-mono",
					children: ".env"
				}),
				")."
			]
		})]
	});
}
//#endregion
//#region src/pages/admin/login.astro
var login_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Login,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Login = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Login;
	const redirect = await guardGuest(Astro);
	if (redirect) return redirect;
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {
		"title": "Acceso",
		"description": "Acceso al panel de administración de Carmexio."
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="relative flex min-h-[calc(100dvh-5rem)] items-center justify-center overflow-hidden py-16"><div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true" style="background: radial-gradient(55% 50% at 50% 0%, var(--accent-tint), transparent 70%)"></div>${renderComponent($$result, "AdminLogin", AdminLogin, { "developmentHint": !isSupabaseConfigured() })}</section>` })}`;
}, "/home/boxter/Dev/Carmexio/src/pages/admin/login.astro", void 0);
var $$file = "/home/boxter/Dev/Carmexio/src/pages/admin/login.astro";
var $$url = "/admin/login";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/login@_@astro
var page = () => login_exports;
//#endregion
export { page };

import { S as createAstro, c as renderSlot, d as renderTemplate, f as maybeRenderHead, i as renderComponent, m as addAttribute } from "./server_tknsmTu_.mjs";
import { t as createComponent } from "./compiler_ChNlsBvO.mjs";
import { useState } from "react";
import { Car, Handshake, SignOut, TrendUp, Wallet, Wrench } from "@phosphor-icons/react";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/components/admin/LogoutButton.tsx
function LogoutButton() {
	const [busy, setBusy] = useState(false);
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		className: "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-soft transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-50",
		disabled: busy,
		onClick: async () => {
			setBusy(true);
			try {
				await fetch("/api/auth/logout", { method: "POST" });
			} catch {}
			window.location.href = "/admin/login";
		},
		children: [/* @__PURE__ */ jsx(SignOut, {
			size: 17,
			weight: "regular"
		}), "Cerrar sesión"]
	});
}
//#endregion
//#region src/components/admin/AdminShell.astro
createAstro("https://astro.build");
var $$AdminShell = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$AdminShell;
	const modules = [
		{
			href: "/admin/vehiculos",
			label: "Vehículos",
			icon: Car,
			available: true
		},
		{
			href: "/admin/financiamiento",
			label: "Financiamiento",
			icon: Wallet,
			available: false
		},
		{
			href: "/admin/membresias",
			label: "Membresías",
			icon: Wrench,
			available: false
		},
		{
			href: "/admin/inversiones",
			label: "Inversiones",
			icon: TrendUp,
			available: false
		},
		{
			href: "/admin/comisiones",
			label: "Comisiones",
			icon: Handshake,
			available: false
		}
	];
	const { user, pathname, title, backHref } = Astro.props;
	const titleMatch = (href) => Boolean(href && pathname.startsWith(href));
	return renderTemplate`${maybeRenderHead($$result)}<section class="wrap py-8 lg:py-10"><div class="grid gap-8 lg:grid-cols-[250px_1fr]"><aside class="lg:sticky lg:top-24 lg:self-start"><div class="rounded-2xl border border-line bg-surface p-4"><div class="flex items-center gap-3 border-b border-line px-1 pb-4"><span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-accent-contrast">${(user.name ?? user.email).charAt(0).toUpperCase()}</span><div class="min-w-0"><p class="truncate text-sm font-semibold text-ink">${user.name ?? user.email}</p><p class="truncate text-xs text-muted">${user.email}</p></div></div><nav class="mt-3 flex flex-nowrap gap-1 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label="Módulos administrativos">${modules.map((m) => {
		const active = titleMatch(m.href);
		return m.available && m.href ? renderTemplate`<a${addAttribute(m.href, "href")}${addAttribute(`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-accent-tint text-accent" : "text-soft hover:bg-surface-2 hover:text-ink"}`, "class")}>${renderComponent($$result, "m.icon", m.icon, {
			"size": 17,
			"weight": "regular"
		})}${m.label}</a>` : renderTemplate`<span class="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted" title="Módulo próximo">${renderComponent($$result, "m.icon", m.icon, {
			"size": 17,
			"weight": "regular"
		})}${m.label}<span class="rounded bg-surface-2 px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide">Pronto</span></span>`;
	})}</nav><div class="mt-3 border-t border-line pt-3">${renderComponent($$result, "LogoutButton", LogoutButton, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "/home/boxter/Dev/Carmexio/src/components/admin/LogoutButton.tsx",
		"client:component-export": "default"
	})}</div></div></aside><div class="min-w-0"><div class="flex flex-wrap items-center justify-between gap-3"><div>${backHref && renderTemplate`<a${addAttribute(backHref, "href")} class="mb-1.5 inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-accent">← Volver</a>`}<h1 class="font-display text-2xl font-semibold tracking-tight text-ink lg:text-3xl">${title}</h1></div>${renderSlot($$result, $$slots["actions"])}</div><div class="mt-6">${renderSlot($$result, $$slots["default"])}</div></div></div></section>`;
}, "/home/boxter/Dev/Carmexio/src/components/admin/AdminShell.astro", void 0);
//#endregion
export { $$AdminShell as t };

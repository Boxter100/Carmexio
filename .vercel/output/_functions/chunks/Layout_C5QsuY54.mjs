import { S as createAstro, c as renderSlot, d as renderTemplate, f as maybeRenderHead, i as renderComponent, m as addAttribute, p as renderHead } from "./server_tknsmTu_.mjs";
import { t as createComponent } from "./compiler_ChNlsBvO.mjs";
import { useEffect, useState } from "react";
import { CaretRight, List, Moon, Sun, UserCircle, X } from "@phosphor-icons/react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region src/lib/site.ts
var SITE = {
	name: "Carmexio",
	tagline: "Autos premium, precios honestos.",
	url: "https://carmexio.com.mx",
	email: "hola@carmexio.mx",
	phone: "(55) 0000 0000"
};
var NAV_LINKS = [
	{
		href: "/",
		label: "Inicio"
	},
	{
		href: "/garage",
		label: "Garage"
	},
	{
		href: "/financiamiento",
		label: "Financiamiento"
	},
	{
		href: "/membresias",
		label: "Membresías"
	},
	{
		href: "/inversiones",
		label: "Inversiones"
	},
	{
		href: "/comisiones",
		label: "Comisiones"
	},
	{
		href: "/nosotros",
		label: "Quiénes somos"
	}
];
//#endregion
//#region src/components/ThemeToggle.tsx
function resolveInitial() {
	if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) return "dark";
	return "light";
}
function ThemeToggle() {
	const [theme, setTheme] = useState(resolveInitial);
	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
		try {
			localStorage.setItem("carmexio-theme", theme);
		} catch {}
	}, [theme]);
	return /* @__PURE__ */ jsx("button", {
		type: "button",
		title: theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro",
		"aria-label": theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro",
		onClick: () => setTheme((t) => t === "dark" ? "light" : "dark"),
		className: "grid h-9 w-9 place-items-center rounded-lg text-soft transition-colors hover:bg-surface-2 hover:text-ink",
		children: /* @__PURE__ */ jsx("span", {
			className: "theme-icon",
			children: theme === "dark" ? /* @__PURE__ */ jsx(Sun, {
				size: 18,
				weight: "regular"
			}) : /* @__PURE__ */ jsx(Moon, {
				size: 18,
				weight: "regular"
			})
		}, theme)
	});
}
//#endregion
//#region src/components/AccountButton.tsx
function AccountButton() {
	const [state, setState] = useState("loading");
	const [user, setUser] = useState(null);
	useEffect(() => {
		let active = true;
		fetch("/api/auth/me").then((res) => res.ok ? res.json() : null).then((data) => {
			if (!active) return;
			if (data?.user) {
				setUser(data.user);
				setState("admin");
			} else setState("anonymous");
		}).catch(() => active && setState("anonymous"));
		return () => {
			active = false;
		};
	}, []);
	if (state === "loading") return /* @__PURE__ */ jsx("span", {
		className: "h-9 w-9 animate-pulse rounded-lg bg-surface-2",
		"aria-hidden": "true"
	});
	if (state === "admin" && user) return /* @__PURE__ */ jsxs("a", {
		href: "/admin",
		className: "flex h-9 items-center gap-2 rounded-lg border border-line-strong bg-surface px-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2",
		title: "Panel de administración",
		children: [/* @__PURE__ */ jsx("span", {
			className: "flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold uppercase text-accent-contrast",
			children: (user.name ?? user.email).charAt(0)
		}), /* @__PURE__ */ jsx("span", {
			className: "hidden max-w-28 truncate sm:block",
			children: user.name ?? user.email.split("@")[0]
		})]
	});
	return /* @__PURE__ */ jsxs("a", {
		href: "/admin/login",
		className: "flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-soft transition-colors hover:bg-surface-2 hover:text-ink",
		title: "Iniciar sesión",
		children: [
			/* @__PURE__ */ jsx(UserCircle, {
				size: 18,
				weight: "regular"
			}),
			/* @__PURE__ */ jsx("span", {
				className: "hidden sm:block",
				children: "Ingresar"
			}),
			/* @__PURE__ */ jsx(CaretRight, {
				size: 13,
				weight: "bold",
				className: "hidden sm:block"
			})
		]
	});
}
//#endregion
//#region src/components/MobileNav.tsx
function isActive(pathname, href) {
	if (href === "/") return pathname === "/";
	return pathname.startsWith(href);
}
function MobileNav({ pathname }) {
	const [open, setOpen] = useState(false);
	useEffect(() => {
		if (!open) return;
		const onKey = (e) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("keydown", onKey);
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = previousOverflow;
		};
	}, [open]);
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("button", {
		type: "button",
		className: "grid h-9 w-9 place-items-center rounded-lg text-soft transition-colors hover:bg-surface-2 hover:text-ink",
		"aria-label": open ? "Cerrar menú" : "Abrir menú",
		"aria-expanded": open,
		"aria-controls": "mobile-nav",
		onClick: () => setOpen((o) => !o),
		children: open ? /* @__PURE__ */ jsx(X, {
			size: 20,
			weight: "regular"
		}) : /* @__PURE__ */ jsx(List, {
			size: 20,
			weight: "regular"
		})
	}), /* @__PURE__ */ jsxs("div", {
		id: "mobile-nav",
		className: `fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`,
		children: [/* @__PURE__ */ jsx("div", {
			className: `absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`,
			onClick: () => setOpen(false),
			"aria-hidden": "true"
		}), /* @__PURE__ */ jsxs("aside", {
			className: `absolute right-0 top-0 flex h-full w-[min(21rem,88vw)] flex-col border-l border-line bg-background shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${open ? "translate-x-0" : "translate-x-full"}`,
			role: "dialog",
			"aria-modal": "true",
			"aria-label": "Menú de navegación",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex h-16 items-center justify-between border-b border-line px-5",
					children: [/* @__PURE__ */ jsx("span", {
						className: "font-display text-base font-semibold tracking-tight text-ink",
						children: "Menú"
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						className: "grid h-9 w-9 place-items-center rounded-lg text-soft hover:bg-surface-2 hover:text-ink",
						"aria-label": "Cerrar menú",
						onClick: () => setOpen(false),
						children: /* @__PURE__ */ jsx(X, {
							size: 20,
							weight: "regular"
						})
					})]
				}),
				/* @__PURE__ */ jsx("nav", {
					className: "flex flex-col gap-1 overflow-y-auto p-4",
					"aria-label": "Principal",
					children: NAV_LINKS.map((link, i) => {
						const active = isActive(pathname, link.href);
						return /* @__PURE__ */ jsxs("a", {
							href: link.href,
							onClick: () => setOpen(false),
							className: `flex items-center justify-between rounded-xl px-4 py-3 text-[0.9375rem] font-medium transition-colors ${active ? "bg-surface text-ink ring-1 ring-line" : "text-soft hover:bg-surface-2 hover:text-ink"}`,
							children: [link.label, /* @__PURE__ */ jsx("span", { className: `h-1.5 w-1.5 rounded-full bg-accent transition-opacity ${active ? "opacity-100" : "opacity-0"}` })]
						}, link.href);
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-auto border-t border-line p-4",
					children: /* @__PURE__ */ jsx("a", {
						href: pathname.startsWith("/admin") ? "/admin" : "/admin/login",
						className: "btn btn-outline btn-block",
						onClick: () => setOpen(false),
						children: pathname.startsWith("/admin") ? "Ir al panel" : "Acceso"
					})
				})
			]
		})]
	})] });
}
//#endregion
//#region src/components/Header.astro
createAstro("https://astro.build");
var $$Header = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Header;
	const { pathname } = Astro.props;
	function isActive(href) {
		if (href === "/") return pathname === "/";
		return pathname.startsWith(href);
	}
	return renderTemplate`${maybeRenderHead($$result)}<header class="sticky top-0 z-40 border-b border-line bg-background/80 backdrop-blur-xl"><div class="wrap flex h-16 items-center justify-between gap-4 lg:h-[4.25rem]"><a href="/" class="flex shrink-0 items-center gap-2.5 rounded-lg" aria-label="Carmexio · Inicio"><span class="grid h-9 w-9 place-items-center rounded-xl bg-surface shadow-sm ring-1 ring-line-strong"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.2" stroke="var(--accent)" stroke-width="1.7"></circle><circle cx="12" cy="12" r="1.5" fill="var(--accent)"></circle><path d="M12 3.8v3.1M8.9 5.9l1.6 2.7M15.1 5.9l-1.6 2.7M12 20.2v-3.1M15.1 18.1l-1.6-2.7M8.9 18.1l1.6-2.7" stroke="var(--accent)" stroke-width="1.7" stroke-linecap="round"></path></svg></span><span class="font-display text-lg font-semibold tracking-tight text-ink">Carmexio</span></a><nav class="hidden items-center gap-0.5 xl:flex" aria-label="Principal">${NAV_LINKS.map((link) => renderTemplate`<a${addAttribute(link.href, "href")}${addAttribute(["rounded-lg px-3 py-2 text-[0.8125rem] font-medium transition-colors", isActive(link.href) ? "bg-surface text-ink ring-1 ring-line" : "text-soft hover:bg-surface-2 hover:text-ink"], "class:list")}>${link.label}</a>`)}</nav><div class="flex items-center gap-1.5">${renderComponent($$result, "ThemeToggle", ThemeToggle, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "/home/boxter/Dev/Carmexio/src/components/ThemeToggle.tsx",
		"client:component-export": "default"
	})}${renderComponent($$result, "AccountButton", AccountButton, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "/home/boxter/Dev/Carmexio/src/components/AccountButton.tsx",
		"client:component-export": "default"
	})}<div class="xl:hidden">${renderComponent($$result, "MobileNav", MobileNav, {
		"client:load": true,
		"pathname": pathname,
		"client:component-hydration": "load",
		"client:component-path": "/home/boxter/Dev/Carmexio/src/components/MobileNav.tsx",
		"client:component-export": "default"
	})}</div></div></div></header>`;
}, "/home/boxter/Dev/Carmexio/src/components/Header.astro", void 0);
//#endregion
//#region src/components/Footer.astro
createAstro("https://astro.build");
var $$Footer = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Footer;
	const { pathname } = Astro.props;
	const year = (/* @__PURE__ */ new Date()).getFullYear();
	return renderTemplate`${maybeRenderHead($$result)}<footer class="border-t border-line bg-surface"><div class="wrap py-14"><div class="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]"><div><a href="/" class="flex items-center gap-2.5" aria-label="Carmexio · Inicio"><span class="grid h-9 w-9 place-items-center rounded-xl bg-surface-2 ring-1 ring-line-strong"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.2" stroke="var(--accent)" stroke-width="1.7"></circle><circle cx="12" cy="12" r="1.5" fill="var(--accent)"></circle><path d="M12 3.8v3.1M8.9 5.9l1.6 2.7M15.1 5.9l-1.6 2.7M12 20.2v-3.1M15.1 18.1l-1.6-2.7M8.9 18.1l1.6-2.7" stroke="var(--accent)" stroke-width="1.7" stroke-linecap="round"></path></svg></span><span class="font-display text-lg font-semibold tracking-tight text-ink">${SITE.name}</span></a><p class="mt-4 max-w-xs text-sm leading-relaxed text-muted">Autos seminuevos y nuevos con precio claro, financiamiento propio y un servicio pensado para que conduzcas sin complicaciones.</p></div><div><h3 class="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted">Navegación</h3><ul class="mt-4 space-y-2.5">${NAV_LINKS.map((link) => renderTemplate`<li><a${addAttribute(link.href, "href")}${addAttribute(["text-sm transition-colors hover:text-accent", pathname === link.href ? "font-medium text-accent" : "text-soft"], "class:list")}>${link.label}</a></li>`)}</ul></div><div><h3 class="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted">Servicios</h3><ul class="mt-4 space-y-2.5">${[
		{
			href: "/garage",
			label: "Inventario"
		},
		{
			href: "/financiamiento",
			label: "Financiamiento"
		},
		{
			href: "/membresias",
			label: "Membresías"
		},
		{
			href: "/inversiones",
			label: "Inversiones"
		},
		{
			href: "/comisiones",
			label: "Comisiones"
		}
	].map((link) => renderTemplate`<li><a${addAttribute(link.href, "href")} class="text-sm text-soft transition-colors hover:text-accent">${link.label}</a></li>`)}</ul></div><div><h3 class="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted">Contacto</h3><ul class="mt-4 space-y-2.5 text-sm text-soft"><li><a${addAttribute(`mailto:${SITE.email}`, "href")} class="transition-colors hover:text-accent">${SITE.email}</a></li><li><a${addAttribute(`tel:${SITE.phone.replace(/[^0-9]/g, "")}`, "href")} class="transition-colors hover:text-accent">${SITE.phone}</a></li><li class="text-muted">Ciudad de México / Preventa</li></ul><a href="/admin" class="mt-5 inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-soft" rel="nofollow">Acceso administrador</a></div></div><div class="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between"><p>© ${year} ${SITE.name}. Todos los derechos reservados.</p><div class="flex items-center gap-4"><a href="/" class="transition-colors hover:text-soft">Aviso de privacidad</a><a href="/" class="transition-colors hover:text-soft">Términos y condiciones</a></div></div></div></footer>`;
}, "/home/boxter/Dev/Carmexio/src/components/Footer.astro", void 0);
//#endregion
//#region src/layouts/Layout.astro
createAstro("https://astro.build");
var $$Layout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Layout;
	const { title, description } = Astro.props;
	const fullTitle = title ? `${title} · ${SITE.name}` : `${SITE.name} · ${SITE.tagline}`;
	const metaDescription = description ?? "Vehiculos seleccionados con precio claro, financiamiento propio y servicio anual en Carmexio.";
	return renderTemplate`<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" href="/favicon.ico"><meta name="generator"${addAttribute(Astro.generator, "content")}><meta name="description"${addAttribute(metaDescription, "content")}><meta property="og:type" content="website"><meta property="og:site_name"${addAttribute(SITE.name, "content")}><meta property="og:title"${addAttribute(fullTitle, "content")}><meta property="og:description"${addAttribute(metaDescription, "content")}><meta name="theme-color" content="#0b0c0e"><title>${fullTitle}</title><script>
			(function () {
				var stored = null;
				try {
					stored = localStorage.getItem('carmexio-theme');
				} catch (e) {}
				var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
				document.documentElement.classList.toggle('dark', dark);
			})();
		<\/script>${renderHead($$result)}</head><body class="min-h-dvh"><a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-3 focus:left-3 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-contrast">Saltar al contenido</a>${renderComponent($$result, "Header", $$Header, { "pathname": Astro.url.pathname })}<main id="main">${renderSlot($$result, $$slots["default"])}</main>${renderComponent($$result, "Footer", $$Footer, { "pathname": Astro.url.pathname })}</body></html>`;
}, "/home/boxter/Dev/Carmexio/src/layouts/Layout.astro", void 0);
//#endregion
export { SITE as n, $$Layout as t };

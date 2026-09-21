import { S as createAstro, b as unescapeHTML, d as renderTemplate, f as maybeRenderHead, i as renderComponent } from "./server_tknsmTu_.mjs";
import { t as createComponent } from "./compiler_ChNlsBvO.mjs";
import { ArrowLeft } from "@phosphor-icons/react";
//#region src/components/Placeholder.astro
createAstro("https://astro.build");
var $$Placeholder = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Placeholder;
	const icons = {
		finance: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"13\" rx=\"2.5\"/><path d=\"M3 10h18M15.5 13.5h2.5\"/>",
		membresias: "<path d=\"M12 3.5s-6.5 4.5-6.5 9.5a6.5 6.5 0 0 0 13 0c0-5-6.5-9.5-6.5-9.5Z\"/><path d=\"M12 8v6M9.5 10.5h5\"/>",
		inversiones: "<path d=\"M3 17.5 9 11l4 4 8-8.5\"/><path d=\"M17 6.5H21v4\"/>",
		comisiones: "<circle cx=\"9\" cy=\"8\" r=\"3.2\"/><circle cx=\"16.5\" cy=\"9.5\" r=\"2.2\"/><path d=\"M3.5 20c.6-3.4 2.8-5.2 5.5-5.2s4.9 1.8 5.5 5.2\"/><path d=\"M15 14.9c2 .3 3.6 1.6 4.2 3.9\"/>",
		nosotros: "<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4.5 20c1-5 3.8-7.5 7.5-7.5S18.5 15 19.5 20\"/>"
	};
	const { title, description, icon } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<section class="relative flex min-h-[62dvh] items-center overflow-hidden py-20"><div class="pointer-events-none absolute inset-0 -z-10" aria-hidden="true" style="background: radial-gradient(60% 50% at 20% 0%, var(--accent-tint), transparent 70%)"></div><div class="wrap"><div class="mx-auto max-w-xl text-center"><div class="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-line bg-surface text-accent shadow-sm"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${unescapeHTML(icons[icon])}</svg></div><p class="eyebrow mt-8">Próximamente</p><h1 class="mt-3 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">${title}</h1><p class="mt-4 text-base leading-relaxed text-soft">${description}</p><div class="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"><a href="/garage" class="btn btn-primary">Explorar el Garage</a><a href="/" class="btn btn-ghost">${renderComponent($$result, "ArrowLeft", ArrowLeft, {
		"size": 16,
		"weight": "bold"
	})}Volver al inicio</a></div></div></div></section>`;
}, "/home/boxter/Dev/Carmexio/src/components/Placeholder.astro", void 0);
//#endregion
export { $$Placeholder as t };

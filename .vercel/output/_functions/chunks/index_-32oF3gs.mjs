import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { d as renderTemplate, i as renderComponent } from "./server_tknsmTu_.mjs";
import { t as createComponent } from "./compiler_ChNlsBvO.mjs";
import { t as $$Layout } from "./Layout_C5QsuY54.mjs";
import { t as $$Placeholder } from "./Placeholder_CFtL_yCh.mjs";
//#region src/pages/financiamiento/index.astro
var financiamiento_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
var $$Index = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {
		"title": "Financiamiento",
		"description": "Financiamiento propio para tu próximo vehículo. Disponible próximamente en Carmexio."
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Placeholder", $$Placeholder, {
		"icon": "finance",
		"title": "Financiamiento",
		"description": "Financiamiento propio con enganches desde 20%, hasta 60 mensualidades y trámites simples. Estamos afinando los detalles para que lo tengas pronto."
	})}` })}`;
}, "/home/boxter/Dev/Carmexio/src/pages/financiamiento/index.astro", void 0);
var $$file = "/home/boxter/Dev/Carmexio/src/pages/financiamiento/index.astro";
var $$url = "/financiamiento";
//#endregion
//#region \0virtual:astro:page:src/pages/financiamiento/index@_@astro
var page = () => financiamiento_exports;
//#endregion
export { page };

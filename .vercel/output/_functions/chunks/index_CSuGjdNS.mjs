import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { d as renderTemplate, i as renderComponent } from "./server_tknsmTu_.mjs";
import { t as createComponent } from "./compiler_ChNlsBvO.mjs";
import { t as $$Layout } from "./Layout_C5QsuY54.mjs";
import { t as $$Placeholder } from "./Placeholder_CFtL_yCh.mjs";
//#region src/pages/inversiones/index.astro
var inversiones_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
var $$Index = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {
		"title": "Inversiones",
		"description": "Inversiones y oportunidades de patrimonio vehicular. Disponible próximamente en Carmexio."
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Placeholder", $$Placeholder, {
		"icon": "inversiones",
		"title": "Inversiones",
		"description": "Oportunidades de inversión ligadas al inventario de Carmexio con rendimientos claros y seguimiento transparente. Por ahora, seguimos trabajando en ello."
	})}` })}`;
}, "/home/boxter/Dev/Carmexio/src/pages/inversiones/index.astro", void 0);
var $$file = "/home/boxter/Dev/Carmexio/src/pages/inversiones/index.astro";
var $$url = "/inversiones";
//#endregion
//#region \0virtual:astro:page:src/pages/inversiones/index@_@astro
var page = () => inversiones_exports;
//#endregion
export { page };

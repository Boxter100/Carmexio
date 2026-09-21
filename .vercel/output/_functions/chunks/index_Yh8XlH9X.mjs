import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { d as renderTemplate, i as renderComponent } from "./server_tknsmTu_.mjs";
import { t as createComponent } from "./compiler_ChNlsBvO.mjs";
import { t as $$Layout } from "./Layout_C5QsuY54.mjs";
import { t as $$Placeholder } from "./Placeholder_CFtL_yCh.mjs";
//#region src/pages/comisiones/index.astro
var comisiones_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
var $$Index = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {
		"title": "Comisiones",
		"description": "Programa de comisiones por referidos. Disponible próximamente en Carmexio."
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Placeholder", $$Placeholder, {
		"icon": "comisiones",
		"title": "Comisiones",
		"description": "Nuestro programa de comisiones y referidos está en camino. Pronto podrás compartir el Garage de Carmexio y ganar por cada unidad entregada."
	})}` })}`;
}, "/home/boxter/Dev/Carmexio/src/pages/comisiones/index.astro", void 0);
var $$file = "/home/boxter/Dev/Carmexio/src/pages/comisiones/index.astro";
var $$url = "/comisiones";
//#endregion
//#region \0virtual:astro:page:src/pages/comisiones/index@_@astro
var page = () => comisiones_exports;
//#endregion
export { page };

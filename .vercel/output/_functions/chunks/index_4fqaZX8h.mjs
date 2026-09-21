import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { d as renderTemplate, i as renderComponent } from "./server_tknsmTu_.mjs";
import { t as createComponent } from "./compiler_ChNlsBvO.mjs";
import { t as $$Layout } from "./Layout_C5QsuY54.mjs";
import { t as $$Placeholder } from "./Placeholder_CFtL_yCh.mjs";
//#region src/pages/nosotros/index.astro
var nosotros_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
var $$Index = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {
		"title": "Quiénes somos",
		"description": "Conoce a Carmexio, tu aliado automotriz. Información completa disponible próximamente."
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Placeholder", $$Placeholder, {
		"icon": "nosotros",
		"title": "Quiénes somos",
		"description": "Carmexio busca cambiar la forma de comprar autos: inventario seleccionado, precios claros y un proceso sin letras chiquitas. Nuestra historia completa está en camino."
	})}` })}`;
}, "/home/boxter/Dev/Carmexio/src/pages/nosotros/index.astro", void 0);
var $$file = "/home/boxter/Dev/Carmexio/src/pages/nosotros/index.astro";
var $$url = "/nosotros";
//#endregion
//#region \0virtual:astro:page:src/pages/nosotros/index@_@astro
var page = () => nosotros_exports;
//#endregion
export { page };

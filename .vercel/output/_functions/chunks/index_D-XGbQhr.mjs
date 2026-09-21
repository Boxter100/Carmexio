import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { d as renderTemplate, i as renderComponent } from "./server_tknsmTu_.mjs";
import { t as createComponent } from "./compiler_ChNlsBvO.mjs";
import { t as $$Layout } from "./Layout_C5QsuY54.mjs";
import { t as $$Placeholder } from "./Placeholder_CFtL_yCh.mjs";
//#region src/pages/membresias/index.astro
var membresias_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => $$url
});
var $$Index = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {
		"title": "Membresías",
		"description": "Membresías y servicio anual para tu vehículo. Disponible próximamente en Carmexio."
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Placeholder", $$Placeholder, {
		"icon": "membresias",
		"title": "Membresías",
		"description": "Membresías con servicio anual, beneficios en mantenimiento y atención preferente para que tu auto esté siempre en su mejor momento."
	})}` })}`;
}, "/home/boxter/Dev/Carmexio/src/pages/membresias/index.astro", void 0);
var $$file = "/home/boxter/Dev/Carmexio/src/pages/membresias/index.astro";
var $$url = "/membresias";
//#endregion
//#region \0virtual:astro:page:src/pages/membresias/index@_@astro
var page = () => membresias_exports;
//#endregion
export { page };

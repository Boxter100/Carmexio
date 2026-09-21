import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { S as createAstro, d as renderTemplate, i as renderComponent } from "./server_tknsmTu_.mjs";
import { t as createComponent } from "./compiler_ChNlsBvO.mjs";
import { t as guardAdmin } from "./guard_CyOI69Fs.mjs";
import { t as $$Layout } from "./Layout_C5QsuY54.mjs";
import { t as $$AdminShell } from "./AdminShell_C9YvTrgN.mjs";
import { t as VehicleForm } from "./VehicleForm_BUZ_smJi.mjs";
//#region src/pages/admin/vehiculos/nuevo.astro
var nuevo_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Nuevo,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Nuevo = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Nuevo;
	const guard = await guardAdmin(Astro);
	if (guard instanceof Response) return guard;
	const { user } = guard;
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {
		"title": "Nuevo vehículo — Panel",
		"description": "Crear un vehículo en Carmexio."
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "AdminShell", $$AdminShell, {
		"user": user,
		"pathname": Astro.url.pathname,
		"title": "Nuevo vehículo",
		"backHref": "/admin/vehiculos"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "VehicleForm", VehicleForm, {
		"mode": "create",
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "/home/boxter/Dev/Carmexio/src/components/admin/VehicleForm.tsx",
		"client:component-export": "default"
	})}` })}` })}`;
}, "/home/boxter/Dev/Carmexio/src/pages/admin/vehiculos/nuevo.astro", void 0);
var $$file = "/home/boxter/Dev/Carmexio/src/pages/admin/vehiculos/nuevo.astro";
var $$url = "/admin/vehiculos/nuevo";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/vehiculos/nuevo@_@astro
var page = () => nuevo_exports;
//#endregion
export { page };

import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { S as createAstro, d as renderTemplate, i as renderComponent } from "./server_tknsmTu_.mjs";
import { t as createComponent } from "./compiler_ChNlsBvO.mjs";
import { t as guardAdmin } from "./guard_CyOI69Fs.mjs";
import { t as $$Layout } from "./Layout_C5QsuY54.mjs";
import { t as $$AdminShell } from "./AdminShell_C9YvTrgN.mjs";
import { t as VehicleForm } from "./VehicleForm_BUZ_smJi.mjs";
//#region src/pages/admin/vehiculos/[id].astro
var _id__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Id,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Id = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Id;
	const { id } = Astro.params;
	if (!id || !/^[a-zA-Z0-9-]+$/.test(id)) return Astro.redirect("/admin/vehiculos");
	const guard = await guardAdmin(Astro);
	if (guard instanceof Response) return guard;
	const { user } = guard;
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {
		"title": "Editar vehículo — Panel",
		"description": "Editar un vehículo de Carmexio."
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "AdminShell", $$AdminShell, {
		"user": user,
		"pathname": Astro.url.pathname,
		"title": "Editar vehículo",
		"backHref": "/admin/vehiculos"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "VehicleForm", VehicleForm, {
		"mode": "edit",
		"vehicleId": id,
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "/home/boxter/Dev/Carmexio/src/components/admin/VehicleForm.tsx",
		"client:component-export": "default"
	})}` })}` })}`;
}, "/home/boxter/Dev/Carmexio/src/pages/admin/vehiculos/[id].astro", void 0);
var $$file = "/home/boxter/Dev/Carmexio/src/pages/admin/vehiculos/[id].astro";
var $$url = "/admin/vehiculos/[id]";
//#endregion
//#region \0virtual:astro:page:src/pages/admin/vehiculos/[id]@_@astro
var page = () => _id__exports;
//#endregion
export { page };

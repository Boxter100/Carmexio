import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { r as logoutAdmin } from "./auth_CCbTrT4O.mjs";
//#region src/pages/api/auth/logout.ts
var logout_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var POST = async ({ request, cookies }) => {
	await logoutAdmin({
		request,
		cookies
	});
	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: { "content-type": "application/json" }
	});
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/auth/logout@_@ts
var page = () => logout_exports;
//#endregion
export { page };

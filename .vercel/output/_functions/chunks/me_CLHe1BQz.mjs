import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { t as currentSession } from "./auth_CCbTrT4O.mjs";
//#region src/pages/api/auth/me.ts
var me_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var GET = async ({ request, cookies }) => {
	const user = await currentSession({
		request,
		cookies
	});
	if (!user) return new Response(JSON.stringify({ user: null }), {
		status: 200,
		headers: { "content-type": "application/json" }
	});
	return new Response(JSON.stringify({ user }), {
		status: 200,
		headers: { "content-type": "application/json" }
	});
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/auth/me@_@ts
var page = () => me_exports;
//#endregion
export { page };

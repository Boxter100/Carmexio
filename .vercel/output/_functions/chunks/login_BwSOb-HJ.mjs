import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { n as loginAdmin } from "./auth_CCbTrT4O.mjs";
import { t as loginSchema } from "./validation_CSvmmUdY.mjs";
//#region src/pages/api/auth/login.ts
var login_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var POST = async ({ request, cookies }) => {
	const ctx = {
		request,
		cookies
	};
	const json = (data, status) => new Response(JSON.stringify(data), {
		status,
		headers: { "content-type": "application/json" }
	});
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: "Solicitud inválida." }, 400);
	}
	const parsed = loginSchema.safeParse(body);
	if (!parsed.success) return json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos." }, 400);
	const result = await loginAdmin(ctx, parsed.data.email, parsed.data.password);
	if (!result.ok) return json({ error: result.error }, 401);
	return json({ user: result.user }, 200);
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/auth/login@_@ts
var page = () => login_exports;
//#endregion
export { page };

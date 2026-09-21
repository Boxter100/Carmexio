import { t as isAdminRole } from "./roles_CIjRyDdg.mjs";
import { i as requireAdmin, t as currentSession } from "./auth_CCbTrT4O.mjs";
//#region src/lib/server/guard.ts
/** Protege una página /admin: devuelve el usuario o un Response de redirección. */
function guardAdmin(Astro) {
	return new Promise((resolve) => {
		requireAdmin({
			request: Astro.request,
			cookies: Astro.cookies
		}).then((user) => resolve({ user })).catch(() => resolve(Astro.redirect("/admin/login")));
	});
}
/** Redirige a /admin si ya hay sesión (para la página de login). */
async function guardGuest(Astro) {
	const user = await currentSession({
		request: Astro.request,
		cookies: Astro.cookies
	});
	if (user && isAdminRole(user.role)) return Astro.redirect("/admin/vehiculos");
	return null;
}
//#endregion
export { guardGuest as n, guardAdmin as t };

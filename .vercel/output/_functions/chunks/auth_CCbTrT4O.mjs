import { f as localSignIn, i as SESSION_COOKIE, p as localSignOut, r as createServerSupabase, t as isAdminRole, u as localSession, y as isSupabaseConfigured } from "./roles_CIjRyDdg.mjs";
//#region src/lib/server/auth.ts
var COOKIE_OPTIONS = {
	httpOnly: true,
	sameSite: "lax",
	path: "/",
	maxAge: 604800,
	secure: true
};
function localToken(cookies) {
	return cookies.get("carmexio_session")?.value ?? null;
}
function clearLocalToken(cookies) {
	cookies.delete(SESSION_COOKIE, { path: "/" });
}
async function currentSession(ctx) {
	if (isSupabaseConfigured()) {
		const sb = createServerSupabase(ctx.request, ctx.cookies);
		const { data: { user } } = await sb.auth.getUser();
		if (!user) return null;
		let role = user.app_metadata?.role ?? "user";
		if (!isAdminRole(role)) {
			const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
			if (profile?.role) role = String(profile.role);
		}
		return {
			id: user.id,
			email: user.email ?? "",
			name: user.user_metadata?.name ?? null,
			role
		};
	}
	return localSession(localToken(ctx.cookies));
}
async function loginAdmin(ctx, email, password) {
	const normalizedEmail = email.trim().toLowerCase();
	if (!normalizedEmail || !password) return {
		ok: false,
		error: "Ingresa tu correo y contraseña."
	};
	if (isSupabaseConfigured()) {
		const { data, error } = await createServerSupabase(ctx.request, ctx.cookies).auth.signInWithPassword({
			email: normalizedEmail,
			password
		});
		if (error || !data.user) return {
			ok: false,
			error: "Credenciales inválidas."
		};
		return {
			ok: true,
			user: {
				id: data.user.id,
				email: data.user.email ?? normalizedEmail,
				name: data.user.user_metadata?.name ?? null,
				role: data.user.app_metadata?.role ?? "user"
			}
		};
	}
	const { user, token } = await localSignIn(normalizedEmail, password);
	if (!user || !token) return {
		ok: false,
		error: "Credenciales inválidas."
	};
	ctx.cookies.set(SESSION_COOKIE, token, COOKIE_OPTIONS);
	return {
		ok: true,
		user
	};
}
async function logoutAdmin(ctx) {
	if (isSupabaseConfigured()) {
		await createServerSupabase(ctx.request, ctx.cookies).auth.signOut();
		return;
	}
	const token = localToken(ctx.cookies);
	await localSignOut(token);
	clearLocalToken(ctx.cookies);
}
async function requireAdmin(ctx) {
	const user = await currentSession(ctx);
	if (!user) {
		const err = /* @__PURE__ */ new Error("No autorizado.");
		err.status = 401;
		throw err;
	}
	if (!isAdminRole(user.role)) {
		const err = /* @__PURE__ */ new Error("Requiere permisos de administrador.");
		err.status = 403;
		throw err;
	}
	return user;
}
//#endregion
export { requireAdmin as i, loginAdmin as n, logoutAdmin as r, currentSession as t };

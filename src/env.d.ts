/// <reference types="astro/client" />

declare namespace App {
	interface Locals {
		/**
		 * Sesión resuelta una sola vez por el middleware (`src/middleware.ts`).
		 * `undefined` significa que el middleware no la resolvió; `null`, que la
		 * petición es anónima.
		 */
		user?: import('./lib/types').AdminUser | null;
	}
}

declare module '*.woff2?url' {
	const src: string;
	export default src;
}

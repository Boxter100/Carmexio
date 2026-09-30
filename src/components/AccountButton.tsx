import { CaretRight, UserCircle } from '@phosphor-icons/react';
import type { AdminUser } from '../lib/types';

/**
 * Sin estado ni efectos: la sesión llega resuelta desde Layout.astro. Antes hacía
 * un `fetch('/api/auth/me')` en `client:load` en todas las páginas, lo que añadía
 * ~870 ms a la cadena crítica y un skeleton pulsante en el header.
 *
 * LogoutButton.tsx navega con `window.location.href`, así que el logout también
 * pasa por un render completo y el botón se actualiza sin necesidad de hidratar.
 */
export default function AccountButton({ user }: { user: AdminUser | null }) {
	if (user) {
		return (
			<a
				href="/admin"
				className="flex h-9 items-center gap-2 rounded-lg border border-line-strong bg-surface px-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
				title="Panel de administración"
			>
				<span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold uppercase text-accent-contrast">
					{(user.name ?? user.email).charAt(0)}
				</span>
				<span className="hidden max-w-28 truncate sm:block">
					{user.name ?? user.email.split('@')[0]}
				</span>
			</a>
		);
	}

	return (
		<a
			href="/admin/login"
			className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-soft transition-colors hover:bg-surface-2 hover:text-ink"
			title="Iniciar sesión"
		>
			<UserCircle size={18} weight="regular" />
			<span className="hidden sm:block">Ingresar</span>
			<CaretRight size={13} weight="bold" className="hidden sm:block" />
		</a>
	);
}
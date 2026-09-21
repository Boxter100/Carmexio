import { useEffect, useState } from 'react';
import { CaretRight, UserCircle } from '@phosphor-icons/react';
import type { AdminUser } from '../lib/types';

type State = 'loading' | 'anonymous' | 'admin';

export default function AccountButton() {
	const [state, setState] = useState<State>('loading');
	const [user, setUser] = useState<AdminUser | null>(null);

	useEffect(() => {
		let active = true;
		fetch('/api/auth/me')
			.then((res) => (res.ok ? res.json() : null))
			.then((data: { user: AdminUser } | null) => {
				if (!active) return;
				if (data?.user) {
					setUser(data.user);
					setState('admin');
				} else {
					setState('anonymous');
				}
			})
			.catch(() => active && setState('anonymous'));
		return () => {
			active = false;
		};
	}, []);

	if (state === 'loading') {
		return (
			<span className="h-9 w-9 animate-pulse rounded-lg bg-surface-2" aria-hidden="true" />
		);
	}

	if (state === 'admin' && user) {
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
import { useState } from 'react';
import { SignOut } from '@phosphor-icons/react';

export default function LogoutButton() {
	const [busy, setBusy] = useState(false);

	return (
		<button
			type="button"
			className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-soft transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-50"
			disabled={busy}
			onClick={async () => {
				setBusy(true);
				try {
					await fetch('/api/auth/logout', { method: 'POST' });
				} catch {}
				window.location.href = '/admin/login';
			}}
		>
			<SignOut size={17} weight="regular" />
			Cerrar sesión
		</button>
	);
}
import { useState } from 'react';
import { ArrowRight, Info, LockKey, WarningCircle } from '@phosphor-icons/react';

export default function AdminLogin({ developmentHint }: { developmentHint: boolean }) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		if (busy) return;
		setBusy(true);
		setError(null);
		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ email, password }),
			});
			const data = (await res.json()) as { user?: { role?: string }; error?: string };
			if (!res.ok) {
				setError(data.error ?? 'No se pudo iniciar sesión.');
				setBusy(false);
				return;
			}
			window.location.assign('/admin/vehiculos');
		} catch {
			setError('Error de conexión. Intenta de nuevo.');
			setBusy(false);
		}
	}

	return (
		<div className="mx-auto w-full max-w-sm">
			<form
				className="rounded-2xl border border-line bg-surface p-7 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.4)]"
				onSubmit={submit}
				noValidate
			>
				<div className="mb-6 text-center">
					<span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent-tint text-accent">
						<LockKey size={22} weight="regular" />
					</span>
					<h2 className="mt-4 font-display text-xl font-semibold tracking-tight text-ink">
						Panel de administración
					</h2>
					<p className="mt-1 text-sm text-muted">Inicia sesión para gestionar Carmexio.</p>
				</div>

				{error && (
					<p
						className="mb-5 flex items-start gap-2 rounded-xl bg-accent-tint px-3.5 py-3 text-sm font-medium text-accent"
						role="alert"
					>
						<WarningCircle size={17} weight="regular" className="mt-0.5 shrink-0" />
						{error}
					</p>
				)}

				<label className="field-label" htmlFor="admin-email">
					Correo electrónico
				</label>
				<input
					id="admin-email"
					type="email"
					autoComplete="email"
					className="input"
					placeholder="admin@carmexio.mx"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>

				<div className="field-group">
					<label className="field-label" htmlFor="admin-password">
						Contraseña
					</label>
					<input
						id="admin-password"
						type="password"
						autoComplete="current-password"
						className="input"
						placeholder="••••••••••"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>

				<button type="submit" className="btn btn-primary btn-lg btn-block mt-6" disabled={busy}>
					{busy ? 'Entrando…' : 'Entrar al panel'}
					{!busy && <ArrowRight size={16} weight="bold" />}
				</button>
			</form>

			{developmentHint && (
				<p className="mt-5 flex items-start gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-xs leading-relaxed text-muted">
					<Info size={15} weight="regular" className="mt-0.5 shrink-0 text-accent" />
					Modo desarrollo: <code className="font-mono">admin@carmexio.mx</code> con contraseña{' '}
					<code className="font-mono">carmexio123</code> (configurable en <code className="font-mono">.env</code>).
				</p>
			)}
		</div>
	);
}
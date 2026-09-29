import { useCallback, useEffect, useState } from 'react';
import { CaretRight, MagnifyingGlass, PencilSimple, Plus, Trash, WarningCircle } from '@phosphor-icons/react';
import type { Vehicle } from '../../lib/types';
import { formatMXN } from '../../lib/format';
import ConfirmDialog from './ConfirmDialog';

function rowImage(v: Vehicle) {
	const img = [...v.images].sort((a, b) => a.order - b.order)[0];
	return img ? (img.display_url ?? img.url) : null;
}

function Switch({
	checked,
	onChange,
	disabled,
	label,
}: {
	checked: boolean;
	onChange: (next: boolean) => void;
	disabled?: boolean;
	label: string;
}) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			aria-label={label}
			disabled={disabled}
			onClick={() => onChange(!checked)}
			className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-50 after:absolute after:-inset-x-2 after:-inset-y-3 after:content-[''] ${
				checked ? 'bg-emerald-500' : 'bg-surface-2 ring-1 ring-line-strong'
			}`}
		>
			<span
				className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${
					checked ? 'left-6' : 'left-1'
				}`}
			/>
		</button>
	);
}

function SkeletonRow() {
	return (
		<div className="border-b border-line p-4 last:border-b-0">
			<div className="flex gap-4">
				<div className="skeleton h-20 w-28 shrink-0 rounded-lg" />
				<div className="flex-1 space-y-2">
					<div className="skeleton h-3.5 w-2/3 rounded" />
					<div className="skeleton h-3 w-1/3 rounded" />
					<div className="skeleton h-3.5 w-1/2 rounded" />
				</div>
			</div>
			<div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
				<div className="skeleton h-6 w-11 rounded-full" />
				<div className="skeleton h-3 w-14 rounded" />
				<div className="skeleton ml-auto h-11 w-20 rounded-lg" />
				<div className="skeleton h-11 w-24 rounded-lg" />
			</div>
		</div>
	);
}

export default function VehiclesAdmin() {
	const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [search, setSearch] = useState('');
	const [pending, setPending] = useState<string | null>(null);
	const [deleting, setDeleting] = useState<Vehicle | null>(null);
	const [deleteBusy, setDeleteBusy] = useState(false);

	const load = useCallback(async () => {
		setError(null);
		try {
			const res = await fetch('/api/vehicles?sort=recent&limit=500');
			if (!res.ok) {
				const data = (await res.json().catch(() => null)) as { error?: string } | null;
				if (res.status === 401) {
					window.location.assign('/admin/login');
					return;
				}
				throw new Error(data?.error ?? 'No se pudo cargar el inventario.');
			}
			const data = (await res.json()) as { vehicles: Vehicle[] };
			setVehicles(data.vehicles);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error inesperado.');
		}
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const q = search.trim().toLowerCase();
	const filtered = (vehicles ?? []).filter((v) =>
		q
			? [v.title, v.brand, v.branch, v.stock_id, v.engine, String(v.year)]
					.filter(Boolean)
					.join(' ')
					.toLowerCase()
					.includes(q)
			: true,
	);

	async function toggleAvailable(v: Vehicle, next: boolean) {
		setPending(v.id);
		const previous = { ...v, available: v.available };
		setVehicles((list) => (list ?? []).map((item) => (item.id === v.id ? { ...item, available: next } : item)));
		try {
			const res = await fetch(`/api/vehicles/${v.id}/availability`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ available: next }),
			});
			if (!res.ok) {
				if (res.status === 401) window.location.assign('/admin/login');
				throw new Error('No se pudo actualizar la disponibilidad.');
			}
		} catch {
			setVehicles((list) => (list ?? []).map((item) => (item.id === previous.id ? previous : item)));
		} finally {
			setPending(null);
		}
	}

	async function confirmDelete() {
		if (!deleting) return;
		setDeleteBusy(true);
		try {
			const res = await fetch(`/api/vehicles/${deleting.id}`, { method: 'DELETE' });
			if (!res.ok) {
				if (res.status === 401) window.location.assign('/admin/login');
				throw new Error('No se pudo eliminar el vehículo.');
			}
			setVehicles((list) => (list ?? []).filter((v) => v.id !== deleting.id));
			setDeleting(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error al eliminar.');
		} finally {
			setDeleteBusy(false);
		}
	}

	const mobileCard = (v: Vehicle) => (
		<div key={v.id} className="border-b border-line p-4 last:border-b-0">
			<div className="flex gap-4">
				<a href={`/garage/${v.slug}`} className="relative block h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-surface-2">
					{rowImage(v) ? (
						<img src={rowImage(v)!} alt="" loading="lazy" className="h-full w-full object-cover" />
					) : null}
					{v.available && (
						<span className="absolute left-1.5 top-1.5 rounded bg-emerald-500/90 px-1.5 py-0.5 text-[0.625rem] font-bold text-white">
							DISPONIBLE
						</span>
					)}
				</a>
				<div className="min-w-0 flex-1">
					<a href={`/admin/vehiculos/${v.id}`} className="-my-1 block py-1 font-display text-sm font-semibold leading-snug text-ink hover:text-accent">
						{v.title}
					</a>
					<p className="mt-0.5 text-xs text-muted">
						{v.year ?? '—'} · {v.branch ?? '—'}
					</p>
					<p className="mt-1.5 font-display text-sm font-semibold text-ink">
						{formatMXN(v.cash_delivery_price)}
					</p>
					{v.advance_payment_price != null && (
						<p className="mt-0.5 text-xs text-muted">Apartado {formatMXN(v.advance_payment_price)}</p>
					)}
				</div>
			</div>
			<div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
				<Switch
					checked={v.available}
					disabled={pending === v.id}
					label={`Disponibilidad de ${v.title}`}
					onChange={(next) => void toggleAvailable(v, next)}
				/>
				<span className="text-xs font-medium text-soft">{v.available ? 'Visible' : 'Oculto'}</span>
				<a
					href={`/admin/vehiculos/${v.id}`}
					className="ml-auto inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-line-strong px-3 text-sm font-medium text-soft transition-colors hover:text-ink"
				>
					<PencilSimple size={15} weight="regular" />
					Editar
				</a>
				<button
					type="button"
					onClick={() => setDeleting(v)}
					className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-line-strong px-3 text-sm font-medium text-soft transition-colors hover:border-accent hover:text-accent"
				>
					<Trash size={15} weight="regular" />
					Eliminar
				</button>
			</div>
		</div>
	);

	return (
		<div>
			{error && (
				<div className="mb-5 flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-center">
					<span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-tint text-accent">
						<WarningCircle size={20} weight="regular" />
					</span>
					<p className="flex-1 text-sm text-soft">{error}</p>
					<button type="button" className="btn btn-outline btn-sm" onClick={() => void load()}>
						Reintentar
					</button>
				</div>
			)}

			<form className="relative mb-5 w-full max-w-sm" role="search" onSubmit={(e) => e.preventDefault()}>
				<MagnifyingGlass size={16} weight="regular" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
				<input
					type="search"
					className="input pl-9"
					placeholder="Buscar por título, marca, ID…"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					aria-label="Buscar vehículos en el panel"
				/>
			</form>

			{vehicles === null ? (
				<div className="overflow-hidden rounded-2xl border border-line bg-surface">
					{Array.from({ length: 6 }).map((_, i) => (
						<SkeletonRow key={i} />
					))}
				</div>
			) : vehicles.length === 0 ? (
				<div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
					<span className="grid h-12 w-12 place-items-center rounded-xl bg-surface-2 text-muted">
						<MagnifyingGlass size={22} weight="regular" />
					</span>
					<div>
						<h2 className="font-display text-lg font-semibold text-ink">Aún no hay vehículos</h2>
						<p className="mt-1 max-w-sm text-sm text-soft">
							Agrega tu primera unidad para empezar a mostrar el Garage, o siembra el catálogo inicial con{' '}
							<code className="font-mono text-xs">pnpm seed</code>.
						</p>
					</div>
					<a href="/admin/vehiculos/nuevo" className="btn btn-primary btn-sm">
						<Plus size={15} weight="bold" />
						Agregar vehículo
					</a>
				</div>
			) : filtered.length === 0 ? (
				<div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
					<p className="font-display text-base font-semibold text-ink">Sin resultados</p>
					<p className="text-sm text-soft">Ningún vehículo coincide con «{search}».</p>
					<button type="button" className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>
						Limpiar búsqueda
					</button>
				</div>
			) : (
				<>
					<div className="hidden overflow-hidden rounded-2xl border border-line bg-surface md:block">
						<table className="w-full text-left">
							<thead>
								<tr className="border-b border-line text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted">
									<th scope="col" className="px-5 py-3.5">Unidad</th>
									<th scope="col" className="px-5 py-3.5">Año / Sucursal</th>
									<th scope="col" className="px-5 py-3.5">Precio</th>
									<th scope="col" className="px-5 py-3.5">Disponible</th>
									<th scope="col" className="px-5 py-3.5 text-right">Acciones</th>
								</tr>
							</thead>
							<tbody>
								{filtered.map((v) => (
									<tr key={v.id} className="group border-b border-line transition-colors last:border-b-0 hover:bg-surface-2/50">
										<td className="px-5 py-4">
											<div className="flex items-center gap-4">
												<a href={`/garage/${v.slug}`} className="relative block h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-2">
													{rowImage(v) ? (
														<img src={rowImage(v)!} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
													) : null}
												</a>
												<div>
													<a href={`/admin/vehiculos/${v.id}`} className="font-display text-sm font-semibold text-ink transition-colors hover:text-accent">
														{v.title}
													</a>
													<p className="mt-0.5 text-xs text-muted">ID {v.stock_id ?? v.id.slice(0, 8)}</p>
												</div>
											</div>
										</td>
										<td className="px-5 py-4 text-sm text-soft">
											{v.year ?? '—'}
											<span className="text-muted"> · {v.branch ?? '—'}</span>
										</td>
										<td className="px-5 py-4">
											<p className="font-display text-sm font-semibold text-ink">{formatMXN(v.cash_delivery_price)}</p>
											{v.advance_payment_price != null && (
												<p className="text-xs text-muted">Apartado {formatMXN(v.advance_payment_price)}</p>
											)}
										</td>
										<td className="px-5 py-4">
											<Switch
												checked={v.available}
												disabled={pending === v.id}
												label={`Disponibilidad de ${v.title}`}
												onChange={(next) => void toggleAvailable(v, next)}
											/>
										</td>
										<td className="px-5 py-4">
											<div className="flex items-center justify-end gap-2">
												<a
													href={`/admin/vehiculos/${v.id}`}
													className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-2.5 py-1.5 text-xs font-medium text-soft transition-colors hover:text-ink"
												>
													<PencilSimple size={13} weight="regular" />
													<span className="hidden lg:inline">Editar</span>
												</a>
												<button
													type="button"
													onClick={() => setDeleting(v)}
													className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-2.5 py-1.5 text-xs font-medium text-soft transition-colors hover:border-accent hover:text-accent"
												>
													<Trash size={13} weight="regular" />
													<span className="hidden lg:inline">Eliminar</span>
												</button>
												<a href={`/garage/${v.slug}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line-strong text-soft transition-colors hover:text-ink" aria-label={`Ver ${v.title} en el sitio`}>
													<CaretRight size={14} weight="bold" />
												</a>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className="overflow-hidden rounded-2xl border border-line bg-surface md:hidden">
						{filtered.map(mobileCard)}
					</div>
				</>
			)}

			<ConfirmDialog
				open={deleting !== null}
				title="Eliminar vehículo"
				description={
					deleting
						? `Se eliminará «${deleting.title}» de forma permanente. Esta acción no se puede deshacer.`
						: ''
				}
				confirmLabel="Eliminar"
				busy={deleteBusy}
				onCancel={() => !deleteBusy && setDeleting(null)}
				onConfirm={() => void confirmDelete()}
			/>
		</div>
	);
}
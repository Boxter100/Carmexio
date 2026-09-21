import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CaretDown, Funnel, MagnifyingGlass, SlidersHorizontal, X } from '@phosphor-icons/react';
import type { Vehicle, VehicleFacets, VehicleList, VehicleSort } from '../../lib/types';
import VehicleCard from './VehicleCard';

const SORTS: { value: VehicleSort; label: string }[] = [
	{ value: 'recent', label: 'Más recientes' },
	{ value: 'price-asc', label: 'Precio: menor a mayor' },
	{ value: 'price-desc', label: 'Precio: mayor a menor' },
	{ value: 'year-desc', label: 'Año: más nuevo' },
	{ value: 'year-asc', label: 'Año: más antiguo' },
];

interface FacetOption {
	value: string;
	count: number;
}

function toOptions(map: Record<string, number>): FacetOption[] {
	return Object.entries(map)
		.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
		.map(([value, count]) => ({ value, count }));
}

interface State {
	search: string;
	brands: string[];
	vehicle_types: string[];
	transmissions: string[];
	drive_types: string[];
	branches: string[];
	available: boolean | null;
	min_price: string;
	max_price: string;
	min_year: string;
	max_year: string;
	sort: VehicleSort;
}

const INITIAL: State = {
	search: '',
	brands: [],
	vehicle_types: [],
	transmissions: [],
	drive_types: [],
	branches: [],
	available: null,
	min_price: '',
	max_price: '',
	min_year: '',
	max_year: '',
	sort: 'recent',
};

function stateToQuery(s: State, extra: Record<string, string> = {}): string {
	const p = new URLSearchParams();
	if (s.search.trim()) p.set('search', s.search.trim());
	if (s.brands.length) p.set('brands', s.brands.join(','));
	if (s.vehicle_types.length) p.set('vehicle_types', s.vehicle_types.join(','));
	if (s.transmissions.length) p.set('transmissions', s.transmissions.join(','));
	if (s.drive_types.length) p.set('drive_types', s.drive_types.join(','));
	if (s.branches.length) p.set('branches', s.branches.join(','));
	if (s.available !== null) p.set('available', String(s.available));
	if (s.min_price) p.set('min_price', s.min_price);
	if (s.max_price) p.set('max_price', s.max_price);
	if (s.min_year) p.set('min_year', s.min_year);
	if (s.max_year) p.set('max_year', s.max_year);
	p.set('sort', s.sort);
	Object.entries(extra).forEach(([k, v]) => p.set(k, v));
	return p.toString();
}

function hasActiveFilters(s: State): boolean {
	return Boolean(
		s.search ||
			s.brands.length ||
			s.vehicle_types.length ||
			s.transmissions.length ||
			s.drive_types.length ||
			s.branches.length ||
			s.available !== null ||
			s.min_price ||
			s.max_price ||
			s.min_year ||
			s.max_year ||
			s.sort !== 'recent',
	);
}

function initialFromQuery(): State {
	if (typeof window === 'undefined') return INITIAL;
	const p = new URLSearchParams(window.location.search);
	const list = (k: string) => (p.get(k)?.split(',').map((s) => s.trim()).filter(Boolean) ?? []) as string[];
	const av = p.get('available');
	return {
		search: p.get('search') ?? '',
		brands: list('brands'),
		vehicle_types: list('vehicle_types'),
		transmissions: list('transmissions'),
		drive_types: list('drive_types'),
		branches: list('branches'),
		available: av === 'true' ? true : av === 'false' ? false : null,
		min_price: p.get('min_price') ?? '',
		max_price: p.get('max_price') ?? '',
		min_year: p.get('min_year') ?? '',
		max_year: p.get('max_year') ?? '',
		sort: (p.get('sort') as VehicleSort) || 'recent',
	};
}

function toggle(list: string[], value: string): string[] {
	return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function FacetGroup({
	title,
	options,
	selected,
	onToggle,
}: {
	title: string;
	options: FacetOption[];
	selected: string[];
	onToggle: (value: string) => void;
}) {
	const [open, setOpen] = useState(true);
	if (options.length === 0) return null;
	return (
		<fieldset className="border-b border-line py-4 last:border-b-0">
			<legend className="flex w-full items-center justify-between">
				<span className="text-[0.8125rem] font-semibold text-ink">{title}</span>
				<button
					type="button"
					className="grid h-7 w-7 place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-ink"
					aria-expanded={open}
					onClick={() => setOpen((o) => !o)}
				>
					<CaretDown size={14} weight="bold" className={`transition-transform duration-200 ${open ? '' : '-rotate-90'}`} />
				</button>
			</legend>
			{open && (
				<div className="mt-2 flex flex-col gap-1">
					{options.map((opt) => {
						const checked = selected.includes(opt.value);
						return (
							<label
								key={opt.value}
								className="flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5 text-sm text-soft transition-colors hover:bg-surface-2 hover:text-ink"
							>
								<input
									type="checkbox"
									className="h-4 w-4 shrink-0 appearance-none rounded border border-line-strong bg-surface transition-all checked:border-accent checked:bg-accent"
									checked={checked}
									onChange={() => onToggle(opt.value)}
								/>
								<span className="flex-1">{opt.value}</span>
								<span className="text-xs text-muted">{opt.count}</span>
							</label>
						);
					})}
				</div>
			)}
		</fieldset>
	);
}

function SkeletonCard() {
	return (
		<div className="overflow-hidden rounded-2xl border border-line bg-surface">
			<div className="skeleton aspect-[4/3]" />
			<div className="space-y-3 p-5">
				<div className="skeleton h-4 w-2/3 rounded" />
				<div className="skeleton h-3 w-1/3 rounded" />
				<div className="mt-4 space-y-2">
					<div className="skeleton h-3 w-full rounded" />
					<div className="skeleton h-3 w-2/3 rounded" />
				</div>
				<div className="skeleton h-7 w-1/2 rounded" />
			</div>
		</div>
	);
}

export default function GarageExplorer({
	initial,
}: {
	initial: VehicleList;
}) {
	const [state, setState] = useState<State>(initialFromQuery);
	const [vehicles, setVehicles] = useState<Vehicle[]>(initial?.vehicles ?? []);
	const [facets, setFacets] = useState<VehicleFacets>(initial?.facets ?? { brands: {}, vehicle_types: {}, transmissions: {}, drive_types: {}, branches: {} });
	const [total, setTotal] = useState(initial?.total ?? 0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [open, setOpen] = useState(false);
	const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const mounted = useRef(false);

	const patch = useCallback((partial: Partial<State>) => {
		setState((s) => ({ ...s, ...partial }));
	}, []);

	const fetchBrands = useCallback(async (query: string) => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/vehicles?${query}`);
			if (!res.ok) throw new Error('No se pudo cargar el inventario.');
			const data = (await res.json()) as VehicleList;
			setVehicles(data.vehicles);
			setFacets(data.facets);
			setTotal(data.total);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Error inesperado.');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (!mounted.current) return;
		const query = stateToQuery(state);
		if (searchTimer.current) clearTimeout(searchTimer.current);
		searchTimer.current = setTimeout(() => void fetchBrands(query), 220);
		return () => {
			if (searchTimer.current) clearTimeout(searchTimer.current);
		};
	}, [state, fetchBrands]);

	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	const reset = useCallback(() => {
		setState(INITIAL);
	}, []);

	const active = hasActiveFilters(state);
	const predicateGroups = useMemo(
		() => [
			{ title: 'Marca', options: toOptions(facets.brands), selected: state.brands, key: 'brands' as const },
			{ title: 'Tipo de vehículo', options: toOptions(facets.vehicle_types), selected: state.vehicle_types, key: 'vehicle_types' as const },
			{ title: 'Transmisión', options: toOptions(facets.transmissions), selected: state.transmissions, key: 'transmissions' as const },
			{ title: 'Tracción', options: toOptions(facets.drive_types), selected: state.drive_types, key: 'drive_types' as const },
			{ title: 'Sucursal', options: toOptions(facets.branches), selected: state.branches, key: 'branches' as const },
		],
		[facets, state],
	);

	const filterPanel = (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between border-b border-line px-5 py-4">
				<span className="font-display text-sm font-semibold text-ink">Filtros</span>
				<button
					type="button"
					className="grid h-8 w-8 place-items-center rounded-lg text-soft hover:bg-surface-2 hover:text-ink lg:hidden"
					aria-label="Cerrar filtros"
					onClick={() => setOpen(false)}
				>
					<X size={18} weight="regular" />
				</button>
			</div>
			<div className="flex-1 overflow-y-auto px-5">
				<fieldset className="border-b border-line py-4">
					<legend><span className="text-[0.8125rem] font-semibold text-ink">Disponibilidad</span></legend>
					<div className="mt-2">
						<label className="flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5 text-sm text-soft">
							<input
								type="checkbox"
								checked={state.available === true}
								onChange={() => patch({ available: state.available === true ? null : true })}
								className="h-4 w-4 appearance-none rounded border border-line-strong bg-surface transition-all checked:border-accent checked:bg-accent"
							/>
							Solo disponibles
						</label>
					</div>
				</fieldset>
				{predicateGroups.map((g) => (
					<FacetGroup
						key={g.key}
						title={g.title}
						options={g.options}
						selected={g.selected}
						onToggle={(value) =>
							patch({ [g.key]: toggle(g.selected, value) } as Partial<State>)
						}
					/>
				))}
				<fieldset className="border-b border-line py-4 last:border-b-0">
					<legend className="text-[0.8125rem] font-semibold text-ink">Precio (MXN)</legend>
					<div className="mt-2 grid grid-cols-2 gap-2">
						<label className="field-label">
							<span className="mb-1 block text-xs text-muted">Mínimo</span>
							<input
								type="number"
								inputMode="numeric"
								className="input input-sm"
								placeholder="0"
								value={state.min_price}
								onChange={(e) => patch({ min_price: e.target.value })}
							/>
						</label>
						<label className="field-label">
							<span className="mb-1 block text-xs text-muted">Máximo</span>
							<input
								type="number"
								inputMode="numeric"
								className="input input-sm"
								placeholder="Sin límite"
								value={state.max_price}
								onChange={(e) => patch({ max_price: e.target.value })}
							/>
						</label>
					</div>
				</fieldset>
				<fieldset className="border-b border-line py-4 last:border-b-0">
					<legend className="text-[0.8125rem] font-semibold text-ink">Año</legend>
					<div className="mt-2 grid grid-cols-2 gap-2">
						<label className="field-label">
							<span className="mb-1 block text-xs text-muted">Desde</span>
							<input
								type="number"
								inputMode="numeric"
								className="input input-sm"
								placeholder="2015"
								value={state.min_year}
								onChange={(e) => patch({ min_year: e.target.value })}
							/>
						</label>
						<label className="field-label">
							<span className="mb-1 block text-xs text-muted">Hasta</span>
							<input
								type="number"
								inputMode="numeric"
								className="input input-sm"
								placeholder="2024"
								value={state.max_year}
								onChange={(e) => patch({ max_year: e.target.value })}
							/>
						</label>
					</div>
				</fieldset>
			</div>
			<div className="border-t border-line p-4">
				<button type="button" className="btn btn-ghost btn-block" onClick={() => { reset(); setOpen(false); }}>
					Limpiar filtros
				</button>
			</div>
		</div>
	);

	return (
		<section className="wrap pb-20 pt-10 lg:pt-14">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="eyebrow">Inventario</p>
					<h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">Garage</h1>
					<p className="mt-2 max-w-md text-[0.9375rem] text-soft">
						Cada unidad pasa por una revisión de 170 puntos y se entrega detallada, lista y
						documentada.
					</p>
				</div>
				<form
					className="relative w-full sm:max-w-xs"
					role="search"
					onSubmit={(e) => e.preventDefault()}
				>
					<MagnifyingGlass
						size={16}
						weight="regular"
						className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
					/>
					<input
						type="search"
						className="input pl-9"
						placeholder="Buscar marca, modelo, motor…"
						value={state.search}
						onChange={(e) => patch({ search: e.target.value })}
						aria-label="Buscar vehículos"
					/>
				</form>
			</div>

			<div className="mt-10 flex flex-col gap-8 lg:flex-row">
				<aside className="hidden w-64 shrink-0 lg:block">
					<div className="sticky top-24 rounded-2xl border border-line bg-surface">
						{filterPanel}
					</div>
				</aside>

				{/* Panel de filtros móvil */}
				<div className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`}>
					<div
						className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
						onClick={() => setOpen(false)}
						aria-hidden="true"
					/>
					<aside
						className={`absolute left-0 top-0 flex h-full w-[min(21rem,90vw)] max-w-full flex-col border-r border-line bg-background shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${open ? 'translate-x-0' : '-translate-x-full'}`}
						role="dialog"
						aria-modal="true"
						aria-label="Filtros del Garage"
					>
						{filterPanel}
					</aside>
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<p className="text-sm text-soft" aria-live="polite">
							{loading ? 'Actualizando…' : (
								<>
									<strong className="font-semibold text-ink">{total}</strong>{' '}
									{total === 1 ? 'vehículo' : 'vehículos'}
								</>
							)}
						</p>
						<div className="flex items-center gap-2">
							<button
								type="button"
								className="btn btn-outline btn-sm lg:hidden"
								onClick={() => setOpen(true)}
							>
								<Funnel size={15} weight="regular" />
								Filtros
								{active && (
									<span className="grid h-4 w-4 place-items-center rounded-full bg-accent text-[10px] font-bold text-accent-contrast">!</span>
								)}
							</button>
							{active && (
								<button
									type="button"
									className="btn btn-ghost btn-sm"
									onClick={reset}
								>
									<X size={14} weight="bold" />
									Limpiar
								</button>
							)}
							<label className="relative">
								<span className="sr-only">Ordenar</span>
								<SlidersHorizontal
									size={15}
									weight="regular"
									className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
								/>
								<select
									className="input input-sm cursor-pointer appearance-none pl-9 pr-9"
									value={state.sort}
									onChange={(e) => patch({ sort: e.target.value as VehicleSort })}
									aria-label="Ordenar resultados"
								>
									{SORTS.map((s) => (
										<option key={s.value} value={s.value}>
											{s.label}
										</option>
									))}
								</select>
								<CaretDown
									size={13}
									weight="bold"
									className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
								/>
							</label>
						</div>
					</div>

					{error ? (
						<div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-line bg-surface px-6 py-14 text-center">
							<span className="grid h-12 w-12 place-items-center rounded-xl bg-accent-tint text-accent">
								<SlidersHorizontal size={22} weight="regular" />
							</span>
							<div>
								<h2 className="font-display text-lg font-semibold text-ink">No pudimos cargar el inventario</h2>
								<p className="mt-1 text-sm text-soft">{error}</p>
							</div>
							<button type="button" className="btn btn-primary btn-sm" onClick={() => void fetchBrands(stateToQuery(state))}>
								Reintentar
							</button>
						</div>
					) : loading && vehicles.length === 0 ? (
						<div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
							{Array.from({ length: 6 }).map((_, i) => (
								<SkeletonCard key={i} />
							))}
						</div>
					) : vehicles.length === 0 ? (
						<div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
							<span className="grid h-12 w-12 place-items-center rounded-xl bg-surface-2 text-muted">
								<MagnifyingGlass size={22} weight="regular" />
							</span>
							<div>
								<h2 className="font-display text-lg font-semibold text-ink">Sin resultados</h2>
								<p className="mt-1 max-w-sm text-sm text-soft">
									Ningún vehículo coincide con tu búsqueda. Prueba con otros filtros o consulta el
									Garage completo.
								</p>
							</div>
							<button type="button" className="btn btn-primary btn-sm" onClick={() => { reset(); setOpen(false); }}>
								Ver todo el inventario
							</button>
						</div>
					) : (
						<ul
							className={`mt-8 grid grid-cols-1 gap-6 transition-opacity duration-200 sm:grid-cols-2 xl:grid-cols-3 ${
								loading ? 'pointer-events-none opacity-60' : ''
							}`}
						>
							{vehicles.map((v) => (
								<li key={v.id}>
									<VehicleCard vehicle={v} />
								</li>
							))}
						</ul>
					)}

					{!loading && vehicles.length > 0 && total > vehicles.length && (
						<p className="mt-8 text-center text-sm text-muted">
							Mostrando {vehicles.length} de {total} vehículos
						</p>
					)}
				</div>
			</div>
		</section>
	);
}
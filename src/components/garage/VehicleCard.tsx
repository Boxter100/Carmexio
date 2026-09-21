import { Calendar, Gauge, Crosshair, GearSix, ArrowUpRight } from '@phosphor-icons/react';
import type { Vehicle } from '../../lib/types';
import { displayPrice, formatMiles } from '../../lib/format';

function firstImages(v: Vehicle) {
	const sorted = [...v.images].sort((a, b) => a.order - b.order);
	return { cover: sorted[0] ?? null, hover: sorted[1] ?? null };
}

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
	const { cover, hover } = firstImages(vehicle);
	const price = displayPrice(vehicle);
	const href = `/garage/${vehicle.slug}`;
	const alt = cover?.alt || `${vehicle.brand} ${vehicle.model ?? ''} ${vehicle.year ?? ''}`.trim();

	return (
		<article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.35)]">
			<div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
				<a href={href} tabIndex={-1} aria-hidden="true" className="block h-full w-full">
					{cover ? (
						<img
							src={cover.display_url ?? cover.url}
							alt={alt}
							loading="lazy"
							decoding="async"
							className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
						/>
					) : (
						<div className="grid h-full w-full place-items-center text-muted">
							<GearSix size={40} weight="thin" />
						</div>
					)}
					{hover && (
						<img
							src={hover.display_url ?? hover.url}
							alt=""
							loading="lazy"
							decoding="async"
							className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
						/>
					)}
				</a>
				<div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3">
					<span className="chip bg-surface/90 backdrop-blur">
						<span className="font-semibold">{vehicle.brand}</span>
						<span className="text-muted">·</span>
						<span>{vehicle.year ?? '—'}</span>
					</span>
					{vehicle.available ? (
						<span className="badge badge-available bg-surface/90 backdrop-blur">Disponible</span>
					) : (
						<span className="badge badge-neutral bg-surface/90 backdrop-blur">Apartado</span>
					)}
				</div>
			</div>

			<div className="flex flex-1 flex-col p-5">
				<h3 className="font-display text-lg font-semibold leading-snug tracking-tight">
					<a href={href} className="transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-accent">
						{vehicle.title}
					</a>
				</h3>
				{vehicle.vehicle_type && (
					<p className="mt-0.5 text-xs font-medium uppercase tracking-[0.12em] text-muted">
						{vehicle.vehicle_type}
					</p>
				)}

				<ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-[0.8125rem] text-soft">
					<li className="flex items-center gap-1.5">
						<Calendar size={14} weight="regular" className="text-muted" />
						{vehicle.year ?? '—'}
					</li>
					<li className="flex items-center gap-1.5">
						<Gauge size={14} weight="regular" className="text-muted" />
						{formatMiles(vehicle.mileage)}
					</li>
					<li className="flex items-center gap-1.5">
						<GearSix size={14} weight="regular" className="text-muted" />
						{vehicle.transmission ?? '—'}
					</li>
					<li className="flex items-center gap-1.5">
						<Crosshair size={14} weight="regular" className="text-muted" />
						{vehicle.drive_type ?? '—'}
					</li>
				</ul>

				<div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-4">
					<div>
						<p className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-muted">
							{vehicle.advance_payment_price != null && vehicle.cash_delivery_price != null
								? 'Apartado'
								: 'Contra entrega'}
						</p>
						<p className="font-display text-xl font-semibold tracking-tight text-ink">
							{price.main}
						</p>
						{price.secondary && <p className="mt-0.5 text-xs text-muted">{price.secondary}</p>}
					</div>
					<a
						href={href}
						className="mb-0.5 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-accent transition-colors hover:text-accent-strong"
					>
						Ver detalle
						<ArrowUpRight size={14} weight="bold" className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
					</a>
				</div>
			</div>
		</article>
	);
}
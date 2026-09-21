import { useCallback, useEffect, useMemo, useState } from 'react';
import { CaretLeft, CaretRight, ArrowsOutSimple } from '@phosphor-icons/react';
import type { VehicleImage } from '../../lib/types';

export default function VehicleGallery({ images }: { images: VehicleImage[] }) {
	const sorted = useMemo(() => [...images].sort((a, b) => a.order - b.order), [images]);
	const [index, setIndex] = useState(0);
	const [lightbox, setLightbox] = useState(false);

	const current = sorted[Math.min(index, Math.max(0, sorted.length - 1))];
	const currentIndex = Math.max(0, sorted.indexOf(current));

	const prev = useCallback(() => setIndex((i) => (i - 1 + sorted.length) % sorted.length), [sorted.length]);
	const next = useCallback(() => setIndex((i) => (i + 1) % sorted.length), [sorted.length]);

	useEffect(() => {
		if (!lightbox) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setLightbox(false);
			if (e.key === 'ArrowLeft') prev();
			if (e.key === 'ArrowRight') next();
		};
		document.addEventListener('keydown', onKey);
		const overflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.removeEventListener('keydown', onKey);
			document.body.style.overflow = overflow;
		};
	}, [lightbox, prev, next]);

	if (sorted.length === 0) {
		return (
			<div className="grid aspect-[4/3] place-items-center rounded-2xl border border-line bg-surface-2 text-muted">
				Sin imágenes disponibles
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<div className="group relative overflow-hidden rounded-2xl border border-line bg-surface-2">
				<img
					key={current.url}
					src={current.display_url ?? current.url}
					alt={current.alt || 'Imagen del vehículo'}
					className="aspect-[4/3] w-full object-cover"
				/>
				<button
					type="button"
					className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg bg-surface/90 text-soft backdrop-blur transition-colors hover:text-ink"
					onClick={() => setLightbox(true)}
					aria-label="Ver imagen a pantalla completa"
				>
					<ArrowsOutSimple size={16} weight="regular" />
				</button>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						prev();
					}}
					className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-surface/85 text-soft opacity-0 backdrop-blur transition-opacity duration-200 hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
					aria-label="Imagen anterior"
					disabled={sorted.length <= 1}
				>
					<CaretLeft size={18} weight="bold" />
				</button>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						next();
					}}
					className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-surface/85 text-soft opacity-0 backdrop-blur transition-opacity duration-200 hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
					aria-label="Imagen siguiente"
					disabled={sorted.length <= 1}
				>
					<CaretRight size={18} weight="bold" />
				</button>
				<span className="absolute bottom-3 right-3 rounded-md bg-black/55 px-2 py-1 font-mono text-xs font-medium text-white">
					{currentIndex + 1} / {sorted.length}
				</span>
			</div>

			{/* Lightbox */}
			{lightbox && (
				<div
					className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
					role="dialog"
					aria-modal="true"
					aria-label="Vista ampliada del vehículo"
					onClick={() => setLightbox(false)}
				>
					<button
						type="button"
						className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
						aria-label="Cerrar vista ampliada"
						onClick={() => setLightbox(false)}
					>
						<ArrowsOutSimple size={18} weight="regular" className="rotate-45" />
					</button>
					<img
						src={current.url || current.display_url || current.url}
						alt={current.alt || 'Imagen del vehículo'}
						className="max-h-[85dvh] max-w-full rounded-xl object-contain shadow-2xl"
						onClick={(e) => e.stopPropagation()}
					/>
				</div>
			)}

			{sorted.length > 1 && (
				<div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-5">
					{sorted.map((img, i) => (
						<button
							type="button"
							key={img.url}
							className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-surface-2 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-accent"
							style={{
								borderColor: i === currentIndex ? 'var(--accent)' : 'var(--border)',
							}}
							onClick={() => setIndex(i)}
							aria-label={`Ver imagen ${i + 1}`}
							aria-current={i === currentIndex}
						>
							<img
								src={img.display_url ?? img.url}
								alt=""
								loading="lazy"
								className="h-full w-full object-cover"
							/>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
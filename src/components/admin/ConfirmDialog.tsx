import { useEffect, useRef } from 'react';
import { Trash } from '@phosphor-icons/react';

interface Props {
	open: boolean;
	title: string;
	description: string;
	confirmLabel?: string;
	busy?: boolean;
	onCancel: () => void;
	onConfirm: () => void;
}

export default function ConfirmDialog({
	open,
	title,
	description,
	confirmLabel = 'Confirmar',
	busy = false,
	onCancel,
	onConfirm,
}: Props) {
	const cancelRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (open) cancelRef.current?.focus();
	}, [open]);

	useEffect(() => {
		if (!open) return;
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape' && !busy) onCancel();
		}
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [open, busy, onCancel]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={title}>
			<button
				type="button"
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={() => !busy && onCancel()}
				tabIndex={-1}
				aria-label="Cerrar"
			/>
			<div className="relative w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-2xl">
				<span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-tint text-accent">
					<Trash size={20} weight="regular" />
				</span>
				<h2 className="mt-4 font-display text-lg font-semibold tracking-tight text-ink">{title}</h2>
				<p className="mt-1.5 text-sm leading-relaxed text-soft">{description}</p>
				<div className="mt-6 flex justify-end gap-2.5">
					<button ref={cancelRef} type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
						Cancelar
					</button>
					<button
						type="button"
						className="btn btn-danger"
						onClick={onConfirm}
						disabled={busy}
					>
						{busy ? 'Eliminando…' : confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}
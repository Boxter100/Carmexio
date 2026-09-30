import { useCallback, useRef, useState } from 'react';
import {
	DndContext,
	DragOverlay,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
	type Announcements,
	type DragEndEvent,
	type DragStartEvent,
} from '@dnd-kit/core';
import {
	SortableContext,
	arrayMove,
	rectSortingStrategy,
	sortableKeyboardCoordinates,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CircleNotch, ImageSquare, Trash, UploadSimple, WarningCircle } from '@phosphor-icons/react';
import ConfirmDialog from './ConfirmDialog';
import {
	ACCEPTED_IMAGE_EXT,
	ACCEPTED_IMAGE_MIME,
	MAX_IMAGE_BYTES,
	MAX_IMAGES_PER_VEHICLE,
	storagePathFromUrl,
} from '../../lib/storage';

/** Etiqueta del límite de tamaño, derivada de la constante para que no se desincronice. */
const MAX_MB_LABEL = (MAX_IMAGE_BYTES / (1024 * 1024)).toFixed(1).replace('.0', '');

export interface ImageDraft {
	url: string;
	display_url: string;
	alt: string;
	width?: number | null;
	height?: number | null;
}

interface PendingUpload {
	id: string;
	name: string;
	preview: string;
}

interface Props {
	images: ImageDraft[];
	onChange: (images: ImageDraft[]) => void;
	slug: string;
	onBusyChange?: (busy: boolean) => void;
	error?: string;
}

function SortableTile({
	image,
	index,
	total,
	onAlt,
	onRemove,
}: {
	image: ImageDraft;
	index: number;
	total: number;
	onAlt: (value: string) => void;
	onRemove: () => void;
}) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: image.url,
	});

	return (
		<li
			ref={setNodeRef}
			style={{ transform: CSS.Transform.toString(transform), transition }}
			className={`flex flex-col gap-2 rounded-xl border border-line bg-surface-2/60 p-3 ${
				isDragging ? 'z-10 opacity-40' : ''
			}`}
		>
			<div
				{...attributes}
				{...listeners}
				className="relative aspect-[4/3] shrink-0 cursor-grab touch-none select-none overflow-hidden rounded-lg border border-line bg-surface active:cursor-grabbing"
				aria-label={`Mover imagen ${index + 1} de ${total}. Usa las flechas para reordenar.`}
			>
				<img
					src={image.display_url || image.url}
					alt=""
					draggable={false}
					loading="lazy"
					className="pointer-events-none h-full w-full object-cover"
				/>
				{index === 0 && (
					<span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[0.625rem] font-bold text-white">
						PORTA
					</span>
				)}
				<span className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[0.625rem] font-bold text-white">
					{index + 1}
				</span>
			</div>

			<input
				className="input input-sm"
				value={image.alt}
				onChange={(e) => onAlt(e.target.value)}
				placeholder="Texto alternativo…"
				aria-label={`Texto alternativo de la imagen ${index + 1}`}
			/>

			<button
				type="button"
				onClick={onRemove}
				className="btn btn-ghost btn-sm self-start text-accent"
				aria-label={`Quitar imagen ${index + 1}`}
			>
				<Trash size={14} weight="regular" />
				Quitar
			</button>
		</li>
	);
}

export default function ImageUploader({ images, onChange, slug, onBusyChange, error }: Props) {
	const [dragging, setDragging] = useState(false);
	const [pending, setPending] = useState<PendingUpload[]>([]);
	const [rejected, setRejected] = useState<string[]>([]);
	const [notice, setNotice] = useState<string | null>(null);
	const [disabled, setDisabled] = useState(false);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [toDelete, setToDelete] = useState<ImageDraft | null>(null);
	const [deleting, setDeleting] = useState(false);
	const dragDepth = useRef(0);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

	const position = useCallback(
		(id: string | number) => images.findIndex((i) => i.url === id) + 1,
		[images],
	);

	const announcements: Announcements = {
		onDragStart: ({ active }) => `Se levantó la imagen ${position(active.id)}.`,
		onDragOver: ({ active, over }) =>
			over ? `La imagen ${position(active.id)} está sobre la posición ${position(over.id)}.` : '',
		onDragEnd: ({ active, over }) =>
			over ? `La imagen quedó en la posición ${position(over.id)}.` : 'Se canceló el reordenado.',
		onDragCancel: ({ active }) => `Se canceló el reordenado de la imagen ${position(active.id)}.`,
	};

	const setBusy = useCallback(
		(busy: boolean) => {
			onBusyChange?.(busy);
		},
		[onBusyChange],
	);

	const upload = useCallback(
		async (files: File[]) => {
			const accepted = files.filter((f) => f.type === ACCEPTED_IMAGE_MIME || f.name.toLowerCase().endsWith(ACCEPTED_IMAGE_EXT));
			const wrongType = files.filter((f) => !accepted.includes(f));
			const tooBig = accepted.filter((f) => f.size > MAX_IMAGE_BYTES);
			const room = MAX_IMAGES_PER_VEHICLE - images.length - pending.length;
			const overflowing = accepted.filter((f) => !tooBig.includes(f)).slice(Math.max(room, 0));
			const queue = accepted.filter((f) => !tooBig.includes(f)).slice(0, Math.max(room, 0));

			const messages: string[] = [];
			if (wrongType.length) messages.push(`No son .webp: ${wrongType.map((f) => f.name).join(', ')}.`);
			if (tooBig.length) messages.push(`Superan ${MAX_MB_LABEL} MB: ${tooBig.map((f) => f.name).join(', ')}.`);
			if (overflowing.length) messages.push(`Máximo ${MAX_IMAGES_PER_VEHICLE} imágenes por vehículo.`);
			setRejected(messages);
			if (!queue.length) return;

			const items: PendingUpload[] = queue.map((file) => ({
				id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
				name: file.name,
				preview: URL.createObjectURL(file),
			}));
			setPending((p) => [...p, ...items]);
			setBusy(true);

			let collected: ImageDraft[] = [];
			for (let i = 0; i < queue.length; i += 1) {
				const file = queue[i]!;
				const item = items[i]!;
				const form = new FormData();
				form.append('file', file);
				form.append('folder', slug);
				try {
					const res = await fetch('/api/uploads', { method: 'POST', body: form });
					const data = (await res.json().catch(() => null)) as {
						url?: string;
						display_url?: string;
						width?: number;
						height?: number;
						warning?: string | null;
						error?: string;
					} | null;
					if (res.status === 401) {
						window.location.assign('/admin/login');
						return;
					}
					if (res.status === 503) {
						setDisabled(true);
						setNotice(data?.error ?? 'Las subidas requieren Supabase configurado.');
						continue;
					}
					if (!res.ok || !data?.url) throw new Error(data?.error ?? 'No se pudo subir el archivo.');
					if (data.warning) setNotice(data.warning);
					collected.push({
						url: data.url,
						display_url: data.display_url ?? data.url,
						alt: '',
						width: data.width ?? null,
						height: data.height ?? null,
					});
				} catch (err) {
					setRejected([err instanceof Error ? err.message : `Falló la subida de ${file.name}.`]);
				} finally {
					URL.revokeObjectURL(item.preview);
					setPending((p) => p.filter((x) => x.id !== item.id));
				}
			}

			if (collected.length) {
				const seen = new Set(images.map((i) => i.url));
				collected = collected.filter((i) => !seen.has(i.url));
				if (collected.length) onChange([...images, ...collected]);
			}
			setBusy(false);
		},
		[images, pending.length, slug, onChange, setBusy],
	);

	const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files ?? []);
		e.target.value = '';
		if (files.length) void upload(files);
	};

	const onDrop = (e: React.DragEvent) => {
		e.preventDefault();
		dragDepth.current = 0;
		setDragging(false);
		if (disabled) return;
		const files = Array.from(e.dataTransfer.files ?? []);
		if (files.length) void upload(files);
	};

	const onDragEnd = ({ active, over }: DragEndEvent) => {
		setActiveId(null);
		if (!over || active.id === over.id) return;
		const from = images.findIndex((i) => i.url === active.id);
		const to = images.findIndex((i) => i.url === over.id);
		if (from < 0 || to < 0) return;
		onChange(arrayMove(images, from, to));
	};

	const onDragStart = ({ active }: DragStartEvent) => setActiveId(String(active.id));

	async function confirmRemove() {
		const target = toDelete;
		if (!target) return;
		setDeleting(true);
		const path = storagePathFromUrl(target.url);
		if (path) {
			try {
				const res = await fetch(`/api/uploads?path=${encodeURIComponent(path)}`, { method: 'DELETE' });
				if (res.status === 401) {
					window.location.assign('/admin/login');
					return;
				}
				if (!res.ok) {
					const data = (await res.json().catch(() => null)) as { error?: string } | null;
					throw new Error(data?.error ?? 'No se pudo borrar el archivo.');
				}
			} catch (err) {
				setRejected([err instanceof Error ? err.message : 'No se pudo borrar el archivo.']);
				setDeleting(false);
				setToDelete(null);
				return;
			}
		}
		onChange(images.filter((i) => i.url !== target.url));
		setDeleting(false);
		setToDelete(null);
	}

	const active = activeId ? images.find((i) => i.url === activeId) : null;
	const full = images.length + pending.length >= MAX_IMAGES_PER_VEHICLE;

	return (
		<div className="grid gap-4">
			<p className="text-xs leading-relaxed text-muted">
				Arrastra tus fotos aquí o haz clic para elegirlas. Solo se aceptan archivos{' '}
				<code className="font-mono">.webp</code> de hasta {MAX_MB_LABEL} MB. La primera imagen es la portada:
				arrastra las miniaturas para reordenarlas.
			</p>

			{error && (
				<p className="flex items-center gap-2 rounded-xl bg-accent-tint px-4 py-3 text-sm font-medium text-accent">
					<WarningCircle size={16} weight="regular" />
					{error}
				</p>
			)}

			{notice && (
				<p className="flex items-center gap-2 rounded-xl bg-accent-tint px-4 py-3 text-sm font-medium text-accent" role="alert">
					<WarningCircle size={16} weight="regular" />
					{notice}
				</p>
			)}

			{rejected.length > 0 && (
				<ul className="grid gap-1 rounded-xl bg-accent-tint px-4 py-3 text-sm font-medium text-accent" role="alert">
					{rejected.map((msg) => (
						<li key={msg} className="flex items-start gap-2">
							<WarningCircle size={16} weight="regular" className="mt-0.5 shrink-0" />
							<span>{msg}</span>
						</li>
					))}
				</ul>
			)}

			<label
				className="dropzone"
				data-drag={dragging}
				onDragEnter={(e) => {
					e.preventDefault();
					dragDepth.current += 1;
					setDragging(true);
				}}
				onDragOver={(e) => e.preventDefault()}
				onDragLeave={(e) => {
					e.preventDefault();
					dragDepth.current -= 1;
					if (dragDepth.current <= 0) setDragging(false);
				}}
				onDrop={onDrop}
			>
				<input
					type="file"
					multiple
					accept={`${ACCEPTED_IMAGE_EXT},${ACCEPTED_IMAGE_MIME}`}
					className="sr-only"
					onChange={onFileInput}
					disabled={disabled || full}
					aria-label="Subir imágenes .webp"
				/>
				<UploadSimple size={24} weight="regular" className="text-accent" />
				<span className="text-sm font-semibold text-ink">
					{disabled
						? 'Subidas no disponibles'
						: full
							? `Alcanzaste el máximo de ${MAX_IMAGES_PER_VEHICLE} imágenes`
							: 'Arrastra tus imágenes .webp aquí'}
				</span>
				<span className="text-xs text-muted">
					{disabled ? 'Configura Supabase para habilitar las subidas.' : 'o haz clic para seleccionarlas'}
				</span>
			</label>

			{(images.length > 0 || pending.length > 0) && (
				<div className="flex items-center justify-between gap-2 text-xs text-muted">
					<span>
						{images.length} {images.length === 1 ? 'imagen' : 'imágenes'}
						{pending.length > 0 && ` · ${pending.length} subiendo`}
					</span>
					<span>Arrastra las miniaturas para reordenar</span>
				</div>
			)}

			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={onDragStart}
				onDragEnd={onDragEnd}
				onDragCancel={() => setActiveId(null)}
				accessibility={{ announcements }}
			>
				<SortableContext items={images.map((i) => i.url)} strategy={rectSortingStrategy}>
					<ul
						aria-label="Imágenes del vehículo"
						className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
					>
						{images.map((img, i) => (
							<SortableTile
								key={img.url}
								image={img}
								index={i}
								total={images.length}
								onAlt={(value) =>
									onChange(images.map((x, j) => (j === i ? { ...x, alt: value } : x)))
								}
								onRemove={() => setToDelete(img)}
							/>
						))}
						{pending.map((p) => (
							<li
								key={p.id}
								className="flex flex-col gap-2 rounded-xl border border-line bg-surface-2/60 p-3"
							>
								<div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line bg-surface">
									<img src={p.preview} alt="" className="h-full w-full object-cover opacity-50" />
									<span className="absolute inset-0 grid place-items-center bg-black/40 text-white">
										<CircleNotch size={22} weight="bold" className="animate-spin" />
									</span>
								</div>
								<p className="truncate text-xs text-muted" title={p.name}>
									{p.name}
								</p>
								<span className="text-xs text-muted">Subiendo…</span>
							</li>
						))}
					</ul>
				</SortableContext>

				<DragOverlay>
					{active && (
						<div className="aspect-[4/3] w-32 overflow-hidden rounded-lg border border-line bg-surface shadow-2xl">
							<img
								src={active.display_url || active.url}
								alt=""
								className="h-full w-full object-cover"
							/>
						</div>
					)}
				</DragOverlay>
			</DndContext>

			{images.length === 0 && pending.length === 0 && (
				<p className="flex items-center gap-2 text-xs text-muted">
					<ImageSquare size={15} weight="regular" />
					Todavía no hay imágenes para este vehículo.
				</p>
			)}

			{toDelete && (
				<ConfirmDialog
					open
					busy={deleting}
					title="Quitar imagen"
					description="Se quitará del vehículo y se borrará el archivo del almacenamiento. Esta acción no se puede deshacer."
					confirmLabel="Quitar y borrar"
					onCancel={() => !deleting && setToDelete(null)}
					onConfirm={() => void confirmRemove()}
				/>
			)}
		</div>
	);
}

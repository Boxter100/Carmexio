import { useEffect, useState } from 'react';
import { List, X } from '@phosphor-icons/react';
import { NAV_LINKS } from '../lib/site';

function isActive(pathname: string, href: string): boolean {
	if (href === '/') return pathname === '/';
	return pathname.startsWith(href);
}

export default function MobileNav({ pathname }: { pathname: string }) {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false);
		};
		document.addEventListener('keydown', onKey);
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.removeEventListener('keydown', onKey);
			document.body.style.overflow = previousOverflow;
		};
	}, [open]);

	return (
		<>
			<button
				type="button"
				className="grid h-9 w-9 place-items-center rounded-lg text-soft transition-colors hover:bg-surface-2 hover:text-ink"
				aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
				aria-expanded={open}
				aria-controls="mobile-nav"
				onClick={() => setOpen((o) => !o)}
			>
				{open ? <X size={20} weight="regular" /> : <List size={20} weight="regular" />}
			</button>

			<div
				id="mobile-nav"
				className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`}
			>
				<div
					className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${
						open ? 'opacity-100' : 'opacity-0'
					}`}
					onClick={() => setOpen(false)}
					aria-hidden="true"
				/>
				<aside
					className={`absolute right-0 top-0 flex h-full w-[min(21rem,88vw)] flex-col border-l border-line bg-background shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
						open ? 'translate-x-0' : 'translate-x-full'
					}`}
					role="dialog"
					aria-modal="true"
					aria-label="Menú de navegación"
				>
					<div className="flex h-16 items-center justify-between border-b border-line px-5">
						<span className="font-display text-base font-semibold tracking-tight text-ink">
							Menú
						</span>
						<button
							type="button"
							className="grid h-9 w-9 place-items-center rounded-lg text-soft hover:bg-surface-2 hover:text-ink"
							aria-label="Cerrar menú"
							onClick={() => setOpen(false)}
						>
							<X size={20} weight="regular" />
						</button>
					</div>
					<nav className="flex flex-col gap-1 overflow-y-auto p-4" aria-label="Principal">
						{NAV_LINKS.map((link, i) => {
							const active = isActive(pathname, link.href);
							return (
								<a
									key={link.href}
									href={link.href}
									onClick={() => setOpen(false)}
									className={`flex items-center justify-between rounded-xl px-4 py-3 text-[0.9375rem] font-medium transition-colors ${
										active
											? 'bg-surface text-ink ring-1 ring-line'
											: 'text-soft hover:bg-surface-2 hover:text-ink'
									}`}
								>
									{link.label}
									<span
										className={`h-1.5 w-1.5 rounded-full bg-accent transition-opacity ${
											active ? 'opacity-100' : 'opacity-0'
										}`}
									/>
								</a>
							);
						})}
					</nav>
					<div className="mt-auto border-t border-line p-4">
						<a
							href={pathname.startsWith('/admin') ? '/admin' : '/admin/login'}
							className="btn btn-outline btn-block"
							onClick={() => setOpen(false)}
						>
							{pathname.startsWith('/admin') ? 'Ir al panel' : 'Acceso'}
						</a>
					</div>
				</aside>
			</div>
		</>
	);
}
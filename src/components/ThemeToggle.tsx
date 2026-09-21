import { useEffect, useState } from 'react';
import { Moon, Sun } from '@phosphor-icons/react';

type Theme = 'light' | 'dark';

function resolveInitial(): Theme {
	if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
		return 'dark';
	}
	return 'light';
}

export default function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>(resolveInitial);

	useEffect(() => {
		const root = document.documentElement;
		root.classList.toggle('dark', theme === 'dark');
		try {
			localStorage.setItem('carmexio-theme', theme);
		} catch {}
	}, [theme]);

	return (
		<button
			type="button"
			title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
			aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
			onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
			className="grid h-9 w-9 place-items-center rounded-lg text-soft transition-colors hover:bg-surface-2 hover:text-ink"
		>
			<span key={theme} className="theme-icon">
				{theme === 'dark' ? <Sun size={18} weight="regular" /> : <Moon size={18} weight="regular" />}
			</span>
		</button>
	);
}
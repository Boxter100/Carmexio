export const SITE = {
	name: 'Carmexio',
	tagline: 'Autos premium, precios honestos.',
	url: 'https://carmexio.com.mx',
	email: 'hola@carmexio.mx',
	phone: '(55) 0000 0000',
} as const;

export const NAV_LINKS = [
	{ href: '/', label: 'Inicio' },
	{ href: '/garage', label: 'Garage' },
	{ href: '/financiamiento', label: 'Financiamiento' },
	{ href: '/membresias', label: 'Membresías' },
	{ href: '/inversiones', label: 'Inversiones' },
	{ href: '/comisiones', label: 'Comisiones' },
	{ href: '/nosotros', label: 'Quiénes somos' },
] as const;
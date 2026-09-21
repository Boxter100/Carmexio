# Carmexio — Sitio web

Sitio de venta de vehículos seminuevos con catálogo, detalle, financiamiento (próximamente) y un panel administrativo para gestionar el inventario.

## Stack

- **Astro 7** (SSR) con adaptador de **Vercel**, React 19 (islas) y Tailwind CSS v4.
- **Supabase** (Postgres + Auth) como base de datos; con **fallback local** automático para desarrollo sin backend.
- Validación con **zod**, iconos **Phosphor**, tipografías **Sora** + **Manrope**.

## Comandos

| Comando                   | Acción                                                    |
| :------------------------ | :-------------------------------------------------------- |
| `pnpm install`            | Instala dependencias                                      |
| `pnpm dev`                | Servidor de desarrollo en `http://localhost:4321`         |
| `astro dev --background`  | Dev en segundo plano (`dev stop` / `dev logs` / `dev status`) |
| `pnpm typecheck`          | Revisión de tipos (`astro check`)                         |
| `pnpm build`              | Build de producción en `./dist/` (salida Vercel)          |
| `pnpm seed`               | Siembra el catálogo (Supabase o almacén local)            |

## Capa de datos

El catálogo vive en `datos/vehiculos_normalizados.json` (28 unidades) y se expone vía `src/lib/db`:

- **Modo Supabase**: activo si existen `PUBLIC_SUPABASE_URL` + `PUBLIC_SUPABASE_ANON_KEY`. Lecturas públicas con cliente anónimo; escrituras del panel requieren sesión de admin (RLS).
- **Modo fallback local**: en ausencia de credenciales, el primer arranque siembra `.data/vehicles.json` desde el JSON original y persiste los cambios ahí. `.data/` y `datos/` están en `.gitignore`.

### Setup con Supabase

1. Crea un proyecto y copia `.env.example` a `.env` con los valores:
   - `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` (para el sitio).
   - `SUPABASE_SERVICE_ROLE_KEY` (solo para el seed y alta del admin).
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` (cliente del panel; por defecto `admin@carmexio.mx` / `carmexio123`).
2. Aplica la migración `supabase/migrations/0001_initial.sql` (tablas `vehicles` y `profiles`, RLS y bucket de imágenes `vehicle-images`).
3. `pnpm seed` crea/actualiza las 28 unidades (upsert por `slug`) y garantiza el usuario administrador con rol `admin`.

### Desarrollo local (sin Supabase)

No configures `.env`: el sitio usa el almacén en `.data/vehicles.json` y autenticación local.

- Usuario del panel: `admin@carmexio.mx` / `carmexio123` (sobrescribible con `ADMIN_EMAIL` / `ADMIN_PASSWORD`).
- SIEMBRA: `pnpm seed` (escribe `.data/vehicles.json`).

## Rutas

| Ruta                   | Descripción                                                     |
| :--------------------- | :-------------------------------------------------------------- |
| `/`                    | Inicio con hero, destacados y módulos                           |
| `/garage`              | Catálogo con búsqueda, filtros y ordenamiento                   |
| `/garage/[slug]`       | Ficha del vehículo (galería, especificaciones, precio, apartado)|
| `/financiamiento`,`/membresias`,`/inversiones`,`/comisiones`,`/nosotros` | Módulos «Próximamente» |
| `/admin/login`         | Acceso al panel                                                 |
| `/admin/vehiculos`     | Lista de inventario (buscar, disponibilidad, editar, eliminar)  |
| `/admin/vehiculos/nuevo` | Crear vehículo                                                |
| `/admin/vehiculos/[id]` | Editar vehículo                                                |

### API pública

- `GET /api/vehicles` — catálogo con filtros (`search`, `brands`, `vehicle_types`, `transmissions`, `drive_types`, `branches`, `available`, `min_price`, `max_price`, `min_year`, `max_year`, `sort`, `limit`, `offset`).
- `GET /api/vehicles/[id]` — una unidad.
- `POST/PUT/DELETE /api/vehicles[/id]`, `PATCH /api/vehicles/[id]/availability` — admin (requiere sesión).
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` — sesión del panel.

## Notas de diseño

Tema claro/oscuro con `prefers-color-scheme` + toggle en `localStorage` (`carmexio-theme`). Tokens de color y utilidades en `src/styles/global.css` y `src/styles/components.css`. Iconos de Phosphor: la versión instalada marca como «deprecated» los nombres clásicos; aún se pueden usar (serán `XxxIcon` en actualizaciones futuras).
# Frontend SaaS Blueprint (SaPyme)

## 1) Stack recomendado (moderno y escalable)

| Área | Tecnología | Motivo |
|---|---|---|
| Build | Vite | Bundling rápido, DX moderna, HMR estable |
| Framework | React | Ecosistema robusto para SaaS complejos |
| UI | TailwindCSS | Diseño consistente, tokens reutilizables y velocidad |
| Componentes | Shadcn UI | Base accesible y extensible para Design System |
| Estado global | Zustand | Liviano, simple y mantenible para sesión/UI state |
| Routing | React Router | Control fino de rutas privadas por rol/feature |
| API client | Axios | Interceptores JWT, manejo de errores uniforme |
| Data fetching | TanStack Query | Cache, reintentos, invalidación, loading states |
| Formularios | React Hook Form | Alto performance en formularios largos |
| Validación | Zod | Esquemas tipados y validación robusta |
| Dashboard | Recharts | Gráficos flexibles para KPIs SaaS |
| Tablas | TanStack Table | Filtros, sorting y paginación avanzados |
| Notificaciones | Sonner | UX moderna de toasts para acciones rápidas |
| Iconos | Lucide | Set consistente, minimalista y SaaS-like |
| Theming | Dark mode con Tailwind | Mejor UX y personalización |

## 2) Arquitectura de carpetas (propuesta)

```txt
src/
├── app/                # Providers globales (QueryClient, Theme, Auth)
├── routes/             # Definición de rutas y guards
├── layouts/            # Shells: Auth, SaaS, Admin, Landing
├── modules/            # Lógica por dominio (ventas, inventario, etc.)
├── components/         # Componentes compartidos y UI primitives
├── pages/              # Páginas por contexto
│   ├── landing/
│   ├── saas/
│   └── admin/
├── services/           # Clientes HTTP y servicios backend
├── store/              # Zustand stores
├── hooks/              # Hooks transversales (auth, permisos, tema)
├── utils/              # Helpers puros
├── styles/             # Tokens, globals, utilidades CSS
├── admin-panel/        # (opcional) estructura dedicada super admin
└── saas-app/           # (opcional) estructura dedicada empresas
```

## 3) Diseño UI/UX estilo SaaS

### Layout base
- Sidebar colapsable.
- Topbar con búsqueda, notificaciones, perfil y selector de tema.
- Área principal con `PageHeader` + contenido.

### Admin Panel
- Dashboard
- Empresas
- Suscripciones
- Pagos
- Planes
- Features
- Límites
- Métricas
- Auditoría

### SaaS App (empresas)
- Dashboard
- Ventas
- Inventario
- Gastos
- Reportes
- Predicciones
- Clientes
- Proveedores
- Usuarios
- Configuración

### Landing
- Hero
- Features
- Precios
- Testimonios
- CTA
- Login / Registro

## 4) Design System

Componentes globales mínimos:
- `Button`, `Card`, `Input`, `Select`, `Badge`, `Alert`
- `Table`/`DataTable`, `Modal`, `ConfirmDialog`
- `Sidebar`, `Navbar/Topbar`, `PageHeader`
- `StatCard`, `ChartCard`, `Toast`

Buenas prácticas:
- Variant API (`primary`, `secondary`, `destructive`, `ghost`).
- Escala tipográfica y spacing basada en tokens.
- Accesibilidad: focus-visible, labels, contrast ratio AA.
- Estados: idle/loading/success/error/empty.

## 5) Dashboard UX (empresa)

Bloques recomendados:
1. KPI row: ventas mes, gastos mes, utilidad, ticket promedio.
2. Gráfico ventas vs gastos (línea/área).
3. Top productos (tabla compacta).
4. Alertas operativas (stock bajo, pagos vencidos).
5. Predicciones ML (demanda/ventas) con intervalos.

## 6) Control de acceso frontend

- `ProtectedRoute`: exige sesión JWT.
- `RoleRoute`: controla navegación por rol.
- `FeatureRoute`: controla módulos por plan/rubro/override.
- Menú dinámico por permisos y features.
- Mensaje UX: "Disponible en plan Pro" + CTA upgrade.

## 7) Escalabilidad

- Lazy loading por módulo (`React.lazy`).
- Code splitting por rutas.
- React Query para cache, stale-while-revalidate, invalidación.
- Axios con interceptores (auth + tracing).
- Error boundaries por layout.
- Feature flags en cliente con fallback seguro.

## 8) Producción

- Activar Sentry (frontend errors + performance).
- CSP y headers de seguridad desde Nginx.
- Telemetría web-vitals.
- Pipeline CI: lint, typecheck, unit + e2e smoke.
- Versionado semántico y release notes.

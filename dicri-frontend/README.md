# DICRI Frontend (React + Vite + TypeScript)

Frontend para la gestión de expedientes, indicios, reportes, usuarios, roles y permisos de la DICRI.

## Requisitos

- Node 18+
- Backend corriendo en http://localhost:3000 (o configurar VITE_API_URL)

## Variables de entorno

Crea un archivo `.env` (o `.env.local`) en la raíz del proyecto:

```
VITE_API_URL=http://localhost:3000
```

## Scripts

- `npm run dev` — Inicia el servidor de desarrollo
- `npm run build` — Compila para producción
- `npm run preview` — Sirve el build localmente

## Estructura de carpetas

```
src/
  components/
    AppLayout.tsx
    layout.css
  config/
    env.ts
  context/
    AuthContext.tsx
  pages/
    LoginPage.tsx
    DashboardPage.tsx
    ExpedientesPage.tsx
    IndiciosPage.tsx
    ReportesPage.tsx
    PermisosPage.tsx
    RolesPage.tsx
    UsuariosPage.tsx
  routes/
    ProtectedRoute.tsx
  services/
    api.ts
    authService.ts
    expedientesService.ts
    indiciosService.ts
    reportesService.ts
    permisosService.ts
    rolesService.ts
    usuariosService.ts
  types/
    index.ts
  utils/
    storage.ts
  App.tsx
  main.tsx
  index.css
```

## Navegación y permisos

- Ruta pública: `/login`
- Rutas protegidas: `/` (dashboard), `/expedientes`, `/indicios`, `/reportes`, `/usuarios`, `/roles`, `/permisos`
- Se usa JWT almacenado en localStorage y se inyecta en Authorization Bearer automáticamente.

## Servicios API

Se consumen los endpoints descritos en el OpenAPI que compartiste. El archivo `src/services/api.ts` configura axios con:

- baseURL = `VITE_API_URL`
- interceptor de Authorization con el token
- manejo básico de errores

## Notas

- `authService.me()` es un placeholder si tu backend no expone `/api/auth/me`. Ajústalo fácilmente para usar el endpoint correcto de tu backend.
- Las páginas son versiones minimalistas para validar el flujo completo y pueden refinarse (UI/UX, validaciones, paginación, etc.).

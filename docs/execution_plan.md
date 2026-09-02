# Plan de Ejecución — Sarango Real Estate (Vestra)

**Estado:** Completado (100%)

---

## Tareas Secuenciales de Desarrollo

### 🟦 Fase A: Infraestructura & Base de Datos
* [x] **Tarea 1:** Verificación y migración del esquema de Prisma v7 (`prisma/schema.prisma`) asegurando roles (`ADMIN`), modelo `Agent` (con campo `license` para José Sarango), `Property`, `PropertyImage`, `Client` y `Lead`. Ejecución de `prisma generate`.
* [x] **Tarea 2:** Configuración de NextAuth.js v5 (Auth.js) en `src/lib/auth.ts` / API route con Credentials Provider para el rol **ADMIN** y protección de middleware en la ruta `/admin/*`.

### 🟨 Fase B: i18n & Estado Client-Side
* [x] **Tarea 3:** Implementación del store de idioma con Zustand (`src/store/useLanguageStore.ts`) con soporte para Español e Inglés y actualización del componente `Navbar.tsx` con el selector de idioma.
* [x] **Tarea 4:** Configuración del store de filtros (`src/store/useFilterStore.ts`) para filtrado reactivo client-side y vinculación en `PropertyFilterBar.tsx`.

### 🟩 Fase C: Almacenamiento & Integración de Mapas
* [x] **Tarea 5:** Creación del Server Action `src/actions/uploadImage.ts` para subir imágenes al servidor local en `/public/uploads/properties` con validación de extensión y peso.
* [x] **Tarea 6:** Implementación del componente de mapa interactivo Leaflet / OpenStreetMap en `src/components/maps/PropertyMap.tsx` usando `next/dynamic` con `{ ssr: false }` para prevenir fallos de hidratación SSR.

### 🟥 Fase D: UI Pública & Integración WhatsApp
* [x] **Tarea 7:** Rediseño del catálogo de propiedades (`/propiedades`) con `PropertyGrid` y tarjetas `PropertyCard` que implementen Glassmorphism (`backdrop-blur-md`), gradientes y animaciones con Framer Motion.
* [x] **Tarea 8:** Desarrollo de la página de detalle (`/propiedades/[slug]`) y tarjeta de agente José Sarango (Licencia 551-A), integrando el flujo de contacto con `submitLeadAction` y generación de la URL pre-compuesta a WhatsApp con alerta Toast de `sonner`.

### 🟪 Fase E: Admin Panel & Validación
* [x] **Tarea 9:** Creación de las vistas del panel de administración (`/admin/login`, `/admin/dashboard` y `/admin/properties`) permitiendo el CRUD de inmuebles y carga drag-and-drop de fotos.
* [x] **Tarea 10:** Verificación global del sistema mediante `npm run typecheck`, `npm run lint` y `npm run build`.

---

# Especificación Técnica (Spec) — Sarango Real Estate (Vestra)

**Versión:** 1.0.0  
**Fecha:** 6 de Agosto, 2026  
**Estado:** Pendiente de Aprobación  

---

## 1. Arquitectura General del Sistema

### 1.1 Stack Tecnológico & Enfoque de Diseño
* **Framework:** Next.js 16 (App Router) + React 19 + TypeScript (en modo estricto).
* **Autenticación & Control de Acceso:** NextAuth.js v5 (Auth.js) configurado con Credentials Provider para autenticar únicamente al rol **ADMIN**. El **VISITANTE PÚBLICO** no requiere autenticación.
* **Internacionalización (i18n):** Sistema dinámico en el cliente (*Client-side*) gestionado vía Zustand (`useLanguageStore`) con diccionarios de traducciones tipados en JSON (`es.json`, `en.json`).
* **Estado & Data Fetching:** 
  * Zustand para estado global ligero (Filtros en el cliente, selección de idioma, modal de contacto).
  * TanStack React Query v5 para hidratación y gestión eficiente de caché en cliente.
  * React Hook Form + Zod para validación rigurosa de formularios (Creación/edición de propiedades, contacto).
* **Mapas Interactivos:** Leaflet + OpenStreetMap renderizado dinámicamente mediante `next/dynamic` (`ssr: false`) para evitar errores de hidratación y manipulación del DOM en el servidor.
* **Estrategia de Almacenamiento de Imágenes:** Carga de imágenes enviadas desde el Admin Panel hacia almacenamiento en servidor dentro del directorio estático optimizado `/public/uploads/properties` con preservación de metadatos en la base de datos (`PropertyImage`).
* **Interfaz de Usuario (UX/UI):** Vanilla Tailwind CSS + Glassmorphism (paneles translúcidos con `backdrop-blur-md`, bordes sutiles y gradientes), Framer Motion para micro-animaciones fluidas, Lucide Icons y Sonner para sistema de notificaciones en tiempo real.

---

## 2. Modelo de Datos (Prisma Schema - PostgreSQL)

La base de datos relacional PostgreSQL utilizará Prisma ORM (@prisma/client v7) con los siguientes modelos principales:

```prisma
enum UserRole {
  ADMIN
}

enum ListingStatus {
  FOR_SALE
  FOR_RENT
  SOLD
  NEW_DEVELOPMENT
}

enum PropertyType {
  VILLA
  APARTMENT
  TOWNHOUSE
  PENTHOUSE
  LOFT
  ESTATE
  OFFICE
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  role         UserRole @default(ADMIN)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("users")
}

model Agent {
  id              String     @id @default(cuid())
  slug            String     @unique
  name            String
  role            String
  license         String?    // Licencia Profesional ej. 551-A
  avatar          String
  phone           String
  email           String
  address         String?
  citySlug        String
  bio             String     @db.Text
  languages       String[]   @default([])
  specialties     String[]   @default([])
  experienceYears Int        @default(0)
  dealsClosed     Int        @default(0)
  rating          Float      @default(0)
  social          Json       @default("{}")
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  properties      Property[]
  leads           Lead[]

  @@map("agents")
}

model Property {
  id           String        @id @default(cuid())
  reference    String        @unique
  slug         String        @unique
  title        String
  description  String        @db.Text
  status       ListingStatus @default(FOR_SALE)
  type         PropertyType
  price        Int
  address      String
  citySlug     String
  lat          Float
  lng          Float
  bedrooms     Int
  bathrooms    Int
  garages      Int           @default(0)
  area         Int           // en m²
  featured     Boolean       @default(false)
  amenityIds   String[]      @default([])
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  agent        Agent         @relation(fields: [agentId], references: [id])
  agentId      String
  images       PropertyImage[]
  leads        Lead[]

  @@index([status])
  @@index([citySlug])
  @@map("properties")
}

model PropertyImage {
  id         String   @id @default(cuid())
  url        String
  position   Int      @default(0)
  createdAt  DateTime @default(now())

  property   Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  propertyId String

  @@map("property_images")
}

model Client {
  id        String   @id @default(cuid())
  firstName String
  lastName  String
  email     String   @unique
  phone     String?
  createdAt DateTime @default(now())

  leads     Lead[]

  @@map("clients")
}

model Lead {
  id         String    @id @default(cuid())
  message    String?   @db.Text
  createdAt  DateTime  @default(now())

  client     Client    @relation(fields: [clientId], references: [id])
  clientId   String
  property   Property? @relation(fields: [propertyId], references: [id])
  propertyId String?
  agent      Agent?    @relation(fields: [agentId], references: [id])
  agentId    String?

  @@map("leads")
}
```

---

## 3. Endpoints, Server Actions & Flujos de API

### 3.1 Rutas Autenticadas (NextAuth v5)
* `POST /api/auth/signin` — Autenticación de Administrador.
* `POST /api/auth/signout` — Cierre de sesión de Administrador.

### 3.2 Server Actions & APIs de Propiedades
* `getProperties(filters)` — Consulta de propiedades con filtros aplicados (por cliente o servidor según el caso).
* `getPropertyBySlug(slug)` — Retorna el detalle completo de una propiedad con sus imágenes y datos del agente.
* `createProperty(data)` *(ADMIN Only)* — Crea una nueva propiedad y asocia imágenes.
* `updateProperty(id, data)` *(ADMIN Only)* — Modifica información de la propiedad.
* `deleteProperty(id)` *(ADMIN Only)* — Elimina lógicamente o físicamente la propiedad.

### 3.3 Server Actions de Carga de Archivos
* `uploadPropertyImages(formData)` *(ADMIN Only)* — Recibe archivos de imagen (`image/jpeg`, `image/png`, `image/webp`), los procesa y guarda en `/public/uploads/properties`, retornando la URL accesible.

### 3.4 Flujo de Contacto y WhatsApp Directo
* `submitLeadAction(data)` — Guarda la interacción del cliente en la base de datos (`Client` y `Lead`), notifica mediante Sonner en la UI, y genera dinámicamente la URL pre-compuesta de WhatsApp hacia el número del Agente *(José Sarango: +593 98 672 6084)* con el formato:
  `https://wa.me/593986726084?text=Hola%20José%20Sarango,%20estoy%20interesado%20en%20la%20propiedad:%20[TITULO]%20(Ref:%20[REF])`

---

## 4. Estructura de Componentes y Navegación

### 4.1 UI Pública
1. **Navegación Global (`Navbar`):**
   * Logo Sarango Real Estate (Vestra).
   * Selector de Idioma Dinámico (ES / EN).
   * Enlaces directos: Inicio, Propiedades, Agentes (Destacando a José Sarango), Contacto.
2. **Catálogo de Propiedades (`/propiedades`):**
   * `PropertyFilterBar`: Filtros interactivos client-side (Tipo, Ubicación, Rango de precio, Habitaciones, Baños, Estado).
   * `PropertyGrid`: Renderizado reactivo de tarjetas de propiedad (`PropertyCard`) con efectos Glassmorphism y hover Framer Motion.
   * `PropertyMapModal` / `PropertyMapSection`: Mapa interactivo OpenStreetMap/Leaflet marcando los inmuebles disponibles.
3. **Página de Detalle (`/propiedades/[slug]`):**
   * Galería de fotos con visualizador a pantalla completa.
   * Especificaciones técnicas (m², habitaciones, precio, dirección, mapa Leaflet).
   * Tarjeta de Agente Asignado (José Sarango - Licencia 551-A) con botón de llamada directa a WhatsApp.
4. **Página de Agente José Sarango (`/agentes/jose-sarango`):**
   * Perfil detallado, biografía, especialidades, número de contacto, licencia 551-A y catálogo de propiedades asignadas.

### 4.2 UI Administrador (`/admin`)
1. **Login Admin (`/admin/login`):** Formulario protegido con NextAuth.
2. **Dashboard Admin (`/admin/dashboard`):** Resumen de propiedades publicadas, mensajes de leads y acceso rápido a gestión.
3. **Gestión de Propiedades (`/admin/properties`):** Tabla interactiva con botones para añadir, editar y eliminar propiedades, incluyendo subida drag-and-drop de fotografías.

---

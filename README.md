# 🏨 Hotel Meducin - Frontend

## 📋 Descripción del Proyecto

Sistema frontend para la gestión integral del Hotel Meducin, desarrollado con **Next.js**, **React** y **TypeScript**. Implementa autenticación JWT, gestión de reservaciones, habitaciones y servicios del hotel con una interfaz moderna y responsive.

## 🛠️ Tecnologías Utilizadas

- **Next.js** - Framework de React
- **React** - Biblioteca de JavaScript
- **TypeScript** - Lenguaje de programación
- **CSS3** - Estilos personalizados
- **Axios** - Cliente HTTP
- **Context API** - Gestión de estado

## 📦 Instalación y Dependencias

### Prerrequisitos
- Node.js (v18 o superior)
- npm o yarn

### Instalación de Dependencias

```bash
# Instalar dependencias del proyecto
npm install

# Instalar dependencias globales (opcional)
npm install -g next
```

### Dependencias Principales
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "typescript": "^5.0.0",
  "axios": "^1.0.0",
  "@types/react": "^18.0.0",
  "@types/node": "^20.0.0"
}
```

## 🚀 Comandos para Ejecutar el Servidor

### Desarrollo
```bash
# Ejecutar en modo desarrollo
npm run dev

# Ejecutar con hot reload
npm run dev -- --turbo
```

### Producción
```bash
# Compilar el proyecto
npm run build

# Ejecutar en producción
npm run start
```

### Otros Comandos
```bash
# Linting
npm run lint

# Verificar tipos TypeScript
npm run type-check
```

## 🌐 Configuración del Frontend

### Variables de Entorno
Crear archivo `.env.local` en la raíz del proyecto:

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3000

# Configuración de la aplicación
NEXT_PUBLIC_APP_NAME=Hotel Meducin
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 📡 Páginas y Rutas del Frontend

### 🏠 Páginas Principales
```
/                           # Página de inicio
/about                      # Sobre nosotros
/contact                    # Contacto
/rooms                      # Lista de habitaciones
/reservations               # Sistema de reservaciones
```

### 🔐 Autenticación
```
/login                      # Iniciar sesión
/register                   # Registro de usuario
/user/profile               # Perfil del usuario
```

### 🛎️ Reservaciones
```
/reservations               # Categorías de habitaciones
/reservations/formulario    # Formulario de reserva
/reservations/confirmacion  # Confirmación de reserva
```

### 🏊 Servicios del Hotel
```
/services                   # Servicios principales
/services/restaurantes      # Restaurantes
/services/spa-bienestar     # Spa y bienestar
/services/piscina-y-gimnasio # Piscina y gimnasio
```

### 🏠 Habitaciones
```
/rooms                      # Lista de habitaciones
/rooms/[id]                 # Detalle de habitación
/rooms/[id]/reserve         # Reservar habitación
```

## 🎨 Características del Frontend

### ✅ **Funcionalidades Implementadas:**
- **🔐 Autenticación JWT** con Context API
- **📱 Diseño responsive** para móviles y desktop
- **🏠 Gestión de habitaciones** con galería de imágenes
- **🛎️ Sistema de reservaciones** con calendario de disponibilidad
- **🏊 Servicios del hotel** con páginas dedicadas
- **👤 Perfil de usuario** con gestión de reservas
- **🎨 Interfaz moderna** con CSS personalizado

### 🎯 **Componentes Principales:**
- **Header/Navbar** - Navegación principal
- **RoomCard** - Tarjetas de habitaciones
- **ReservationForm** - Formulario de reservas
- **AvailabilityCalendar** - Calendario de disponibilidad
- **AuthContext** - Gestión de autenticación
- **ProtectedRoute** - Rutas protegidas

## 🔧 Estructura del Proyecto

```
src/
├── app/
│   ├── components/         # Componentes reutilizables
│   ├── context/           # Context API (Auth, Theme)
│   ├── hooks/             # Custom hooks
│   ├── services/          # Servicios de API
│   ├── styles/            # Archivos CSS
│   ├── types/             # Tipos TypeScript
│   ├── utils/             # Utilidades
│   ├── login/             # Página de login
│   ├── register/          # Página de registro
│   ├── reservations/      # Sistema de reservaciones
│   ├── rooms/             # Gestión de habitaciones
│   ├── services/          # Servicios del hotel
│   └── user/              # Perfil de usuario
├── public/
│   └── images/            # Imágenes del proyecto
└── middleware.ts          # Middleware de Next.js
```

## 🚀 Inicio Rápido

1. **Clonar el repositorio**
2. **Instalar dependencias**: `npm install`
3. **Configurar variables de entorno** en `.env.local`
4. **Ejecutar el servidor**: `npm run dev`
5. **Acceder a**: `http://localhost:4200`

## 📝 Notas Importantes

- El frontend se ejecuta en el puerto **4200** por defecto
- Se conecta al backend en `http://localhost:3000`
- **Todas las rutas protegidas** requieren autenticación JWT
- **Rutas públicas**: `/`, `/about`, `/contact`, `/login`, `/register`
- **Rutas protegidas**: `/user/profile`, `/reservations`, `/rooms`
- Las imágenes se almacenan en `public/images/`
- Los estilos están en `src/app/styles/`
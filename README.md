# MyPets 3.0 — Gestión Integral de Mascotas

Aplicación web progresiva (PWA) de página única para tutores de mascotas. Permite registrar y gestionar toda la información de salud, vacunas, medicamentos, agenda y finanzas de múltiples mascotas desde un solo lugar.

🔗 **Demo en vivo:** [my-pets-3-0.vercel.app](https://my-pets-3-0.vercel.app)

---

## Características principales

### 🐾 Gestión de mascotas
- Registro de múltiples mascotas con ficha completa: nombre, especie, raza, fecha de nacimiento, sexo, color, estado reproductivo y microchip
- Catálogo de razas por especie (perro, gato, ave, conejo, pez, hámster, reptil)
- Avatar con emoji personalizado
- Datos del veterinario de cabecera (nombre, clínica, teléfono, email)
- Edad calculada automáticamente

### 💉 Vacunas
- Catálogo específico por especie (DHPP, antirrábica, triple felina, etc.)
- Periodicidades configurables: mensual, bimestral, trimestral, semestral, anual, cada 2 o 3 años
- Cálculo automático de fecha de próxima dosis
- Alertas cuando una vacuna está vencida o próxima a vencer

### 🪱 Desparasitaciones
- Registro de tratamientos antiparasitarios con producto, dosis y fecha
- Mismo sistema de periodicidades y alertas que las vacunas

### 💊 Medicamentos y tratamientos
- Registro completo: medicamento, dosis, unidad, frecuencia en horas o días
- Cálculo automático de horarios de dosificación del día
- Fecha de inicio, hora de inicio y duración del tratamiento
- Control de stock (cantidad, unidad, fecha de caducidad)
- Tratamientos activos vs. finalizados

### 📋 Historial clínico
- Registro de consultas, cirugías, análisis, emergencias y observaciones
- Vista cronológica del historial completo

### 📅 Agenda
- Calendario mensual con vista de eventos por día
- Tipos: veterinario, vacuna, medicamento, desparasitación, baño, peluquería y otros
- Indicadores visuales en días con eventos

### 💰 Finanzas
- Registro de gastos por categoría con filtros por mascota y período
- Gráfico de distribución de gastos (Chart.js)
- Exportación a CSV
- Predicción de gasto mensual

### 🧴 Botiquín
- Inventario de medicamentos e insumos del hogar
- Estado de stock: disponible, por agotarse o agotado
- Alertas de caducidad

### 📊 Seguimiento y nutrición
- Historial de peso con gráfico de evolución
- Registro de estado de ánimo y energía
- Log de síntomas con severidad
- Registro de comidas y actividad física

### 🏠 Dashboard
- Estadísticas: total de mascotas, alertas activas, eventos próximos y medicamentos del día
- Streaks de bienestar
- Recomendaciones inteligentes
- Cumpleaños próximos

### ⚙️ Panel de Administrador (SaaS)
- Acceso exclusivo para usuarios con `is_admin = true`
- **Dashboard:** métricas de usuarios, mascotas, distribución de planes, gráfico de registros 7 días
- **Usuarios:** tabla completa con plan, mascotas y fecha de registro
- **Planes:** gestión de planes Free / Basic / Pro / Clínica con cambio de plan por usuario

---

## Tecnología

| Capa | Tecnología |
|---|---|
| Frontend | HTML5 + JavaScript vanilla (SPA) |
| Estilos | Tailwind CSS v3 (CDN) + CSS custom |
| Gráficos | Chart.js 4.4 |
| Auth | Supabase Auth (email + password, recuperación) |
| Base de datos | Supabase (PostgreSQL + RLS) |
| Email | EmailJS (opcional) |
| Deploy | Vercel |

**Sin backend propio.** Auth y datos gestionados 100% por Supabase con Row Level Security.

---

## Arquitectura de base de datos (Supabase)

| Tabla | Descripción |
|---|---|
| `profiles` | Perfiles de usuario (nombre, plan, is_admin) |
| `pets` | Mascotas (owner_id, especie, raza, microchip, vet) |
| `pet_access` | Control de acceso por mascota (owner / editor) |
| `vaccines` | Vacunas por mascota |
| `dewormings` | Desparasitaciones por mascota |
| `medications` | Medicamentos y tratamientos |
| `clinical_history` | Historial clínico |
| `events` | Eventos de la agenda |
| `expenses` | Gastos y finanzas |
| `botiquin` | Inventario del botiquín |
| `weight_history` | Historial de peso |
| `mood_log` | Registro de estado de ánimo |
| `symptoms_log` | Log de síntomas |
| `meals` | Registro de comidas |
| `activities` | Actividad física |
| `dose_log` | Log de dosis administradas |

Todas las tablas tienen **Row Level Security (RLS)** activo — cada usuario solo ve sus propios datos.

---

## Estructura del proyecto

```
MyPets-3.0/
├── index.html        # Punto de entrada + CDN scripts
├── css/
│   └── style.css     # Estilos personalizados y animaciones
└── js/
    └── app.js        # Aplicación completa (~4500 líneas)
```

---

## Módulos principales (`app.js`)

| Función | Descripción |
|---|---|
| `initApp()` | Inicialización, sesión Supabase, detección recovery |
| `loadDataFromSupabase()` | Carga paralela de todos los datos del usuario |
| `loadAdminData()` | Carga datos de todos los usuarios (solo admin) |
| `viewDashboard()` | Pantalla de inicio con resumen y streaks |
| `viewPets()` | Listado de mascotas |
| `viewAddPet()` | Stepper de registro (4 pasos) |
| `viewPetProfile()` | Perfil completo con pestañas |
| `viewCalendar()` | Agenda mensual |
| `viewFinance()` | Módulo de gastos y gráficos |
| `viewBotiquin()` | Inventario del botiquín |
| `viewAdmin()` | Panel de administrador SaaS |
| `savePet()` | Crear mascota en Supabase |
| `saveVaccine()` | Guardar vacuna en Supabase |
| `saveMedication()` | Guardar medicamento en Supabase |
| `saveEvent()` | Guardar evento en Supabase |
| `saveExpense()` | Guardar gasto en Supabase |
| `applyPlanChange()` | Cambiar plan de usuario (admin) |

---

## Autenticación (Supabase Auth)

- **Registro** con nombre, email y contraseña
- **Login** con persistencia de sesión (JWT)
- **Recuperación de contraseña** por email con link seguro
- **Modo demo** con datos precargados (`demo@mypets.cl`)
- Sesión persistente entre recargas con `getSession()`

---

## Planes SaaS

| Plan | Precio | Límites |
|---|---|---|
| Free | $0 | 1 mascota, funciones básicas |
| Basic | $4.990/mes | 3 mascotas, agenda y finanzas |
| Pro | $9.990/mes | Mascotas ilimitadas, seguimiento avanzado, IA |
| Clínica | $29.990/mes | Multi-usuario, gestión clínica, API |

---

## Configuración de Supabase

```javascript
const SUPABASE_URL  = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### Marcar usuario como administrador

```sql
UPDATE public.profiles
SET is_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'tu@email.com');
```

---

## Deploy

El proyecto no requiere build. Se puede desplegar directamente en:

- **Vercel:** conectar el repositorio y desplegar automáticamente
- **GitHub Pages:** activar Pages desde la rama `main`
- **Cualquier hosting estático:** subir los 3 archivos

Requiere una cuenta gratuita en [supabase.com](https://supabase.com) para auth y base de datos.

---

## Licencia

MIT — libre uso, modificación y distribución.

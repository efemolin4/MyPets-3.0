# MyPets 3.0 — Gestión Integral de Mascotas

Aplicación web progresiva (PWA) de página única para tutores de mascotas. Permite registrar y gestionar toda la información de salud, vacunas, medicamentos, agenda y finanzas de múltiples mascotas desde un solo lugar.

🔗 **Demo en vivo:** [my-pets-3-0.vercel.app](https://my-pets-3-0.vercel.app)

---

## Características principales

### 🐾 Gestión de mascotas
- Registro de múltiples mascotas con ficha completa: nombre, especie, raza, fecha de nacimiento, sexo, color, estado reproductivo y número de microchip
- Catálogo de razas por especie (perro, gato, ave, conejo, pez, hámster, reptil)
- Avatar con foto o emoji personalizado
- Datos del veterinario de cabecera (nombre, clínica, teléfono, email)
- Seguimiento de peso con historial de registros
- Edad calculada automáticamente

### 💉 Vacunas
- Registro de vacunas con catálogo específico por especie (ej. DHPP, antirrábica, triple felina)
- Periodicidades configurables: mensual, bimestral, trimestral, semestral, anual, cada 2 o 3 años
- Cálculo automático de fecha de próxima dosis
- Alertas cuando una vacuna está vencida o próxima a vencer
- Edición y eliminación de registros

### 🪱 Desparasitaciones
- Registro de tratamientos antiparasitarios con producto, dosis y fecha
- Mismo sistema de periodicidades y alertas que las vacunas

### 💊 Medicamentos y tratamientos
- Registro completo: medicamento, dosis, unidad (mg, ml, comprimidos, gotas), frecuencia
- Frecuencia configurable en horas o días (ej. cada 8 horas)
- Cálculo automático de horarios de dosificación del día
- Fecha de inicio, hora de inicio y duración del tratamiento en días
- Control de stock (cantidad, unidad, fecha de caducidad)
- Recordatorio por dosis: horario exacto, 15, 30 o 60 minutos antes
- Tratamientos activos vs. finalizados

### 📋 Historial clínico
- Registro de consultas, cirugías, análisis, emergencias y observaciones
- Cada entrada incluye: título, tipo, fecha, médico, clínica, costo y notas
- Posibilidad de adjuntar documentos (descripción de archivos)
- Vista cronológica del historial completo

### 📅 Agenda
- Calendario mensual con vista de eventos por día
- Tipos de eventos: veterinario, vacuna, medicamento, desparasitación, baño, peluquería, y otros
- Indicadores visuales en días con eventos
- Creación rápida de eventos desde cualquier día del calendario
- Vista responsive: texto completo en desktop, puntos indicadores en mobile

### 💰 Finanzas
- Registro de gastos por categoría: veterinario, medicamentos, alimento, accesorios, peluquería, seguro, vacunas y otros
- Filtros por mascota y por período (mensual, trimestral, semestral, anual)
- Gráfico de distribución de gastos por categoría (Chart.js)
- Resumen de gasto total, promedio mensual y mes con mayor gasto
- Exportación de datos a CSV

### 🧴 Botiquín
- Inventario de medicamentos e insumos del hogar
- Estado de stock: disponible, por agotarse o agotado
- Filtros por mascota y por estado
- Alertas de caducidad próxima o vencida

### 🏠 Dashboard
- Vista general con estadísticas: total de mascotas, alertas activas, eventos próximos y medicamentos del día
- Acceso rápido a mascotas recientes
- Panel de alertas de salud (vacunas vencidas, tratamientos activos)
- Próximos 3 eventos del calendario

---

## Tecnología

| Capa | Tecnología |
|---|---|
| Frontend | HTML5 + JavaScript vanilla (SPA) |
| Estilos | Tailwind CSS v3 (CDN) + CSS custom |
| Gráficos | Chart.js 4.4 |
| Email | EmailJS (notificaciones opcionales) |
| Persistencia | localStorage (`mypets_v3`) |
| Deploy | Vercel |

**Sin dependencias de backend.** Todo el estado se persiste en `localStorage` del navegador. No requiere servidor, base de datos ni build step.

---

## Estructura del proyecto

```
MyPets-3.0/
├── index.html        # Punto de entrada
├── css/
│   └── style.css     # Estilos personalizados y animaciones
└── js/
    └── app.js        # Aplicación completa (~3.400 líneas)
```

---

## Módulos del código (`app.js`)

| Función | Descripción |
|---|---|
| `viewDashboard()` | Pantalla de inicio con resumen |
| `viewPets()` | Listado de mascotas |
| `viewAddPet()` | Stepper de registro (3 pasos) |
| `viewPetProfile()` | Perfil completo con pestañas |
| `viewCalendar()` | Agenda mensual |
| `viewFinance()` | Módulo de gastos y gráficos |
| `viewBotiquin()` | Inventario del botiquín |
| `viewAdmin()` | Panel de administración |
| `openVaccineModal()` | Modal de vacunas |
| `openDewormModal()` | Modal de desparasitaciones |
| `openMedModal()` | Modal de medicamentos |
| `openHistoryModal()` | Modal de historial clínico |
| `openEventModal()` | Modal de agenda |
| `openExpenseModal()` | Modal de gastos |
| `injectStyles()` | Inyección dinámica de CSS |

---

## Autenticación

Sistema de usuarios completo en localStorage:

- **Registro** con nombre, email y contraseña
- **Login** con persistencia de sesión
- **Recuperación de contraseña** por email (simulada o vía EmailJS)
- **Modo demo** con datos precargados para explorar la app sin registro
- **Sistema de invitaciones** entre usuarios

---

## Diseño y UX

- **Responsive completo:** sidebar en desktop, bottom navigation en mobile
- **Modales tipo bottom-sheet** en mobile (se deslizan desde abajo)
- **Animaciones suaves** con CSS keyframes (`fadeIn`, `slideUp`, `scaleIn`)
- **Soporte safe-area** para iPhone con notch (iOS env variables)
- **Tema de color:** violeta (`#7c3aed`) como color principal, teal como acento
- **Fuente:** Inter (Google Fonts)

---

## Configuración de EmailJS (opcional)

Para activar notificaciones por email, editar las constantes al inicio de `app.js`:

```javascript
const EMAILJS_SERVICE_ID  = 'service_mypets';
const EMAILJS_TEMPLATE_ID = 'template_mypets';
const EMAILJS_PUBLIC_KEY  = 'TU_PUBLIC_KEY_AQUI';
```

Crear cuenta gratuita en [emailjs.com](https://emailjs.com) y reemplazar los valores.

---

## Deploy

El proyecto no requiere build. Se puede desplegar directamente en:

- **Vercel:** conectar el repositorio y desplegar automáticamente
- **GitHub Pages:** activar Pages desde la rama `main`
- **Cualquier hosting estático:** subir los 3 archivos (`index.html`, `css/style.css`, `js/app.js`)

---

## Licencia

MIT — libre uso, modificación y distribución.

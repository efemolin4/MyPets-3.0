/* ============================================================
   MYPETS 3.0 — Aplicación Principal
   ============================================================ */

// ---- VACUNAS POR ESPECIE ----
const VACCINES_BY_SPECIES = {
  Perro:   ['Antirrábica','Polivalente DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)','Parvovirus','Moquillo (Distemper)','Hepatitis Infecciosa Canina','Leptospirosis','Parainfluenza','Bordetella (Tos de las perreras)','Coronavirus Canino','Leishmaniasis'],
  Gato:    ['Antirrábica','Triple Felina (Panleucopenia, Rinotraqueítis, Calicivirus)','Cuádruple Felina','Leucemia Felina (FeLV)','Peritonitis Infecciosa Felina (FIP)','Clamidiosis Felina','Inmunodeficiencia Felina (FIV)'],
  Ave:     ['Viruela Aviar','Newcastle','Psitacosis (Clamidiosis)','Influenza Aviar','Marek'],
  Conejo:  ['Mixomatosis','Enfermedad Vírica Hemorrágica (RHD)','Combinada Mixomatosis + RHD'],
  Pez:     ['Furunculosis','Vibriosis','Yersiniosis'],
  Hámster: ['Consultar con veterinario'],
  Reptil:  ['Consultar con veterinario'],
  Otro:    ['Consultar con veterinario'],
};

// ---- PERIODICIDADES ----
const PERIODICITY_OPTIONS = [
  { label: 'Sin periodicidad',     months: 0  },
  { label: 'Mensual (1 mes)',      months: 1  },
  { label: 'Bimestral (2 meses)', months: 2  },
  { label: 'Trimestral (3 meses)',months: 3  },
  { label: 'Semestral (6 meses)', months: 6  },
  { label: 'Anual (12 meses)',     months: 12 },
  { label: 'Cada 2 años',         months: 24 },
  { label: 'Cada 3 años',         months: 36 },
];

// ---- RAZAS POR ESPECIE ----
const BREEDS = {
  Perro: ['Mestizo','Labrador Retriever','Golden Retriever','Pastor Alemán','Bulldog Francés','Bulldog Inglés','Poodle','Beagle','Chihuahua','Yorkshire Terrier','Shih Tzu','Schnauzer','Dachshund','Husky Siberiano','Border Collie','Boxer','Cocker Spaniel','Doberman','Rottweiler','Pomerania','Maltés','Bichón Frisé','Akita','Shar Pei','Weimaraner','Dálmata','Samoyedo','Chow Chow','Setter Irlandés','Gran Danés'],
  Gato: ['Mestizo','Siamés','Persa','Maine Coon','Bengalí','Ragdoll','Abisinio','Sphynx','British Shorthair','Scottish Fold','Noruego del Bosque','Angora Turco','Birmano','Ruso Azul','Somalí','Tonkinés','Devon Rex','Cornish Rex','Manx','Bombay'],
  Ave: ['Mestizo','Canario','Periquito','Loro','Cacatúa','Agaporni','Ninfas','Jilguero','Paloma','Cotorra'],
  Conejo: ['Mestizo','Enano de Holanda','Angora','Rex','Lionhead','Mini Lop','Belier','Californiano','Nueva Zelanda'],
  Pez: ['Mestizo','Betta','Goldfish','Guppy','Tetra','Ángel','Disco','Koi','Molly','Platy','Oscar'],
  Hámster: ['Mestizo','Sirio','Ruso','Chino','Roborovski','Campbell'],
  Reptil: ['Mestizo','Dragón Barbudo','Gecko Leopardo','Iguana Verde','Camaleón','Tortuga','Boa','Pitón','Anolis'],
  Otro: ['Mestizo','Otro'],
};

// ---- ESTADO ----
const defaultState = {
  user: null, isLoggedIn: false,
  pets: [], events: [], expenses: [],
  currentView: 'login', currentPetId: null,
  currentTab: 'general', addPetStep: 1, newPetData: {},
};
let state = { ...defaultState };
let chartInstance = null;

function loadState() {
  try {
    const s = localStorage.getItem('mypets_v3');
    if (s) {
      const p = JSON.parse(s);
      Object.assign(state, p);
      state.currentView = p.isLoggedIn ? 'dashboard' : 'login';
      state.currentTab = 'general'; state.addPetStep = 1; state.newPetData = {};
    }
  } catch(e) {}
}

function saveState() {
  try {
    localStorage.setItem('mypets_v3', JSON.stringify({
      user: state.user, isLoggedIn: state.isLoggedIn,
      pets: state.pets, events: state.events, expenses: state.expenses,
    }));
  } catch(e) {}
}

// ---- UTILIDADES ----
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function formatDate(d) {
  if (!d) return '—';
  const dt = new Date(d + 'T12:00:00');
  return dt.toLocaleDateString('es-CL', { day:'2-digit', month:'2-digit', year:'numeric' });
}

function addMonths(dateStr, months) {
  if (!dateStr || !months) return '';
  const d = new Date(dateStr + 'T12:00:00');
  d.setMonth(d.getMonth() + parseInt(months));
  return d.toISOString().slice(0, 10);
}

function getAge(dob) {
  if (!dob) return '';
  const b = new Date(dob), n = new Date();
  const y = n.getFullYear() - b.getFullYear(), m = n.getMonth() - b.getMonth();
  if (y === 0) return `${Math.max(0,m)} mes${m !== 1 ? 'es' : ''}`;
  return `${y} año${y !== 1 ? 's' : ''}`;
}

function speciesEmoji(s) {
  return { Perro:'🐕', Gato:'🐈', Ave:'🦜', Conejo:'🐇', Pez:'🐠', Hámster:'🐹', Reptil:'🦎', Otro:'🐾' }[s] || '🐾';
}

function showToast(msg, type = '') {
  const t = document.createElement('div');
  t.className = `toast ${type}`; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function fmtCLP(n) {
  return Number(n || 0).toLocaleString('es-CL', { style:'currency', currency:'CLP', maximumFractionDigits:0 });
}

// ---- ROUTER ----
function navigate(view, params = {}) {
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
  Object.assign(state, { currentView: view, ...params });
  render();
  window.scrollTo(0, 0);
}

// ---- COMPONENTES ----
function sidebar() {
  const items = [
    { v:'dashboard', icon:'🏠', label:'Dashboard' },
    { v:'pets',      icon:'🐾', label:'Mis Mascotas' },
    { v:'calendar',  icon:'📅', label:'Agenda' },
    { v:'finance',   icon:'💰', label:'Finanzas' },
  ];
  return `
  <aside class="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-20 shadow-sm">
    <div class="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
      <div class="w-9 h-9 bg-brand-gradient rounded-xl flex items-center justify-center text-white font-bold text-sm">MP</div>
      <div><div class="font-bold text-gray-900 text-sm">MyPets</div><div class="text-xs text-brand-500">v3.0</div></div>
    </div>
    <nav class="flex-1 px-3 py-4 space-y-1">
      ${items.map(i => `
        <button onclick="navigate('${i.v}')" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${state.currentView === i.v ? 'nav-item-active' : 'text-gray-600 hover:bg-gray-50'}">
          <span class="text-base">${i.icon}</span><span>${i.label}</span>
        </button>`).join('')}
    </nav>
    <div class="px-4 py-4 border-t border-gray-100">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-white text-sm font-bold">${(state.user?.name || 'U')[0].toUpperCase()}</div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-gray-900 truncate">${state.user?.name || ''}</div>
          <div class="text-xs text-gray-400 truncate">${state.user?.email || ''}</div>
        </div>
        <button onclick="logout()" class="text-gray-400 hover:text-red-500 transition-colors" title="Cerrar sesión">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        </button>
      </div>
    </div>
  </aside>`;
}

function bottomNav() {
  const items = [
    { v:'dashboard', icon:'🏠', label:'Inicio' },
    { v:'pets',      icon:'🐾', label:'Mascotas' },
    { v:'calendar',  icon:'📅', label:'Agenda' },
    { v:'finance',   icon:'💰', label:'Finanzas' },
  ];
  return `
  <nav class="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-20 safe-area-bottom">
    <div class="flex">
      ${items.map(i => `
        <button onclick="navigate('${i.v}')" class="flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors ${state.currentView === i.v ? 'text-brand-600 font-semibold' : 'text-gray-400'}">
          <span class="text-xl leading-none">${i.icon}</span>
          <span>${i.label}</span>
        </button>`).join('')}
    </div>
  </nav>`;
}

function appShell(content) {
  return `
  ${sidebar()}
  <div class="md:ml-64 flex flex-col min-h-screen">
    <main class="flex-1 pb-20 md:pb-8 p-4 md:p-8 animate-fade-in">${content}</main>
    ${bottomNav()}
  </div>`;
}

function pageHeader(title, subtitle = '', action = '') {
  return `
  <div class="flex items-start justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">${title}</h1>
      ${subtitle ? `<p class="text-sm text-gray-500 mt-0.5">${subtitle}</p>` : ''}
    </div>
    ${action}
  </div>`;
}

function statCard(icon, label, value, color = 'brand') {
  const colors = {
    brand: 'bg-brand-50 text-brand-600',
    teal:  'bg-teal-50 text-teal-600',
    amber: 'bg-amber-50 text-amber-600',
    red:   'bg-red-50 text-red-600',
  };
  return `
  <div class="bg-white rounded-2xl p-5 shadow-sm card-hover animate-fade-in">
    <div class="flex items-center justify-between mb-3">
      <div class="w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center text-xl">${icon}</div>
    </div>
    <div class="text-2xl font-bold text-gray-900">${value}</div>
    <div class="text-sm text-gray-500 mt-0.5">${label}</div>
  </div>`;
}

function petAvatar(pet, size = 'sm') {
  const dim = size === 'lg' ? 'w-24 h-24 text-4xl' : 'w-14 h-14 text-2xl';
  if (pet.photo) return `<img src="${pet.photo}" class="${size === 'lg' ? 'pet-avatar-lg' : 'pet-avatar'}" alt="${pet.name}" />`;
  return `<div class="${dim} pet-avatar-placeholder rounded-full">${speciesEmoji(pet.species)}</div>`;
}

function emptyState(icon, title, sub, btnLabel = '', btnFn = '') {
  return `
  <div class="text-center py-16 animate-fade-in">
    <div class="text-6xl mb-4">${icon}</div>
    <h3 class="text-lg font-semibold text-gray-700 mb-1">${title}</h3>
    <p class="text-sm text-gray-400 mb-6">${sub}</p>
    ${btnLabel ? `<button onclick="${btnFn}" class="btn-primary">${btnLabel}</button>` : ''}
  </div>`;
}

// ---- VISTA: LOGIN ----
function viewLogin() {
  return `
  <div class="min-h-screen flex">
    <div class="hidden lg:flex lg:w-1/2 bg-brand-gradient items-center justify-center p-12 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        ${Array.from({length:12}, (_,i) => `<div class="absolute text-6xl" style="top:${Math.random()*90}%;left:${Math.random()*90}%;opacity:${0.3+Math.random()*0.7}">${['🐕','🐈','🐇','🦜','🐠'][i%5]}</div>`).join('')}
      </div>
      <div class="relative text-center text-white">
        <div class="text-8xl mb-6">🐾</div>
        <h1 class="text-4xl font-bold mb-3">MyPets 3.0</h1>
        <p class="text-lg text-purple-100 max-w-xs mx-auto">Tu compañero digital para el cuidado integral de tus mascotas</p>
        <div class="mt-8 grid grid-cols-2 gap-4 text-sm">
          <div class="bg-white/10 rounded-xl p-3"><div class="text-2xl mb-1">📋</div>Ficha médica completa</div>
          <div class="bg-white/10 rounded-xl p-3"><div class="text-2xl mb-1">🔔</div>Alertas automáticas</div>
          <div class="bg-white/10 rounded-xl p-3"><div class="text-2xl mb-1">💊</div>Control de medicamentos</div>
          <div class="bg-white/10 rounded-xl p-3"><div class="text-2xl mb-1">💰</div>Control de gastos</div>
        </div>
      </div>
    </div>
    <div class="flex-1 flex items-center justify-center p-6">
      <div class="w-full max-w-sm animate-scale-in">
        <div class="lg:hidden text-center mb-8">
          <div class="text-5xl mb-2">🐾</div>
          <h1 class="text-2xl font-bold text-gray-900">MyPets 3.0</h1>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-1">Bienvenido de vuelta</h2>
        <p class="text-gray-500 text-sm mb-6">Ingresa a tu cuenta para continuar</p>
        <form onsubmit="handleLogin(event)" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="l-email" type="email" required placeholder="tu@email.com" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input id="l-pass" type="password" required placeholder="••••••••" class="input-field" />
          </div>
          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center gap-2 text-gray-600 cursor-pointer">
              <input type="checkbox" class="rounded text-brand-500" /> Recordarme
            </label>
            <button type="button" onclick="navigate('forgot')" class="text-brand-600 hover:underline">¿Olvidaste tu contraseña?</button>
          </div>
          <button type="submit" class="btn-primary w-full">Iniciar Sesión</button>
        </form>
        <div class="mt-4 text-center text-sm text-gray-500">
          ¿No tienes cuenta? <button onclick="navigate('register')" class="text-brand-600 font-medium hover:underline">Regístrate gratis</button>
        </div>
        <div class="mt-6 p-3 bg-brand-50 rounded-xl text-xs text-brand-700">
          <strong>Demo:</strong> Usa cualquier email y contraseña para ingresar
        </div>
      </div>
    </div>
  </div>`;
}

// ---- VISTA: REGISTER ----
function viewRegister() {
  return `
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-teal-50 p-6">
    <div class="w-full max-w-sm animate-scale-in">
      <div class="text-center mb-6">
        <div class="text-4xl mb-2">🐾</div>
        <h2 class="text-2xl font-bold text-gray-900">Crear cuenta</h2>
        <p class="text-sm text-gray-500 mt-1">Únete a MyPets gratis</p>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <form onsubmit="handleRegister(event)" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input id="r-name" type="text" required placeholder="Tu nombre" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="r-email" type="email" required placeholder="tu@email.com" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input id="r-pass" type="password" required minlength="6" placeholder="Mínimo 6 caracteres" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
            <input id="r-pass2" type="password" required placeholder="Repite la contraseña" class="input-field" />
          </div>
          <button type="submit" class="btn-primary w-full">Crear cuenta gratuita</button>
        </form>
        <div class="text-center text-sm text-gray-500">
          ¿Ya tienes cuenta? <button onclick="navigate('login')" class="text-brand-600 font-medium hover:underline">Inicia sesión</button>
        </div>
      </div>
    </div>
  </div>`;
}

// ---- VISTA: FORGOT ----
function viewForgot() {
  return `
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-teal-50 p-6">
    <div class="w-full max-w-sm animate-scale-in">
      <div class="text-center mb-6">
        <div class="text-4xl mb-2">🔑</div>
        <h2 class="text-2xl font-bold text-gray-900">Recuperar contraseña</h2>
        <p class="text-sm text-gray-500 mt-1">Te enviaremos un enlace por email</p>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input id="f-email" type="email" required placeholder="tu@email.com" class="input-field" />
        </div>
        <button onclick="handleForgot()" class="btn-primary w-full">Enviar enlace</button>
        <button onclick="navigate('login')" class="w-full text-sm text-gray-500 hover:text-gray-700">← Volver al inicio de sesión</button>
      </div>
    </div>
  </div>`;
}

// ---- VISTA: DASHBOARD ----
function viewDashboard() {
  const pets = state.pets;
  const today = new Date().toISOString().slice(0, 10);
  const alerts = pets.flatMap(p => [
    ...( p.vaccines || []).filter(v => v.nextDate && v.nextDate <= today),
    ...( p.medications || []).filter(m => m.endDate && m.endDate <= today),
  ]);
  const upcoming = (state.events || []).filter(e => e.date >= today).slice(0, 3);
  const todayMeds = pets.flatMap(p => (p.medications || []).filter(m => m.active));
  const dateStr = new Date().toLocaleDateString('es-CL', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  return appShell(`
    ${pageHeader(`Hola, ${state.user?.name?.split(' ')[0] || 'Tutor'} 👋`, dateStr)}
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
      ${statCard('🐾', 'Mascotas', pets.length, 'brand')}
      ${statCard('🔔', 'Alertas activas', alerts.length, 'red')}
      ${statCard('📅', 'Eventos próximos', upcoming.length, 'amber')}
      ${statCard('💊', 'Medicamentos hoy', todayMeds.length, 'teal')}
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-white rounded-2xl shadow-sm p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-gray-900">Mis Mascotas</h2>
          <button onclick="navigate('pets')" class="text-sm text-brand-600 hover:underline">Ver todas</button>
        </div>
        ${pets.length === 0
          ? `<div class="text-center py-8">
               <div class="text-4xl mb-2">🐾</div>
               <p class="text-sm text-gray-400 mb-3">Aún no tienes mascotas registradas</p>
               <button onclick="navigate('addPet')" class="btn-primary text-sm">+ Agregar mascota</button>
             </div>`
          : `<div class="space-y-3">
               ${pets.slice(0, 4).map(p => `
                 <div onclick="openPet('${p.id}')" class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                   ${petAvatar(p)}
                   <div class="flex-1 min-w-0">
                     <div class="font-medium text-gray-900 text-sm">${p.name}</div>
                     <div class="text-xs text-gray-400">${p.species} · ${getAge(p.dateOfBirth)}</div>
                   </div>
                   <span class="text-gray-300 text-lg">›</span>
                 </div>`).join('')}
               <button onclick="navigate('addPet')" class="w-full mt-1 py-2 text-sm text-brand-600 hover:bg-brand-50 rounded-xl transition-colors font-medium">+ Agregar mascota</button>
             </div>`}
      </div>

      <div class="bg-white rounded-2xl shadow-sm p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-gray-900">Próximos eventos</h2>
          <button onclick="navigate('calendar')" class="text-sm text-brand-600 hover:underline">Ver agenda</button>
        </div>
        ${upcoming.length === 0
          ? `<div class="text-center py-8">
               <div class="text-4xl mb-2">📅</div>
               <p class="text-sm text-gray-400 mb-3">Sin eventos próximos</p>
               <button onclick="navigate('calendar')" class="btn-primary text-sm">Agendar evento</button>
             </div>`
          : upcoming.map(e => `
              <div class="flex items-start gap-3 p-3 rounded-xl border border-gray-100 mb-2">
                <div class="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-xl">${eventIcon(e.type)}</div>
                <div>
                  <div class="text-sm font-medium text-gray-900">${e.title}</div>
                  <div class="text-xs text-gray-400">${formatDate(e.date)} · ${e.pet || 'Sin mascota'}</div>
                </div>
              </div>`).join('')}
      </div>

      ${alerts.length > 0 ? `
      <div class="md:col-span-2 bg-red-50 border border-red-100 rounded-2xl p-5">
        <h2 class="font-semibold text-red-700 mb-3">⚠️ Alertas vencidas</h2>
        <div class="space-y-2">
          ${alerts.slice(0,4).map(a => `
            <div class="flex items-center gap-3 bg-white rounded-xl p-3">
              <span class="text-xl">💉</span>
              <div><div class="text-sm font-medium text-gray-800">${a.name}</div>
              <div class="text-xs text-gray-400">Vence: ${formatDate(a.nextDate || a.endDate)}</div></div>
            </div>`).join('')}
        </div>
      </div>` : ''}
    </div>
  `);
}

function eventIcon(t) {
  return { Consulta:'🏥', Examen:'🔬', Peluquería:'✂️', Hotel:'🏨', Vacuna:'💉', Otro:'📌' }[t] || '📌';
}

// ---- VISTA: MASCOTAS ----
function viewPets() {
  const pets = state.pets;
  return appShell(`
    ${pageHeader('Mis Mascotas', `${pets.length} mascota${pets.length !== 1 ? 's' : ''} registrada${pets.length !== 1 ? 's' : ''}`,
      `<button onclick="navigate('addPet')" class="btn-primary flex items-center gap-2"><span>+</span> Agregar</button>`)}
    ${pets.length === 0
      ? emptyState('🐾', 'Aún no tienes mascotas', 'Registra tu primera mascota para comenzar', '+ Agregar mascota', "navigate('addPet')")
      : `<div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger">
           ${pets.map(p => `
             <div onclick="openPet('${p.id}')" class="bg-white rounded-2xl shadow-sm p-5 cursor-pointer card-hover animate-fade-in">
               <div class="flex flex-col items-center text-center">
                 ${petAvatar(p, 'lg')}
                 <div class="mt-3 font-bold text-gray-900">${p.name}</div>
                 <div class="text-sm text-gray-400 mt-0.5">${p.species} · ${p.breed || 'Sin raza'}</div>
                 <div class="text-xs text-gray-400 mt-0.5">${getAge(p.dateOfBirth)}</div>
                 <div class="flex gap-2 mt-3 flex-wrap justify-center">
                   ${(p.personalityTags || []).slice(0,2).map(t => `<span class="tag text-xs">${t}</span>`).join('')}
                 </div>
               </div>
               <div class="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-center text-gray-500">
                 <div><div class="font-semibold text-gray-800">${(p.vaccines||[]).length}</div>Vacunas</div>
                 <div><div class="font-semibold text-gray-800">${(p.medications||[]).length}</div>Medicamentos</div>
               </div>
             </div>`).join('')}
         </div>`}
  `);
}

// ---- VISTA: AGREGAR MASCOTA (STEPPER) ----
function viewAddPet() {
  const step = state.addPetStep;
  const steps = ['Datos básicos', 'Info física', 'Salud', 'Tutores'];
  return appShell(`
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <button onclick="navigate('pets')" class="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">‹</button>
        <div>
          <h1 class="text-xl font-bold text-gray-900">Nueva mascota</h1>
          <p class="text-sm text-gray-400">Paso ${step} de 4</p>
        </div>
      </div>

      <div class="flex items-center mb-8 px-2">
        ${steps.map((s, i) => `
          <div class="flex-1 flex flex-col items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1
              ${i+1 < step ? 'bg-brand-500 text-white' : i+1 === step ? 'bg-brand-600 text-white ring-4 ring-brand-100' : 'bg-gray-100 text-gray-400'}">
              ${i+1 < step ? '✓' : i+1}
            </div>
            <div class="text-xs text-center hidden sm:block ${i+1 === step ? 'text-brand-600 font-medium' : 'text-gray-400'}">${s}</div>
          </div>
          ${i < steps.length-1 ? `<div class="flex-1 h-0.5 mb-5 ${i+1 < step ? 'bg-brand-500' : 'bg-gray-200'}"></div>` : ''}
        `).join('')}
      </div>

      <div class="bg-white rounded-2xl shadow-sm p-6 animate-scale-in">
        ${step === 1 ? stepBasic() : step === 2 ? stepPhysical() : step === 3 ? stepHealth() : stepTutors()}
        <div class="flex gap-3 mt-6 pt-6 border-t border-gray-100">
          ${step > 1 ? `<button onclick="prevStep()" class="btn-secondary flex-1">← Anterior</button>` : ''}
          <button onclick="nextStep()" class="btn-primary flex-1">${step === 4 ? '✓ Guardar mascota' : 'Siguiente →'}</button>
        </div>
      </div>
    </div>
  `);
}

function stepBasic() {
  const d = state.newPetData;
  return `
    <h2 class="text-lg font-bold text-gray-900 mb-4">Datos básicos</h2>
    <div class="space-y-4">
      <div class="flex flex-col items-center mb-4">
        <div id="photo-preview" class="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-4xl mb-2 overflow-hidden">
          ${d.photo ? `<img src="${d.photo}" class="w-full h-full object-cover" />` : '🐾'}
        </div>
        <label class="cursor-pointer text-sm text-brand-600 hover:underline font-medium">
          Subir foto <input type="file" accept="image/*" class="hidden" onchange="previewPhoto(event)" />
        </label>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2">
          <label class="form-label">Nombre *</label>
          <input id="pet-name" type="text" required value="${d.name||''}" placeholder="Nombre de tu mascota" class="input-field" />
        </div>
        <div>
          <label class="form-label">Especie *</label>
          <select id="pet-species" class="input-field" onchange="updateBreedOptions(this.value)">
            ${['Perro','Gato','Ave','Conejo','Pez','Hámster','Reptil','Otro'].map(s => `<option ${(d.species||'Perro')===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="form-label">Sexo</label>
          <select id="pet-sex" class="input-field">
            ${['Macho','Hembra'].map(s => `<option ${d.sex===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="form-label">Raza</label>
          <select id="pet-breed" class="input-field">
            ${(BREEDS[d.species || 'Perro'] || BREEDS.Otro).map(b => `<option ${(d.breed||'Mestizo')===b?'selected':''}>${b}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="form-label">Fecha de nacimiento</label>
          <input id="pet-dob" type="date" value="${d.dateOfBirth||''}" class="input-field" />
        </div>
      </div>
    </div>`;
}

function stepPhysical() {
  const d = state.newPetData;
  const tags = ['Juguetón','Cariñoso','Tranquilo','Activo','Tímido','Sociable','Independiente','Protector'];
  const colors = ['Negro','Blanco','Gris','Marrón','Dorado','Amarillo','Crema','Naranja','Rojo','Canela','Atigrado','Manchado negro y blanco','Manchado marrón y blanco','Tricolor','Bicolor','Azul grisáceo','Plateado','Otro'];
  const sizes = [
    { label: 'Pequeño', range: 'hasta 10 kg' },
    { label: 'Mediano', range: '10 – 25 kg' },
    { label: 'Grande',  range: '25 – 45 kg' },
    { label: 'Gigante', range: 'más de 45 kg' },
  ];
  return `
    <h2 class="text-lg font-bold text-gray-900 mb-4">Información física</h2>
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="form-label">Color</label>
          <select id="pet-color" class="input-field">
            ${colors.map(c => `<option ${(d.color||'')=== c?'selected':''}>${c}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="form-label">Tamaño</label>
          <select id="pet-size" class="input-field">
            ${sizes.map(s => `<option value="${s.label}" ${d.sizeRange===s.label?'selected':''}>${s.label} (${s.range})</option>`).join('')}
          </select>
        </div>
      </div>
      <div>
        <label class="form-label">Peso</label>
        <div class="grid grid-cols-2 gap-3 mt-1">
          <div class="relative">
            <input id="pet-wkg" type="number" min="0" max="200" value="${d.weightKg||''}" placeholder="0" class="input-field pr-10" />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">kg</span>
          </div>
          <div class="relative">
            <input id="pet-wgr" type="number" min="0" max="999" value="${d.weightGr||''}" placeholder="0" class="input-field pr-10" />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">gr</span>
          </div>
        </div>
        <p class="text-xs text-gray-400 mt-1">Ejemplo: 4 kg 500 gr → ingresa 4 en kilos y 500 en gramos</p>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="form-label">Estado reproductivo</label>
          <select id="pet-repro" class="input-field">
            ${['Entero/a','Esterilizado/a','Castrado/a'].map(s => `<option ${d.reproductiveStatus===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="form-label">Nro. de chip</label>
          <input id="pet-chip" type="text" value="${d.chipNumber||''}" placeholder="123456789" class="input-field" />
        </div>
      </div>
      <div>
        <label class="form-label">Nivel de actividad</label>
        <div class="flex gap-3 mt-1">
          ${[{v:1,l:'Bajo'},{v:2,l:'Medio'},{v:3,l:'Alto'}].map(a => `
            <button type="button" onclick="setActivity(${a.v})" id="act-${a.v}"
              class="flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all
              ${(d.activityLevel||2)===a.v ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-brand-300'}">
              ${a.l}
            </button>`).join('')}
        </div>
      </div>
      <div>
        <label class="form-label">Personalidad (selecciona varios)</label>
        <div class="flex flex-wrap gap-2 mt-1" id="tag-container">
          ${tags.map(t => `
            <button type="button" onclick="toggleTag('${t}')"
              class="tag ${(d.personalityTags||[]).includes(t) ? 'selected' : ''}">${t}</button>`).join('')}
        </div>
      </div>
    </div>`;
}

function stepHealth() {
  const d = state.newPetData;
  const allergyOpts = ['Pollo','Pescado','Pasto','Polen','Ácaros','Maíz','Trigo','Soya','Lácteos'];
  return `
    <h2 class="text-lg font-bold text-gray-900 mb-4">Salud inicial</h2>
    <div class="space-y-4">
      <div>
        <label class="form-label">Alergias conocidas</label>
        <div class="flex flex-wrap gap-2 mt-1">
          ${allergyOpts.map(a => `
            <button type="button" onclick="toggleAllergy('${a}')"
              class="tag ${(d.allergies||[]).includes(a) ? 'selected' : ''}">${a}</button>`).join('')}
        </div>
      </div>
      <div>
        <label class="form-label">Condiciones crónicas <span class="text-gray-400 font-normal">(selecciona una o más)</span></label>
        <div class="flex flex-wrap gap-2 mt-1">
          ${['Ninguna','Diabetes','Epilepsia','Hipotiroidismo','Hipertiroidismo','Displasia de cadera','Displasia de codo','Enfermedad renal crónica','Enfermedad cardíaca','Artritis','Obesidad','Cushing','Addison','Pancreatitis crónica','Enfermedad inflamatoria intestinal','Asma','Dermatitis atópica','Cáncer','Cataratas','Glaucoma','Otra'].map(c => `
            <button type="button" onclick="toggleCondition('${c}')"
              class="tag ${(d.chronicConditions||[]).includes(c) ? 'selected' : ''}">${c}</button>`).join('')}
        </div>
      </div>
      <hr class="border-gray-100" />
      <h3 class="font-semibold text-gray-700 text-sm">Veterinario de cabecera</h3>
      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2">
          <label class="form-label">Nombre del veterinario</label>
          <input id="vet-name" type="text" value="${d.vet?.name||''}" placeholder="Dr. García" class="input-field" />
        </div>
        <div class="col-span-2">
          <label class="form-label">Clínica</label>
          <input id="vet-clinic" type="text" value="${d.vet?.clinic||''}" placeholder="Clínica Veterinaria" class="input-field" />
        </div>
        <div>
          <label class="form-label">Teléfono</label>
          <input id="vet-phone" type="tel" value="${d.vet?.phone||''}" placeholder="+56 9 1234 5678" class="input-field" />
        </div>
        <div>
          <label class="form-label">Email</label>
          <input id="vet-email" type="email" value="${d.vet?.email||''}" placeholder="vet@clinica.cl" class="input-field" />
        </div>
      </div>
    </div>`;
}

function stepTutors() {
  const d = state.newPetData;
  return `
    <h2 class="text-lg font-bold text-gray-900 mb-4">Gestión de tutores</h2>
    <div class="space-y-4">
      <div class="bg-brand-50 border border-brand-100 rounded-xl p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold">
            ${(state.user?.name||'U')[0].toUpperCase()}
          </div>
          <div>
            <div class="font-medium text-gray-900 text-sm">${state.user?.name || 'Tu nombre'}</div>
            <div class="text-xs text-gray-500">${state.user?.email || ''}</div>
            <span class="badge bg-brand-100 text-brand-700 mt-1">Tutor principal</span>
          </div>
        </div>
      </div>
      <div>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" id="add-tutor2" class="rounded text-brand-500" onchange="toggleTutor2(this)" ${d.tutor2?.name?'checked':''} />
          <span class="text-sm font-medium text-gray-700">Agregar segundo tutor</span>
        </label>
      </div>
      <div id="tutor2-fields" class="${d.tutor2?.name?'':'hidden'} space-y-3 p-4 border border-gray-200 rounded-xl">
        <div>
          <label class="form-label">Nombre</label>
          <input id="t2-name" type="text" value="${d.tutor2?.name||''}" placeholder="Nombre del segundo tutor" class="input-field" />
        </div>
        <div>
          <label class="form-label">Email</label>
          <input id="t2-email" type="email" value="${d.tutor2?.email||''}" placeholder="email@ejemplo.com" class="input-field" />
        </div>
        <div>
          <label class="form-label">Permisos</label>
          <select id="t2-role" class="input-field">
            <option value="edicion" ${d.tutor2?.role==='edicion'?'selected':''}>Edición</option>
            <option value="lectura" ${d.tutor2?.role==='lectura'?'selected':''}>Solo lectura</option>
          </select>
        </div>
      </div>
      <div class="bg-teal-50 rounded-xl p-4 text-sm text-teal-700">
        🐾 Tu mascota quedará registrada con toda la información ingresada. ¡Podrás editarla en cualquier momento!
      </div>
    </div>`;
}

// ---- VISTA: PERFIL DE MASCOTA ----
function viewPetProfile() {
  const pet = state.pets.find(p => p.id === state.currentPetId);
  if (!pet) { navigate('pets'); return ''; }
  const tabs = ['general','vacunas','desparasitación','medicamentos','historial'];
  const tabLabels = { general:'General', vacunas:'Vacunas', 'desparasitación':'Desparasitación', medicamentos:'Medicamentos', historial:'Historial' };
  const tab = state.currentTab;

  return appShell(`
    <div class="max-w-3xl mx-auto">
      <button onclick="navigate('pets')" class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        ← Mis Mascotas
      </button>
      <div class="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <div class="flex items-center gap-4">
          ${petAvatar(pet, 'lg')}
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h1 class="text-xl font-bold text-gray-900">${pet.name}</h1>
                <div class="text-sm text-gray-400">${pet.species} · ${pet.breed || 'Mestizo'} · ${pet.sex || ''}</div>
                <div class="text-sm text-gray-400">${getAge(pet.dateOfBirth)}</div>
              </div>
              <div class="flex gap-2">
                <button onclick="openEditPetModal('${pet.id}')" class="btn-secondary text-xs">Editar</button>
                <button onclick="confirmDeletePet('${pet.id}')" class="px-3 py-1.5 rounded-xl text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors">Eliminar</button>
              </div>
            </div>
            <div class="flex flex-wrap gap-2 mt-2">
              ${(pet.personalityTags||[]).map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm mb-4 overflow-x-auto">
        <div class="flex border-b border-gray-100 min-w-max">
          ${tabs.map(t => `
            <button onclick="setTab('${t}')"
              class="px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${tab===t ? 'text-brand-600 border-b-2 border-brand-500' : 'text-gray-500 hover:text-gray-700'}">
              ${tabLabels[t]}
            </button>`).join('')}
        </div>
      </div>

      <div class="animate-fade-in">
        ${tab === 'general'        ? tabGeneral(pet)         : ''}
        ${tab === 'vacunas'        ? tabVaccines(pet)        : ''}
        ${tab === 'desparasitación' ? tabDeworming(pet)      : ''}
        ${tab === 'medicamentos'   ? tabMedications(pet)     : ''}
        ${tab === 'historial'      ? tabHistory(pet)         : ''}
      </div>
    </div>
  `);
}

function tabGeneral(pet) {
  return `
    <div class="grid md:grid-cols-2 gap-4">
      <div class="bg-white rounded-2xl shadow-sm p-5">
        <h3 class="font-semibold text-gray-700 mb-3">Datos básicos</h3>
        <dl class="space-y-2 text-sm">
          ${infoRow('Especie', pet.species)} ${infoRow('Raza', pet.breed||'Mestizo')}
          ${infoRow('Sexo', pet.sex)} ${infoRow('Nacimiento', formatDate(pet.dateOfBirth))}
          ${infoRow('Edad', getAge(pet.dateOfBirth))}
        </dl>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-5">
        <h3 class="font-semibold text-gray-700 mb-3">Datos físicos</h3>
        <dl class="space-y-2 text-sm">
          ${infoRow('Color', pet.color)} ${infoRow('Tamaño', pet.sizeRange)}
          ${infoRow('Peso', pet.weightKg ? `${pet.weightKg} kg ${pet.weightGr||0} gr` : '—')}
          ${infoRow('Estado reproductivo', pet.reproductiveStatus)}
          ${infoRow('Nro. chip', pet.chipNumber||'Sin chip')}
          ${infoRow('Nivel actividad', ['','Bajo','Medio','Alto'][pet.activityLevel]||'—')}
        </dl>
      </div>
      ${pet.allergies?.length||pet.chronicConditions ? `
      <div class="bg-white rounded-2xl shadow-sm p-5">
        <h3 class="font-semibold text-gray-700 mb-3">Salud</h3>
        <dl class="space-y-2 text-sm">
          ${infoRow('Alergias', (pet.allergies||[]).join(', ')||'Ninguna')}
          ${infoRow('Condiciones crónicas', Array.isArray(pet.chronicConditions) ? (pet.chronicConditions.join(', ')||'Ninguna') : (pet.chronicConditions||'Ninguna'))}
        </dl>
      </div>` : ''}
      ${pet.vet?.name ? `
      <div class="bg-white rounded-2xl shadow-sm p-5">
        <h3 class="font-semibold text-gray-700 mb-3">Veterinario</h3>
        <dl class="space-y-2 text-sm">
          ${infoRow('Nombre', pet.vet.name)} ${infoRow('Clínica', pet.vet.clinic)}
          ${infoRow('Teléfono', pet.vet.phone)} ${infoRow('Email', pet.vet.email)}
        </dl>
      </div>` : ''}
    </div>`;
}

function infoRow(label, value) {
  return `<div class="flex justify-between"><dt class="text-gray-400">${label}</dt><dd class="font-medium text-gray-800 text-right max-w-[60%]">${value||'—'}</dd></div>`;
}

function tabVaccines(pet) {
  const vs = pet.vaccines || [];
  return `
    <div class="bg-white rounded-2xl shadow-sm p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-700">Vacunas (${vs.length})</h3>
        <button onclick="openVaccineModal('${pet.id}')" class="btn-primary text-sm">+ Agregar</button>
      </div>
      ${vs.length === 0
        ? emptyState('💉','Sin vacunas registradas','Agrega el historial de vacunación')
        : `<div class="space-y-3">
             ${vs.map(v => `
               <div class="border border-gray-100 rounded-xl p-4 flex items-start justify-between">
                 <div class="flex items-start gap-3">
                   <div class="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-lg">💉</div>
                   <div>
                     <div class="font-medium text-gray-900 text-sm">${v.name}</div>
                     <div class="text-xs text-gray-400">${v.code ? `Código: ${v.code} · ` : ''}Aplicada: ${formatDate(v.date)}</div>
                     ${v.nextDate ? `<div class="text-xs mt-1 ${new Date(v.nextDate) < new Date() ? 'text-red-500' : 'text-green-600'}">Próxima: ${formatDate(v.nextDate)}</div>` : ''}
                     ${v.cost ? `<div class="text-xs text-gray-400">Costo: ${fmtCLP(v.cost)}</div>` : ''}
                   </div>
                 </div>
                 <button onclick="deleteVaccine('${pet.id}','${v.id}')" class="text-red-400 hover:text-red-600 text-xs p-1">✕</button>
               </div>`).join('')}
           </div>`}
    </div>`;
}

function tabDeworming(pet) {
  const ds = pet.deworming || [];
  return `
    <div class="bg-white rounded-2xl shadow-sm p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-700">Desparasitaciones (${ds.length})</h3>
        <button onclick="openDewormModal('${pet.id}')" class="btn-primary text-sm">+ Agregar</button>
      </div>
      ${ds.length === 0
        ? emptyState('🪱','Sin desparasitaciones','Registra los tratamientos antiparasitarios')
        : `<div class="space-y-3">
             ${ds.map(d => `
               <div class="border border-gray-100 rounded-xl p-4 flex items-start justify-between">
                 <div class="flex items-start gap-3">
                   <div class="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center text-lg">🪱</div>
                   <div>
                     <div class="font-medium text-gray-900 text-sm">${d.product}</div>
                     <div class="text-xs text-gray-400">${d.type} · ${d.format} · Fecha: ${formatDate(d.date)}</div>
                     <div class="text-xs text-gray-400">Dosis: ${d.dose} ${d.unit}</div>
                     ${d.nextDate ? `<div class="text-xs text-green-600">Próxima: ${formatDate(d.nextDate)}</div>` : ''}
                   </div>
                 </div>
                 <button onclick="deleteDeworming('${pet.id}','${d.id}')" class="text-red-400 hover:text-red-600 text-xs p-1">✕</button>
               </div>`).join('')}
           </div>`}
    </div>`;
}

function tabMedications(pet) {
  const ms = pet.medications || [];
  return `
    <div class="bg-white rounded-2xl shadow-sm p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-700">Medicamentos (${ms.length})</h3>
        <button onclick="openMedModal('${pet.id}')" class="btn-primary text-sm">+ Agregar</button>
      </div>
      ${ms.length === 0
        ? emptyState('💊','Sin medicamentos','Registra tratamientos activos e historial')
        : `<div class="space-y-3">
             ${ms.map(m => `
               <div class="border border-gray-100 rounded-xl p-4 flex items-start justify-between">
                 <div class="flex items-start gap-3">
                   <div class="w-9 h-9 ${m.active?'bg-purple-50':'bg-gray-50'} rounded-xl flex items-center justify-center text-lg">💊</div>
                   <div>
                     <div class="flex items-center gap-2">
                       <span class="font-medium text-gray-900 text-sm">${m.name}</span>
                       ${m.active ? '<span class="badge bg-green-100 text-green-700">Activo</span>' : '<span class="badge bg-gray-100 text-gray-500">Finalizado</span>'}
                     </div>
                     <div class="text-xs text-gray-400">${m.dose} · ${m.frequency}</div>
                     <div class="text-xs text-gray-400">${formatDate(m.startDate)} → ${formatDate(m.endDate)}</div>
                     <div class="text-xs text-gray-400">Stock: ${m.stock||0} unidades</div>
                   </div>
                 </div>
                 <button onclick="deleteMedication('${pet.id}','${m.id}')" class="text-red-400 hover:text-red-600 text-xs p-1">✕</button>
               </div>`).join('')}
           </div>`}
    </div>`;
}

function tabHistory(pet) {
  const hs = pet.clinicalHistory || [];
  const types = ['Cirugía','Esterilización','Procedimiento','Diagnóstico','Otro'];
  return `
    <div class="bg-white rounded-2xl shadow-sm p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-700">Historial clínico (${hs.length})</h3>
        <button onclick="openHistoryModal('${pet.id}')" class="btn-primary text-sm">+ Agregar</button>
      </div>
      ${hs.length === 0
        ? emptyState('📋','Sin historial clínico','Registra eventos y procedimientos médicos')
        : `<div class="relative pl-6">
             <div class="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200"></div>
             ${[...hs].reverse().map(h => `
               <div class="relative mb-4">
                 <div class="absolute -left-4 top-1 w-3 h-3 rounded-full bg-brand-500 border-2 border-white"></div>
                 <div class="border border-gray-100 rounded-xl p-4">
                   <div class="flex items-start justify-between">
                     <div>
                       <div class="flex items-center gap-2">
                         <span class="font-medium text-gray-900 text-sm">${h.title}</span>
                         <span class="badge bg-brand-50 text-brand-700">${h.type}</span>
                       </div>
                       <div class="text-xs text-gray-400 mt-0.5">${formatDate(h.date)} ${h.doctor ? `· ${h.doctor}` : ''} ${h.clinic ? `· ${h.clinic}` : ''}</div>
                       ${h.notes ? `<p class="text-sm text-gray-600 mt-1">${h.notes}</p>` : ''}
                       ${h.cost ? `<div class="text-xs text-gray-400 mt-1">Costo: ${fmtCLP(h.cost)}</div>` : ''}
                     </div>
                     <button onclick="deleteHistory('${pet.id}','${h.id}')" class="text-red-400 hover:text-red-600 text-xs p-1">✕</button>
                   </div>
                 </div>
               </div>`).join('')}
           </div>`}
    </div>`;
}

// ---- VISTA: CALENDARIO ----
function viewCalendar() {
  const now = new Date();
  const year = state.calYear || now.getFullYear();
  const month = state.calMonth !== undefined ? state.calMonth : now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();
  const today = now.toISOString().slice(0,10);
  const events = state.events || [];
  const monthName = firstDay.toLocaleDateString('es-CL', { month:'long', year:'numeric' });
  const days = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);

  return appShell(`
    ${pageHeader('Agenda', monthName,
      `<button onclick="openEventModal()" class="btn-primary flex items-center gap-2">+ Evento</button>`)}

    <div class="bg-white rounded-2xl shadow-sm p-4 mb-6">
      <div class="flex items-center justify-between mb-4">
        <button onclick="prevMonth()" class="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center">‹</button>
        <span class="font-semibold text-gray-800 capitalize">${monthName}</span>
        <button onclick="nextMonth()" class="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center">›</button>
      </div>
      <div class="grid grid-cols-7 gap-1 mb-2">
        ${['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d => `<div class="text-center text-xs font-medium text-gray-400 py-1">${d}</div>`).join('')}
      </div>
      <div class="grid grid-cols-7 gap-1">
        ${days.map((d, i) => {
          if (!d) return `<div class="calendar-day other-month"></div>`;
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          const dayEvents = events.filter(e => e.date === dateStr);
          const isToday = dateStr === today;
          return `
            <div onclick="openEventModal('${dateStr}')" class="calendar-day ${isToday?'today':''} relative">
              <div class="text-xs font-medium ${isToday?'text-brand-600':'text-gray-700'}">${d}</div>
              ${dayEvents.map(e => `
                <div class="text-xs mt-0.5 px-1 py-0.5 rounded bg-brand-100 text-brand-700 truncate">${eventIcon(e.type)} ${e.title}</div>
              `).join('')}
            </div>`;
        }).join('')}
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm p-5">
      <h3 class="font-semibold text-gray-700 mb-3">Próximos eventos</h3>
      ${events.filter(e => e.date >= today).sort((a,b)=>a.date>b.date?1:-1).slice(0,10).length === 0
        ? `<p class="text-sm text-gray-400 text-center py-4">Sin eventos próximos</p>`
        : events.filter(e=>e.date>=today).sort((a,b)=>a.date>b.date?1:-1).slice(0,10).map(e => `
            <div class="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
              <div class="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-base">${eventIcon(e.type)}</div>
              <div class="flex-1">
                <div class="text-sm font-medium text-gray-900">${e.title}</div>
                <div class="text-xs text-gray-400">${formatDate(e.date)} ${e.pet ? `· ${e.pet}` : ''}</div>
              </div>
              <button onclick="deleteEvent('${e.id}')" class="text-red-400 hover:text-red-600 text-xs">✕</button>
            </div>`).join('')}
    </div>
  `);
}

// ---- VISTA: FINANZAS ----
function viewFinance() {
  const expenses = state.expenses || [];
  const pets = state.pets;
  const today = new Date();
  const thisMonth = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;
  const monthExp = expenses.filter(e => e.date?.startsWith(thisMonth));
  const total = expenses.reduce((s,e)=>s+Number(e.amount||0), 0);
  const monthTotal = monthExp.reduce((s,e)=>s+Number(e.amount||0), 0);

  // Chart data: last 6 months
  const months6 = Array.from({length:6}, (_,i) => {
    const d = new Date(today.getFullYear(), today.getMonth()-5+i, 1);
    return { label: d.toLocaleDateString('es-CL',{month:'short'}), key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` };
  });

  const catColors = { Veterinaria:'#8b5cf6', Medicamentos:'#06b6d4', Alimentación:'#f59e0b', Peluquería:'#ec4899', Hotel:'#10b981', Otro:'#6b7280' };

  setTimeout(() => {
    const ctx = document.getElementById('expenses-chart');
    if (ctx) {
      if (chartInstance) chartInstance.destroy();
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: months6.map(m => m.label),
          datasets: [{
            label: 'Gastos (CLP)',
            data: months6.map(m => expenses.filter(e=>e.date?.startsWith(m.key)).reduce((s,e)=>s+Number(e.amount||0),0)),
            backgroundColor: '#8b5cf6', borderRadius: 8,
          }]
        },
        options: { responsive:true, plugins:{ legend:{display:false} }, scales:{ y:{ ticks:{callback:v=>'$'+v.toLocaleString('es-CL')} } } }
      });
    }
  }, 100);

  return appShell(`
    ${pageHeader('Finanzas', 'Control de gastos por mascota',
      `<button onclick="openExpenseModal()" class="btn-primary">+ Gasto</button>`)}

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 stagger">
      ${statCard('💰','Total gastos', fmtCLP(total), 'brand')}
      ${statCard('📅','Este mes', fmtCLP(monthTotal), 'teal')}
      ${statCard('🧾','Registros', expenses.length, 'amber')}
      ${statCard('🐾','Mascotas', pets.length, 'brand')}
    </div>

    <div class="grid md:grid-cols-2 gap-6 mb-6">
      <div class="bg-white rounded-2xl shadow-sm p-5">
        <h3 class="font-semibold text-gray-700 mb-4">Últimos 6 meses</h3>
        <canvas id="expenses-chart" height="200"></canvas>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-5">
        <h3 class="font-semibold text-gray-700 mb-4">Por categoría</h3>
        ${Object.keys(catColors).map(cat => {
          const catTotal = expenses.filter(e=>e.category===cat).reduce((s,e)=>s+Number(e.amount||0),0);
          const pct = total > 0 ? Math.round(catTotal/total*100) : 0;
          if (!catTotal) return '';
          return `
            <div class="mb-3">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600">${cat}</span>
                <span class="font-medium text-gray-800">${fmtCLP(catTotal)} (${pct}%)</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2">
                <div class="h-2 rounded-full" style="width:${pct}%;background:${catColors[cat]}"></div>
              </div>
            </div>`;
        }).join('')}
        ${total === 0 ? '<p class="text-sm text-gray-400 text-center py-4">Sin gastos registrados</p>' : ''}
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-700">Historial de gastos</h3>
      </div>
      ${expenses.length === 0
        ? emptyState('💸','Sin gastos registrados','Comienza a registrar los gastos de tus mascotas')
        : `<div class="overflow-x-auto">
             <table class="w-full text-sm">
               <thead><tr class="text-left text-gray-400 text-xs border-b border-gray-100">
                 <th class="pb-2 font-medium">Fecha</th><th class="pb-2 font-medium">Descripción</th>
                 <th class="pb-2 font-medium">Mascota</th><th class="pb-2 font-medium">Categoría</th>
                 <th class="pb-2 font-medium text-right">Monto</th><th class="pb-2"></th>
               </tr></thead>
               <tbody>
                 ${[...expenses].reverse().map(e => `
                   <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                     <td class="py-2 text-gray-400">${formatDate(e.date)}</td>
                     <td class="py-2 font-medium text-gray-800">${e.description}</td>
                     <td class="py-2 text-gray-500">${e.pet||'—'}</td>
                     <td class="py-2"><span class="badge bg-brand-50 text-brand-700">${e.category||'—'}</span></td>
                     <td class="py-2 text-right font-semibold text-gray-900">${fmtCLP(e.amount)}</td>
                     <td class="py-2 text-right"><button onclick="deleteExpense('${e.id}')" class="text-red-400 hover:text-red-600">✕</button></td>
                   </tr>`).join('')}
               </tbody>
             </table>
           </div>`}
    </div>
  `);
}

// ---- MODALES ----
function openModal(html) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="modal-overlay" onclick="closeModal(event)">${html}</div>`;
}
function closeModal(e) {
  if (!e || e.target.classList.contains('modal-overlay')) {
    document.getElementById('modal-root').innerHTML = '';
  }
}

function openVaccineModal(petId) {
  const pet = state.pets.find(p => p.id === petId);
  const species = pet?.species || 'Perro';
  const vaccineList = VACCINES_BY_SPECIES[species] || VACCINES_BY_SPECIES.Otro;
  openModal(`
    <div class="modal-box p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-1">Nueva vacuna</h3>
      <p class="text-xs text-gray-400 mb-4">Vacunas para ${species} · La alerta se enviará automáticamente en la fecha calculada</p>
      <form onsubmit="saveVaccine(event,'${petId}')" class="space-y-3">
        <div>
          <label class="form-label">Vacuna *</label>
          <select id="v-name" required class="input-field">
            <option value="">— Selecciona una vacuna —</option>
            ${vaccineList.map(v => `<option>${v}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="form-label">Código / Lote</label>
          <input id="v-code" placeholder="Ej: RAB-001" class="input-field" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label">Fecha de aplicación *</label>
            <input id="v-date" type="date" required class="input-field" onchange="updateNextDatePreview('v')" />
          </div>
          <div>
            <label class="form-label">Periodicidad</label>
            <select id="v-period" class="input-field" onchange="updateNextDatePreview('v')">
              ${PERIODICITY_OPTIONS.map(p => `<option value="${p.months}">${p.label}</option>`).join('')}
            </select>
          </div>
        </div>
        <div id="v-next-preview" class="hidden bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 text-sm">
          <span class="text-gray-500">Próxima aplicación:</span>
          <span id="v-next-date" class="font-semibold text-brand-700 ml-1"></span>
          <div class="text-xs text-brand-500 mt-0.5">🔔 Se enviará una alerta automáticamente ese día</div>
        </div>
        <div>
          <label class="form-label">Costo (CLP)</label>
          <input id="v-cost" type="number" min="0" placeholder="0" class="input-field" />
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button type="submit" class="btn-primary flex-1">Guardar vacuna</button>
        </div>
      </form>
    </div>`);
}

function openDewormModal(petId) {
  openModal(`
    <div class="modal-box p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-1">Nueva desparasitación</h3>
      <p class="text-xs text-gray-400 mb-4">La alerta se enviará automáticamente en la fecha calculada</p>
      <form onsubmit="saveDeworming(event,'${petId}')" class="space-y-3">
        <div>
          <label class="form-label">Producto *</label>
          <input id="d-product" required placeholder="Nombre del producto" class="input-field" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label">Tipo</label>
            <select id="d-type" class="input-field"><option>Interna</option><option>Externa</option><option>Ambas</option></select>
          </div>
          <div>
            <label class="form-label">Formato</label>
            <select id="d-format" onchange="updateDoseUnit()" class="input-field">
              <option>Comprimido</option><option>Pipeta</option><option>Collar</option>
              <option>Spray</option><option>Jarabe</option><option>Inyección</option>
            </select>
          </div>
          <div>
            <label class="form-label">Dosis</label>
            <input id="d-dose" placeholder="1" class="input-field" />
          </div>
          <div>
            <label class="form-label">Unidad</label>
            <input id="d-unit" placeholder="Comprimidos" class="input-field" />
          </div>
          <div>
            <label class="form-label">Fecha de aplicación *</label>
            <input id="d-date" type="date" required class="input-field" onchange="updateNextDatePreview('d')" />
          </div>
          <div>
            <label class="form-label">Periodicidad</label>
            <select id="d-period" class="input-field" onchange="updateNextDatePreview('d')">
              ${PERIODICITY_OPTIONS.map(p => `<option value="${p.months}">${p.label}</option>`).join('')}
            </select>
          </div>
        </div>
        <div id="d-next-preview" class="hidden bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 text-sm">
          <span class="text-gray-500">Próxima aplicación:</span>
          <span id="d-next-date" class="font-semibold text-teal-700 ml-1"></span>
          <div class="text-xs text-teal-500 mt-0.5">🔔 Se enviará una alerta automáticamente ese día</div>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button type="submit" class="btn-primary flex-1">Guardar</button>
        </div>
      </form>
    </div>`);
}

function openMedModal(petId) {
  openModal(`
    <div class="modal-box p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4">Nuevo medicamento</h3>
      <form onsubmit="saveMedication(event,'${petId}')" class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div class="col-span-2"><label class="form-label">Medicamento *</label><input id="m-name" required placeholder="Nombre del medicamento" class="input-field" /></div>
          <div class="col-span-2"><label class="form-label">Dosis</label><input id="m-dose" placeholder="Ej: 1 comprimido" class="input-field" /></div>
          <div class="col-span-2"><label class="form-label">Frecuencia</label>
            <select id="m-freq" class="input-field">
              <option>Cada 8 horas</option><option>Cada 12 horas</option><option>Cada 24 horas</option>
              <option>Cada 48 horas</option><option>1 vez/semana</option><option>Según prescripción</option>
            </select>
          </div>
          <div><label class="form-label">Inicio *</label><input id="m-start" type="date" required class="input-field" /></div>
          <div><label class="form-label">Fin</label><input id="m-end" type="date" class="input-field" /></div>
          <div><label class="form-label">Stock (unidades)</label><input id="m-stock" type="number" min="0" placeholder="0" class="input-field" /></div>
          <div class="flex items-center gap-2 mt-4">
            <input type="checkbox" id="m-active" checked class="rounded text-brand-500" />
            <label for="m-active" class="text-sm text-gray-700">Tratamiento activo</label>
          </div>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button type="submit" class="btn-primary flex-1">Guardar</button>
        </div>
      </form>
    </div>`);
}

function openHistoryModal(petId) {
  openModal(`
    <div class="modal-box p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4">Nuevo evento clínico</h3>
      <form onsubmit="saveHistory(event,'${petId}')" class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div class="col-span-2"><label class="form-label">Título *</label><input id="h-title" required placeholder="Ej: Esterilización" class="input-field" /></div>
          <div><label class="form-label">Tipo</label>
            <select id="h-type" class="input-field">
              <option>Cirugía</option><option>Esterilización</option><option>Procedimiento</option>
              <option>Diagnóstico</option><option>Otro</option>
            </select>
          </div>
          <div><label class="form-label">Fecha *</label><input id="h-date" type="date" required class="input-field" /></div>
          <div><label class="form-label">Médico</label><input id="h-doctor" placeholder="Dr. García" class="input-field" /></div>
          <div><label class="form-label">Clínica</label><input id="h-clinic" placeholder="Clínica Vet." class="input-field" /></div>
          <div class="col-span-2"><label class="form-label">Costo (CLP)</label><input id="h-cost" type="number" min="0" placeholder="0" class="input-field" /></div>
          <div class="col-span-2"><label class="form-label">Notas</label><textarea id="h-notes" rows="2" class="input-field resize-none" placeholder="Observaciones..."></textarea></div>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button type="submit" class="btn-primary flex-1">Guardar</button>
        </div>
      </form>
    </div>`);
}

function openEventModal(dateStr = '') {
  const pets = state.pets;
  openModal(`
    <div class="modal-box p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4">Nuevo evento</h3>
      <form onsubmit="saveEvent(event)" class="space-y-3">
        <div><label class="form-label">Título *</label><input id="ev-title" required placeholder="Ej: Consulta anual" class="input-field" /></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="form-label">Tipo</label>
            <select id="ev-type" class="input-field">
              <option>Consulta</option><option>Examen</option><option>Peluquería</option>
              <option>Hotel</option><option>Vacuna</option><option>Otro</option>
            </select>
          </div>
          <div><label class="form-label">Fecha *</label><input id="ev-date" type="date" required value="${dateStr}" class="input-field" /></div>
        </div>
        <div><label class="form-label">Mascota</label>
          <select id="ev-pet" class="input-field">
            <option value="">Sin mascota</option>
            ${pets.map(p => `<option>${p.name}</option>`).join('')}
          </select>
        </div>
        <div><label class="form-label">Notas</label><textarea id="ev-notes" rows="2" class="input-field resize-none" placeholder="Detalles del evento..."></textarea></div>
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button type="submit" class="btn-primary flex-1">Guardar</button>
        </div>
      </form>
    </div>`);
}

function openExpenseModal() {
  const pets = state.pets;
  openModal(`
    <div class="modal-box p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4">Registrar gasto</h3>
      <form onsubmit="saveExpense(event)" class="space-y-3">
        <div><label class="form-label">Descripción *</label><input id="ex-desc" required placeholder="Ej: Consulta veterinaria" class="input-field" /></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="form-label">Monto (CLP) *</label><input id="ex-amount" type="number" required min="0" placeholder="0" class="input-field" /></div>
          <div><label class="form-label">Fecha *</label><input id="ex-date" type="date" required value="${new Date().toISOString().slice(0,10)}" class="input-field" /></div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="form-label">Categoría</label>
            <select id="ex-cat" class="input-field">
              <option>Veterinaria</option><option>Medicamentos</option><option>Alimentación</option>
              <option>Peluquería</option><option>Hotel</option><option>Otro</option>
            </select>
          </div>
          <div><label class="form-label">Mascota</label>
            <select id="ex-pet" class="input-field">
              <option value="">General</option>
              ${pets.map(p => `<option>${p.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button type="submit" class="btn-primary flex-1">Guardar</button>
        </div>
      </form>
    </div>`);
}

function openEditPetModal(petId) {
  const p = state.pets.find(x => x.id === petId);
  if (!p) return;
  openModal(`
    <div class="modal-box p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4">Editar mascota</h3>
      <div class="space-y-3">
        <div><label class="form-label">Nombre</label><input id="ep-name" value="${p.name||''}" class="input-field" /></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="form-label">Especie</label>
            <select id="ep-species" class="input-field">${['Perro','Gato','Ave','Conejo','Pez','Hámster','Reptil','Otro'].map(s=>`<option ${p.species===s?'selected':''}>${s}</option>`).join('')}</select>
          </div>
          <div><label class="form-label">Raza</label><input id="ep-breed" value="${p.breed||''}" class="input-field" /></div>
          <div><label class="form-label">Peso (kg)</label><input id="ep-wkg" type="number" value="${p.weightKg||''}" class="input-field" /></div>
          <div><label class="form-label">Nacimiento</label><input id="ep-dob" type="date" value="${p.dateOfBirth||''}" class="input-field" /></div>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button onclick="saveEditPet('${petId}')" class="btn-primary flex-1">Guardar</button>
        </div>
      </div>
    </div>`);
}

// ---- CONTROLADORES ----
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('l-email').value;
  const name = email.split('@')[0].replace(/\./g,' ').replace(/\b\w/g, l=>l.toUpperCase());
  state.user = { name, email };
  state.isLoggedIn = true;
  saveState();
  navigate('dashboard');
}

function handleRegister(e) {
  e.preventDefault();
  const pass = document.getElementById('r-pass').value;
  const pass2 = document.getElementById('r-pass2').value;
  if (pass !== pass2) { showToast('Las contraseñas no coinciden', 'error'); return; }
  state.user = { name: document.getElementById('r-name').value, email: document.getElementById('r-email').value };
  state.isLoggedIn = true;
  saveState(); navigate('dashboard');
}

function handleForgot() {
  const email = document.getElementById('f-email')?.value;
  if (!email) return;
  showToast('✉️ Enlace enviado a ' + email, 'success');
  setTimeout(() => navigate('login'), 1500);
}

function logout() {
  state.isLoggedIn = false; state.user = null;
  saveState(); navigate('login');
}

function openPet(id) { navigate('petProfile', { currentPetId: id, currentTab: 'general' }); }
function setTab(t) { state.currentTab = t; render(); }

function prevStep() { if (state.addPetStep > 1) { collectStepData(); state.addPetStep--; render(); } }
function nextStep() {
  collectStepData();
  if (state.addPetStep === 4) { savePet(); return; }
  state.addPetStep++; render();
}

function collectStepData() {
  const d = state.newPetData;
  const g = id => document.getElementById(id);
  if (state.addPetStep === 1) {
    if (g('pet-name')) d.name = g('pet-name').value;
    if (g('pet-species')) d.species = g('pet-species').value;
    if (g('pet-sex')) d.sex = g('pet-sex').value;
    if (g('pet-breed')) d.breed = g('pet-breed').value;
    if (g('pet-dob')) d.dateOfBirth = g('pet-dob').value;
  } else if (state.addPetStep === 2) {
    if (g('pet-color')) d.color = g('pet-color').value;
    if (g('pet-size')) d.sizeRange = g('pet-size').value;
    if (g('pet-wkg')) d.weightKg = g('pet-wkg').value;
    if (g('pet-wgr')) d.weightGr = g('pet-wgr').value;
    if (g('pet-repro')) d.reproductiveStatus = g('pet-repro').value;
    if (g('pet-chip')) d.chipNumber = g('pet-chip').value;
  } else if (state.addPetStep === 3) {
    // chronicConditions se gestiona con toggleCondition()
    d.vet = {
      name: g('vet-name')?.value||'', clinic: g('vet-clinic')?.value||'',
      phone: g('vet-phone')?.value||'', email: g('vet-email')?.value||'',
    };
  } else if (state.addPetStep === 4) {
    if (g('add-tutor2')?.checked) {
      d.tutor2 = { name: g('t2-name')?.value||'', email: g('t2-email')?.value||'', role: g('t2-role')?.value||'edicion' };
    }
  }
}

function savePet() {
  const d = state.newPetData;
  if (!d.name) { showToast('El nombre es requerido', 'error'); state.addPetStep = 1; render(); return; }
  const pet = {
    id: genId(), ...d,
    vaccines: [], deworming: [], medications: [], clinicalHistory: [],
    personalityTags: d.personalityTags || [], allergies: d.allergies || [],
    activityLevel: d.activityLevel || 2,
  };
  state.pets.push(pet);
  state.newPetData = {}; state.addPetStep = 1;
  saveState();
  showToast(`🐾 ${pet.name} registrado con éxito!`, 'success');
  navigate('petProfile', { currentPetId: pet.id, currentTab: 'general' });
}

function confirmDeletePet(petId) {
  const pet = state.pets.find(p => p.id === petId);
  openModal(`
    <div class="modal-box p-6 text-center">
      <div class="text-5xl mb-3">⚠️</div>
      <h3 class="text-lg font-bold text-gray-900 mb-2">¿Eliminar a ${pet?.name}?</h3>
      <p class="text-sm text-gray-500 mb-6">Esta acción no se puede deshacer. Se eliminará toda la información de ${pet?.name}.</p>
      <div class="flex gap-3">
        <button onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
        <button onclick="deletePet('${petId}')" class="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors">Eliminar</button>
      </div>
    </div>`);
}

function deletePet(petId) {
  state.pets = state.pets.filter(p => p.id !== petId);
  saveState(); closeModal(); navigate('pets');
  showToast('Mascota eliminada', 'error');
}

function saveEditPet(petId) {
  const p = state.pets.find(x => x.id === petId);
  if (!p) return;
  const g = id => document.getElementById(id)?.value;
  p.name = g('ep-name') || p.name; p.species = g('ep-species') || p.species;
  p.breed = g('ep-breed'); p.weightKg = g('ep-wkg'); p.dateOfBirth = g('ep-dob');
  saveState(); closeModal(); render();
  showToast('Cambios guardados', 'success');
}

function saveVaccine(e, petId) {
  e.preventDefault();
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;
  const g = id => document.getElementById(id)?.value;
  const date = g('v-date'), period = g('v-period');
  const v = { id: genId(), name: g('v-name'), code: g('v-code'), date, periodicity: period,
    nextDate: period ? addMonths(date, parseInt(period)) : '', alertType: 'automática', cost: g('v-cost') };
  pet.vaccines = pet.vaccines || [];
  pet.vaccines.push(v);
  if (v.cost) { state.expenses.push({ id: genId(), description: `Vacuna ${v.name} - ${pet.name}`, amount: v.cost, date, category: 'Veterinaria', pet: pet.name }); }
  saveState(); closeModal(); render();
  showToast('Vacuna registrada ✓', 'success');
}

function deleteVaccine(petId, vId) {
  const pet = state.pets.find(p => p.id === petId);
  if (pet) { pet.vaccines = pet.vaccines.filter(v => v.id !== vId); saveState(); render(); }
}

function saveDeworming(e, petId) {
  e.preventDefault();
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;
  const g = id => document.getElementById(id)?.value;
  const date = g('d-date'), period = g('d-period');
  const d = { id: genId(), product: g('d-product'), type: g('d-type'), format: g('d-format'),
    dose: g('d-dose'), unit: g('d-unit'), date, nextDate: period ? addMonths(date, parseInt(period)) : '' };
  pet.deworming = pet.deworming || [];
  pet.deworming.push(d);
  saveState(); closeModal(); render();
  showToast('Desparasitación registrada ✓', 'success');
}

function deleteDeworming(petId, dId) {
  const pet = state.pets.find(p => p.id === petId);
  if (pet) { pet.deworming = pet.deworming.filter(d => d.id !== dId); saveState(); render(); }
}

function saveMedication(e, petId) {
  e.preventDefault();
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;
  const g = id => document.getElementById(id)?.value;
  const m = { id: genId(), name: g('m-name'), dose: g('m-dose'), frequency: g('m-freq'),
    startDate: g('m-start'), endDate: g('m-end'), stock: g('m-stock'),
    active: document.getElementById('m-active')?.checked };
  pet.medications = pet.medications || [];
  pet.medications.push(m);
  saveState(); closeModal(); render();
  showToast('Medicamento registrado ✓', 'success');
}

function deleteMedication(petId, mId) {
  const pet = state.pets.find(p => p.id === petId);
  if (pet) { pet.medications = pet.medications.filter(m => m.id !== mId); saveState(); render(); }
}

function saveHistory(e, petId) {
  e.preventDefault();
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;
  const g = id => document.getElementById(id)?.value;
  const h = { id: genId(), title: g('h-title'), type: g('h-type'), date: g('h-date'),
    doctor: g('h-doctor'), clinic: g('h-clinic'), cost: g('h-cost'), notes: g('h-notes') };
  pet.clinicalHistory = pet.clinicalHistory || [];
  pet.clinicalHistory.push(h);
  if (h.cost) { state.expenses.push({ id: genId(), description: `${h.title} - ${pet.name}`, amount: h.cost, date: h.date, category: 'Veterinaria', pet: pet.name }); }
  saveState(); closeModal(); render();
  showToast('Evento clínico registrado ✓', 'success');
}

function deleteHistory(petId, hId) {
  const pet = state.pets.find(p => p.id === petId);
  if (pet) { pet.clinicalHistory = pet.clinicalHistory.filter(h => h.id !== hId); saveState(); render(); }
}

function saveEvent(e) {
  e.preventDefault();
  const g = id => document.getElementById(id)?.value;
  state.events = state.events || [];
  state.events.push({ id: genId(), title: g('ev-title'), type: g('ev-type'), date: g('ev-date'), pet: g('ev-pet'), notes: g('ev-notes') });
  saveState(); closeModal(); render();
  showToast('Evento agendado ✓', 'success');
}

function deleteEvent(id) {
  state.events = state.events.filter(e => e.id !== id); saveState(); render();
}

function saveExpense(e) {
  e.preventDefault();
  const g = id => document.getElementById(id)?.value;
  state.expenses = state.expenses || [];
  state.expenses.push({ id: genId(), description: g('ex-desc'), amount: g('ex-amount'), date: g('ex-date'), category: g('ex-cat'), pet: g('ex-pet') });
  saveState(); closeModal(); render();
  showToast('Gasto registrado ✓', 'success');
}

function deleteExpense(id) {
  state.expenses = state.expenses.filter(e => e.id !== id); saveState(); render();
}

function prevMonth() {
  let m = state.calMonth !== undefined ? state.calMonth : new Date().getMonth();
  let y = state.calYear || new Date().getFullYear();
  if (m === 0) { m = 11; y--; } else m--;
  state.calMonth = m; state.calYear = y; render();
}

function nextMonth() {
  let m = state.calMonth !== undefined ? state.calMonth : new Date().getMonth();
  let y = state.calYear || new Date().getFullYear();
  if (m === 11) { m = 0; y++; } else m++;
  state.calMonth = m; state.calYear = y; render();
}

// Helpers for stepper
function previewPhoto(e) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    state.newPetData.photo = ev.target.result;
    const preview = document.getElementById('photo-preview');
    if (preview) preview.innerHTML = `<img src="${ev.target.result}" class="w-full h-full object-cover rounded-full" />`;
  };
  reader.readAsDataURL(file);
}

function setActivity(level) {
  state.newPetData.activityLevel = level;
  [1,2,3].forEach(l => {
    const btn = document.getElementById('act-'+l);
    if (btn) btn.className = `flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${l===level ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-brand-300'}`;
  });
}

function toggleTag(t) {
  const tags = state.newPetData.personalityTags || [];
  const idx = tags.indexOf(t);
  if (idx >= 0) tags.splice(idx,1); else tags.push(t);
  state.newPetData.personalityTags = tags;
  document.querySelectorAll('.tag').forEach(el => {
    if (el.textContent.trim() === t) el.classList.toggle('selected', tags.includes(t));
  });
}

function toggleCondition(c) {
  if (!state.newPetData.chronicConditions) state.newPetData.chronicConditions = [];
  const list = state.newPetData.chronicConditions;
  if (c === 'Ninguna') {
    state.newPetData.chronicConditions = list.includes('Ninguna') ? [] : ['Ninguna'];
  } else {
    state.newPetData.chronicConditions = list.filter(x => x !== 'Ninguna');
    const idx = state.newPetData.chronicConditions.indexOf(c);
    if (idx >= 0) state.newPetData.chronicConditions.splice(idx, 1); else state.newPetData.chronicConditions.push(c);
  }
  document.querySelectorAll('.tag').forEach(el => {
    const val = el.textContent.trim();
    if (['Ninguna','Diabetes','Epilepsia','Hipotiroidismo','Hipertiroidismo','Displasia de cadera','Displasia de codo','Enfermedad renal crónica','Enfermedad cardíaca','Artritis','Obesidad','Cushing','Addison','Pancreatitis crónica','Enfermedad inflamatoria intestinal','Asma','Dermatitis atópica','Cáncer','Cataratas','Glaucoma','Otra'].includes(val)) {
      el.classList.toggle('selected', state.newPetData.chronicConditions.includes(val));
    }
  });
}

function toggleAllergy(a) {
  const allergies = state.newPetData.allergies || [];
  const idx = allergies.indexOf(a);
  if (idx >= 0) allergies.splice(idx,1); else allergies.push(a);
  state.newPetData.allergies = allergies;
  document.querySelectorAll('.tag').forEach(el => {
    if (el.textContent.trim() === a) el.classList.toggle('selected', allergies.includes(a));
  });
}

function toggleTutor2(el) {
  const fields = document.getElementById('tutor2-fields');
  if (fields) fields.classList.toggle('hidden', !el.checked);
}

function updateNextDatePreview(prefix) {
  const dateEl = document.getElementById(`${prefix}-date`);
  const periodEl = document.getElementById(`${prefix}-period`);
  const preview = document.getElementById(`${prefix}-next-preview`);
  const nextLabel = document.getElementById(`${prefix}-next-date`);
  if (!dateEl || !periodEl || !preview || !nextLabel) return;
  const months = parseInt(periodEl.value);
  const date = dateEl.value;
  if (date && months > 0) {
    const next = addMonths(date, months);
    nextLabel.textContent = formatDate(next);
    preview.classList.remove('hidden');
  } else {
    preview.classList.add('hidden');
  }
}

function updateBreedOptions(species) {
  const select = document.getElementById('pet-breed');
  if (!select) return;
  const breeds = BREEDS[species] || BREEDS.Otro;
  select.innerHTML = breeds.map(b => `<option ${b==='Mestizo'?'selected':''}>${b}</option>`).join('');
}

function updateDoseUnit() {
  const fmt = document.getElementById('d-format')?.value;
  const unitMap = { Comprimido:'Comprimidos', Pipeta:'Pipetas', Collar:'Unidades', Spray:'ML', Jarabe:'ML', Inyección:'ML' };
  const unitEl = document.getElementById('d-unit');
  if (unitEl) unitEl.value = unitMap[fmt] || 'Unidades';
}

// ---- CSS CLASSES HELPER (inject into head) ----
function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .input-field { width:100%; padding:0.5rem 0.75rem; border:1px solid #e2e8f0; border-radius:0.75rem; font-size:0.875rem; transition:border-color 0.15s; background:white; }
    .form-label { display:block; font-size:0.75rem; font-weight:500; color:#4b5563; margin-bottom:0.25rem; }
    .btn-primary { padding:0.5rem 1rem; background:linear-gradient(135deg,#7c3aed,#4f46e5); color:white; border-radius:0.75rem; font-weight:600; font-size:0.875rem; transition:opacity 0.15s; cursor:pointer; border:none; }
    .btn-primary:hover { opacity:0.9; }
    .btn-secondary { padding:0.5rem 1rem; background:#f1f5f9; color:#374151; border-radius:0.75rem; font-weight:600; font-size:0.875rem; transition:background 0.15s; cursor:pointer; border:none; }
    .btn-secondary:hover { background:#e2e8f0; }
    .bg-brand-gradient { background: linear-gradient(135deg,#7c3aed,#4f46e5); }
  `;
  document.head.appendChild(style);
}

// ---- RENDER ----
function render() {
  const app = document.getElementById('app');
  const v = state.currentView;
  if (!state.isLoggedIn && !['login','register','forgot'].includes(v)) { navigate('login'); return; }
  if      (v === 'login')      app.innerHTML = viewLogin();
  else if (v === 'register')   app.innerHTML = viewRegister();
  else if (v === 'forgot')     app.innerHTML = viewForgot();
  else if (v === 'dashboard')  app.innerHTML = viewDashboard();
  else if (v === 'pets')       app.innerHTML = viewPets();
  else if (v === 'addPet')     app.innerHTML = viewAddPet();
  else if (v === 'petProfile') app.innerHTML = viewPetProfile();
  else if (v === 'calendar')   app.innerHTML = viewCalendar();
  else if (v === 'finance')    app.innerHTML = viewFinance();
  else navigate('dashboard');
}

// ---- INIT ----
injectStyles();
loadState();
render();

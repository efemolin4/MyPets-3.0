/* ============================================================
   MYPETS 3.0 — Aplicación Principal
   ============================================================ */

// ---- EMAILJS CONFIG (reemplaza con tus claves en https://emailjs.com) ----
const EMAILJS_SERVICE_ID  = 'service_mypets';
const EMAILJS_TEMPLATE_ID = 'template_mypets';
const EMAILJS_PUBLIC_KEY  = 'TU_PUBLIC_KEY_AQUI';
let emailjsReady = false;
function initEmailJS() {
  try { emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); emailjsReady = true; } catch(e) {}
}
function sendEmail(to, subject, body, extra = {}) {
  if (!emailjsReady) {
    console.log(`[Email simulado] Para: ${to}\nAsunto: ${subject}\n${body}`);
    return Promise.resolve();
  }
  return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { to_email: to, subject, message: body, ...extra });
}

// ---- HELPERS DE USUARIOS / INVITACIONES ----
function getUsers()        { try { return JSON.parse(localStorage.getItem('mypets_users') || '[]'); } catch(e) { return []; } }
function saveUsers(u)      { localStorage.setItem('mypets_users', JSON.stringify(u)); }
function getInvites()      { try { return JSON.parse(localStorage.getItem('mypets_invites') || '[]'); } catch(e) { return []; } }
function saveInvites(i)    { localStorage.setItem('mypets_invites', JSON.stringify(i)); }
function getResets()       { try { return JSON.parse(localStorage.getItem('mypets_resets') || '[]'); } catch(e) { return []; } }
function saveResets(r)     { localStorage.setItem('mypets_resets', JSON.stringify(r)); }

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
  { label: 'Sin periodicidad',          months: 0,  days: 0    },
  { label: '1 mes (30 días)',           months: 1,  days: 30   },
  { label: 'Bimestral (60 días)',       months: 2,  days: 60   },
  { label: 'Trimestral (90 días)',      months: 3,  days: 90   },
  { label: 'Semestral (180 días)',      months: 6,  days: 180  },
  { label: 'Anual (365 días)',          months: 12, days: 365  },
  { label: 'Cada 2 años (730 días)',    months: 24, days: 730  },
  { label: 'Cada 3 años (1095 días)',   months: 36, days: 1095 },
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

// ---- PAGINACIÓN ----
const PAGE_SIZE = 10;
function getPage(key) { return ((state.pages||{})[key]) || 1; }
function setPage(key, p) { state.pages = state.pages||{}; state.pages[key] = p; render(); }
function paginate(items, key) {
  const page = getPage(key);
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const cur   = Math.max(1, Math.min(page, pages));
  return { items: items.slice((cur-1)*PAGE_SIZE, cur*PAGE_SIZE), total, pages, page: cur };
}
function pagerHTML(key, pages, cur) {
  if (pages <= 1) return '';
  const range = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - cur) <= 1) range.push(i);
    else if (range[range.length-1] !== '…') range.push('…');
  }
  return `
  <div class="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
    <button onclick="setPage('${key}',${cur-1})" ${cur<=1?'disabled':''}
      class="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-default transition-colors font-medium">
      ← Anterior
    </button>
    <div class="flex items-center gap-1">
      ${range.map(n => n==='…'
        ? `<span class="w-8 text-center text-gray-400 text-sm">…</span>`
        : `<button onclick="setPage('${key}',${n})"
            class="w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${n===cur?'bg-brand-600 text-white shadow-sm':'text-gray-500 hover:bg-gray-100'}">
            ${n}
          </button>`).join('')}
    </div>
    <button onclick="setPage('${key}',${cur+1})" ${cur>=pages?'disabled':''}
      class="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-default transition-colors font-medium">
      Siguiente →
    </button>
  </div>`;
}

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
    // Handle URL hash tokens
    const hash = location.hash;
    const resetMatch = hash.match(/reset=([^&]+)/);
    const inviteMatch = hash.match(/invite=([^&]+)/);
    if (resetMatch) {
      state.resetToken = resetMatch[1];
      state.currentView = 'resetPassword';
      history.replaceState(null, '', location.pathname);
    } else if (inviteMatch) {
      state.inviteToken = inviteMatch[1];
      state.currentView = 'register';
      history.replaceState(null, '', location.pathname);
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
function iconSVG(name) {
  const icons = {
    home:    `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>`,
    paw:     `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243zm7.364-9.243a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"/>`,
    calendar:`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>`,
    finance: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
    kit:     `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>`,
    logout:  `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>`,
  };
  return icons[name] || '';
}

function sidebar() {
  const items = [
    { v:'dashboard', icon:'🏠', label:'Inicio' },
    { v:'pets',      icon:'🐾', label:'Mis Mascotas' },
    { v:'calendar',  icon:'📅', label:'Agenda' },
    { v:'finance',   icon:'💰', label:'Finanzas' },
    { v:'botiquin',  icon:'🧴', label:'Botiquín' },
  ];
  const navIcons = { dashboard:'home', pets:'paw', calendar:'calendar', finance:'finance', botiquin:'kit' };
  return `
  <aside class="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-20">
    <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
      <div class="w-8 h-8 bg-brand-gradient rounded-xl flex items-center justify-center text-white font-black text-xs tracking-tight">MP</div>
      <div><div class="font-bold text-gray-900 text-sm leading-none">MyPets</div><div class="text-xs text-brand-400 mt-0.5">3.0</div></div>
    </div>
    <nav class="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
      ${items.map(i => {
        const active = state.currentView === i.v;
        return `
        <button onclick="navigate('${i.v}')"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group ${active ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}">
          <svg class="w-4.5 h-4.5 flex-shrink-0 ${active?'text-brand-600':'text-gray-400 group-hover:text-gray-600'}" style="width:1.1rem;height:1.1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            ${iconSVG(navIcons[i.v]||'home')}
          </svg>
          <span>${i.label}</span>
          ${active?`<span class="ml-auto w-1.5 h-4 rounded-full bg-brand-500"></span>`:''}
        </button>`;
      }).join('')}
    </nav>
    <div class="px-3 py-3 border-t border-gray-100">
      <div class="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors">
        <div class="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">${(state.user?.name||'U')[0].toUpperCase()}</div>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-semibold text-gray-900 truncate">${state.user?.name||''}</div>
          <div class="text-xs text-gray-400 truncate">${state.user?.email||''}</div>
        </div>
        <button onclick="logout()" title="Cerrar sesión"
          class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">${iconSVG('logout')}</svg>
        </button>
      </div>
    </div>
  </aside>`;
}

function bottomNav() {
  const items = [
    { v:'dashboard', icon:'home',     label:'Inicio' },
    { v:'pets',      icon:'paw',      label:'Mascotas' },
    { v:'calendar',  icon:'calendar', label:'Agenda' },
    { v:'finance',   icon:'finance',  label:'Finanzas' },
    { v:'botiquin',  icon:'kit',      label:'Botiquín' },
  ];
  return `
  <nav class="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-gray-100 z-20" style="padding-bottom:env(safe-area-inset-bottom)">
    <div class="flex">
      ${items.map(i => {
        const active = state.currentView === i.v;
        return `
        <button onclick="navigate('${i.v}')" class="flex-1 flex flex-col items-center gap-0.5 pt-2 pb-1.5 transition-colors ${active?'text-brand-600':'text-gray-400'}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">${iconSVG(i.icon)}</svg>
          <span class="text-[10px] font-medium">${i.label}</span>
          ${active?`<span class="absolute bottom-0 w-8 h-0.5 rounded-full bg-brand-500 mb-0.5"></span>`:''}
        </button>`;
      }).join('')}
    </div>
  </nav>`
  .replace('class="flex-1', 'class="relative flex-1');
}

function appShell(content) {
  return `
  ${sidebar()}
  <div class="md:ml-60 flex flex-col min-h-screen">
    <main class="flex-1 pb-24 md:pb-10 px-4 py-5 md:px-8 md:py-8 max-w-6xl mx-auto w-full animate-fade-in">${content}</main>
    ${bottomNav()}
  </div>`;
}

function pageHeader(title, subtitle = '', action = '') {
  return `
  <div class="flex items-start justify-between gap-3 mb-6 flex-wrap">
    <div class="min-w-0 flex-1">
      <h1 class="text-xl md:text-2xl font-bold text-gray-900 leading-tight">${title}</h1>
      ${subtitle ? `<p class="text-sm text-gray-500 mt-0.5">${subtitle}</p>` : ''}
    </div>
    ${action ? `<div class="flex-shrink-0">${action}</div>` : ''}
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
  <div class="bg-white rounded-2xl p-4 md:p-5 shadow-sm card-hover animate-fade-in">
    <div class="w-9 h-9 md:w-10 md:h-10 rounded-xl ${colors[color]} flex items-center justify-center text-lg md:text-xl mb-3">${icon}</div>
    <div class="text-xl md:text-2xl font-bold text-gray-900 leading-none">${value}</div>
    <div class="text-xs md:text-sm text-gray-500 mt-1">${label}</div>
  </div>`;
}

function petAvatar(pet, size = 'sm') {
  const dim = size === 'lg' ? 'w-24 h-24 text-4xl' : 'w-14 h-14 text-2xl';
  if (pet.photo) return `<img src="${pet.photo}" class="${size === 'lg' ? 'pet-avatar-lg' : 'pet-avatar'}" alt="${pet.name}" />`;
  return `<div class="${dim} pet-avatar-placeholder rounded-full">${speciesEmoji(pet.species)}</div>`;
}

function emptyState(icon, title, sub, btnLabel = '', btnFn = '') {
  return `
  <div class="text-center py-10 md:py-16 animate-fade-in">
    <div class="text-5xl md:text-6xl mb-3">${icon}</div>
    <h3 class="text-base md:text-lg font-semibold text-gray-700 mb-1">${title}</h3>
    <p class="text-sm text-gray-400 mb-5">${sub}</p>
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
    <div class="flex-1 overflow-y-auto">
      <div class="min-h-full flex flex-col justify-center px-5 py-8 sm:px-8 lg:items-center">
        <div class="w-full max-w-sm mx-auto animate-scale-in">
          <!-- Logo solo móvil: compacto -->
          <div class="lg:hidden flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-2xl bg-brand-gradient flex items-center justify-center text-white font-black text-sm">MP</div>
            <div>
              <div class="font-bold text-gray-900 leading-none">MyPets 3.0</div>
              <div class="text-xs text-brand-400 mt-0.5">Tu compañero digital</div>
            </div>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-1">Bienvenido de vuelta</h2>
          <p class="text-gray-500 text-sm mb-5">Ingresa a tu cuenta para continuar</p>
          <form onsubmit="handleLogin(event)" class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input id="l-email" type="email" required autocomplete="email" placeholder="tu@email.com" class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input id="l-pass" type="password" required autocomplete="current-password" placeholder="••••••••" class="input-field" />
            </div>
            <div class="flex items-center justify-between text-sm">
              <label class="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input type="checkbox" class="rounded text-brand-500" /> Recordarme
              </label>
              <button type="button" onclick="navigate('forgot')" class="text-brand-600 hover:underline text-xs font-medium">¿Olvidaste tu contraseña?</button>
            </div>
            <button type="submit" class="btn-primary w-full !py-3 text-base">Iniciar Sesión</button>
          </form>
          <div class="mt-4 text-center text-sm text-gray-500">
            ¿No tienes cuenta? <button onclick="navigate('register')" class="text-brand-600 font-semibold hover:underline">Regístrate gratis</button>
          </div>
          <div class="mt-4 p-4 bg-gradient-to-br from-brand-50 to-teal-50 rounded-2xl border border-brand-100">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs font-bold text-brand-700">🧪 Cuenta de prueba</span>
            </div>
            <div class="flex gap-4 text-xs text-gray-600 mb-3">
              <div><span class="text-gray-400">Email: </span><strong class="select-all">demo@mypets.cl</strong></div>
              <div><span class="text-gray-400">Clave: </span><strong class="select-all">demo123</strong></div>
            </div>
            <button type="button" onclick="loadDemoAndLogin()"
              class="w-full py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 transition-colors">
              ⚡ Entrar con datos de demo
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// ---- VISTA: REGISTER ----
function viewRegister() {
  return `
  <div class="min-h-screen overflow-y-auto bg-gradient-to-br from-brand-50 to-teal-50">
    <div class="min-h-full flex flex-col justify-center px-5 py-8 sm:px-8 sm:items-center">
    <div class="w-full max-w-sm mx-auto animate-scale-in">
      <div class="text-center mb-5">
        <div class="inline-flex w-12 h-12 rounded-2xl bg-brand-gradient items-center justify-center text-white font-black mb-3">MP</div>
        <h2 class="text-2xl font-bold text-gray-900">Crear cuenta</h2>
        <p class="text-sm text-gray-500 mt-1">Únete a MyPets gratis</p>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        <form onsubmit="handleRegister(event)" class="space-y-3">
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
          <button type="submit" class="btn-primary w-full !py-3">Crear cuenta gratuita</button>
        </form>
        <div class="text-center text-sm text-gray-500">
          ¿Ya tienes cuenta? <button onclick="navigate('login')" class="text-brand-600 font-semibold hover:underline">Inicia sesión</button>
        </div>
      </div>
    </div>
    </div>
  </div>`;
}

// ---- VISTA: RESET PASSWORD ----
function viewResetPassword() {
  return `
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-teal-50 p-6">
    <div class="w-full max-w-sm animate-scale-in">
      <div class="text-center mb-6">
        <div class="text-4xl mb-2">🔐</div>
        <h2 class="text-2xl font-bold text-gray-900">Nueva contraseña</h2>
        <p class="text-sm text-gray-500 mt-1">Crea una contraseña segura</p>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
          <input id="rp-pass" type="password" required minlength="6" placeholder="Mínimo 6 caracteres" class="input-field" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
          <input id="rp-pass2" type="password" required placeholder="Repite la contraseña" class="input-field" />
        </div>
        <button onclick="handleResetPassword()" class="btn-primary w-full">Guardar nueva contraseña</button>
        <button onclick="navigate('login')" class="w-full text-sm text-gray-500 hover:text-gray-700">← Volver al inicio</button>
      </div>
    </div>
  </div>`;
}

function handleResetPassword() {
  const pass  = document.getElementById('rp-pass')?.value;
  const pass2 = document.getElementById('rp-pass2')?.value;
  if (!pass || pass.length < 6) { showToast('Mínimo 6 caracteres', 'error'); return; }
  if (pass !== pass2) { showToast('Las contraseñas no coinciden', 'error'); return; }
  const token = state.resetToken;
  if (!token) { showToast('Token inválido', 'error'); navigate('login'); return; }
  const resets = getResets();
  const reset = resets.find(r => r.token === token && !r.used);
  if (!reset || Date.now() - reset.createdAt > 3600000) {
    showToast('El enlace expiró. Solicita uno nuevo.', 'error'); navigate('forgot'); return;
  }
  const users = getUsers();
  const user = users.find(u => u.email === reset.email);
  if (user) { user.password = btoa(pass); saveUsers(users); }
  reset.used = true; saveResets(resets);
  state.resetToken = null;
  showToast('✅ Contraseña actualizada. Inicia sesión.', 'success');
  navigate('login');
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
    <div class="mb-5">
      <h1 class="text-xl md:text-2xl font-bold text-gray-900">Hola, ${state.user?.name?.split(' ')[0] || 'Tutor'} 👋</h1>
      <p class="text-sm text-gray-400 mt-0.5 capitalize">${dateStr}</p>
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 stagger">
      ${statCard('🐾', 'Mascotas', pets.length, 'brand')}
      ${statCard('🔔', 'Alertas activas', alerts.length, 'red')}
      ${statCard('📅', 'Eventos próximos', upcoming.length, 'amber')}
      ${statCard('💊', 'Medicamentos hoy', todayMeds.length, 'teal')}
    </div>

    <div class="grid md:grid-cols-2 gap-4 md:gap-6">
      <div class="bg-white rounded-2xl shadow-sm p-4 md:p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-gray-900">Mis Mascotas</h2>
          <button onclick="navigate('pets')" class="text-sm text-brand-600 hover:underline font-medium">Ver todas →</button>
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

      <div class="bg-white rounded-2xl shadow-sm p-4 md:p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-gray-900">Próximos eventos</h2>
          <button onclick="navigate('calendar')" class="text-sm text-brand-600 hover:underline font-medium">Ver agenda →</button>
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
      `<button onclick="navigate('addPet')" class="btn-primary flex items-center gap-1.5">
         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
         <span>Agregar</span>
       </button>`)}
    ${pets.length === 0
      ? emptyState('🐾', 'Aún no tienes mascotas', 'Registra tu primera mascota para comenzar', '+ Agregar mascota', "navigate('addPet')")
      : `<div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger">
           ${pets.map(p => `
             <div class="bg-white rounded-2xl shadow-sm p-5 card-hover animate-fade-in relative flex flex-col">
               <!-- Botones top-right -->
               <div class="absolute top-3 right-3 flex gap-1.5 z-10">
                 <button onclick="event.stopPropagation();openEditPetModal('${p.id}')"
                   title="Editar"
                   class="w-8 h-8 rounded-lg bg-gray-50 hover:bg-brand-50 text-gray-400 hover:text-brand-600 border border-gray-200 flex items-center justify-center transition-all">
                   <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                 </button>
                 <button onclick="event.stopPropagation();openDeletePetWithCode('${p.id}')"
                   title="Eliminar"
                   class="w-8 h-8 rounded-lg bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-200 flex items-center justify-center transition-all">
                   <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                 </button>
               </div>
               <!-- Contenido central -->
               <div class="flex flex-col items-center text-center pt-4">
                 ${petAvatar(p, 'lg')}
                 <div class="mt-3 font-bold text-gray-900">${p.name}</div>
                 <div class="text-sm text-gray-400 mt-0.5">${p.species} · ${p.breed || 'Mestizo'}</div>
                 <div class="text-xs text-gray-400 mt-0.5">${getAge(p.dateOfBirth)}</div>
                 <div class="flex gap-2 mt-3 flex-wrap justify-center">
                   ${(p.personalityTags || []).slice(0,2).map(t => `<span class="tag text-xs">${t}</span>`).join('')}
                 </div>
               </div>
               <!-- Stats -->
               <div class="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-center text-gray-500">
                 <div><div class="font-semibold text-gray-800">${(p.vaccines||[]).length}</div>Vacunas</div>
                 <div><div class="font-semibold text-gray-800">${(p.medications||[]).length}</div>Medicamentos</div>
               </div>
               <!-- Botón Ver ficha -->
               <button onclick="openPet('${p.id}')"
                 class="mt-4 w-full py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-sm font-semibold transition-colors">
                 Ver ficha →
               </button>
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

      <div class="flex items-center mb-5 px-1">
        ${steps.map((s, i) => `
          <div class="flex-1 flex flex-col items-center">
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mb-1
              ${i+1 < step ? 'bg-brand-500 text-white' : i+1 === step ? 'bg-brand-600 text-white ring-4 ring-brand-100' : 'bg-gray-100 text-gray-400'}">
              ${i+1 < step ? '✓' : i+1}
            </div>
            <div class="text-[10px] sm:text-xs text-center ${i+1 === step ? 'text-brand-600 font-medium' : 'text-gray-400'}">${s.split(' ')[0]}</div>
          </div>
          ${i < steps.length-1 ? `<div class="flex-1 h-0.5 mb-4 ${i+1 < step ? 'bg-brand-500' : 'bg-gray-200'}"></div>` : ''}
        `).join('')}
      </div>

      <div class="bg-white rounded-2xl shadow-sm p-4 sm:p-6 animate-scale-in">
        ${step === 1 ? stepBasic() : step === 2 ? stepPhysical() : step === 3 ? stepHealth() : stepTutors()}
        <div class="flex gap-3 mt-5 pt-5 border-t border-gray-100">
          ${step > 1 ? `<button onclick="prevStep()" class="btn-secondary flex-1 !py-3">← Anterior</button>` : ''}
          <button onclick="nextStep()" class="btn-primary flex-1 !py-3">${step === 4 ? '✓ Guardar mascota' : 'Siguiente →'}</button>
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
      <div class="space-y-3">
        <div>
          <label class="form-label">Nombre *</label>
          <input id="pet-name" type="text" required value="${d.name||''}" placeholder="Nombre de tu mascota" class="input-field" />
        </div>
        <!-- Especie + Sexo siempre en 2 col (selects cortos) -->
        <div class="grid grid-cols-2 gap-3">
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
        </div>
        <!-- Raza + Fecha: 1 col en mobile, 2 col en sm+ -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      </div>
    </div>`;
}

function stepPhysical() {
  const d = state.newPetData;
  const tags = ['Juguetón','Cariñoso','Tranquilo','Activo','Tímido','Sociable','Independiente','Protector'];
  const colors = ['Negro','Blanco','Gris','Café','Dorado','Amarillo','Crema','Naranja','Rojo','Canela','Atigrado','Manchado negro y blanco','Manchado café y blanco','Tricolor','Bicolor','Azul grisáceo','Plateado','Otro'];
  const sizes = [
    { label: 'Pequeño', range: 'hasta 10 kg' },
    { label: 'Mediano', range: '10 – 25 kg' },
    { label: 'Grande',  range: '25 – 45 kg' },
    { label: 'Gigante', range: 'más de 45 kg' },
  ];
  return `
    <h2 class="text-lg font-bold text-gray-900 mb-4">Información física</h2>
    <div class="space-y-3">
      <!-- Color + Tamaño: 2 col (selects cortos, OK en mobile) -->
      <div class="grid grid-cols-2 gap-3">
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
      <!-- Peso -->
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
        <p class="text-xs text-gray-400 mt-1">Ej: 4 kg 500 gr → ingresa 4 en kilos y 500 en gramos</p>
      </div>
      <!-- Estado reproductivo + Chip: 1 col en mobile -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      <h3 class="font-semibold text-gray-700 text-sm">Veterinario de cabecera <span class="text-gray-400 font-normal">(opcional)</span></h3>
      <div class="space-y-3">
        <div>
          <label class="form-label">Nombre del veterinario</label>
          <input id="vet-name" type="text" value="${d.vet?.name||''}" placeholder="Dr. García" class="input-field" />
        </div>
        <div>
          <label class="form-label">Clínica</label>
          <input id="vet-clinic" type="text" value="${d.vet?.clinic||''}" placeholder="Clínica Veterinaria" class="input-field" />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="form-label">Teléfono</label>
            <input id="vet-phone" type="tel" value="${d.vet?.phone||''}" placeholder="+56 9 1234 5678" class="input-field" />
          </div>
          <div>
            <label class="form-label">Email</label>
            <input id="vet-email" type="email" value="${d.vet?.email||''}" placeholder="vet@clinica.cl" class="input-field" />
          </div>
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
  const tabLabels = { general:'General', vacunas:'Vacunas', 'desparasitación':'Desparasitación', medicamentos:'Tratamiento', historial:'Historial' };
  const tab = state.currentTab;

  return appShell(`
    <div class="max-w-3xl mx-auto">
      <button onclick="navigate('pets')" class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        ← Mis Mascotas
      </button>
      <div class="bg-white rounded-2xl shadow-sm p-4 md:p-5 mb-4">
        <div class="flex items-start gap-3 md:gap-4">
          <div class="flex-shrink-0">${petAvatar(pet, 'lg')}</div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <h1 class="text-lg md:text-xl font-bold text-gray-900 truncate">${pet.name}</h1>
                <div class="text-xs md:text-sm text-gray-400">${pet.species} · ${pet.breed || 'Mestizo'}${pet.sex ? ` · ${pet.sex}` : ''}</div>
                <div class="text-xs md:text-sm text-gray-400">${getAge(pet.dateOfBirth)}</div>
              </div>
              <div class="flex gap-1.5 flex-shrink-0">
                <button onclick="openEditPetModal('${pet.id}')"
                  title="Editar"
                  class="w-8 h-8 md:w-auto md:h-auto md:px-3 md:py-1.5 rounded-xl bg-gray-50 hover:bg-brand-50 text-gray-500 hover:text-brand-600 border border-gray-200 text-xs font-medium transition-colors flex items-center justify-center gap-1">
                  <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  <span class="hidden md:inline">Editar</span>
                </button>
                <button onclick="confirmDeletePet('${pet.id}')"
                  title="Eliminar"
                  class="w-8 h-8 md:w-auto md:h-auto md:px-3 md:py-1.5 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-200 text-xs font-medium transition-colors flex items-center justify-center gap-1">
                  <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  <span class="hidden md:inline">Eliminar</span>
                </button>
              </div>
            </div>
            <div class="flex flex-wrap gap-1.5 mt-2">
              ${(pet.personalityTags||[]).map(t => `<span class="tag text-xs">${t}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm mb-4 relative">
        <div class="overflow-x-auto" style="scrollbar-width:none;-webkit-overflow-scrolling:touch">
          <div class="flex border-b border-gray-100" style="min-width:max-content">
            ${tabs.map(t => `
              <button onclick="setTab('${t}')"
                class="px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${tab===t ? 'text-brand-600 border-b-2 border-brand-500' : 'text-gray-500 hover:text-gray-700'}">
                ${tabLabels[t]}
              </button>`).join('')}
          </div>
        </div>
        <div class="pointer-events-none absolute right-0 top-0 bottom-0 w-8 rounded-r-2xl md:hidden"
          style="background:linear-gradient(to left,rgba(255,255,255,1),rgba(255,255,255,0))"></div>
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
          ${infoRow('Teléfono', pet.vet.phone ? `<span>${pet.vet.phone}</span>
            ${pet.vet.phone ? `<a href="https://wa.me/${pet.vet.phone.replace(/\D/g,'')}" target="_blank"
              class="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-colors">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.932-1.414C8.354 21.481 10.146 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
              WhatsApp</a>` : ''}` : '—')}
          ${infoRow('Email', pet.vet.email ? `<a href="mailto:${pet.vet.email}" class="text-brand-600 hover:underline">${pet.vet.email}</a>` : '—')}
        </dl>
      </div>` : ''}
      <div class="bg-white rounded-2xl shadow-sm p-5">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-gray-700">Segundo Tutor</h3>
          ${pet.tutor2?.name
            ? `<button onclick="removeTutor2('${pet.id}')" class="text-xs text-red-500 hover:underline">Quitar tutor</button>`
            : `<button onclick="openInviteTutor2Modal('${pet.id}')" class="btn-primary text-xs">+ Invitar</button>`}
        </div>
        ${pet.tutor2?.name
          ? `<div class="flex items-center gap-3">
               <div class="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-600">${pet.tutor2.name[0].toUpperCase()}</div>
               <div>
                 <div class="text-sm font-medium text-gray-900">${pet.tutor2.name}</div>
                 <div class="text-xs text-gray-400">${pet.tutor2.email} · <span class="capitalize">${pet.tutor2.role||'lectura'}</span></div>
               </div>
             </div>`
          : `<p class="text-sm text-gray-400">Sin segundo tutor asignado. Invita a alguien para que también pueda ver y gestionar a ${pet.name}.</p>`}
      </div>
    </div>`;
}

function infoRow(label, value) {
  return `<div class="flex justify-between"><dt class="text-gray-400">${label}</dt><dd class="font-medium text-gray-800 text-right max-w-[60%]">${value||'—'}</dd></div>`;
}

function tabVaccines(pet) {
  const allVs = [...(pet.vaccines||[])].reverse();
  const { items: vs, total, pages, page } = paginate(allVs, `vac_${pet.id}`);
  return `
    <div class="bg-white rounded-2xl shadow-sm p-5">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="font-semibold text-gray-800">Vacunas</h3>
          ${total > 0 ? `<p class="text-xs text-gray-400 mt-0.5">${total} registro${total!==1?'s':''}</p>` : ''}
        </div>
        <button onclick="openVaccineModal('${pet.id}')" class="btn-primary text-sm">+ Agregar</button>
      </div>
      ${total === 0
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
                     ${v.alertType ? `<div class="text-xs text-brand-500">🔔 Alerta: ${{same:'El mismo día',week:'1 semana antes',custom:`${v.alertDays} días antes`}[v.alertType]||v.alertType}</div>` : ''}
                     ${v.cost ? `<div class="text-xs text-gray-400">Costo: ${fmtCLP(v.cost)}</div>` : ''}
                   </div>
                 </div>
                 <div class="flex items-center gap-1 flex-shrink-0">
                   <button onclick="openEditVaccineModal('${pet.id}','${v.id}')" title="Editar"
                     class="w-8 h-8 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 flex items-center justify-center transition-colors">
                     <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                   </button>
                   <button onclick="deleteVaccine('${pet.id}','${v.id}')" title="Eliminar"
                     class="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors">
                     <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                   </button>
                 </div>
               </div>`).join('')}
           </div>
           ${pagerHTML(`vac_${pet.id}`, pages, page)}`}
    </div>`;
}

function tabDeworming(pet) {
  const allDs = [...(pet.deworming||[])].reverse();
  const { items: ds, total, pages, page } = paginate(allDs, `dew_${pet.id}`);
  return `
    <div class="bg-white rounded-2xl shadow-sm p-5">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="font-semibold text-gray-800">Desparasitaciones</h3>
          ${total > 0 ? `<p class="text-xs text-gray-400 mt-0.5">${total} registro${total!==1?'s':''}</p>` : ''}
        </div>
        <button onclick="openDewormModal('${pet.id}')" class="btn-primary text-sm">+ Agregar</button>
      </div>
      ${total === 0
        ? emptyState('🪱','Sin desparasitaciones','Registra los tratamientos antiparasitarios')
        : `<div class="space-y-2">
             ${ds.map(d => `
               <div class="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-colors group">
                 <div class="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center text-base flex-shrink-0">🪱</div>
                 <div class="flex-1 min-w-0">
                   <div class="flex items-center gap-2 flex-wrap">
                     <span class="font-medium text-gray-900 text-sm">${d.product}</span>
                     <span class="badge bg-teal-50 text-teal-700 text-xs">${d.type}</span>
                   </div>
                   <div class="text-xs text-gray-400">${d.format} · Dosis: ${d.dose} ${d.unit} · ${formatDate(d.date)}</div>
                   ${d.nextDate ? `<div class="text-xs ${new Date(d.nextDate)<new Date()?'text-red-500':'text-teal-600'} font-medium">Próxima: ${formatDate(d.nextDate)}</div>` : ''}
                 </div>
                 <div class="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onclick="openEditDewormModal('${pet.id}','${d.id}')" title="Editar"
                     class="w-8 h-8 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 flex items-center justify-center transition-colors">
                     <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                   </button>
                   <button onclick="deleteDeworming('${pet.id}','${d.id}')" title="Eliminar"
                     class="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors">
                     <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                   </button>
                 </div>
               </div>`).join('')}
           </div>
           ${pagerHTML(`dew_${pet.id}`, pages, page)}`}
    </div>`;
}

function tabMedications(pet) {
  const allMs = [...(pet.medications||[])].reverse();
  const { items: ms, total, pages, page } = paginate(allMs, `med_${pet.id}`);
  const today = new Date().toISOString().slice(0,10);
  const reminderLabels = { exact:'Horario exacto', '15':'15 min antes', '30':'30 min antes', '60':'60 min antes' };
  return `
    <div class="bg-white rounded-2xl shadow-sm p-5">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="font-semibold text-gray-800">Tratamiento</h3>
          ${total > 0 ? `<p class="text-xs text-gray-400 mt-0.5">${total} registro${total!==1?'s':''}</p>` : ''}
        </div>
        <button onclick="openMedModal('${pet.id}')" class="btn-primary text-sm">+ Agregar</button>
      </div>
      ${total === 0
        ? emptyState('💊','Sin tratamientos','Registra tratamientos activos e historial')
        : `<div class="space-y-3">
             ${ms.map(m => {
               const isExpired  = m.expiry && m.expiry < today;
               const expiringSoon = m.expiry && !isExpired && m.expiry <= new Date(Date.now()+30*86400000).toISOString().slice(0,10);
               const reminderLabel = reminderLabels[m.reminder] || m.reminder;
               return `
               <div class="border border-gray-100 rounded-2xl p-4 hover:border-brand-200 transition-colors">
                 <div class="flex items-start justify-between gap-3">
                   <div class="flex items-start gap-3 flex-1 min-w-0">
                     <div class="w-10 h-10 rounded-xl ${m.active?'bg-brand-50':'bg-gray-50'} flex items-center justify-center text-xl flex-shrink-0">💊</div>
                     <div class="flex-1 min-w-0">
                       <div class="flex items-center gap-2 flex-wrap">
                         <span class="font-semibold text-gray-900">${m.name}</span>
                         ${m.active ? '<span class="badge bg-green-100 text-green-700">Activo</span>' : '<span class="badge bg-gray-100 text-gray-500">Finalizado</span>'}
                         ${isExpired ? '<span class="badge bg-red-100 text-red-600">Vencido</span>' : ''}
                         ${expiringSoon ? '<span class="badge bg-amber-100 text-amber-600">Por vencer</span>' : ''}
                       </div>
                       <div class="text-xs text-gray-400 mt-0.5">
                         ${m.dose || `${m.doseVal||''} ${m.doseUnit||''}`} · ${m.frequency}
                       </div>
                       <div class="text-xs text-gray-400">
                         📅 ${formatDate(m.startDate)}${m.endDate ? ` → ${formatDate(m.endDate)}` : ''}
                         ${m.startTime ? ` · ⏰ ${m.startTime}` : ''}
                       </div>
                       ${m.reminder ? `<div class="text-xs text-brand-500 mt-0.5">🔔 ${reminderLabel}</div>` : ''}
                       ${m.stockTotal ? `
                         <div class="mt-2">
                           <div class="flex justify-between text-xs text-gray-500 mb-1">
                             <span>Stock: ${m.stockTotal} ${m.stockUnit||''}</span>
                             ${m.expiry ? `<span class="${isExpired?'text-red-500':expiringSoon?'text-amber-500':'text-gray-400'}">Cad: ${formatDate(m.expiry)}</span>` : ''}
                           </div>
                           <div class="w-full bg-gray-100 rounded-full h-1.5">
                             <div class="h-1.5 rounded-full ${parseInt(m.stockTotal)<=5?'bg-red-400':parseInt(m.stockTotal)<=15?'bg-amber-400':'bg-green-400'}"
                               style="width:${Math.min(100,parseInt(m.stockTotal)/30*100)}%"></div>
                           </div>
                         </div>` : ''}
                     </div>
                   </div>
                   <div class="flex items-center gap-1 flex-shrink-0">
                     <button onclick="openEditMedModal('${pet.id}','${m.id}')" title="Editar"
                       class="w-8 h-8 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 flex items-center justify-center transition-colors">
                       <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                     </button>
                     <button onclick="deleteMedication('${pet.id}','${m.id}')" title="Eliminar"
                       class="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors">
                       <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                     </button>
                   </div>
                 </div>
               </div>`;
             }).join('')}
           </div>
           ${pagerHTML(`med_${pet.id}`, pages, page)}`}
    </div>`;
}

function tabHistory(pet) {
  const allHs = [...(pet.clinicalHistory||[])].reverse();
  const { items: hs, total, pages, page } = paginate(allHs, `hist_${pet.id}`);
  const typeColors = { Cirugía:'bg-red-50 text-red-700', Esterilización:'bg-purple-50 text-purple-700', Procedimiento:'bg-blue-50 text-blue-700', Diagnóstico:'bg-teal-50 text-teal-700', Otro:'bg-gray-50 text-gray-600' };
  return `
    <div class="bg-white rounded-2xl shadow-sm p-5">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="font-semibold text-gray-800">Historial clínico</h3>
          ${total > 0 ? `<p class="text-xs text-gray-400 mt-0.5">${total} evento${total!==1?'s':''}</p>` : ''}
        </div>
        <button onclick="openHistoryModal('${pet.id}')" class="btn-primary text-sm">+ Agregar</button>
      </div>
      ${total === 0
        ? emptyState('📋','Sin historial clínico','Registra eventos, procedimientos y adjunta documentos')
        : `<div class="relative pl-6">
             <div class="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200"></div>
             ${[...hs].reverse().map(h => `
               <div class="relative mb-4">
                 <div class="absolute -left-4 top-1 w-3 h-3 rounded-full bg-brand-500 border-2 border-white"></div>
                 <div class="border border-gray-100 rounded-xl p-4">
                   <div class="flex items-start justify-between gap-2">
                     <div class="flex-1 min-w-0">
                       <div class="flex items-center gap-2 flex-wrap">
                         <span class="font-medium text-gray-900 text-sm">${h.title}</span>
                         <span class="badge ${typeColors[h.type]||'bg-gray-50 text-gray-600'}">${h.type}</span>
                       </div>
                       <div class="text-xs text-gray-400 mt-0.5">${formatDate(h.date)}${h.doctor ? ` · ${h.doctor}` : ''}${h.clinic ? ` · ${h.clinic}` : ''}</div>
                       ${h.notes ? `<p class="text-sm text-gray-600 mt-1">${h.notes}</p>` : ''}
                       ${h.cost ? `<div class="text-xs text-gray-400 mt-1">Costo: ${fmtCLP(h.cost)}</div>` : ''}
                       ${(h.files||[]).length > 0 ? `
                         <div class="flex flex-wrap gap-2 mt-2">
                           ${h.files.map((f,fi) => f.data.startsWith('data:image') ? `
                             <a href="${f.data}" target="_blank" title="${f.name}">
                               <img src="${f.data}" class="h-16 w-16 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity" />
                             </a>` : `
                             <a href="${f.data}" download="${f.name}"
                               class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-700 transition-colors">
                               📎 ${f.name}
                             </a>`).join('')}
                         </div>` : ''}
                     </div>
                     <div class="flex items-center gap-1 flex-shrink-0">
                       <button onclick="openEditHistoryModal('${pet.id}','${h.id}')" title="Editar"
                         class="w-8 h-8 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 flex items-center justify-center transition-colors">
                         <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                       </button>
                       <button onclick="deleteHistory('${pet.id}','${h.id}')" title="Eliminar"
                         class="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors">
                         <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                       </button>
                     </div>
                   </div>
                 </div>
               </div>`).join('')}
           </div>
           ${pagerHTML(`hist_${pet.id}`, pages, page)}`}
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
      `<button onclick="openEventModal()" class="btn-primary flex items-center gap-1.5">
         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
         <span>Evento</span>
       </button>`)}

    <div class="bg-white rounded-2xl shadow-sm p-3 md:p-4 mb-6">
      <div class="flex items-center justify-between mb-3">
        <button onclick="prevMonth()" class="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 font-medium">‹</button>
        <span class="font-semibold text-gray-800 capitalize text-sm md:text-base">${monthName}</span>
        <button onclick="nextMonth()" class="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 font-medium">›</button>
      </div>
      <div class="grid grid-cols-7 gap-0.5 mb-1">
        ${['D','L','M','X','J','V','S'].map((d,i) => `<div class="text-center text-[10px] md:text-xs font-medium text-gray-400 py-1">${d}</div>`).join('')}
      </div>
      <div class="grid grid-cols-7 gap-0.5">
        ${days.map((d, i) => {
          if (!d) return `<div class="calendar-day other-month"></div>`;
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          const dayEvents = events.filter(e => e.date === dateStr);
          const isToday = dateStr === today;
          return `
            <div onclick="openEventModal('${dateStr}')" class="calendar-day ${isToday?'today':''} relative">
              <div class="text-[10px] md:text-xs font-semibold ${isToday?'text-brand-600':'text-gray-700'}">${d}</div>
              ${dayEvents.slice(0,2).map(e => `
                <div class="hidden md:block text-xs mt-0.5 px-1 py-0.5 rounded bg-brand-100 text-brand-700 truncate">${eventIcon(e.type)} ${e.title}</div>
                <div class="md:hidden mt-0.5 w-1.5 h-1.5 rounded-full bg-brand-400 mx-auto"></div>
              `).join('')}
            </div>`;
        }).join('')}
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm p-5">
      ${(() => {
        const upcoming = events.filter(e=>e.date>=today).sort((a,b)=>a.date>b.date?1:-1);
        const { items: evPage, total, pages, page } = paginate(upcoming, 'events');
        return `
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-semibold text-gray-800">Próximos eventos</h3>
            ${total > 0 ? `<p class="text-xs text-gray-400 mt-0.5">${total} evento${total!==1?'s':''}</p>` : ''}
          </div>
        </div>
        ${total === 0
          ? `<p class="text-sm text-gray-400 text-center py-8">Sin eventos próximos</p>`
          : `<div class="space-y-1">
               ${evPage.map(e => `
                 <div class="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors group">
                   <div class="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-base flex-shrink-0">${eventIcon(e.type)}</div>
                   <div class="flex-1 min-w-0">
                     <div class="text-sm font-medium text-gray-900 truncate">${e.title}</div>
                     <div class="text-xs text-gray-400">${formatDate(e.date)}${e.pet ? ` · ${e.pet}` : ''}</div>
                   </div>
                   <button onclick="deleteEvent('${e.id}')"
                     class="w-7 h-7 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100">
                     <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                   </button>
                 </div>`).join('')}
             </div>
             ${pagerHTML('events', pages, page)}`}`;
      })()}
    </div>
  `);
}

// ---- VISTA: FINANZAS ----
function viewFinance() {
  const allExpenses = state.expenses || [];
  const pets = state.pets;
  const today = new Date();
  const thisMonth = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;

  // Filtros activos
  const petFilter  = state.finPet    || '';
  const period     = state.finPeriod || 'mensual';
  const viewMode   = state.finView   || 'listado';

  // Gastos filtrados por mascota
  const expenses = petFilter ? allExpenses.filter(e => e.pet === petFilter) : allExpenses;

  const total      = expenses.reduce((s,e) => s + Number(e.amount||0), 0);
  const monthTotal = expenses.filter(e => e.date?.startsWith(thisMonth)).reduce((s,e) => s + Number(e.amount||0), 0);
  const catColors  = { Veterinaria:'#8b5cf6', Medicamentos:'#06b6d4', Alimentación:'#f59e0b', Peluquería:'#ec4899', Hotel:'#10b981', Otro:'#6b7280' };

  // Construir períodos para el gráfico
  function buildPeriods() {
    if (period === 'mensual') {
      return Array.from({length:6}, (_,i) => {
        const d = new Date(today.getFullYear(), today.getMonth()-5+i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        return { label: d.toLocaleDateString('es-CL',{month:'short', year:'2-digit'}), key, match: e => e.date?.startsWith(key) };
      });
    }
    if (period === 'trimestral') {
      return Array.from({length:4}, (_,i) => {
        const d = new Date(today.getFullYear(), today.getMonth() - (3-i)*3, 1);
        const q = Math.floor(d.getMonth()/3)+1;
        const months = [0,1,2].map(m => `${d.getFullYear()}-${String(d.getMonth()+m+1).padStart(2,'0')}`);
        return { label: `Q${q} ${d.getFullYear()}`, match: e => months.some(m => e.date?.startsWith(m)) };
      });
    }
    if (period === 'semestral') {
      return Array.from({length:4}, (_,i) => {
        const offset = (3-i)*6;
        const d = new Date(today.getFullYear(), today.getMonth()-offset, 1);
        const sem = d.getMonth() < 6 ? 1 : 2;
        const baseMonth = sem === 1 ? 0 : 6;
        const months = Array.from({length:6}, (_,m) => `${d.getFullYear()}-${String(baseMonth+m+1).padStart(2,'0')}`);
        return { label: `S${sem} ${d.getFullYear()}`, match: e => months.some(m => e.date?.startsWith(m)) };
      });
    }
    if (period === 'anual') {
      return Array.from({length:4}, (_,i) => {
        const y = today.getFullYear() - (3-i);
        return { label: `${y}`, match: e => e.date?.startsWith(`${y}`) };
      });
    }
    return [];
  }

  const periods = buildPeriods();

  setTimeout(() => {
    const ctx = document.getElementById('expenses-chart');
    if (!ctx) return;
    if (chartInstance) chartInstance.destroy();

    if (petFilter) {
      // Gráfico de una mascota: una sola serie
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: periods.map(p => p.label),
          datasets: [{ label: petFilter, data: periods.map(p => expenses.filter(p.match).reduce((s,e)=>s+Number(e.amount||0),0)),
            backgroundColor: '#8b5cf6', borderRadius: 8 }]
        },
        options: { responsive:true, plugins:{ legend:{display:false} }, scales:{ y:{ ticks:{ callback: v=>'$'+v.toLocaleString('es-CL') } } } }
      });
    } else {
      // Gráfico con todas las mascotas: una serie por mascota + colores
      const petColors = ['#8b5cf6','#06b6d4','#f59e0b','#ec4899','#10b981','#ef4444','#6366f1','#84cc16'];
      const petsWithExp = pets.filter(p => allExpenses.some(e => e.pet === p.name));
      const datasets = petsWithExp.length > 0
        ? petsWithExp.map((p, i) => ({
            label: p.name,
            data: periods.map(pr => allExpenses.filter(e => e.pet===p.name && pr.match(e)).reduce((s,e)=>s+Number(e.amount||0),0)),
            backgroundColor: petColors[i % petColors.length], borderRadius: 6,
          }))
        : [{ label: 'Todos', data: periods.map(p => expenses.filter(p.match).reduce((s,e)=>s+Number(e.amount||0),0)),
            backgroundColor: '#8b5cf6', borderRadius: 8 }];
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels: periods.map(p => p.label), datasets },
        options: { responsive:true, plugins:{ legend:{ display: petsWithExp.length > 1 } },
          scales:{ x:{ stacked: false }, y:{ ticks:{ callback: v=>'$'+v.toLocaleString('es-CL') } } } }
      });
    }
  }, 100);

  return appShell(`
    ${pageHeader('Finanzas 💰', 'Control de gastos por mascota',
      `<button onclick="openExpenseModal()" class="btn-primary flex items-center gap-1.5">
         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
         <span>Gasto</span>
       </button>`)}

    <!-- Filtros -->
    <div class="bg-white rounded-2xl shadow-sm p-4 mb-6 space-y-3">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Selector mascota -->
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Mascota</span>
          <select onchange="state.finPet=this.value;render()" class="input-field text-sm py-1.5" style="width:auto;min-width:130px">
            <option value="">Todas</option>
            ${pets.map(p=>`<option ${petFilter===p.name?'selected':''}>${p.name}</option>`).join('')}
          </select>
        </div>
        <!-- Vista toggle -->
        <div class="flex rounded-xl overflow-hidden border border-gray-200 text-sm font-medium ml-auto">
          ${['listado','grafico'].map(m=>`
            <button onclick="state.finView='${m}';render()"
              class="px-3 py-1.5 transition-colors ${viewMode===m?'bg-brand-600 text-white':'text-gray-500 hover:bg-gray-50'}">
              ${m==='listado'?'☰ Lista':'📊 Gráfico'}
            </button>`).join('')}
        </div>
      </div>
      <!-- Período (segunda fila en móvil, inline en desktop) -->
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Período</span>
        <div class="flex rounded-xl overflow-hidden border border-gray-200 text-xs md:text-sm font-medium">
          ${['mensual','trimestral','semestral','anual'].map(p=>`
            <button onclick="state.finPeriod='${p}';render()"
              class="px-2.5 md:px-3 py-1.5 transition-colors ${period===p?'bg-brand-600 text-white':'text-gray-500 hover:bg-gray-50'}">
              ${{mensual:'Mensual',trimestral:'Trimest.',semestral:'Semest.',anual:'Anual'}[p]}
            </button>`).join('')}
        </div>
      </div>
    </div>

    <!-- Widgets -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger">
      ${statCard('💰','Total '+(petFilter||'todas'), fmtCLP(total), 'brand')}
      ${statCard('📅','Este mes', fmtCLP(monthTotal), 'teal')}
      ${statCard('🧾','Registros', expenses.length, 'amber')}
      ${statCard('🐾','Mascotas', pets.length, 'brand')}
    </div>

    ${viewMode === 'grafico' ? `
    <!-- GRÁFICO -->
    <div class="grid md:grid-cols-3 gap-6 mb-6">
      <div class="md:col-span-2 bg-white rounded-2xl shadow-sm p-5">
        <h3 class="font-semibold text-gray-700 mb-1">Gastos ${period} ${petFilter ? '· '+petFilter : '· Todas las mascotas'}</h3>
        <p class="text-xs text-gray-400 mb-4">${{mensual:'Últimos 6 meses',trimestral:'Últimos 4 trimestres',semestral:'Últimos 4 semestres',anual:'Últimos 4 años'}[period]}</p>
        <canvas id="expenses-chart" height="220"></canvas>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-5">
        <h3 class="font-semibold text-gray-700 mb-4">Por categoría</h3>
        ${Object.keys(catColors).map(cat => {
          const catTotal = expenses.filter(e=>e.category===cat).reduce((s,e)=>s+Number(e.amount||0),0);
          const pct = total > 0 ? Math.round(catTotal/total*100) : 0;
          if (!catTotal) return '';
          return `<div class="mb-3">
            <div class="flex justify-between text-xs mb-1">
              <span class="text-gray-600">${cat}</span>
              <span class="font-semibold text-gray-800">${fmtCLP(catTotal)}</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div class="h-2 rounded-full" style="width:${pct}%;background:${catColors[cat]}"></div>
            </div>
          </div>`;
        }).join('')}
        ${total===0?'<p class="text-xs text-gray-400 text-center py-4">Sin datos</p>':''}
        ${pets.length > 1 && !petFilter ? `
        <div class="mt-4 pt-4 border-t border-gray-100">
          <div class="text-xs font-semibold text-gray-400 mb-2">Por mascota</div>
          ${pets.map(p => {
            const pt = allExpenses.filter(e=>e.pet===p.name).reduce((s,e)=>s+Number(e.amount||0),0);
            if (!pt) return '';
            const pct = total>0?Math.round(pt/total*100):0;
            return `<div class="mb-2">
              <div class="flex justify-between text-xs mb-1">
                <span class="text-gray-600">${speciesEmoji(p.species)} ${p.name}</span>
                <span class="font-semibold">${fmtCLP(pt)}</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-1.5">
                <div class="h-1.5 rounded-full bg-brand-400" style="width:${pct}%"></div>
              </div>
            </div>`;
          }).join('')}
        </div>` : ''}
      </div>
    </div>` : `
    <!-- LISTADO -->
    ${(() => {
      const sorted = [...expenses].sort((a,b)=>b.date>a.date?1:-1);
      const { items: expPage, total: expTotal, pages: expPages, page: expPage_ } = paginate(sorted, 'finance');
      return `
      <div class="bg-white rounded-2xl shadow-sm p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-semibold text-gray-800">Historial de gastos${petFilter?' · '+petFilter:''}</h3>
            <p class="text-xs text-gray-400 mt-0.5">${expTotal} registro${expTotal!==1?'s':''} · Total ${fmtCLP(total)}</p>
          </div>
        </div>
        ${expTotal === 0
          ? emptyState('💸','Sin gastos registrados','Comienza a registrar los gastos de tus mascotas')
          : `<div class="overflow-x-auto -mx-5 px-5">
               <table class="w-full text-sm min-w-[540px]">
                 <thead>
                   <tr class="text-left text-xs text-gray-400 border-b border-gray-100">
                     <th class="pb-3 font-semibold">Fecha</th>
                     <th class="pb-3 font-semibold">Descripción</th>
                     <th class="pb-3 font-semibold">Mascota</th>
                     <th class="pb-3 font-semibold">Categoría</th>
                     <th class="pb-3 font-semibold text-right">Monto</th>
                     <th class="pb-3 w-8"></th>
                   </tr>
                 </thead>
                 <tbody>
                   ${expPage.map(e => `
                     <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                       <td class="py-3 text-gray-400 whitespace-nowrap text-xs">${formatDate(e.date)}</td>
                       <td class="py-3 font-medium text-gray-800 max-w-[200px]">
                         <span class="truncate block">${e.description}</span>
                       </td>
                       <td class="py-3 text-gray-500 text-xs">${e.pet ? `${speciesEmoji(pets.find(p=>p.name===e.pet)?.species||'')} ${e.pet}` : '—'}</td>
                       <td class="py-3"><span class="badge text-xs" style="background:${catColors[e.category]+'22'};color:${catColors[e.category]}">${e.category||'—'}</span></td>
                       <td class="py-3 text-right font-bold text-gray-900 whitespace-nowrap">${fmtCLP(e.amount)}</td>
                       <td class="py-3 text-right">
                         <button onclick="deleteExpense('${e.id}')"
                           class="w-7 h-7 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors ml-auto opacity-0 group-hover:opacity-100">
                           <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                         </button>
                       </td>
                     </tr>`).join('')}
                 </tbody>
               </table>
             </div>
             ${pagerHTML('finance', expPages, expPage_)}`}
      </div>`;
    })()}`}
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
    <div class="modal-box p-4 sm:p-6">
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
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        </div>
        <div>
          <label class="form-label">¿Cuándo recibir la alerta?</label>
          <div class="grid grid-cols-3 gap-2 mt-1">
            ${[{v:'same',l:'El mismo día'},{v:'week',l:'1 sem antes'},{v:'custom',l:'Personalizado'}].map(o => `
              <button type="button" onclick="selectVaccineAlert('${o.v}')" id="va-${o.v}"
                class="py-2.5 px-1 rounded-xl border-2 text-xs font-medium transition-all border-gray-200 text-gray-500 hover:border-brand-300 text-center leading-tight">
                ${o.l}
              </button>`).join('')}
          </div>
          <input type="hidden" id="v-alert" value="same" />
          <div id="va-custom-field" class="hidden mt-2">
            <label class="form-label">Días de anticipación</label>
            <input id="v-alert-days" type="number" min="1" max="365" placeholder="Ej: 15" class="input-field" />
          </div>
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
    <div class="modal-box p-4 sm:p-6">
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
            <select id="d-type" class="input-field">
              <option>Interna</option><option>Externa</option><option>Ambas</option>
            </select>
          </div>
          <div>
            <label class="form-label">Formato *</label>
            <select id="d-format" onchange="updateDoseSection()" class="input-field">
              <option value="">— Selecciona formato —</option>
              <option>Comprimido</option><option>Pipeta</option><option>Collar</option>
              <option>Spray</option><option>Jarabe</option><option>Inyección</option>
            </select>
          </div>
        </div>

        <div id="d-dose-section" class="hidden space-y-2">
          <label class="form-label">Dosis</label>
          <div class="flex gap-2 items-center">
            <div id="d-dose-input-wrap" class="flex-1"></div>
            <div id="d-unit-badge" class="px-3 py-2 bg-teal-50 text-teal-700 rounded-xl text-sm font-semibold whitespace-nowrap"></div>
          </div>
          <div id="d-dose-preview" class="hidden bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700">
            📋 Se registrará: <span id="d-dose-preview-text" class="font-semibold text-teal-700"></span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        </div>

        <div>
          <label class="form-label">¿Cuándo recibir la alerta?</label>
          <div class="grid grid-cols-3 gap-2 mt-1">
            ${[{v:'same',l:'El mismo día'},{v:'week',l:'1 sem antes'},{v:'custom',l:'Personalizado'}].map(o => `
              <button type="button" onclick="selectDewormAlert('${o.v}')" id="da-${o.v}"
                class="py-2.5 px-1 rounded-xl border-2 text-xs font-medium transition-all border-gray-200 text-gray-500 hover:border-teal-300 text-center leading-tight">
                ${o.l}
              </button>`).join('')}
          </div>
          <input type="hidden" id="d-alert" value="same" />
          <div id="da-custom-field" class="hidden mt-2">
            <label class="form-label">Días de anticipación</label>
            <input id="d-alert-days" type="number" min="1" max="365" placeholder="Ej: 15" class="input-field" />
          </div>
        </div>

        <div>
          <label class="form-label">Costo (CLP)</label>
          <input id="d-cost" type="number" min="0" placeholder="0" class="input-field" />
        </div>

        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button type="submit" class="btn-primary flex-1">Guardar</button>
        </div>
      </form>
    </div>`);
}

function openMedModal(petId) {
  const today = new Date().toISOString().slice(0,10);
  openModal(`
    <div class="modal-box p-4 sm:p-6">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-2xl">💊</span>
        <h3 class="text-lg font-bold text-gray-900">Registrar Tratamiento</h3>
      </div>
      <p class="text-xs text-gray-400 mb-4">Los horarios se calculan automáticamente según la frecuencia</p>
      <form onsubmit="saveMedication(event,'${petId}')" class="space-y-3">

        <div>
          <label class="form-label">Medicamento *</label>
          <input id="m-name" required placeholder="Nombre del medicamento" class="input-field" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label">Dosis *</label>
            <input id="m-dose-val" type="number" min="0" step="0.1" required placeholder="Ej: 500" class="input-field" oninput="updateMedPreview()" />
          </div>
          <div>
            <label class="form-label">Unidad</label>
            <select id="m-unit" class="input-field" onchange="updateMedPreview()">
              <option value="mg">mg</option>
              <option value="ml">ml</option>
              <option value="Comprimido(s)">Comprimido(s)</option>
              <option value="Gotas">Gotas</option>
            </select>
          </div>
        </div>

        <div>
          <label class="form-label">Frecuencia *</label>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-400 font-medium whitespace-nowrap flex-shrink-0">Cada</span>
            <input id="m-freq-n" type="number" min="1" max="72" value="8" class="input-field !w-16 text-center flex-shrink-0" oninput="updateMedPreview()" />
            <select id="m-freq-unit" class="input-field flex-1" onchange="updateMedPreview()">
              <option value="horas">Horas</option>
              <option value="dias">Días</option>
            </select>
          </div>
          <div id="m-freq-preview" class="text-xs text-brand-600 mt-1 font-medium"></div>
        </div>

        <div id="m-schedules-box" class="hidden bg-brand-50 rounded-xl p-3">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Horarios calculados</div>
          <div id="m-schedules" class="flex flex-wrap gap-2"></div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="min-w-0">
            <label class="form-label">Fecha inicio *</label>
            <input id="m-start" type="date" required value="${today}" class="input-field" style="min-width:0;width:100%" oninput="updateMedPreview()" />
          </div>
          <div class="min-w-0">
            <label class="form-label">Hora inicio *</label>
            <input id="m-start-time" type="time" required value="08:00" class="input-field" style="min-width:0;width:100%" oninput="updateMedPreview()" />
          </div>
        </div>
        <div>
          <label class="form-label">N° días tratamiento</label>
          <input id="m-days" type="number" min="1" placeholder="Ej: 7 (dejar vacío = indefinido)" class="input-field" oninput="updateMedPreview()" />
        </div>

        <div id="m-enddate-box" class="hidden">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Fecha de término</div>
          <div id="m-enddate-text" class="text-base font-bold text-brand-600"></div>
        </div>

        <div>
          <label class="form-label">Costo (CLP)</label>
          <input id="m-cost" type="number" min="0" placeholder="0" class="input-field" />
        </div>

        <div>
          <label class="form-label">🔔 Recordatorio por dosis</label>
          <div class="grid grid-cols-2 gap-2 mt-1">
            ${[{v:'exact',l:'Horario exacto'},{v:'15',l:'15 min antes'},{v:'30',l:'30 min antes'},{v:'60',l:'60 min antes'}].map(o => `
              <button type="button" onclick="selectMedReminder('${o.v}')" id="mr-${o.v}"
                class="py-2.5 px-2 rounded-xl border-2 text-sm font-medium transition-all border-gray-200 text-gray-500 hover:border-brand-300 text-center">
                ${o.l}
              </button>`).join('')}
          </div>
          <input type="hidden" id="m-reminder" value="exact" />
        </div>

        <div class="flex items-center gap-2">
          <input type="checkbox" id="m-active" checked class="rounded text-brand-500" />
          <label for="m-active" class="text-sm text-gray-700 font-medium">Tratamiento activo</label>
        </div>

        <hr class="border-gray-100" />
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-semibold text-gray-700">📦 Stock del medicamento <span class="text-gray-400 font-normal">(opcional)</span></label>
          </div>
          <!-- Cantidad + Unidad en 2 cols, Caducidad en fila propia en mobile -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label">Cantidad total</label>
              <input id="m-stock-total" type="number" min="0" placeholder="0" class="input-field" />
            </div>
            <div>
              <label class="form-label">Unidad</label>
              <select id="m-stock-unit" class="input-field">
                <option>Comprimidos</option><option>ml</option><option>mg</option><option>Ampollas</option><option>Frascos</option>
              </select>
            </div>
          </div>
          <div class="mt-3">
            <label class="form-label">Fecha caducidad</label>
            <input id="m-expiry" type="date" class="input-field" />
          </div>
        </div>

        <div class="flex gap-3 pt-1">
          <button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button type="submit" class="btn-primary flex-1">Guardar tratamiento</button>
        </div>
      </form>
    </div>`);
  setTimeout(() => updateMedPreview(), 50);
}

function openHistoryModal(petId) {
  openModal(`
    <div class="modal-box p-4 sm:p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4">Nuevo evento clínico</h3>
      <form onsubmit="saveHistory(event,'${petId}')" class="space-y-3">
        <div>
          <label class="form-label">Título *</label>
          <input id="h-title" required placeholder="Ej: Esterilización" class="input-field" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="form-label">Tipo</label>
            <select id="h-type" class="input-field">
              <option>Cirugía</option><option>Esterilización</option><option>Procedimiento</option>
              <option>Diagnóstico</option><option>Otro</option>
            </select>
          </div>
          <div><label class="form-label">Fecha *</label><input id="h-date" type="date" required class="input-field" /></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label class="form-label">Médico</label><input id="h-doctor" placeholder="Dr. García" class="input-field" /></div>
          <div><label class="form-label">Clínica</label><input id="h-clinic" placeholder="Clínica Vet." class="input-field" /></div>
        </div>
        <div>
          <label class="form-label">Costo (CLP)</label>
          <input id="h-cost" type="number" min="0" placeholder="0" class="input-field" />
        </div>
        <div>
          <label class="form-label">Notas</label>
          <textarea id="h-notes" rows="2" class="input-field resize-none" placeholder="Observaciones..."></textarea>
        </div>
        <div>
          <label class="form-label">📎 Adjuntar archivos <span class="text-gray-400 font-normal">(imágenes, PDFs, resultados)</span></label>
          <div onclick="document.getElementById('h-files').click()"
            class="mt-1 border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-colors">
            <div class="text-2xl mb-1">📂</div>
            <p class="text-xs text-gray-500">Haz clic para seleccionar archivos</p>
            <p class="text-xs text-gray-400">PNG, JPG, PDF (máx. 5MB c/u)</p>
          </div>
          <input id="h-files" type="file" multiple accept="image/*,.pdf,.doc,.docx" class="hidden" onchange="previewHistoryFiles(this)" />
          <div id="h-files-preview" class="flex flex-wrap gap-2 mt-2"></div>
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
    <div class="modal-box p-4 sm:p-6">
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
    <div class="modal-box p-4 sm:p-6">
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
    <div class="modal-box p-4 sm:p-6">
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
  const email = document.getElementById('l-email').value.trim().toLowerCase();
  const pass  = document.getElementById('l-pass').value;
  // Demo account always works
  if (email === 'demo@mypets.cl') {
    const name = 'Felipe Molina';
    state.user = { name, email }; state.isLoggedIn = true; saveState(); navigate('dashboard'); return;
  }
  const users = getUsers();
  const user = users.find(u => u.email === email);
  if (!user) { showToast('Email no registrado', 'error'); return; }
  if (user.password !== btoa(pass)) { showToast('Contraseña incorrecta', 'error'); return; }
  state.user = { name: user.name, email: user.email };
  state.isLoggedIn = true; saveState(); navigate('dashboard');
}

function handleRegister(e) {
  e.preventDefault();
  const name  = document.getElementById('r-name').value.trim();
  const email = document.getElementById('r-email').value.trim().toLowerCase();
  const pass  = document.getElementById('r-pass').value;
  const pass2 = document.getElementById('r-pass2').value;
  if (pass !== pass2) { showToast('Las contraseñas no coinciden', 'error'); return; }
  if (pass.length < 6) { showToast('Mínimo 6 caracteres', 'error'); return; }
  const users = getUsers();
  if (users.find(u => u.email === email)) { showToast('Email ya registrado', 'error'); return; }
  const inviteToken = new URLSearchParams(location.search).get('invite') || location.hash.match(/invite=([^&]+)/)?.[1];
  users.push({ name, email, password: btoa(pass), createdAt: new Date().toISOString() });
  saveUsers(users);
  // Check if registering from an invitation
  if (inviteToken) {
    const invites = getInvites();
    const inv = invites.find(i => i.token === inviteToken && !i.used);
    if (inv) {
      inv.used = true; inv.tutorEmail = email; inv.tutorName = name;
      saveInvites(invites);
      // Load inviter's pets so we can show the shared pet
      showToast(`✅ Cuenta creada. Tienes acceso a ver la mascota compartida.`, 'success');
    }
  }
  state.user = { name, email }; state.isLoggedIn = true; saveState(); navigate('dashboard');
}

function handleForgot() {
  const email = document.getElementById('f-email')?.value?.trim().toLowerCase();
  if (!email) { showToast('Ingresa tu email', 'error'); return; }
  const users = getUsers();
  if (!users.find(u => u.email === email) && email !== 'demo@mypets.cl') {
    showToast('Email no encontrado', 'error'); return;
  }
  const token = genId() + genId();
  const resets = getResets();
  resets.push({ email, token, createdAt: Date.now(), used: false });
  saveResets(resets);
  const link = `${location.origin}${location.pathname}#reset=${token}`;
  sendEmail(email, 'MyPets – Recuperar contraseña',
    `Hola,\n\nHaz clic en el siguiente enlace para restablecer tu contraseña:\n${link}\n\nEste enlace expira en 1 hora.\n\nMyPets 3.0`)
    .then(() => {
      // Show link in toast for demo (since EmailJS may not be configured)
      showToast(`📧 Enlace enviado a ${email}`, 'success');
      console.log(`[MyPets] Reset link: ${link}`);
    })
    .catch(() => {
      showToast(`📧 (Demo) Link copiado a consola`, 'success');
      console.log(`[MyPets] Reset link: ${link}`);
    });
  setTimeout(() => navigate('login'), 2000);
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

function openDeletePetWithCode(petId) {
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;
  const hasTwoTutors = pet.tutor2?.name;
  const email = state.user?.email || '';
  openModal(`
    <div class="modal-box p-4 sm:p-6">
      <div class="text-center mb-4">
        <div class="text-5xl mb-2">🗑️</div>
        <h3 class="text-lg font-bold text-gray-900">Eliminar a ${pet.name}</h3>
        <p class="text-sm text-gray-500 mt-1">
          ${hasTwoTutors
            ? `Esta mascota tiene 2 tutores. Solo se eliminará de <strong>tu perfil</strong>. El otro tutor mantendrá acceso.`
            : `Esta acción eliminará toda la información de <strong>${pet.name}</strong> permanentemente.`}
        </p>
      </div>
      <div id="delete-step-1">
        <div class="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-amber-700 mb-4">
          ⚠️ Para confirmar, enviaremos un código de verificación a:<br/>
          <strong>${email}</strong>
        </div>
        <div class="flex gap-3">
          <button onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button onclick="sendDeleteCode('${petId}')" class="flex-1 py-2 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors">
            Enviar código
          </button>
        </div>
      </div>
      <div id="delete-step-2" class="hidden">
        <p class="text-sm text-gray-500 mb-3">Ingresa el código de 6 dígitos enviado a <strong>${email}</strong></p>
        <input id="delete-code-input" type="text" maxlength="6" placeholder="000000"
          class="input-field text-center text-2xl tracking-[0.5em] font-bold mb-1" />
        <p id="delete-code-error" class="text-xs text-red-500 text-center mb-3 hidden">Código incorrecto. Intenta nuevamente.</p>
        <div class="flex gap-3">
          <button onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button onclick="verifyDeleteCode('${petId}')" class="flex-1 py-2 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors">
            Confirmar eliminación
          </button>
        </div>
        <button onclick="sendDeleteCode('${petId}')" class="w-full text-xs text-gray-400 hover:text-gray-600 mt-2">Reenviar código</button>
      </div>
    </div>`);
}

function sendDeleteCode(petId) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  state.deleteCode = code;
  state.deletePetId = petId;
  // En producción se enviaría por email. Aquí lo mostramos en consola y toast de demo.
  console.log(`[MyPets] Código de eliminación: ${code}`);
  document.getElementById('delete-step-1').classList.add('hidden');
  document.getElementById('delete-step-2').classList.remove('hidden');
  showToast(`📧 Código enviado a ${state.user?.email} (demo: ${code})`, 'success');
}

function verifyDeleteCode(petId) {
  const input = document.getElementById('delete-code-input')?.value?.trim();
  const error = document.getElementById('delete-code-error');
  if (input !== state.deleteCode) {
    error?.classList.remove('hidden');
    document.getElementById('delete-code-input').classList.add('border-red-400');
    return;
  }
  deletePet(petId);
}

function confirmDeletePet(petId) { openDeletePetWithCode(petId); }

function deletePet(petId) {
  const pet = state.pets.find(p => p.id === petId);
  const hasTwoTutors = pet?.tutor2?.name;
  if (hasTwoTutors) {
    // Solo remover al tutor actual — mantener la mascota para el otro tutor
    pet.tutor2 = null;
    showToast(`${pet.name} eliminada de tu perfil`, 'success');
  } else {
    state.pets = state.pets.filter(p => p.id !== petId);
    showToast(`${pet?.name} eliminada`, 'error');
  }
  state.deleteCode = null; state.deletePetId = null;
  saveState(); closeModal(); navigate('pets');
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
    nextDate: period ? addMonths(date, parseInt(period)) : '',
    alertType: g('v-alert'), alertDays: g('v-alert-days'), cost: g('v-cost') };
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
  const fmt = g('d-format');
  const unitMap = { Comprimido:'Comprimido(s)', Pipeta:'ML', Collar:'Unidad(es)', Spray:'ML', Jarabe:'ML', Inyección:'ML' };
  const d = { id: genId(), product: g('d-product'), type: g('d-type'), format: fmt,
    dose: g('d-dose'), unit: unitMap[fmt] || '', date,
    nextDate: period ? addMonths(date, parseInt(period)) : '',
    alertType: g('d-alert'), alertDays: g('d-alert-days'), cost: g('d-cost') };
  pet.deworming = pet.deworming || [];
  pet.deworming.push(d);
  if (d.cost) {
    state.expenses.push({ id: genId(), description: `Desparasitación ${d.product} - ${pet.name}`,
      amount: d.cost, date, category: 'Veterinaria', pet: pet.name });
  }
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
  const freqN = g('m-freq-n'), freqUnit = g('m-freq-unit');
  const days = parseInt(g('m-days') || 0);
  const startDate = g('m-start');
  let endDate = '';
  if (days && startDate) {
    const d = new Date(startDate + 'T12:00:00');
    d.setDate(d.getDate() + days);
    endDate = d.toISOString().slice(0,10);
  }
  const m = {
    id: genId(), name: g('m-name'),
    doseVal: g('m-dose-val'), doseUnit: g('m-unit'),
    dose: `${g('m-dose-val')} ${g('m-unit')}`,
    freqN, freqUnit, frequency: `Cada ${freqN} ${freqUnit}`,
    startDate, startTime: g('m-start-time'), treatmentDays: days, endDate,
    stockTotal: g('m-stock-total'), stockUnit: g('m-stock-unit'), expiry: g('m-expiry'),
    cost: g('m-cost'),
    active: document.getElementById('m-active')?.checked,
    reminder: g('m-reminder') || 'exact',
  };
  pet.medications = pet.medications || [];
  pet.medications.push(m);
  if (m.cost) {
    state.expenses.push({ id: genId(), description: `Medicamento ${m.name} - ${pet.name}`,
      amount: m.cost, date: startDate, category: 'Medicamentos', pet: pet.name });
  }
  saveState(); closeModal(); render();
  showToast('Medicamento registrado ✓', 'success');
}

function deleteMedication(petId, mId) {
  const pet = state.pets.find(p => p.id === petId);
  if (pet) { pet.medications = pet.medications.filter(m => m.id !== mId); saveState(); render(); }
}

function previewHistoryFiles(input) {
  const preview = document.getElementById('h-files-preview');
  if (!preview) return;
  preview.innerHTML = '';
  Array.from(input.files).forEach(file => {
    const el = document.createElement('div');
    el.className = 'flex items-center gap-1.5 px-2 py-1 bg-brand-50 border border-brand-100 rounded-lg text-xs text-brand-700';
    el.textContent = `📎 ${file.name}`;
    preview.appendChild(el);
  });
}

function readFilesAsBase64(fileInput) {
  const files = Array.from(fileInput?.files || []);
  return Promise.all(files.map(f => new Promise((res, rej) => {
    if (f.size > 5 * 1024 * 1024) { showToast(`${f.name} supera 5MB`, 'error'); res(null); return; }
    const reader = new FileReader();
    reader.onload = e => res({ name: f.name, data: e.target.result, type: f.type });
    reader.onerror = rej;
    reader.readAsDataURL(f);
  }))).then(results => results.filter(Boolean));
}

async function saveHistory(e, petId) {
  e.preventDefault();
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;
  const g = id => document.getElementById(id)?.value;
  const filesInput = document.getElementById('h-files');
  const files = filesInput?.files?.length ? await readFilesAsBase64(filesInput) : [];
  const h = { id: genId(), title: g('h-title'), type: g('h-type'), date: g('h-date'),
    doctor: g('h-doctor'), clinic: g('h-clinic'), cost: g('h-cost'), notes: g('h-notes'), files };
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
  state.expenses.push({ id: genId(), description: g('ex-desc'), amount: g('ex-amount'), date: g('ex-date'), category: g('ex-cat'), pet: g('ex-pet'), tutor: state.user?.name || '' });
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

function selectVaccineAlert(val) {
  document.getElementById('v-alert').value = val;
  ['same','week','custom'].forEach(o => {
    const btn = document.getElementById('va-'+o);
    if (btn) btn.className = `px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${o===val ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-brand-300'}`;
  });
  const cf = document.getElementById('va-custom-field');
  if (cf) cf.classList.toggle('hidden', val !== 'custom');
}

function selectDewormAlert(val) {
  document.getElementById('d-alert').value = val;
  ['same','week','custom'].forEach(o => {
    const btn = document.getElementById('da-'+o);
    if (btn) btn.className = `px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${o===val ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500 hover:border-teal-300'}`;
  });
  const cf = document.getElementById('da-custom-field');
  if (cf) cf.classList.toggle('hidden', val !== 'custom');
}

function updateMedPreview() {
  const freqN = parseInt(document.getElementById('m-freq-n')?.value || 0);
  const freqUnit = document.getElementById('m-freq-unit')?.value || 'horas';
  const startTime = document.getElementById('m-start-time')?.value || '08:00';
  const startDate = document.getElementById('m-start')?.value;
  const days = parseInt(document.getElementById('m-days')?.value || 0);
  const doseVal = document.getElementById('m-dose-val')?.value;
  const unit = document.getElementById('m-unit')?.value;

  // Frequency preview
  const freqPreview = document.getElementById('m-freq-preview');
  if (freqPreview && freqN > 0) {
    if (freqUnit === 'horas' && freqN < 48) {
      const dosesDay = Math.round(24 / freqN);
      freqPreview.textContent = `→ ${dosesDay} dosis al día · cada ${freqN} horas`;
    } else {
      freqPreview.textContent = `→ Cada ${freqN} ${freqUnit}`;
    }
  }

  // Schedule calculation
  const box = document.getElementById('m-schedules-box');
  const sched = document.getElementById('m-schedules');
  if (box && sched && freqN > 0 && freqUnit === 'horas' && freqN <= 24 && startTime) {
    const [h, m2] = startTime.split(':').map(Number);
    const times = [];
    let cur = h * 60 + m2;
    const steps = Math.round(24 / freqN);
    for (let i = 0; i < steps; i++) {
      const hh = String(Math.floor((cur % 1440) / 60)).padStart(2,'0');
      const mm = String((cur % 1440) % 60).padStart(2,'0');
      times.push(`${hh}:${mm}`);
      cur += freqN * 60;
    }
    sched.innerHTML = times.map(t => `<span class="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-lg text-sm font-semibold text-brand-700 shadow-sm">🕐 ${t}</span>`).join('');
    box.classList.remove('hidden');
  } else if (box) {
    box.classList.add('hidden');
  }

  // End date calculation
  const endBox = document.getElementById('m-enddate-box');
  const endText = document.getElementById('m-enddate-text');
  if (endBox && endText && days > 0 && startDate) {
    const d = new Date(startDate + 'T12:00:00');
    d.setDate(d.getDate() + days);
    endText.textContent = d.toLocaleDateString('es-CL', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    endBox.classList.remove('hidden');
  } else if (endBox) {
    endBox.classList.add('hidden');
  }
}

function selectMedReminder(val) {
  document.getElementById('m-reminder').value = val;
  ['exact','15','30','60'].forEach(o => {
    const btn = document.getElementById('mr-'+o);
    if (btn) btn.className = `px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${o===val ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-brand-300'}`;
  });
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

function updateDoseSection() {
  const fmt = document.getElementById('d-format')?.value;
  const section = document.getElementById('d-dose-section');
  const wrap = document.getElementById('d-dose-input-wrap');
  const badge = document.getElementById('d-unit-badge');
  if (!fmt || !section) return;
  section.classList.remove('hidden');

  if (fmt === 'Comprimido') {
    badge.textContent = 'Comprimido(s)';
    wrap.innerHTML = `
      <select id="d-dose" class="input-field" onchange="updateDosePreview()">
        <option value="">— Selecciona dosis —</option>
        <option value="1/4">1/4</option>
        <option value="1/3">1/3</option>
        <option value="1/2">1/2</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </select>`;
  } else {
    const unitMap = { Pipeta:'ML', Collar:'Unidad', Spray:'ML', Jarabe:'ML', Inyección:'ML' };
    badge.textContent = unitMap[fmt] || 'Unidades';
    wrap.innerHTML = `<input id="d-dose" type="number" min="0" step="0.1" placeholder="0.0"
      class="input-field" oninput="updateDosePreview()" />`;
  }
  updateDosePreview();
}

function updateDosePreview() {
  const fmt = document.getElementById('d-format')?.value;
  const dose = document.getElementById('d-dose')?.value;
  const preview = document.getElementById('d-dose-preview');
  const previewText = document.getElementById('d-dose-preview-text');
  if (!preview || !previewText) return;
  if (fmt && dose) {
    const unitMap = { Comprimido:'Comprimido(s)', Pipeta:'ML', Collar:'Unidad(es)', Spray:'ML', Jarabe:'ML', Inyección:'ML' };
    previewText.textContent = `${dose} ${unitMap[fmt] || ''}`;
    preview.classList.remove('hidden');
  } else {
    preview.classList.add('hidden');
  }
}

// mantener compatibilidad con llamadas antiguas
function updateDoseUnit() { updateDoseSection(); }

// ---- CSS CLASSES HELPER (inject into head) ----
function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    *{box-sizing:border-box}
    .input-field{width:100%;padding:0.55rem 0.75rem;border:1.5px solid #e5e7eb;border-radius:0.875rem;font-size:0.875rem;transition:border-color .15s,box-shadow .15s;background:white;color:#111827;line-height:1.4}
    .input-field:focus{border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(139,92,246,.15);outline:none}
    .input-field::placeholder{color:#9ca3af}
    select.input-field{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b7280'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 0.6rem center;background-size:1.1rem;padding-right:2rem;appearance:none;cursor:pointer}
    .form-label{display:block;font-size:0.72rem;font-weight:600;color:#6b7280;margin-bottom:0.3rem;text-transform:uppercase;letter-spacing:.03em}
    .btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:.375rem;padding:.5rem 1.125rem;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:white;border-radius:0.875rem;font-weight:600;font-size:.875rem;transition:opacity .15s,transform .1s,box-shadow .15s;cursor:pointer;border:none;letter-spacing:-.01em;box-shadow:0 1px 3px rgba(124,58,237,.35)}
    .btn-primary:hover{opacity:.92;transform:translateY(-1px);box-shadow:0 4px 12px rgba(124,58,237,.4)}
    .btn-primary:active{transform:translateY(0);opacity:1}
    .btn-secondary{display:inline-flex;align-items:center;justify-content:center;gap:.375rem;padding:.5rem 1.125rem;background:#f3f4f6;color:#374151;border-radius:0.875rem;font-weight:600;font-size:.875rem;transition:background .15s,color .15s;cursor:pointer;border:1.5px solid #e5e7eb}
    .btn-secondary:hover{background:#e9ecf0;border-color:#d1d5db}
    .bg-brand-gradient{background:linear-gradient(135deg,#7c3aed,#4f46e5)}
    .card-elevated{background:white;border-radius:1.25rem;box-shadow:0 1px 4px rgba(0,0,0,.06),0 4px 16px rgba(0,0,0,.04);border:1px solid rgba(0,0,0,.05)}
    .page-header-action button,.page-header-action a{white-space:nowrap}
    /* ---- Mobile overrides ---- */
    @media(max-width:640px){
      .input-field{font-size:16px}
      /* Modal slides up from bottom on mobile */
      .modal-overlay{align-items:flex-end;padding:0}
      .modal-box{border-radius:1.5rem 1.5rem 0 0;max-width:100%;max-height:92vh;padding-bottom:env(safe-area-inset-bottom,0px)}
      /* Calendar cells compact on mobile */
      .calendar-day{min-height:44px!important;padding:3px}
      /* Bigger tap area for small buttons */
      .btn-primary,.btn-secondary{min-height:40px}
      /* Section cards: tighter padding */
      .space-y-3>*+*{margin-top:.6rem}
    }
    /* Modal: flex column so footer can stick */
    .modal-box{display:flex;flex-direction:column}
    /* Sticky action buttons — last direct div child of modal-box (the button row) */
    .modal-box>form>div:last-child,
    .modal-box>div.space-y-3>div:last-child,
    .modal-box>div.space-y-4>div:last-child{
      position:sticky;bottom:0;background:white;
      padding-top:12px;margin-top:4px;
      border-top:1px solid #f3f4f6;z-index:2
    }
    @keyframes slideInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideUpModal{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
    .animate-slide-in-up{animation:slideInUp .25s ease both}
    @media(max-width:640px){
      .modal-box{animation:slideUpModal .3s cubic-bezier(.32,.72,0,1) both}
    }
  `;
  document.head.appendChild(style);
}

// ---- VISTA: BOTIQUÍN ----
function viewBotiquin() {
  const pets = state.pets;
  const allMeds = pets.flatMap(p => (p.medications||[]).map(m => ({ ...m, petName: p.name, petId: p.id })));
  const today = new Date().toISOString().slice(0,10);
  const active = allMeds.filter(m => m.active);
  const expiringSoon = allMeds.filter(m => m.expiry && m.expiry <= new Date(Date.now()+30*86400000).toISOString().slice(0,10));
  const lowStock = allMeds.filter(m => m.stockTotal && parseInt(m.stockTotal) <= 5);
  const filterPet = state.botiquinFilter || '';
  const filterStatus = state.botiquinStatus || '';
  let displayed = allMeds.filter(m => !filterPet || m.petName === filterPet);
  if (filterStatus === 'active')   displayed = displayed.filter(m => m.active);
  if (filterStatus === 'expired')  displayed = displayed.filter(m => m.expiry && m.expiry < today);
  if (filterStatus === 'finished') displayed = displayed.filter(m => !m.active);

  return appShell(`
    ${pageHeader('Botiquín 🧴', 'Resumen de medicamentos de todas tus mascotas')}

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger">
      ${statCard('💊','Total', allMeds.length, 'brand')}
      ${statCard('✅','Activos', active.length, 'teal')}
      ${statCard('⚠️','Stock bajo', lowStock.length, 'amber')}
      ${statCard('📅','Por vencer (30d)', expiringSoon.length, 'red')}
    </div>

    ${expiringSoon.length > 0 ? `
    <div class="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6">
      <h3 class="font-semibold text-amber-700 mb-2 text-sm">⚠️ Próximos a vencer (30 días)</h3>
      <div class="flex gap-2 overflow-x-auto pb-1 -mb-1" style="scrollbar-width:none">
        ${expiringSoon.map(m => `
          <div class="bg-white rounded-xl px-3 py-2 text-sm border border-amber-200 flex items-center gap-2 flex-shrink-0">
            <span class="font-medium text-gray-800">${m.name}</span>
            <span class="badge bg-brand-50 text-brand-600 text-xs">${m.petName}</span>
            <span class="text-amber-600 text-xs whitespace-nowrap">Vence ${formatDate(m.expiry)}</span>
          </div>`).join('')}
      </div>
    </div>` : ''}

    <div class="bg-white rounded-2xl shadow-sm p-5">
      <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 class="font-semibold text-gray-700">Todos los medicamentos</h3>
        <div class="flex items-center gap-2 flex-wrap">
          <select onchange="state.botiquinFilter=this.value;render()" class="input-field text-sm py-1.5 w-auto">
            <option value="">Todas las mascotas</option>
            ${pets.map(p => `<option ${filterPet===p.name?'selected':''}>${p.name}</option>`).join('')}
          </select>
          <select onchange="state.botiquinStatus=this.value;render()" class="input-field text-sm py-1.5 w-auto">
            <option value="">Todos los estados</option>
            <option value="active" ${filterStatus==='active'?'selected':''}>Activos</option>
            <option value="finished" ${filterStatus==='finished'?'selected':''}>Finalizados</option>
            <option value="expired" ${filterStatus==='expired'?'selected':''}>Vencidos</option>
          </select>
        </div>
      </div>

      ${(() => {
        const { items: dispPage, total: dispTotal, pages: dispPages, page: dispPage_ } = paginate(displayed, 'botiquin');
        return dispTotal === 0
          ? emptyState('💊','Sin medicamentos','Agrega tratamientos desde el perfil de cada mascota')
          : `<div class="divide-y divide-gray-50">
               ${dispPage.map(m => {
               const isExpired     = m.expiry && m.expiry < today;
               const isExpiringSoon = m.expiry && !isExpired && m.expiry <= new Date(Date.now()+30*86400000).toISOString().slice(0,10);
               return `
               <div class="flex items-center gap-3 py-3">
                 <div class="w-9 h-9 rounded-xl ${m.active?'bg-brand-50':'bg-gray-50'} flex items-center justify-center text-lg flex-shrink-0">💊</div>
                 <div class="flex-1 min-w-0">
                   <div class="flex items-center gap-2 flex-wrap">
                     <span class="font-medium text-gray-900 text-sm">${m.name}</span>
                     <span class="badge bg-brand-50 text-brand-600 text-xs">${m.petName}</span>
                     ${m.active ? '<span class="badge bg-green-100 text-green-700 text-xs">Activo</span>' : '<span class="badge bg-gray-100 text-gray-400 text-xs">Finalizado</span>'}
                   </div>
                   <div class="text-xs mt-0.5 ${isExpired?'text-red-500':isExpiringSoon?'text-amber-500':'text-gray-400'}">
                     ${m.expiry ? `${isExpired?'⚠️ Venció':'📅 Vence'}: ${formatDate(m.expiry)}` : '<span class="text-gray-300">Sin vencimiento</span>'}
                   </div>
                 </div>
                 <button onclick="openPet('${m.petId}');setTab('medicamentos')"
                   class="text-xs text-brand-600 hover:underline whitespace-nowrap flex-shrink-0">Ver detalle →</button>
               </div>`;
             }).join('')}
             </div>
             ${pagerHTML('botiquin', dispPages, dispPage_)}`;
      })()}
    </div>
  `);
}

// ---- RENDER ----
function render() {
  const app = document.getElementById('app');
  const v = state.currentView;
  if (!state.isLoggedIn && !['login','register','forgot','resetPassword'].includes(v)) { navigate('login'); return; }
  if      (v === 'login')         app.innerHTML = viewLogin();
  else if (v === 'register')      app.innerHTML = viewRegister();
  else if (v === 'forgot')        app.innerHTML = viewForgot();
  else if (v === 'resetPassword') app.innerHTML = viewResetPassword();
  else if (v === 'dashboard')     app.innerHTML = viewDashboard();
  else if (v === 'pets')          app.innerHTML = viewPets();
  else if (v === 'addPet')        app.innerHTML = viewAddPet();
  else if (v === 'petProfile')    app.innerHTML = viewPetProfile();
  else if (v === 'calendar')      app.innerHTML = viewCalendar();
  else if (v === 'finance')       app.innerHTML = viewFinance();
  else if (v === 'botiquin')      app.innerHTML = viewBotiquin();
  else navigate('dashboard');
}

// ---- DATOS DE PRUEBA ----
function loadDemoAndLogin() {
  const id = () => genId();
  const dt = (y, m, d) => `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  const greta = {
    id: 'pet-greta', name: 'Greta', species: 'Perro', breed: 'Mestizo', sex: 'Hembra',
    dateOfBirth: dt(2021,3,15), photo: null, color: 'Dorado', sizeRange: 'Mediano',
    weightKg: 12, weightGr: 500, reproductiveStatus: 'Esterilizado/a', chipNumber: '985112345678901',
    activityLevel: 3, personalityTags: ['Sociable','Tranquilo','Cariñoso'],
    allergies: ['Pollo','Pasto'], chronicConditions: ['Displasia de cadera'],
    vet: { name: 'Dra. Valentina Rojas', clinic: 'Clínica Veterinaria Las Condes', phone: '+56912345678', email: 'vrojas@clinicavet.cl' },
    tutor2: { name: 'María González', email: 'maria@gmail.com', role: 'edicion' },
    vaccines: [
      { id: id(), name: 'Polivalente DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)', code: 'DHPP-21', date: dt(2021,6,10), periodicity: 12, nextDate: dt(2022,6,10), alertType: 'week', cost: 25000 },
      { id: id(), name: 'Antirrábica', code: 'RAB-21', date: dt(2021,6,10), periodicity: 12, nextDate: dt(2022,6,10), alertType: 'same', cost: 18000 },
      { id: id(), name: 'Polivalente DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)', code: 'DHPP-22', date: dt(2022,6,8), periodicity: 12, nextDate: dt(2023,6,8), alertType: 'week', cost: 27000 },
      { id: id(), name: 'Antirrábica', code: 'RAB-22', date: dt(2022,6,8), periodicity: 12, nextDate: dt(2023,6,8), alertType: 'same', cost: 19000 },
      { id: id(), name: 'Leptospirosis', code: 'LEP-22', date: dt(2022,9,15), periodicity: 12, nextDate: dt(2023,9,15), alertType: 'week', cost: 22000 },
      { id: id(), name: 'Polivalente DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)', code: 'DHPP-23', date: dt(2023,6,5), periodicity: 12, nextDate: dt(2024,6,5), alertType: 'week', cost: 29000 },
      { id: id(), name: 'Antirrábica', code: 'RAB-23', date: dt(2023,6,5), periodicity: 12, nextDate: dt(2024,6,5), alertType: 'same', cost: 21000 },
      { id: id(), name: 'Bordetella (Tos de las perreras)', code: 'BOR-23', date: dt(2023,11,20), periodicity: 12, nextDate: dt(2024,11,20), alertType: 'week', cost: 20000 },
      { id: id(), name: 'Polivalente DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)', code: 'DHPP-24', date: dt(2024,6,3), periodicity: 12, nextDate: dt(2025,6,3), alertType: 'week', cost: 32000 },
      { id: id(), name: 'Antirrábica', code: 'RAB-24', date: dt(2024,6,3), periodicity: 12, nextDate: dt(2025,6,3), alertType: 'same', cost: 23000 },
      { id: id(), name: 'Polivalente DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)', code: 'DHPP-25', date: dt(2025,6,10), periodicity: 12, nextDate: dt(2026,6,10), alertType: 'week', cost: 35000 },
      { id: id(), name: 'Antirrábica', code: 'RAB-25', date: dt(2025,6,10), periodicity: 12, nextDate: dt(2026,6,10), alertType: 'same', cost: 25000 },
    ],
    deworming: [
      { id: id(), product: 'Drontal Plus', type: 'Interna', format: 'Comprimido', dose: '1', unit: 'Comprimido(s)', date: dt(2023,3,1), nextDate: dt(2023,6,1), alertType: 'same' },
      { id: id(), product: 'Frontline Combo', type: 'Externa', format: 'Pipeta', dose: '1.34', unit: 'ML', date: dt(2023,3,1), nextDate: dt(2023,6,1), alertType: 'same' },
      { id: id(), product: 'Drontal Plus', type: 'Interna', format: 'Comprimido', dose: '1', unit: 'Comprimido(s)', date: dt(2023,6,1), nextDate: dt(2023,9,1), alertType: 'same' },
      { id: id(), product: 'Frontline Combo', type: 'Externa', format: 'Pipeta', dose: '1.34', unit: 'ML', date: dt(2023,9,1), nextDate: dt(2023,12,1), alertType: 'week' },
      { id: id(), product: 'Milbemax', type: 'Interna', format: 'Comprimido', dose: '1', unit: 'Comprimido(s)', date: dt(2024,1,10), nextDate: dt(2024,4,10), alertType: 'same', cost: 8500 },
      { id: id(), product: 'Frontline Combo', type: 'Externa', format: 'Pipeta', dose: '1.34', unit: 'ML', date: dt(2024,4,10), nextDate: dt(2024,7,10), alertType: 'same', cost: 12000 },
      { id: id(), product: 'Milbemax', type: 'Interna', format: 'Comprimido', dose: '1', unit: 'Comprimido(s)', date: dt(2024,7,10), nextDate: dt(2024,10,10), alertType: 'week', cost: 8500 },
      { id: id(), product: 'Frontline Combo', type: 'Externa', format: 'Pipeta', dose: '1.34', unit: 'ML', date: dt(2024,10,10), nextDate: dt(2025,1,10), alertType: 'same', cost: 12000 },
      { id: id(), product: 'Milbemax', type: 'Interna', format: 'Comprimido', dose: '1', unit: 'Comprimido(s)', date: dt(2025,2,5), nextDate: dt(2025,5,5), alertType: 'same', cost: 9000 },
      { id: id(), product: 'Frontline Combo', type: 'Externa', format: 'Pipeta', dose: '1.34', unit: 'ML', date: dt(2025,5,5), nextDate: dt(2025,8,5), alertType: 'week', cost: 13000 },
      { id: id(), product: 'Milbemax', type: 'Interna', format: 'Comprimido', dose: '1', unit: 'Comprimido(s)', date: dt(2025,8,5), nextDate: dt(2025,11,5), alertType: 'same', cost: 9000 },
      { id: id(), product: 'Frontline Combo', type: 'Externa', format: 'Pipeta', dose: '1.34', unit: 'ML', date: dt(2026,2,10), nextDate: dt(2026,5,10), alertType: 'same', cost: 14000 },
    ],
    medications: [
      { id: id(), name: 'Meloxicam', doseVal: '1', doseUnit: 'mg', dose: '1 mg', freqN: '24', freqUnit: 'horas', frequency: 'Cada 24 horas', startDate: dt(2023,8,1), startTime: '08:00', treatmentDays: 10, endDate: dt(2023,8,11), active: false, reminder: 'exact', stockTotal: '', cost: 5500 },
      { id: id(), name: 'Tramadol', doseVal: '50', doseUnit: 'mg', dose: '50 mg', freqN: '8', freqUnit: 'horas', frequency: 'Cada 8 horas', startDate: dt(2023,8,1), startTime: '08:00', treatmentDays: 5, endDate: dt(2023,8,6), active: false, reminder: '30', stockTotal: '', cost: 8000 },
      { id: id(), name: 'Omeprazol', doseVal: '20', doseUnit: 'mg', dose: '20 mg', freqN: '24', freqUnit: 'horas', frequency: 'Cada 24 horas', startDate: dt(2024,3,15), startTime: '08:00', treatmentDays: 30, endDate: dt(2024,4,14), active: false, reminder: 'exact', stockTotal: '30', stockUnit: 'Comprimidos', expiry: dt(2025,12,31), cost: 12000 },
      { id: id(), name: 'Carprofeno', doseVal: '25', doseUnit: 'mg', dose: '25 mg', freqN: '12', freqUnit: 'horas', frequency: 'Cada 12 horas', startDate: dt(2025,1,10), startTime: '08:00', treatmentDays: 14, endDate: dt(2025,1,24), active: false, reminder: '15', cost: 9500 },
      { id: id(), name: 'Gabapentina', doseVal: '100', doseUnit: 'mg', dose: '100 mg', freqN: '12', freqUnit: 'horas', frequency: 'Cada 12 horas', startDate: dt(2026,4,1), startTime: '08:00', treatmentDays: 60, endDate: dt(2026,5,31), active: true, reminder: 'exact', stockTotal: '45', stockUnit: 'Comprimidos', expiry: dt(2027,3,1), cost: 18000 },
    ],
    clinicalHistory: [
      { id: id(), title: 'Esterilización', type: 'Esterilización', date: dt(2022,4,20), doctor: 'Dra. Valentina Rojas', clinic: 'Clínica Vet. Las Condes', cost: 180000, notes: 'Procedimiento sin complicaciones. Alta el mismo día.' },
      { id: id(), title: 'Fractura metacarpo derecho', type: 'Cirugía', date: dt(2023,7,28), doctor: 'Dr. Patricio Vega', clinic: 'Clínica Vet. Las Condes', cost: 320000, notes: 'Caída desde altura. Osteosíntesis con placa. Reposo 6 semanas.' },
      { id: id(), title: 'Control displasia cadera', type: 'Diagnóstico', date: dt(2024,2,14), doctor: 'Dra. Valentina Rojas', clinic: 'Clínica Vet. Las Condes', cost: 45000, notes: 'Radiografías confirman displasia leve. Se indica manejo con suplementos y ejercicio moderado.' },
      { id: id(), title: 'Limpieza dental', type: 'Procedimiento', date: dt(2024,9,5), doctor: 'Dra. Valentina Rojas', clinic: 'Clínica Vet. Las Condes', cost: 95000, notes: 'Sarro moderado. Extracción de pieza P4 izquierda inferior.' },
      { id: id(), title: 'Control anual + exámenes', type: 'Diagnóstico', date: dt(2025,3,20), doctor: 'Dra. Valentina Rojas', clinic: 'Clínica Vet. Las Condes', cost: 68000, notes: 'Hemograma y perfil bioquímico normales. Peso estable. Todo en orden.' },
      { id: id(), title: 'Control displasia + ecografía', type: 'Diagnóstico', date: dt(2026,1,8), doctor: 'Dra. Valentina Rojas', clinic: 'Clínica Vet. Las Condes', cost: 85000, notes: 'Leve progresión displasia. Se agrega gabapentina para manejo dolor crónico.' },
    ],
  };

  const luna = {
    id: 'pet-luna', name: 'Luna', species: 'Gato', breed: 'Siamés', sex: 'Hembra',
    dateOfBirth: dt(2022,8,20), photo: null, color: 'Crema', sizeRange: 'Pequeño',
    weightKg: 3, weightGr: 800, reproductiveStatus: 'Esterilizado/a', chipNumber: '985198765432100',
    activityLevel: 2, personalityTags: ['Independiente','Tranquilo'],
    allergies: ['Maíz'], chronicConditions: ['Ninguna'],
    vet: { name: 'Dra. Valentina Rojas', clinic: 'Clínica Veterinaria Las Condes', phone: '+56912345678', email: 'vrojas@clinicavet.cl' },
    tutor2: null,
    vaccines: [
      { id: id(), name: 'Triple Felina (Panleucopenia, Rinotraqueítis, Calicivirus)', code: 'TF-22', date: dt(2022,10,5), periodicity: 12, nextDate: dt(2023,10,5), alertType: 'week', cost: 28000 },
      { id: id(), name: 'Antirrábica', code: 'RAB-22F', date: dt(2022,10,5), periodicity: 12, nextDate: dt(2023,10,5), alertType: 'same', cost: 18000 },
      { id: id(), name: 'Triple Felina (Panleucopenia, Rinotraqueítis, Calicivirus)', code: 'TF-23', date: dt(2023,10,3), periodicity: 12, nextDate: dt(2024,10,3), alertType: 'week', cost: 30000 },
      { id: id(), name: 'Antirrábica', code: 'RAB-23F', date: dt(2023,10,3), periodicity: 12, nextDate: dt(2024,10,3), alertType: 'same', cost: 20000 },
      { id: id(), name: 'Leucemia Felina (FeLV)', code: 'FEL-23', date: dt(2023,10,3), periodicity: 12, nextDate: dt(2024,10,3), alertType: 'week', cost: 35000 },
      { id: id(), name: 'Triple Felina (Panleucopenia, Rinotraqueítis, Calicivirus)', code: 'TF-24', date: dt(2024,10,7), periodicity: 12, nextDate: dt(2025,10,7), alertType: 'week', cost: 32000 },
      { id: id(), name: 'Antirrábica', code: 'RAB-24F', date: dt(2024,10,7), periodicity: 12, nextDate: dt(2025,10,7), alertType: 'same', cost: 22000 },
      { id: id(), name: 'Triple Felina (Panleucopenia, Rinotraqueítis, Calicivirus)', code: 'TF-25', date: dt(2025,10,10), periodicity: 12, nextDate: dt(2026,10,10), alertType: 'week', cost: 35000 },
    ],
    deworming: [
      { id: id(), product: 'Profender', type: 'Interna', format: 'Pipeta', dose: '0.35', unit: 'ML', date: dt(2023,1,15), nextDate: dt(2023,7,15), alertType: 'same', cost: 14000 },
      { id: id(), product: 'Broadline', type: 'Ambas', format: 'Pipeta', dose: '0.3', unit: 'ML', date: dt(2023,7,15), nextDate: dt(2024,1,15), alertType: 'same', cost: 16000 },
      { id: id(), product: 'Broadline', type: 'Ambas', format: 'Pipeta', dose: '0.3', unit: 'ML', date: dt(2024,1,15), nextDate: dt(2024,7,15), alertType: 'same', cost: 16000 },
      { id: id(), product: 'Broadline', type: 'Ambas', format: 'Pipeta', dose: '0.3', unit: 'ML', date: dt(2024,7,15), nextDate: dt(2025,1,15), alertType: 'week', cost: 17000 },
      { id: id(), product: 'Broadline', type: 'Ambas', format: 'Pipeta', dose: '0.3', unit: 'ML', date: dt(2025,1,15), nextDate: dt(2025,7,15), alertType: 'same', cost: 17000 },
      { id: id(), product: 'Broadline', type: 'Ambas', format: 'Pipeta', dose: '0.3', unit: 'ML', date: dt(2025,7,15), nextDate: dt(2026,1,15), alertType: 'same', cost: 18000 },
      { id: id(), product: 'Broadline', type: 'Ambas', format: 'Pipeta', dose: '0.3', unit: 'ML', date: dt(2026,1,20), nextDate: dt(2026,7,20), alertType: 'same', cost: 18000 },
    ],
    medications: [
      { id: id(), name: 'Prednisolona', doseVal: '5', doseUnit: 'mg', dose: '5 mg', freqN: '24', freqUnit: 'horas', frequency: 'Cada 24 horas', startDate: dt(2024,5,10), startTime: '08:00', treatmentDays: 7, endDate: dt(2024,5,17), active: false, reminder: 'exact', cost: 7000 },
      { id: id(), name: 'Amoxicilina', doseVal: '62.5', doseUnit: 'mg', dose: '62.5 mg', freqN: '12', freqUnit: 'horas', frequency: 'Cada 12 horas', startDate: dt(2025,2,3), startTime: '08:00', treatmentDays: 10, endDate: dt(2025,2,13), active: false, reminder: '15', cost: 9500 },
      { id: id(), name: 'Suplemento Articular (Cosequin)', doseVal: '1', doseUnit: 'Comprimido(s)', dose: '1 Comprimido(s)', freqN: '24', freqUnit: 'horas', frequency: 'Cada 24 horas', startDate: dt(2026,3,1), startTime: '08:00', treatmentDays: 90, endDate: dt(2026,5,30), active: true, reminder: 'exact', stockTotal: '60', stockUnit: 'Comprimidos', expiry: dt(2027,6,1), cost: 25000 },
    ],
    clinicalHistory: [
      { id: id(), title: 'Esterilización', type: 'Esterilización', date: dt(2023,3,10), doctor: 'Dra. Valentina Rojas', clinic: 'Clínica Vet. Las Condes', cost: 160000, notes: 'Sin complicaciones. Alta el mismo día. Ayuno 12h previo.' },
      { id: id(), title: 'Infección urinaria', type: 'Diagnóstico', date: dt(2025,2,1), doctor: 'Dra. Valentina Rojas', clinic: 'Clínica Vet. Las Condes', cost: 55000, notes: 'Urocultivo positivo E. coli. Tratamiento antibiótico 10 días. Dieta húmeda.' },
      { id: id(), title: 'Control renal preventivo', type: 'Diagnóstico', date: dt(2026,3,1), doctor: 'Dra. Valentina Rojas', clinic: 'Clínica Vet. Las Condes', cost: 48000, notes: 'Creatinina y BUN dentro de rango normal. Ecografía renal sin hallazgos.' },
    ],
  };

  const coco = {
    id: 'pet-coco', name: 'Coco', species: 'Conejo', breed: 'Enano de Holanda', sex: 'Macho',
    dateOfBirth: dt(2023,11,5), photo: null, color: 'Blanco', sizeRange: 'Pequeño',
    weightKg: 1, weightGr: 200, reproductiveStatus: 'Castrado/a', chipNumber: '',
    activityLevel: 2, personalityTags: ['Juguetón','Tímido'],
    allergies: [], chronicConditions: ['Ninguna'],
    vet: { name: 'Dr. Rodrigo Méndez', clinic: 'Exotic Pets Vet', phone: '+56987654321', email: 'rmendez@exoticvet.cl' },
    tutor2: null,
    vaccines: [
      { id: id(), name: 'Mixomatosis', code: 'MIX-24', date: dt(2024,2,10), periodicity: 12, nextDate: dt(2025,2,10), alertType: 'week', cost: 32000 },
      { id: id(), name: 'Enfermedad Vírica Hemorrágica (RHD)', code: 'RHD-24', date: dt(2024,2,10), periodicity: 12, nextDate: dt(2025,2,10), alertType: 'week', cost: 32000 },
      { id: id(), name: 'Mixomatosis', code: 'MIX-25', date: dt(2025,2,8), periodicity: 12, nextDate: dt(2026,2,8), alertType: 'week', cost: 35000 },
      { id: id(), name: 'Enfermedad Vírica Hemorrágica (RHD)', code: 'RHD-25', date: dt(2025,2,8), periodicity: 12, nextDate: dt(2026,2,8), alertType: 'week', cost: 35000 },
    ],
    deworming: [
      { id: id(), product: 'Panacur (Fenbendazol)', type: 'Interna', format: 'Jarabe', dose: '0.5', unit: 'ML', date: dt(2024,3,1), nextDate: dt(2024,9,1), alertType: 'same', cost: 11000 },
      { id: id(), product: 'Panacur (Fenbendazol)', type: 'Interna', format: 'Jarabe', dose: '0.5', unit: 'ML', date: dt(2024,9,1), nextDate: dt(2025,3,1), alertType: 'same', cost: 11000 },
      { id: id(), product: 'Panacur (Fenbendazol)', type: 'Interna', format: 'Jarabe', dose: '0.5', unit: 'ML', date: dt(2025,3,1), nextDate: dt(2025,9,1), alertType: 'same', cost: 12000 },
      { id: id(), product: 'Panacur (Fenbendazol)', type: 'Interna', format: 'Jarabe', dose: '0.5', unit: 'ML', date: dt(2025,9,1), nextDate: dt(2026,3,1), alertType: 'same', cost: 12000 },
      { id: id(), product: 'Panacur (Fenbendazol)', type: 'Interna', format: 'Jarabe', dose: '0.5', unit: 'ML', date: dt(2026,3,5), nextDate: dt(2026,9,5), alertType: 'same', cost: 13000 },
    ],
    medications: [
      { id: id(), name: 'Meloxicam (post castración)', doseVal: '0.5', doseUnit: 'mg', dose: '0.5 mg', freqN: '24', freqUnit: 'horas', frequency: 'Cada 24 horas', startDate: dt(2024,6,15), startTime: '08:00', treatmentDays: 5, endDate: dt(2024,6,20), active: false, reminder: 'exact', cost: 4500 },
    ],
    clinicalHistory: [
      { id: id(), title: 'Castración', type: 'Esterilización', date: dt(2024,6,15), doctor: 'Dr. Rodrigo Méndez', clinic: 'Exotic Pets Vet', cost: 120000, notes: 'Procedimiento sin complicaciones. Alta el mismo día. Dieta blanda 48h.' },
      { id: id(), title: 'Control bienestar + corte uñas', type: 'Procedimiento', date: dt(2025,1,20), doctor: 'Dr. Rodrigo Méndez', clinic: 'Exotic Pets Vet', cost: 22000, notes: 'Todo en orden. Peso ideal. Se realizó corte de uñas y revisión dental.' },
      { id: id(), title: 'Control general 1 año', type: 'Diagnóstico', date: dt(2025,11,5), doctor: 'Dr. Rodrigo Méndez', clinic: 'Exotic Pets Vet', cost: 28000, notes: 'Primer año de vida sin incidentes. Buen desarrollo. Dieta correcta.' },
    ],
  };

  // Construir gastos a partir de todos los registros
  const buildExpenses = (pets) => {
    const exps = [];
    const push = (desc, amount, date, cat, pet, tutor) =>
      exps.push({ id: id(), description: desc, amount, date, category: cat, pet, tutor });

    // Gastos de Greta
    greta.vaccines.forEach(v => push(`Vacuna ${v.name.split(' ')[0]} – Greta`, v.cost||0, v.date, 'Veterinaria', 'Greta', 'Felipe Molina'));
    greta.deworming.forEach(d => d.cost && push(`Desparasitación ${d.product} – Greta`, d.cost, d.date, 'Veterinaria', 'Greta', 'Felipe Molina'));
    greta.medications.forEach(m => m.cost && push(`Medicamento ${m.name} – Greta`, m.cost, m.startDate, 'Medicamentos', 'Greta', 'Felipe Molina'));
    greta.clinicalHistory.forEach(h => h.cost && push(`${h.title} – Greta`, h.cost, h.date, 'Veterinaria', 'Greta', 'Felipe Molina'));

    // Gastos de Luna
    luna.vaccines.forEach(v => push(`Vacuna ${v.name.split(' ')[0]} – Luna`, v.cost||0, v.date, 'Veterinaria', 'Luna', 'Felipe Molina'));
    luna.deworming.forEach(d => d.cost && push(`Desparasitación ${d.product} – Luna`, d.cost, d.date, 'Veterinaria', 'Luna', 'Felipe Molina'));
    luna.medications.forEach(m => m.cost && push(`Medicamento ${m.name} – Luna`, m.cost, m.startDate, 'Medicamentos', 'Luna', 'Felipe Molina'));
    luna.clinicalHistory.forEach(h => h.cost && push(`${h.title} – Luna`, h.cost, h.date, 'Veterinaria', 'Luna', 'Felipe Molina'));

    // Gastos de Coco
    coco.vaccines.forEach(v => push(`Vacuna ${v.name.split(' ')[0]} – Coco`, v.cost||0, v.date, 'Veterinaria', 'Coco', 'Felipe Molina'));
    coco.deworming.forEach(d => d.cost && push(`Desparasitación ${d.product} – Coco`, d.cost, d.date, 'Veterinaria', 'Coco', 'Felipe Molina'));
    coco.medications.forEach(m => m.cost && push(`Medicamento ${m.name} – Coco`, m.cost, m.startDate, 'Medicamentos', 'Coco', 'Felipe Molina'));
    coco.clinicalHistory.forEach(h => h.cost && push(`${h.title} – Coco`, h.cost, h.date, 'Veterinaria', 'Coco', 'Felipe Molina'));

    // Gastos de alimentación mensuales
    const months = [];
    for (let y = 2023; y <= 2026; y++) {
      for (let m = 1; m <= 12; m++) {
        if (y === 2026 && m > 5) break;
        months.push(dt(y, m, 5));
      }
    }
    months.forEach(d => {
      push('Alimento Premium Greta (10kg)', 32000, d, 'Alimentación', 'Greta', 'Felipe Molina');
      push('Alimento Royal Canin Luna', 24000, d, 'Alimentación', 'Luna', 'Felipe Molina');
      if (d >= dt(2024,1,1)) push('Alimento Timothy Hay + Pellets Coco', 15000, d, 'Alimentación', 'Coco', 'Felipe Molina');
    });

    // Peluquería Greta
    ['2023-04-10','2023-07-15','2023-10-20','2024-01-12','2024-04-18','2024-07-22','2024-10-15','2025-01-20','2025-04-10','2025-07-18','2025-10-14','2026-01-25','2026-04-22'].forEach(d =>
      push('Peluquería Greta', 25000, d, 'Peluquería', 'Greta', 'Felipe Molina'));

    return exps.filter(e => e.amount > 0);
  };

  const events = [
    { id: id(), title: 'Vacuna anual Greta', type: 'Vacuna', date: dt(2026,6,10), pet: 'Greta', notes: 'DHPP + Rabia' },
    { id: id(), title: 'Vacuna anual Luna', type: 'Vacuna', date: dt(2026,6,15), pet: 'Luna', notes: 'Triple Felina + Rabia' },
    { id: id(), title: 'Control displasia Greta', type: 'Consulta', date: dt(2026,6,20), pet: 'Greta', notes: 'Radiografías cadera' },
    { id: id(), title: 'Desparasitación Greta', type: 'Consulta', date: dt(2026,5,10), pet: 'Greta', notes: 'Frontline Combo' },
    { id: id(), title: 'Desparasitación Luna', type: 'Consulta', date: dt(2026,7,20), pet: 'Luna', notes: 'Broadline' },
    { id: id(), title: 'Desparasitación Coco', type: 'Consulta', date: dt(2026,9,5), pet: 'Coco', notes: 'Panacur' },
    { id: id(), title: 'Peluquería Greta', type: 'Peluquería', date: dt(2026,6,5), pet: 'Greta', notes: 'Corte de verano' },
    { id: id(), title: 'Control general Luna', type: 'Examen', date: dt(2026,7,10), pet: 'Luna', notes: 'Examen renal anual' },
    { id: id(), title: 'Control Coco 2 años', type: 'Consulta', date: dt(2026,8,5), pet: 'Coco', notes: 'Revisión dental' },
  ];

  const demoState = {
    user: { name: 'Felipe Molina', email: 'demo@mypets.cl' },
    isLoggedIn: true,
    pets: [greta, luna, coco],
    events,
    expenses: buildExpenses([greta, luna, coco]),
  };

  localStorage.setItem('mypets_v3', JSON.stringify(demoState));
  loadState();
  showToast('✅ Datos de prueba cargados (3 años)', 'success');
  navigate('dashboard');
}

// ---- EDITAR VACUNA ----
function openEditVaccineModal(petId, vaccineId) {
  const pet = state.pets.find(p => p.id === petId);
  const v = pet?.vaccines?.find(x => x.id === vaccineId);
  if (!v) return;
  const vaccines = VACCINES_BY_SPECIES[pet.species] || VACCINES_BY_SPECIES['Otro'];
  openModal(`
    <div class="modal-box p-4 sm:p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4">✏️ Editar Vacuna</h3>
      <form onsubmit="saveEditVaccine(event,'${petId}','${vaccineId}')" class="space-y-3">
        <div>
          <label class="form-label">Vacuna *</label>
          <select id="ev-name" class="input-field">
            ${vaccines.map(vn => `<option ${vn===v.name?'selected':''}>${vn}</option>`).join('')}
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="form-label">Código / Lote</label><input id="ev-code" value="${v.code||''}" class="input-field" /></div>
          <div><label class="form-label">Fecha aplicación *</label><input id="ev-date" type="date" required value="${v.date||''}" class="input-field" /></div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="form-label">Periodicidad (meses)</label>
            <select id="ev-period" class="input-field">
              ${PERIODICITY_OPTIONS.map(o => `<option value="${o.months}" ${String(o.months)===String(v.periodicity)?'selected':''}>${o.label}</option>`).join('')}
            </select>
          </div>
          <div><label class="form-label">Costo (CLP)</label><input id="ev-cost" type="number" min="0" value="${v.cost||''}" class="input-field" /></div>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button type="submit" class="btn-primary flex-1">Guardar cambios</button>
        </div>
      </form>
    </div>`);
}

function saveEditVaccine(e, petId, vaccineId) {
  e.preventDefault();
  const pet = state.pets.find(p => p.id === petId);
  const v = pet?.vaccines?.find(x => x.id === vaccineId);
  if (!v) return;
  const g = id => document.getElementById(id)?.value;
  const date = g('ev-date'), period = g('ev-period');
  v.name = g('ev-name'); v.code = g('ev-code'); v.date = date;
  v.periodicity = period; v.nextDate = period ? addMonths(date, parseInt(period)) : '';
  v.cost = g('ev-cost');
  saveState(); closeModal(); render();
  showToast('Vacuna actualizada ✓', 'success');
}

// ---- EDITAR DESPARASITACIÓN ----
function openEditDewormModal(petId, dewormId) {
  const pet = state.pets.find(p => p.id === petId);
  const d = pet?.deworming?.find(x => x.id === dewormId);
  if (!d) return;
  openModal(`
    <div class="modal-box p-4 sm:p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4">✏️ Editar Desparasitación</h3>
      <form onsubmit="saveEditDeworming(event,'${petId}','${dewormId}')" class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div><label class="form-label">Producto *</label><input id="edw-product" required value="${d.product||''}" class="input-field" /></div>
          <div><label class="form-label">Tipo</label>
            <select id="edw-type" class="input-field">
              ${['Interna','Externa','Ambas'].map(t => `<option ${t===d.type?'selected':''}>${t}</option>`).join('')}
            </select>
          </div>
          <div><label class="form-label">Formato</label>
            <select id="edw-format" class="input-field">
              ${['Comprimido','Pipeta','Collar','Spray','Jarabe','Inyección'].map(f => `<option ${f===d.format?'selected':''}>${f}</option>`).join('')}
            </select>
          </div>
          <div><label class="form-label">Dosis</label><input id="edw-dose" value="${d.dose||''}" class="input-field" /></div>
          <div><label class="form-label">Fecha *</label><input id="edw-date" type="date" required value="${d.date||''}" class="input-field" /></div>
          <div><label class="form-label">Costo (CLP)</label><input id="edw-cost" type="number" min="0" value="${d.cost||''}" class="input-field" /></div>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button type="submit" class="btn-primary flex-1">Guardar cambios</button>
        </div>
      </form>
    </div>`);
}

function saveEditDeworming(e, petId, dewormId) {
  e.preventDefault();
  const pet = state.pets.find(p => p.id === petId);
  const d = pet?.deworming?.find(x => x.id === dewormId);
  if (!d) return;
  const g = id => document.getElementById(id)?.value;
  d.product = g('edw-product'); d.type = g('edw-type');
  d.format = g('edw-format'); d.dose = g('edw-dose');
  d.date = g('edw-date'); d.cost = g('edw-cost');
  saveState(); closeModal(); render();
  showToast('Desparasitación actualizada ✓', 'success');
}

// ---- EDITAR MEDICAMENTO/TRATAMIENTO ----
function openEditMedModal(petId, medId) {
  const pet = state.pets.find(p => p.id === petId);
  const m = pet?.medications?.find(x => x.id === medId);
  if (!m) return;
  openModal(`
    <div class="modal-box p-4 sm:p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4">✏️ Editar Tratamiento</h3>
      <form onsubmit="saveEditMedication(event,'${petId}','${medId}')" class="space-y-3">
        <div><label class="form-label">Medicamento *</label><input id="em-name" required value="${m.name||''}" class="input-field" /></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="form-label">Dosis</label><input id="em-dose-val" type="number" step="0.1" value="${m.doseVal||''}" class="input-field" /></div>
          <div><label class="form-label">Unidad</label>
            <select id="em-unit" class="input-field">
              ${['mg','ml','Comprimido(s)','Gotas','UI'].map(u => `<option ${u===m.doseUnit?'selected':''}>${u}</option>`).join('')}
            </select>
          </div>
          <div><label class="form-label">Fecha inicio</label><input id="em-start" type="date" value="${m.startDate||''}" class="input-field" /></div>
          <div><label class="form-label">Días tratamiento</label><input id="em-days" type="number" min="1" value="${m.treatmentDays||''}" class="input-field" /></div>
          <div><label class="form-label">Fecha caducidad</label><input id="em-expiry" type="date" value="${m.expiry||''}" class="input-field" /></div>
          <div><label class="form-label">Costo (CLP)</label><input id="em-cost" type="number" min="0" value="${m.cost||''}" class="input-field" /></div>
        </div>
        <div class="flex items-center gap-2">
          <input type="checkbox" id="em-active" ${m.active?'checked':''} class="rounded text-brand-500" />
          <label for="em-active" class="text-sm text-gray-700">Tratamiento activo</label>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button type="submit" class="btn-primary flex-1">Guardar cambios</button>
        </div>
      </form>
    </div>`);
}

function saveEditMedication(e, petId, medId) {
  e.preventDefault();
  const pet = state.pets.find(p => p.id === petId);
  const m = pet?.medications?.find(x => x.id === medId);
  if (!m) return;
  const g = id => document.getElementById(id)?.value;
  const days = parseInt(g('em-days') || 0);
  const startDate = g('em-start');
  m.name = g('em-name');
  m.doseVal = g('em-dose-val'); m.doseUnit = g('em-unit');
  m.dose = `${m.doseVal} ${m.doseUnit}`;
  m.startDate = startDate; m.treatmentDays = days;
  if (days && startDate) {
    const d = new Date(startDate + 'T12:00:00'); d.setDate(d.getDate() + days);
    m.endDate = d.toISOString().slice(0,10);
  }
  m.expiry = g('em-expiry'); m.cost = g('em-cost');
  m.active = document.getElementById('em-active')?.checked;
  saveState(); closeModal(); render();
  showToast('Tratamiento actualizado ✓', 'success');
}

// ---- EDITAR HISTORIAL ----
function openEditHistoryModal(petId, histId) {
  const pet = state.pets.find(p => p.id === petId);
  const h = pet?.clinicalHistory?.find(x => x.id === histId);
  if (!h) return;
  openModal(`
    <div class="modal-box p-4 sm:p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4">✏️ Editar evento clínico</h3>
      <form onsubmit="saveEditHistory(event,'${petId}','${histId}')" class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div class="col-span-2"><label class="form-label">Título *</label><input id="eh-title" required value="${h.title||''}" class="input-field" /></div>
          <div><label class="form-label">Tipo</label>
            <select id="eh-type" class="input-field">
              ${['Cirugía','Esterilización','Procedimiento','Diagnóstico','Otro'].map(t => `<option ${t===h.type?'selected':''}>${t}</option>`).join('')}
            </select>
          </div>
          <div><label class="form-label">Fecha *</label><input id="eh-date" type="date" required value="${h.date||''}" class="input-field" /></div>
          <div><label class="form-label">Médico</label><input id="eh-doctor" value="${h.doctor||''}" placeholder="Dr. García" class="input-field" /></div>
          <div><label class="form-label">Clínica</label><input id="eh-clinic" value="${h.clinic||''}" placeholder="Clínica Vet." class="input-field" /></div>
          <div class="col-span-2"><label class="form-label">Costo (CLP)</label><input id="eh-cost" type="number" min="0" value="${h.cost||''}" class="input-field" /></div>
          <div class="col-span-2"><label class="form-label">Notas</label><textarea id="eh-notes" rows="3" class="input-field resize-none">${h.notes||''}</textarea></div>
        </div>
        ${(h.files||[]).length > 0 ? `
        <div>
          <label class="form-label">Archivos adjuntos actuales</label>
          <div class="flex flex-wrap gap-2 mt-1">
            ${h.files.map((f,fi) => `
              <div class="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                📎 ${f.name}
                <button type="button" onclick="removeHistoryFile('${petId}','${histId}',${fi})" class="ml-1 text-red-400 hover:text-red-600">✕</button>
              </div>`).join('')}
          </div>
        </div>` : ''}
        <div>
          <label class="form-label">📎 Agregar más archivos</label>
          <div onclick="document.getElementById('eh-files').click()"
            class="mt-1 border-2 border-dashed border-gray-200 rounded-xl p-3 text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-colors">
            <p class="text-xs text-gray-400">Haz clic para seleccionar archivos</p>
          </div>
          <input id="eh-files" type="file" multiple accept="image/*,.pdf,.doc,.docx" class="hidden" onchange="previewHistoryFilesEdit(this)" />
          <div id="eh-files-preview" class="flex flex-wrap gap-2 mt-2"></div>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button type="submit" class="btn-primary flex-1">Guardar cambios</button>
        </div>
      </form>
    </div>`);
}

function previewHistoryFilesEdit(input) {
  const preview = document.getElementById('eh-files-preview');
  if (!preview) return;
  preview.innerHTML = '';
  Array.from(input.files).forEach(file => {
    const el = document.createElement('div');
    el.className = 'flex items-center gap-1.5 px-2 py-1 bg-brand-50 border border-brand-100 rounded-lg text-xs text-brand-700';
    el.textContent = `📎 ${file.name}`;
    preview.appendChild(el);
  });
}

function removeHistoryFile(petId, histId, fileIndex) {
  const pet = state.pets.find(p => p.id === petId);
  const h = pet?.clinicalHistory?.find(x => x.id === histId);
  if (!h) return;
  h.files = (h.files||[]).filter((_,i) => i !== fileIndex);
  saveState(); closeModal();
  openEditHistoryModal(petId, histId);
}

async function saveEditHistory(e, petId, histId) {
  e.preventDefault();
  const pet = state.pets.find(p => p.id === petId);
  const h = pet?.clinicalHistory?.find(x => x.id === histId);
  if (!h) return;
  const g = id => document.getElementById(id)?.value;
  const filesInput = document.getElementById('eh-files');
  const newFiles = filesInput?.files?.length ? await readFilesAsBase64(filesInput) : [];
  h.title  = g('eh-title'); h.type   = g('eh-type');
  h.date   = g('eh-date');  h.doctor = g('eh-doctor');
  h.clinic = g('eh-clinic'); h.cost  = g('eh-cost');
  h.notes  = g('eh-notes');
  h.files  = [...(h.files||[]), ...newFiles];
  saveState(); closeModal(); render();
  showToast('Evento actualizado ✓', 'success');
}

// ---- SEGUNDO TUTOR ----
function openInviteTutor2Modal(petId) {
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;
  openModal(`
    <div class="modal-box p-4 sm:p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-2">👥 Invitar Segundo Tutor</h3>
      <p class="text-sm text-gray-500 mb-4">El invitado recibirá un correo para crear su cuenta y acceder a <strong>${pet.name}</strong>.</p>
      <form onsubmit="sendTutor2Invite(event,'${petId}')" class="space-y-3">
        <div><label class="form-label">Nombre del tutor *</label><input id="t2-inv-name" required placeholder="Nombre completo" class="input-field" /></div>
        <div><label class="form-label">Email *</label><input id="t2-inv-email" type="email" required placeholder="correo@ejemplo.com" class="input-field" /></div>
        <div><label class="form-label">Tipo de acceso</label>
          <select id="t2-inv-role" class="input-field">
            <option value="lectura">Solo lectura</option>
            <option value="edicion">Edición completa</option>
          </select>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button type="submit" class="btn-primary flex-1">📧 Enviar invitación</button>
        </div>
      </form>
    </div>`);
}

function sendTutor2Invite(e, petId) {
  e.preventDefault();
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;
  const name  = document.getElementById('t2-inv-name')?.value?.trim();
  const email = document.getElementById('t2-inv-email')?.value?.trim().toLowerCase();
  const role  = document.getElementById('t2-inv-role')?.value;
  const token = genId() + genId();
  const invites = getInvites();
  invites.push({ token, petId, petName: pet.name, inviterEmail: state.user?.email, invitedEmail: email, invitedName: name, role, createdAt: Date.now(), used: false });
  saveInvites(invites);
  const link = `${location.origin}${location.pathname}#invite=${token}`;
  const body = `Hola ${name},\n\n${state.user?.name} te ha invitado a ser tutor de ${pet.name} en MyPets 3.0.\n\nHaz clic en el siguiente enlace para crear tu cuenta:\n${link}\n\nMyPets 3.0`;
  sendEmail(email, `Te han invitado a cuidar a ${pet.name} en MyPets`, body)
    .then(() => showToast(`✅ Invitación enviada a ${email}`, 'success'))
    .catch(() => { showToast(`✅ Invitación generada (ver consola)`, 'success'); });
  console.log(`[MyPets] Invitation link for ${email}: ${link}`);
  // Guardamos como tutor pendiente
  pet.tutor2 = { name, email, role, pending: true };
  saveState(); closeModal(); render();
}

function removeTutor2(petId) {
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;
  if (confirm(`¿Quitar a ${pet.tutor2?.name} como segundo tutor de ${pet.name}?`)) {
    pet.tutor2 = null; saveState(); render();
    showToast('Segundo tutor eliminado', 'success');
  }
}

// ---- VISTA ADMINISTRADOR ----
function viewAdmin() {
  const users   = getUsers();
  const invites = getInvites();
  const resets  = getResets();
  const allPets = state.pets || [];
  const allExps = state.expenses || [];
  const totalRevenue = 0; // SaaS revenue: pendiente de integración de pagos
  const today = new Date().toISOString().slice(0,10);
  const thisMonth = today.slice(0,7);
  const expsMonth = allExps.filter(e => e.date?.startsWith(thisMonth));
  const totalMonth = expsMonth.reduce((s,e) => s + (parseFloat(e.amount)||0), 0);

  const registeredUsers = [
    { name: 'Felipe Molina', email: 'demo@mypets.cl', createdAt: '2023-01-01', plan: 'Pro', pets: allPets.length },
    ...users.map(u => ({ ...u, plan: 'Free', pets: 0 })),
  ];

  return appShell(`
    <div class="max-w-5xl mx-auto">
      ${pageHeader('Panel Administrador ⚙️', 'Gestión de la plataforma MyPets SaaS')}

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
        ${statCard('👥','Usuarios registrados', registeredUsers.length, 'brand')}
        ${statCard('🐾','Mascotas en plataforma', allPets.length, 'teal')}
        ${statCard('📧','Invitaciones enviadas', invites.length, 'amber')}
        ${statCard('💰','Gasto registrado este mes', fmtCLP(totalMonth), 'red')}
      </div>

      <div class="grid md:grid-cols-2 gap-6 mb-6">
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <h3 class="font-semibold text-gray-800 mb-4">📊 Distribución de mascotas</h3>
          <div class="space-y-2">
            ${Object.entries(allPets.reduce((acc, p) => { acc[p.species]=(acc[p.species]||0)+1; return acc; }, {})).map(([sp,n]) => `
              <div class="flex items-center gap-3">
                <span class="text-lg w-7">${speciesEmoji(sp)}</span>
                <div class="flex-1 bg-gray-100 rounded-full h-2"><div class="h-2 rounded-full bg-brand-500" style="width:${Math.round(n/allPets.length*100)}%"></div></div>
                <span class="text-sm text-gray-600 w-24 text-right">${sp} (${n})</span>
              </div>`).join('') || '<p class="text-sm text-gray-400">Sin datos</p>'}
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm p-5">
          <h3 class="font-semibold text-gray-800 mb-4">🔗 Últimas invitaciones</h3>
          ${invites.length === 0
            ? `<p class="text-sm text-gray-400 text-center py-4">Sin invitaciones enviadas</p>`
            : `<div class="space-y-2">
                 ${[...invites].reverse().slice(0,5).map(inv => `
                   <div class="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                     <div>
                       <div class="font-medium text-gray-800">${inv.invitedEmail}</div>
                       <div class="text-xs text-gray-400">Para: ${inv.petName} · ${inv.role}</div>
                     </div>
                     <span class="badge ${inv.used ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}">${inv.used ? 'Aceptada' : 'Pendiente'}</span>
                   </div>`).join('')}
               </div>`}
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-800">👥 Usuarios de la plataforma</h3>
          <span class="text-xs text-gray-400">${registeredUsers.length} total</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs text-gray-400 border-b border-gray-100">
                <th class="pb-2 font-medium">Usuario</th>
                <th class="pb-2 font-medium">Email</th>
                <th class="pb-2 font-medium">Plan</th>
                <th class="pb-2 font-medium">Mascotas</th>
                <th class="pb-2 font-medium">Registro</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              ${registeredUsers.map(u => `
                <tr class="hover:bg-gray-50">
                  <td class="py-2.5 font-medium text-gray-900">${u.name}</td>
                  <td class="py-2.5 text-gray-500">${u.email}</td>
                  <td class="py-2.5"><span class="badge ${u.plan==='Pro'?'bg-brand-100 text-brand-700':'bg-gray-100 text-gray-500'}">${u.plan}</span></td>
                  <td class="py-2.5 text-gray-500">${u.pets}</td>
                  <td class="py-2.5 text-gray-400">${u.createdAt ? formatDate(u.createdAt.slice(0,10)) : '—'}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm p-5">
        <h3 class="font-semibold text-gray-800 mb-4">🔑 Solicitudes de recuperación de contraseña</h3>
        ${resets.length === 0
          ? `<p class="text-sm text-gray-400 text-center py-4">Sin solicitudes</p>`
          : `<div class="space-y-2">
               ${[...resets].reverse().slice(0,10).map(r => `
                 <div class="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                   <div>
                     <div class="font-medium text-gray-800">${r.email}</div>
                     <div class="text-xs text-gray-400">${new Date(r.createdAt).toLocaleString('es-CL')}</div>
                   </div>
                   <span class="badge ${r.used ? 'bg-green-100 text-green-700' : Date.now()-r.createdAt > 3600000 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}">
                     ${r.used ? 'Usado' : Date.now()-r.createdAt > 3600000 ? 'Expirado' : 'Activo'}
                   </span>
                 </div>`).join('')}
             </div>`}
      </div>
    </div>
  `);
}

// ---- INIT ----
initEmailJS();
injectStyles();
loadState();
render();

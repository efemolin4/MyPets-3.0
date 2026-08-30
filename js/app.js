/* ============================================================
   MYPETS 3.0 — Aplicación Principal
   ============================================================ */

// ---- SUPABASE CONFIG ----
const SUPABASE_URL = 'https://dmpvqhdpldlvzwunscah.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcHZxaGRwbGRsdnp3dW5zY2FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjExNTQsImV4cCI6MjA5NDQzNzE1NH0.gUmmrm7hgzAHMKcIw1hBLDBEj7sr8lZf6g6zaIzgblI';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  { label: 'Sin periodicidad',          months: 0,   days: 0    },
  { label: '1 mes (30 días)',           months: 1,   days: 30   },
  { label: '1 1/2 meses (45 días)',     months: 1.5, days: 45   },
  { label: 'Bimestral (60 días)',       months: 2,   days: 60   },
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
      state.user = p.user || null;
      state.isLoggedIn = p.isLoggedIn || false;
      const route = resolveInitialViewFromUrl(state.isLoggedIn);
      if (route) { state.currentView = route.view; Object.assign(state, route.params || {}); }
      else state.currentView = state.isLoggedIn ? 'dashboard' : 'login';
      state.currentTab = 'general'; state.addPetStep = 1; state.newPetData = {};
    }
    // Un link de invitación de segundo tutor llega como ?invite=TOKEN — el login real
    // ocurre vía magic link de Supabase, procesado por separado en initApp(). Solo
    // guardamos el token acá; NO tocamos currentView (el usuario ya queda autenticado).
    const inviteMatch = location.search.match(/invite=([^&]+)/);
    if (inviteMatch) {
      state.inviteToken = inviteMatch[1];
      history.replaceState(null, '', location.pathname + location.hash);
    }
  } catch(e) {}
}

function saveState() {
  try {
    localStorage.setItem('mypets_v3', JSON.stringify({
      user: state.user, isLoggedIn: state.isLoggedIn,
    }));
  } catch(e) {}
}

function isDemoUser() { return !state.user?.id; }

async function loadDataFromSupabase() {
  if (!state.user?.id) return;
  try {
    // Fetch profile first (is_admin, plan) — always, regardless of pets
    const { data: profile } = await sb.from('profiles').select('is_admin, plan').eq('id', state.user.id).single();
    if (profile) {
      state.user.isAdmin = profile.is_admin || false;
      state.user.plan = profile.plan || 'free';
      saveState();
    }

    const { data: accessRows } = await sb.from('pet_access')
      .select('pet_id, role, pets(*)')
      .eq('user_id', state.user.id);

    if (!accessRows || accessRows.length === 0) { state.pets = []; state.events = []; state.expenses = []; return; }

    const petIds = accessRows.map(r => r.pet_id);

    const [vaccRes, dewRes, medRes, histRes, wRes, moodRes, symRes, mealRes, actRes, doseRes, evRes, expRes, botRes, invRes] = await Promise.all([
      sb.from('vaccines').select('*').in('pet_id', petIds),
      sb.from('dewormings').select('*').in('pet_id', petIds),
      sb.from('medications').select('*').in('pet_id', petIds),
      sb.from('history_records').select('*').in('pet_id', petIds),
      sb.from('weight_history').select('*').in('pet_id', petIds),
      sb.from('mood_logs').select('*').in('pet_id', petIds),
      sb.from('symptoms_logs').select('*').in('pet_id', petIds),
      sb.from('meals').select('*').in('pet_id', petIds),
      sb.from('activities').select('*').in('pet_id', petIds),
      sb.from('dose_logs').select('*').in('pet_id', petIds),
      sb.from('events').select('*').eq('user_id', state.user.id),
      sb.from('expenses').select('*').eq('user_id', state.user.id),
      sb.from('botiquin_items').select('*').eq('user_id', state.user.id),
      sb.from('invitations').select('*').in('pet_id', petIds).order('created_at', { ascending: false }),
    ]);

    const vacc = vaccRes.data || [], dew = dewRes.data || [], med = medRes.data || [];
    const hist = histRes.data || [], wh = wRes.data || [], mood = moodRes.data || [];
    const sym = symRes.data || [], meal = mealRes.data || [], act = actRes.data || [];
    const dose = doseRes.data || [];
    const invites = invRes.data || [];

    state.pets = accessRows.map(row => {
      const pet = row.pets;
      const pid = pet.id;
      return {
        id: pid,
        name: pet.name, species: pet.species, breed: pet.breed,
        dateOfBirth: pet.date_of_birth, sex: pet.sex, color: pet.color,
        reproductiveStatus: pet.reproductive_status, chipNumber: pet.microchip,
        personalityTags: pet.personality_tags || [],
        avatar: pet.avatar_emoji || '', photo: pet.photo || null,
        vet: { name: pet.vet_name||'', clinic: pet.vet_clinic||'', phone: pet.vet_phone||'', email: pet.vet_email||'' },
        weightKg: pet.weight_kg ?? '', weightGr: pet.weight_gr ?? '',
        sizeRange: pet.size_range || '', activityLevel: pet.activity_level || 2,
        allergies: pet.allergies || [], chronicConditions: pet.chronic_conditions || [],
        tutor2: (() => {
          const inv = invites.find(i => i.pet_id === pid);
          return inv ? { name: inv.invited_name, email: inv.invited_email, role: inv.role, pending: !inv.used } : null;
        })(),
        vaccines: vacc.filter(v => v.pet_id === pid).map(v => ({
          id: v.id, name: v.name, code: v.code, date: v.date, periodicity: v.periodicity,
          nextDate: v.next_date, alertType: v.alert_type, alertDays: v.alert_days, cost: v.cost })),
        deworming: dew.filter(d => d.pet_id === pid).map(d => ({
          id: d.id, product: d.product, type: d.type, format: d.format, dose: d.dose, unit: d.unit,
          date: d.date, periodicity: d.periodicity,
          nextDate: d.next_date, alertType: d.alert_type, alertDays: d.alert_days, cost: d.cost })),
        medications: med.filter(m => m.pet_id === pid).map(m => ({
          id: m.id, name: m.name, doseVal: m.dose_val, doseUnit: m.dose_unit,
          dose: m.dose_val != null ? `${m.dose_val} ${m.dose_unit||''}`.trim() : '',
          freqN: m.freq_n, freqUnit: m.freq_unit,
          frequency: m.freq_n ? `Cada ${m.freq_n} ${m.freq_unit === 'horas' ? 'horas' : 'días'}` : '',
          startDate: m.start_date, startTime: m.start_time,
          treatmentDays: m.treatment_days, endDate: m.end_date, active: m.active,
          reminder: m.reminder, stockTotal: m.stock_qty, stockUnit: m.stock_unit,
          expiry: m.expiry_date, cost: m.cost })),
        clinicalHistory: hist.filter(h => h.pet_id === pid).map(h => ({
          id: h.id, title: h.title, type: h.type, date: h.date,
          doctor: h.vet, clinic: h.clinic, cost: h.cost, notes: h.notes,
          files: (h.files || []).map(f => { try { return JSON.parse(f); } catch(e) { return null; } }).filter(Boolean) })),
        weightHistory: wh.filter(w => w.pet_id === pid).map(w => ({
          id: w.id, date: w.date, kg: w.kg, gr: w.gr, notes: w.notes })),
        moodLog: mood.filter(m => m.pet_id === pid).map(m => ({
          id: m.id, date: m.date, mood: m.mood, energy: m.energy, notes: m.notes })),
        symptomsLog: sym.filter(s => s.pet_id === pid).map(s => ({
          id: s.id, date: s.date, symptoms: s.symptoms, severity: s.severity, notes: s.notes })),
        meals: meal.filter(m => m.pet_id === pid).map(m => ({
          id: m.id, date: m.date, time: m.time_of_day, food: m.type,
          portion: m.amount, portionUnit: m.unit, notes: m.notes })),
        activities: act.filter(a => a.pet_id === pid).map(a => ({
          id: a.id, date: a.date, type: a.type, duration: a.duration, distance: a.distance, notes: a.notes })),
        doseLog: dose.filter(d => d.pet_id === pid).map(d => ({
          id: d.id, medicationId: d.med_id, date: d.date, given: d.confirmed })),
      };
    });

    state.events = (evRes.data || []).map(e => ({
      id: e.id, title: e.title, date: e.date, time: e.time,
      type: e.type, petId: e.pet_id, notes: e.notes }));

    state.expenses = (expRes.data || []).map(e => ({
      id: e.id, petId: e.pet_id, date: e.date, category: e.category,
      amount: e.amount, description: e.description }));

    // store botiquin separately (not inside pet objects)
    state.botiquin = (botRes.data || []).map(b => ({
      id: b.id, petId: b.pet_id, name: b.name, category: b.type,
      quantity: b.quantity, unit: b.unit, expiryDate: b.expiry_date,
      notes: b.notes }));

  } catch(err) {
    console.error('Error loading from Supabase:', err);
    showToast('Error al cargar datos', 'error');
  }
}

// ---- ADMIN: cargar todos los datos ----
async function loadAdminData() {
  if (!state.user?.isAdmin) return;
  try {
    const [profilesRes, petsRes] = await Promise.all([
      sb.from('profiles').select('*').order('created_at', { ascending: false }),
      sb.from('pets').select('id, owner_id, species, created_at'),
    ]);
    state.adminData = {
      profiles: profilesRes.data || [],
      pets: petsRes.data || [],
    };
  } catch(err) {
    console.error('Admin data error:', err);
  }
}

// ---- UTILIDADES ----
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function formatDate(d) {
  if (!d) return '—';
  const dt = new Date(d + 'T12:00:00');
  return dt.toLocaleDateString('es-CL', { day:'2-digit', month:'2-digit', year:'numeric' });
}

// "Hoy" en fecha LOCAL (YYYY-MM-DD), no en UTC. `new Date().toISOString()` usa UTC,
// así que en Chile (UTC-4/-3) desde ~las 20:00 hasta medianoche ya reporta el día
// siguiente — rompía vencimientos, calendario, eventos próximos y alertas.
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Fecha local, N días desde hoy (para umbrales tipo "vence en 30 días").
function daysFromNowStr(days) {
  const d = new Date(todayStr() + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addMonths(dateStr, months) {
  if (!dateStr || !months) return '';
  const d = new Date(dateStr + 'T12:00:00');
  const whole = Math.trunc(months);
  const frac = months - whole;
  d.setMonth(d.getMonth() + whole);
  if (frac) d.setDate(d.getDate() + Math.round(frac * 30));
  return d.toISOString().slice(0, 10);
}

function getAge(dob) {
  if (!dob) return '';
  const b = new Date(dob + 'T12:00:00'), n = new Date();
  let y = n.getFullYear() - b.getFullYear();
  let m = n.getMonth() - b.getMonth();
  if (n.getDate() < b.getDate()) m--;
  if (m < 0) { y--; m += 12; }
  if (y <= 0) { const totalMonths = Math.max(0, y * 12 + m); return `${totalMonths} mes${totalMonths !== 1 ? 'es' : ''}`; }
  return `${y} año${y !== 1 ? 's' : ''}`;
}

// Convierte alertType/alertDays (guardados en vacunas/desparasitaciones pero antes
// nunca usados) en un estado de 3 niveles: vencido / próximo / al día.
function careAlertStatus(nextDate, alertType, alertDays) {
  if (!nextDate) return { status: 'sin_fecha', label: '', color: 'text-gray-400', badge: 'bg-gray-100 text-gray-500' };
  const today = todayStr();
  if (nextDate < today) return { status: 'vencido', label: 'Vencido', color: 'text-red-500', badge: 'bg-red-100 text-red-600' };
  const windowDays = alertType === 'week' ? 7 : alertType === 'custom' ? (parseInt(alertDays) || 0) : 0;
  const thresholdDate = new Date(today + 'T12:00:00');
  thresholdDate.setDate(thresholdDate.getDate() + windowDays);
  const thresholdStr = `${thresholdDate.getFullYear()}-${String(thresholdDate.getMonth() + 1).padStart(2, '0')}-${String(thresholdDate.getDate()).padStart(2, '0')}`;
  if (nextDate <= thresholdStr) {
    const daysLeft = Math.round((new Date(nextDate + 'T12:00:00') - new Date(today + 'T12:00:00')) / 86400000);
    return { status: 'proximo', label: daysLeft <= 0 ? 'Vence hoy' : `Vence en ${daysLeft} día${daysLeft !== 1 ? 's' : ''}`, color: 'text-amber-500', badge: 'bg-amber-100 text-amber-600' };
  }
  return { status: 'al_dia', label: 'Al día', color: 'text-green-600', badge: 'bg-green-100 text-green-700' };
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
// Rutas reales: la URL refleja la vista actual, el botón atrás/adelante del
// navegador funciona, y recargar la página no te manda siempre al dashboard.
// Requiere que el hosting reescriba cualquier path a index.html (ver vercel.json)
// ya que esto es una SPA de un solo archivo, sin páginas reales en el servidor.
const ROUTE_PATHS = {
  login: '/login', register: '/register', forgot: '/forgot', resetPassword: '/reset-password',
  dashboard: '/', pets: '/pets', addPet: '/pets/nueva',
  calendar: '/calendar', finance: '/finanzas', botiquin: '/botiquin', admin: '/admin',
};
const AUTH_VIEWS = ['login', 'register', 'forgot', 'resetPassword'];

function viewToPath(view, params = {}) {
  if (view === 'petProfile') {
    const id = params.currentPetId || state.currentPetId;
    return id ? `/pets/${encodeURIComponent(id)}` : '/pets';
  }
  return ROUTE_PATHS[view] || '/';
}

function pathToView(pathname) {
  const petMatch = pathname.match(/^\/pets\/([^/]+)\/?$/);
  if (petMatch && petMatch[1] !== 'nueva') {
    return { view: 'petProfile', params: { currentPetId: decodeURIComponent(petMatch[1]), currentTab: 'general' } };
  }
  for (const [view, path] of Object.entries(ROUTE_PATHS)) {
    if (path === pathname) return { view };
  }
  return null;
}

// Deep-link inicial (carga directa o recarga): solo se respeta si calza con el
// estado de sesión — un usuario logueado no debería aterrizar en /login, y uno
// sin sesión no puede saltar directo a una vista protegida.
function resolveInitialViewFromUrl(loggedIn) {
  const route = pathToView(location.pathname);
  if (!route) return null;
  const isAuthView = AUTH_VIEWS.includes(route.view);
  if (loggedIn && isAuthView) return null;
  if (!loggedIn && !isAuthView) return null;
  return route;
}

function navigate(view, params = {}, opts = {}) {
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
  Object.assign(state, { currentView: view, ...params });
  const path = viewToPath(view, params);
  if (location.pathname !== path) {
    if (opts.replace) history.replaceState(null, '', path);
    else history.pushState(null, '', path);
  }
  render();
  window.scrollTo(0, 0);
}

window.addEventListener('popstate', () => {
  const route = pathToView(location.pathname);
  if (!route) return;
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
  Object.assign(state, { currentView: route.view, ...(route.params || {}) });
  render();
});

// ---- COMPONENTES ----
function iconSVG(name) {
  const icons = {
    home:    `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>`,
    paw:     `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243zm7.364-9.243a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"/>`,
    calendar:`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>`,
    finance: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
    kit:     `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>`,
    logout:  `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>`,
    admin:   `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>`,
    check:      `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>`,
    checkCircle:`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
    x:          `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>`,
    warning:    `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>`,
    bell:       `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>`,
    pencil:     `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>`,
    trash:      `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>`,
    paperclip:  `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>`,
    plus:       `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>`,
    money:      `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
    creditCard: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-9 4h16a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>`,
    clipboard:  `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>`,
    users:      `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm5 0a4 4 0 10-1.5-7.7"/>`,
    mail:       `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>`,
    phone:      `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>`,
    chartBar:   `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>`,
    pin:        `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>`,
    box:        `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/>`,
    bolt:       `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>`,
    fire:       `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"/>`,
    arrowUp:    `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>`,
    arrowDown:  `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>`,
    arrowRight: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>`,
    arrowLeft:  `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"/>`,
    minus:      `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>`,
    lock:       `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>`,
    key:        `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>`,
    flask:      `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5.106 14.4a2.25 2.25 0 00-.659 1.591v.001c0 1.242 1.007 2.25 2.25 2.25h10.606c1.243 0 2.25-1.008 2.25-2.25 0-.597-.237-1.169-.659-1.591l-3.985-3.991a2.25 2.25 0 01-.659-1.591V3.104M9.75 3.104a24.301 24.301 0 014.5 0"/>`,
    bug:        `<circle cx="12" cy="13" r="4" stroke-width="2"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9V6m0 0L9.5 4M12 6l2.5-2M8 12H5m11 1h3M9 16l-2 2m8-2l2 2M12 5.5v0"/>`,
    pill:       `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 15.5L15.5 7a4.243 4.243 0 116 6L13 21.5a4.243 4.243 0 01-6-6z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.5 11.5l3 3"/>`,
    weight:     `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v2m0 0a4 4 0 014 4H8a4 4 0 014-4zM5 9h14l1.4 8.4A2 2 0 0118.42 20H5.58a2 2 0 01-1.98-2.6L5 9z"/>`,
    activity:   `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>`,
    food:       `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12h18M3 12a9 9 0 0018 0M3 12a9 9 0 0118-0M8 6v2m4-2v2m4-2v2"/>`,
    heart:      `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>`,
    cake:       `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v4m0 0c-.5 0-1 .5-1 1s.5 1 1 1 1-.5 1-1-.5-1-1-1zM4 21v-7a2 2 0 012-2h12a2 2 0 012 2v7M4 21h16M4 21a2 2 0 002-2m14 2a2 2 0 01-2-2M4 15h16M9 12v3m6-3v3"/>`,
    face:       `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 15s1 1.5 3 1.5S15 15 15 15M9 9h.01M15 9h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
    idea:       `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 18h6m-5 3h4m-7-9a6 6 0 1112 0c0 2.223-1.25 3.5-2.25 4.5S13 15 12 15s-1.75-.5-2.75-1.5S7 12.223 7 10z"/>`,
    hospital:   `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V7a2 2 0 00-2-2H7a2 2 0 00-2 2v14m14 0H5m14 0h2M5 21H3m8-14v4m-2-2h4M9 21v-4a1 1 0 011-1h4a1 1 0 011 1v4"/>`,
    scissors:   `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9a3 3 0 100-6 3 3 0 000 6zm0 0v0a3 3 0 013 3v0m-3-3l12 8m0-14L9 12m9 6a3 3 0 11-6 0 3 3 0 016 0z"/>`,
    building:   `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M15 9h.01M15 13h.01M10 21v-4a2 2 0 014 0v4"/>`,
    menu:       `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>`,
    receipt:    `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l2 2 4-4m3 9l-1.5-1.5L15 21l-1.5-1.5L12 21l-1.5-1.5L9 21l-1.5-1.5L6 21V5a2 2 0 012-2h8a2 2 0 012 2v16z"/>`,
    folder:     `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>`,
    clock:      `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
    document:   `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>`,
    printer:    `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m10 0v4a1 1 0 01-1 1H8a1 1 0 01-1-1v-4m10 0H7m10-9V4a1 1 0 00-1-1H8a1 1 0 00-1 1v4h10z"/>`,
    party:      `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.25 5.25l1.5 1.5m10.5-1.5l-1.5 1.5M3 12h2.25m13.5 0H21M8 21l8-15 5 15-8-4-5 4z"/>`,
    wave:       `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904"/>`,
    dog:        `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8c0-1.5 1-3 3-3l2 3M20 8c0-1.5-1-3-3-3l-2 3M6 8c0 4 2.5 7 6 7s6-3 6-7M6 8H5a1 1 0 000 2h1m12-2h1a1 1 0 010 2h-1M10 15v2m4-2v2m-5 2h6"/>`,
  };
  return icons[name] || '';
}

// Envuelve un ícono lineal (svg) con tamaño/color consistentes — reemplaza el
// uso disperso de emojis como iconografía funcional en toda la app.
function icon(name, cls = 'w-5 h-5') {
  return `<svg class="${cls}" fill="none" stroke="currentColor" viewBox="0 0 24 24">${iconSVG(name)}</svg>`;
}

function sidebar() {
  const items = [
    { v:'dashboard', label:'Inicio' },
    { v:'pets',      label:'Mis Mascotas' },
    { v:'calendar',  label:'Agenda' },
    { v:'finance',   label:'Finanzas' },
    { v:'botiquin',  label:'Botiquín' },
    ...(state.user?.isAdmin ? [{ v:'admin', label:'Admin' }] : []),
  ];
  const navIcons = { dashboard:'home', pets:'paw', calendar:'calendar', finance:'finance', botiquin:'kit', admin:'admin' };
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
        <button onclick="navigate('${i.v}')" aria-current="${active?'page':'false'}"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 ${active ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}">
          <svg class="w-4.5 h-4.5 flex-shrink-0 ${active?'text-brand-600':'text-gray-400 group-hover:text-gray-600'}" style="width:1.1rem;height:1.1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            ${iconSVG(navIcons[i.v]||'home')}
          </svg>
          <span>${i.label}</span>
        </button>`;
      }).join('')}
    </nav>
    <div class="px-3 py-3 border-t border-gray-100">
      <div class="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors">
        <div class="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">${(state.user?.name||'U')[0].toUpperCase()}</div>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-semibold text-gray-900 truncate">${state.user?.name||''}</div>
          <div class="text-xs text-gray-400 truncate" title="${state.user?.email||''}">${state.user?.email||''}</div>
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
        <button onclick="navigate('${i.v}')" class="relative flex-1 flex flex-col items-center gap-0.5 pt-2 pb-1.5 transition-colors ${active?'text-brand-600':'text-gray-400'}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">${iconSVG(i.icon)}</svg>
          <span class="text-[10px] font-medium">${i.label}</span>
          ${active?`<span class="absolute bottom-0 w-8 h-0.5 rounded-full bg-brand-500 mb-0.5"></span>`:''}
        </button>`;
      }).join('')}
    </div>
  </nav>`;
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

function emptyState(iconName, title, sub, btnLabel = '', btnFn = '') {
  return `
  <div class="text-center py-8 md:py-10 animate-fade-in">
    <div class="mb-3 flex justify-center text-gray-300">${icon(iconName, 'w-12 h-12 md:w-14 md:h-14')}</div>
    <h3 class="text-base md:text-lg font-semibold text-gray-700 mb-1">${title}</h3>
    <p class="text-sm text-gray-400 mb-5">${sub}</p>
    ${btnLabel ? `<button onclick="${btnFn}" class="btn-primary">${btnLabel}</button>` : ''}
  </div>`;
}

// Pantalla completa que reemplaza a Finanzas/Agenda/Botiquín cuando no hay
// mascotas registradas — antes mostraban tarjetas de estadísticas en 0 y
// filtros vacíos que aparentaban funcionar sin tener sobre qué operar.
function noPetsOnboarding(iconName, title, desc) {
  return appShell(`
    <div class="max-w-lg mx-auto text-center py-10 md:py-16 animate-fade-in">
      <div class="mb-4 flex justify-center text-brand-300">${icon(iconName, 'w-14 h-14 md:w-16 md:h-16')}</div>
      <h2 class="text-lg md:text-xl font-bold text-gray-900 mb-2">${title}</h2>
      <p class="text-sm text-gray-500 mb-6">${desc}</p>
      <button onclick="navigate('addPet')" class="btn-primary px-6 py-3 text-base">+ Registrar mi primera mascota</button>
    </div>
  `);
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
        <div class="mb-6 flex justify-center">${icon('paw','w-20 h-20')}</div>
        <h1 class="text-4xl font-bold mb-3">MyPets 3.0</h1>
        <p class="text-lg text-purple-100 max-w-xs mx-auto">Tu compañero digital para el cuidado integral de tus mascotas</p>
        <div class="mt-8 grid grid-cols-2 gap-4 text-sm">
          <div class="bg-white/10 rounded-xl p-3"><div class="mb-1 flex justify-center">${icon('clipboard','w-6 h-6')}</div>Ficha médica completa</div>
          <div class="bg-white/10 rounded-xl p-3"><div class="mb-1 flex justify-center">${icon('bell','w-6 h-6')}</div>Alertas automáticas</div>
          <div class="bg-white/10 rounded-xl p-3"><div class="mb-1 flex justify-center">${icon('pill','w-6 h-6')}</div>Control de medicamentos</div>
          <div class="bg-white/10 rounded-xl p-3"><div class="mb-1 flex justify-center">${icon('money','w-6 h-6')}</div>Control de gastos</div>
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
          <div class="mt-4">
            <button type="button" onclick="loadDemoAndLogin()"
              class="w-full py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 transition-colors">
              ${icon('flask','w-4 h-4 inline align-text-bottom')} Ingresar con datos de prueba
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
        <div class="mb-2 flex justify-center text-gray-300">${icon('lock','w-10 h-10')}</div>
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

async function handleResetPassword() {
  const pass  = document.getElementById('rp-pass')?.value;
  const pass2 = document.getElementById('rp-pass2')?.value;
  if (!pass || pass.length < 6) { showToast('Mínimo 6 caracteres', 'error'); return; }
  if (pass !== pass2) { showToast('Las contraseñas no coinciden', 'error'); return; }
  showToast('Actualizando contraseña...', '');
  const { error } = await sb.auth.updateUser({ password: pass });
  if (error) { showToast('Error: ' + error.message, 'error'); return; }
  await sb.auth.signOut();
  state.isLoggedIn = false; state.user = null;
  showToast('Contraseña actualizada. Inicia sesión.', 'success');
  navigate('login');
}

// ---- VISTA: FORGOT ----
function viewForgot() {
  return `
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-teal-50 p-6">
    <div class="w-full max-w-sm animate-scale-in">
      <div class="text-center mb-6">
        <div class="mb-2 flex justify-center text-gray-300">${icon('key','w-10 h-10')}</div>
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
  const today = todayStr();
  const dateStr0 = new Date().toLocaleDateString('es-CL', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  if (pets.length === 0) {
    return appShell(`
      <div class="mb-5">
        <h1 class="text-xl md:text-2xl font-bold text-gray-900">Hola, ${state.user?.name?.split(' ')[0] || 'Tutor'} 👋</h1>
        <p class="text-sm text-gray-400 mt-0.5 capitalize">${dateStr0}</p>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-6 md:p-10 text-center max-w-2xl mx-auto mt-4 md:mt-8">
        <div class="mb-4 flex justify-center text-brand-400">${icon('paw','w-14 h-14')}</div>
        <h2 class="text-lg md:text-xl font-bold text-gray-900 mb-2">Empecemos con tu primera mascota</h2>
        <p class="text-sm text-gray-500 mb-8 max-w-md mx-auto">Regístrala para llevar su ficha de salud, agenda y gastos en un solo lugar. Solo toma un par de minutos.</p>
        <div class="grid sm:grid-cols-3 gap-3 mb-8 text-left">
          <div class="bg-brand-50 border border-brand-100 rounded-xl p-4">
            <div class="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-xs mb-2">1</div>
            <div class="text-sm font-semibold text-gray-800">Registra tu mascota</div>
            <div class="text-xs text-gray-500 mt-1">Nombre, especie y datos básicos</div>
          </div>
          <div class="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <div class="w-7 h-7 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold text-xs mb-2">2</div>
            <div class="text-sm font-semibold text-gray-800">Añade su primer evento</div>
            <div class="text-xs text-gray-500 mt-1">Una vacuna, control o consulta</div>
          </div>
          <div class="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <div class="w-7 h-7 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold text-xs mb-2">3</div>
            <div class="text-sm font-semibold text-gray-800">Configura recordatorios</div>
            <div class="text-xs text-gray-500 mt-1">Nunca más te olvides de una dosis</div>
          </div>
        </div>
        <button onclick="navigate('addPet')" class="btn-primary px-6 py-3 text-base">+ Registrar mi primera mascota</button>
      </div>
    `);
  }

  const alerts = pets.flatMap(p => [
    ...(p.vaccines || []).filter(v => v.nextDate && careAlertStatus(v.nextDate, v.alertType, v.alertDays).status !== 'al_dia')
      .map(v => ({ ...v, icon: 'flask', status: careAlertStatus(v.nextDate, v.alertType, v.alertDays) })),
    ...(p.deworming || []).filter(d => d.nextDate && careAlertStatus(d.nextDate, d.alertType, d.alertDays).status !== 'al_dia')
      .map(d => ({ ...d, name: d.product, icon: 'bug', status: careAlertStatus(d.nextDate, d.alertType, d.alertDays) })),
    ...(p.medications || []).filter(m => m.endDate && m.endDate <= today)
      .map(m => ({ ...m, icon: 'pill', status: { status: 'vencido', label: 'Tratamiento finalizado', badge: 'bg-red-100 text-red-600' } })),
  ]);
  const overdueCount = alerts.filter(a => a.status.status === 'vencido').length;
  const upcoming = (state.events || []).filter(e => e.date >= today).slice(0, 3);
  const todayMeds = pets.flatMap(p => (p.medications || []).filter(m => m.active));
  const dateStr = new Date().toLocaleDateString('es-CL', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  return appShell(`
    <div class="mb-5">
      <h1 class="text-xl md:text-2xl font-bold text-gray-900">Hola, ${state.user?.name?.split(' ')[0] || 'Tutor'} 👋</h1>
      <p class="text-sm text-gray-400 mt-0.5 capitalize">${dateStr}</p>
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 stagger">
      ${statCard(icon('paw','w-5 h-5 md:w-6 md:h-6'), 'Mascotas', pets.length, 'brand')}
      ${statCard(icon('bell','w-5 h-5 md:w-6 md:h-6'), 'Alertas activas', alerts.length, 'red')}
      ${statCard(icon('calendar','w-5 h-5 md:w-6 md:h-6'), 'Eventos próximos', upcoming.length, 'amber')}
      ${statCard(icon('pill','w-5 h-5 md:w-6 md:h-6'), 'Medicamentos hoy', todayMeds.length, 'teal')}
    </div>

    <div class="grid md:grid-cols-2 gap-4 md:gap-6">
      <div class="bg-white rounded-2xl shadow-sm p-4 md:p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-gray-900">Mis Mascotas</h2>
          <button onclick="navigate('pets')" class="text-sm text-brand-600 hover:underline font-medium">Ver todas →</button>
        </div>
        ${pets.length === 0
          ? `<div class="text-center py-8">
               <div class="mb-2 flex justify-center text-gray-300">${icon('paw','w-10 h-10')}</div>
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
               <div class="mb-2 flex justify-center text-gray-300">${icon('calendar','w-10 h-10')}</div>
               <p class="text-sm text-gray-400 mb-3">Sin eventos próximos</p>
               <button onclick="navigate('calendar')" class="btn-primary text-sm">Agendar evento</button>
             </div>`
          : upcoming.map(e => `
              <div class="flex items-start gap-3 p-3 rounded-xl border border-gray-100 mb-2">
                <div class="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">${icon(eventIcon(e.type),'w-5 h-5')}</div>
                <div>
                  <div class="text-sm font-medium text-gray-900">${e.title}</div>
                  <div class="text-xs text-gray-400">${formatDate(e.date)} · ${e.pet || 'Sin mascota'}</div>
                </div>
              </div>`).join('')}
      </div>

      ${alerts.length > 0 ? `
      <div class="md:col-span-2 ${overdueCount > 0 ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'} border rounded-2xl p-5">
        <h2 class="font-semibold ${overdueCount > 0 ? 'text-red-700' : 'text-amber-700'} mb-3 flex items-center gap-1.5">${icon('warning','w-4 h-4')} Alertas${overdueCount > 0 ? ` (${overdueCount} vencida${overdueCount!==1?'s':''})` : ''}</h2>
        <div class="space-y-2">
          ${alerts.slice(0,4).map(a => `
            <div class="flex items-center gap-3 bg-white rounded-xl p-3">
              <span class="text-gray-500">${icon(a.icon,'w-5 h-5')}</span>
              <div class="flex-1"><div class="text-sm font-medium text-gray-800">${a.name}</div>
              <div class="text-xs text-gray-400">Vence: ${formatDate(a.nextDate || a.endDate)}</div></div>
              <span class="badge ${a.status.badge} text-xs flex-shrink-0">${a.status.label}</span>
            </div>`).join('')}
        </div>
      </div>` : ''}
    </div>

    ${(() => {
      // Streaks de medicamentos
      const streakCards = pets.map(p => {
        const activeMeds = (p.medications||[]).filter(m => m.active);
        if (!activeMeds.length) return null;
        const doseLog = p.doseLog || [];
        // Count consecutive days backwards from today
        let streak = 0;
        let checkDate = new Date(today + 'T12:00:00');
        for (let i = 0; i < 365; i++) {
          const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
          if (doseLog.some(dl => dl.date === dateStr && dl.given)) {
            streak++;
            checkDate.setDate(checkDate.getDate()-1);
          } else {
            break;
          }
        }
        return { name: p.name, streak };
      }).filter(Boolean);

      // Próximos cumpleaños (30 días)
      const now = new Date();
      const birthdayPets = pets.map(p => {
        if (!p.dateOfBirth) return null;
        const dob = new Date(p.dateOfBirth + 'T12:00:00');
        const thisYear = now.getFullYear();
        let next = new Date(thisYear, dob.getMonth(), dob.getDate());
        if (next < now) next = new Date(thisYear+1, dob.getMonth(), dob.getDate());
        const diffDays = Math.round((next - now) / 86400000);
        if (diffDays > 30) return null;
        const age = next.getFullYear() - dob.getFullYear();
        return { name: p.name, days: diffDays, age };
      }).filter(Boolean);

      // Recomendaciones inteligentes
      const recs = [];
      pets.forEach(p => {
        const ageYears = p.dateOfBirth ? Math.floor((Date.now() - new Date(p.dateOfBirth).getTime()) / (365.25*86400000)) : 0;
        const lastVaccDate = (p.vaccines||[]).reduce((max,v) => v.date>max?v.date:max, '');
        const vaccineAge = lastVaccDate ? Math.floor((Date.now()-new Date(lastVaccDate).getTime())/(30.44*86400000)) : 999;
        if (p.species === 'Perro' && ageYears >= 7) recs.push({ icon:'flask', text:`${p.name} tiene ${ageYears} años. Considera análisis de sangre anual para detección temprana.` });
        if (p.species === 'Perro' && (p.breed||'').match(/Golden Retriever|Labrador/i)) recs.push({ icon:'warning', text:`Los ${p.breed}s son propensos a displasia de cadera. Consulta con tu vet sobre control radiológico.` });
        if (p.species === 'Gato' && ageYears >= 10) recs.push({ icon:'heart', text:`${p.name} es un gato senior (${ageYears} años). Necesita revisiones veterinarias cada 6 meses.` });
        if (!p.vet?.name) recs.push({ icon:'clipboard', text:`${p.name} no tiene datos de veterinario. Regístralos para tener acceso rápido en emergencias.` });
        if (vaccineAge >= 12) recs.push({ icon:'flask', text:`${p.name} lleva más de un año sin registrar vacunas. Revisa el calendario de vacunación.` });
      });

      const shownRecs = recs.slice(0,2);
      const hasExtras = streakCards.length || birthdayPets.length || shownRecs.length;
      if (!hasExtras) return '';

      return `
      <div class="grid md:grid-cols-3 gap-4 mt-4">
        ${streakCards.length ? `
        <div class="bg-white rounded-2xl shadow-sm p-4 md:p-5">
          <h2 class="font-semibold text-gray-900 mb-3 flex items-center gap-1.5">${icon('fire','w-4 h-4 text-orange-500')} Rachas de medicamentos</h2>
          <div class="space-y-2">
            ${streakCards.map(s => s.streak > 0
              ? `<div class="flex items-center gap-2 p-2.5 bg-orange-50 rounded-xl">
                   <span class="text-orange-500">${icon('fire','w-5 h-5')}</span>
                   <div><div class="text-sm font-semibold text-gray-800">${s.name}</div>
                   <div class="text-xs text-orange-600">${s.streak} día${s.streak!==1?'s':''} seguido${s.streak!==1?'s':''} sin saltarse una dosis</div></div>
                 </div>`
              : `<div class="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
                   <span class="text-gray-400">${icon('fire','w-5 h-5')}</span>
                   <div class="text-sm text-gray-600">¡Empieza hoy tu racha con ${s.name}!</div>
                 </div>`
            ).join('')}
          </div>
        </div>` : ''}

        ${birthdayPets.length ? `
        <div class="bg-white rounded-2xl shadow-sm p-4 md:p-5">
          <h2 class="font-semibold text-gray-900 mb-3">🎂 Próximos cumpleaños</h2>
          <div class="space-y-2">
            ${birthdayPets.map(b => `
              <div class="flex items-center gap-2 p-2.5 bg-pink-50 rounded-xl">
                <span class="text-xl">🎂</span>
                <div>
                  <div class="text-sm font-semibold text-gray-800">${b.name} cumple ${b.age} año${b.age!==1?'s':''}</div>
                  <div class="text-xs text-pink-600">${b.days === 0 ? '¡Hoy es su cumpleaños! 🎉' : `En ${b.days} día${b.days!==1?'s':''}`}</div>
                </div>
              </div>`).join('')}
          </div>
        </div>` : ''}

        ${shownRecs.length ? `
        <div class="bg-white rounded-2xl shadow-sm p-4 md:p-5">
          <h2 class="font-semibold text-gray-900 mb-3 flex items-center gap-1.5">${icon('idea','w-4 h-4 text-amber-500')} Recomendaciones</h2>
          <div class="space-y-2">
            ${shownRecs.map(r => `
              <div class="flex items-start gap-2 p-2.5 bg-yellow-50 rounded-xl">
                <span class="text-gray-400 flex-shrink-0">${icon(r.icon,'w-5 h-5')}</span>
                <p class="text-xs text-gray-700 leading-snug">${r.text}</p>
              </div>`).join('')}
          </div>
        </div>` : ''}
      </div>`;
    })()}
  `);
}

function eventIcon(t) {
  return { Consulta:'hospital', Examen:'flask', Peluquería:'scissors', Hotel:'building', Vacuna:'flask', Otro:'pin' }[t] || 'pin';
}

// ---- VISTA: MASCOTAS ----
function viewPets() {
  const pets = state.pets;
  return appShell(`
    ${pageHeader('Mis Mascotas', `${pets.length} mascota${pets.length !== 1 ? 's' : ''} registrada${pets.length !== 1 ? 's' : ''}`,
      `<button onclick="navigate('addPet')" class="btn-primary flex items-center gap-1.5">
         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
         <span>Agregar mascota</span>
       </button>`)}
    ${pets.length === 0
      ? emptyState('paw', 'Aún no tienes mascotas', 'Registra tu primera mascota para comenzar', '+ Agregar mascota', "navigate('addPet')")
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
  const steps = ['Identificación', 'Características', 'Salud', 'Tutores'];
  return appShell(`
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <button onclick="cancelAddPet()" class="flex items-center gap-1 h-9 px-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">‹ Cancelar</button>
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
    <h2 class="text-lg font-bold text-gray-900 mb-4">Identificación</h2>
    <div class="space-y-4">
      <div class="flex flex-col items-center mb-4">
        <div id="photo-preview" class="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-4xl mb-2 overflow-hidden">
          ${d.photo ? `<img src="${d.photo}" class="w-full h-full object-cover" />` : icon('paw','w-8 h-8 text-gray-300')}
        </div>
        <label class="cursor-pointer text-sm text-brand-600 hover:underline font-medium">
          Subir foto <input type="file" accept="image/*" class="hidden" onchange="previewPhoto(event)" />
        </label>
      </div>
      <div class="space-y-3">
        <div>
          <label class="form-label">Nombre *</label>
          <input id="pet-name" type="text" required value="${d.name||''}" placeholder="Nombre de tu mascota" class="input-field" oninput="clearFieldError('pet-name')" />
          <p id="pet-name-error" class="text-xs text-red-500 mt-1 hidden">Ingresa el nombre de tu mascota para continuar</p>
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
            <label class="form-label">Sexo <span class="text-gray-400 font-normal">(opcional)</span></label>
            <select id="pet-sex" class="input-field">
              ${['Macho','Hembra'].map(s => `<option ${d.sex===s?'selected':''}>${s}</option>`).join('')}
            </select>
          </div>
        </div>
        <!-- Raza + Fecha: 1 col en mobile, 2 col en sm+ -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="form-label">Raza <span class="text-gray-400 font-normal">(opcional)</span></label>
            <select id="pet-breed" class="input-field">
              ${(BREEDS[d.species || 'Perro'] || BREEDS.Otro).map(b => `<option ${(d.breed||'Mestizo')===b?'selected':''}>${b}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label">Fecha de nacimiento <span class="text-gray-400 font-normal">(opcional)</span></label>
            <input id="pet-dob" type="date" value="${d.dateOfBirth||''}" class="input-field" />
            <p class="text-xs text-gray-400 mt-1">Si no la sabes con exactitud, deja el campo vacío</p>
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
    <h2 class="text-lg font-bold text-gray-900 mb-4">Características físicas</h2>
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
        Tu mascota quedará registrada con toda la información ingresada. ¡Podrás editarla en cualquier momento!
      </div>
    </div>`;
}

// ---- VISTA: PERFIL DE MASCOTA ----
function viewPetProfile() {
  const pet = state.pets.find(p => p.id === state.currentPetId);
  if (!pet) { navigate('pets'); return ''; }
  const tabs = ['general','vacunas','desparasitación','medicamentos','historial','seguimiento','nutricion'];
  const tabLabels = { general:'General', vacunas:'Vacunas', 'desparasitación':'Desparasitación', medicamentos:'Tratamiento', historial:'Historial', seguimiento:'Seguimiento', nutricion:'Nutrición' };
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
                <button onclick="exportPetRecord('${pet.id}')"
                  title="Exportar expediente"
                  class="w-8 h-8 md:w-auto md:h-auto md:px-3 md:py-1.5 rounded-xl bg-gray-50 hover:bg-teal-50 text-gray-400 hover:text-teal-600 border border-gray-200 text-xs font-medium transition-colors flex items-center justify-center gap-1">
                  <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  <span class="hidden md:inline">Exportar</span>
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
        ${tab === 'seguimiento'    ? tabSeguimiento(pet)     : ''}
        ${tab === 'nutricion'      ? tabNutricion(pet)       : ''}
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
            ? `<button onclick="removeTutor2('${pet.id}')" class="text-xs text-red-500 hover:underline">${pet.tutor2.pending ? 'Cancelar invitación' : 'Quitar tutor'}</button>`
            : `<button onclick="openInviteTutor2Modal('${pet.id}')" class="btn-primary text-xs">+ Invitar</button>`}
        </div>
        ${pet.tutor2?.name
          ? `<div class="flex items-center gap-3">
               <div class="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-600">${pet.tutor2.name[0].toUpperCase()}</div>
               <div>
                 <div class="text-sm font-medium text-gray-900">${pet.tutor2.name} ${pet.tutor2.pending ? '<span class="badge bg-amber-100 text-amber-600 ml-1">Invitación pendiente</span>' : ''}</div>
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
        ? emptyState('flask','Sin vacunas registradas','Agrega el historial de vacunación')
        : `<div class="space-y-3">
             ${vs.map(v => { const st = careAlertStatus(v.nextDate, v.alertType, v.alertDays); return `
               <div class="border border-gray-100 rounded-xl p-4 flex items-start justify-between">
                 <div class="flex items-start gap-3">
                   <div class="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">${icon('flask','w-4.5 h-4.5')}</div>
                   <div>
                     <div class="font-medium text-gray-900 text-sm">${v.name}</div>
                     <div class="text-xs text-gray-400">${v.code ? `Código: ${v.code} · ` : ''}Aplicada: ${formatDate(v.date)}</div>
                     ${v.nextDate ? `<div class="text-xs mt-1 ${st.color}">Próxima: ${formatDate(v.nextDate)}${st.label ? ` · <span class="badge ${st.badge}">${st.label}</span>` : ''}</div>` : ''}
                     ${v.alertType ? `<div class="text-xs text-brand-500 flex items-center gap-1">${icon('bell','w-3 h-3')} Alerta configurada: ${{same:'El mismo día',week:'1 semana antes',custom:`${v.alertDays} días antes`}[v.alertType]||v.alertType}</div>` : ''}
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
               </div>`; }).join('')}
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
        ? emptyState('bug','Sin desparasitaciones','Registra los tratamientos antiparasitarios')
        : `<div class="space-y-2">
             ${ds.map(d => { const st = careAlertStatus(d.nextDate, d.alertType, d.alertDays); return `
               <div class="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition-colors group">
                 <div class="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 flex-shrink-0">${icon('bug','w-4.5 h-4.5')}</div>
                 <div class="flex-1 min-w-0">
                   <div class="flex items-center gap-2 flex-wrap">
                     <span class="font-medium text-gray-900 text-sm">${d.product}</span>
                     <span class="badge bg-teal-50 text-teal-700 text-xs">${d.type}</span>
                   </div>
                   <div class="text-xs text-gray-400">${d.format} · Dosis: ${d.dose} ${d.unit} · ${formatDate(d.date)}</div>
                   ${d.nextDate ? `<div class="text-xs ${st.color} font-medium">Próxima: ${formatDate(d.nextDate)}${st.label ? ` · <span class="badge ${st.badge}">${st.label}</span>` : ''}</div>` : ''}
                 </div>
                 <div class="flex items-center gap-1 flex-shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                   <button onclick="openEditDewormModal('${pet.id}','${d.id}')" title="Editar"
                     class="w-8 h-8 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 flex items-center justify-center transition-colors">
                     <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                   </button>
                   <button onclick="deleteDeworming('${pet.id}','${d.id}')" title="Eliminar"
                     class="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors">
                     <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                   </button>
                 </div>
               </div>`; }).join('')}
           </div>
           ${pagerHTML(`dew_${pet.id}`, pages, page)}`}
    </div>`;
}

function tabMedications(pet) {
  const allMs = [...(pet.medications||[])].reverse();
  const { items: ms, total, pages, page } = paginate(allMs, `med_${pet.id}`);
  const today = todayStr();
  const reminderLabels = { exact:'Horario exacto', '15':'15 min antes', '30':'30 min antes', '60':'60 min antes' };
  const hasActive = (pet.medications||[]).some(m => m.active);
  const doseGivenToday = (pet.doseLog||[]).some(dl => dl.date === today && dl.given);
  return `
    <div class="bg-white rounded-2xl shadow-sm p-5">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="font-semibold text-gray-800">Tratamiento</h3>
          ${total > 0 ? `<p class="text-xs text-gray-400 mt-0.5">${total} registro${total!==1?'s':''}</p>` : ''}
        </div>
        <div class="flex items-center gap-2">
          ${hasActive ? (doseGivenToday
            ? `<span class="badge bg-green-100 text-green-700">✓ Dosis de hoy registrada</span>`
            : `<button onclick="markDoseTaken('${pet.id}')" class="btn-secondary text-sm flex items-center gap-1.5">${icon('fire','w-4 h-4')} Marcar dosis de hoy</button>`) : ''}
          <button onclick="openMedModal('${pet.id}')" class="btn-primary text-sm">+ Agregar</button>
        </div>
      </div>
      ${total === 0
        ? emptyState('pill','Sin tratamientos','Registra tratamientos activos e historial')
        : `<div class="space-y-3">
             ${ms.map(m => {
               const isExpired  = m.expiry && m.expiry < today;
               const expiringSoon = m.expiry && !isExpired && m.expiry <= daysFromNowStr(30);
               const reminderLabel = reminderLabels[m.reminder] || m.reminder;
               return `
               <div class="border border-gray-100 rounded-2xl p-4 hover:border-brand-200 transition-colors">
                 <div class="flex items-start justify-between gap-3">
                   <div class="flex items-start gap-3 flex-1 min-w-0">
                     <div class="w-10 h-10 rounded-xl ${m.active?'bg-brand-50 text-brand-600':'bg-gray-50 text-gray-400'} flex items-center justify-center flex-shrink-0">${icon('pill','w-5 h-5')}</div>
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
                         ${icon('calendar','w-3 h-3 inline align-text-bottom')} ${formatDate(m.startDate)}${m.endDate ? ` → ${formatDate(m.endDate)}` : ''}
                         ${m.startTime ? ` · ⏰ ${m.startTime}` : ''}
                       </div>
                       ${m.reminder ? `<div class="text-xs text-brand-500 mt-0.5 flex items-center gap-1">${icon('bell','w-3 h-3')} ${reminderLabel}</div>` : ''}
                       ${(() => { const ms = medStockStatus(m); if (!ms) return ''; const barColor = { critico:'bg-red-400', bajo:'bg-amber-400', ok:'bg-green-400' }[ms.level]; return `
                         <div class="mt-2">
                           <div class="flex justify-between text-xs text-gray-500 mb-1">
                             <span>Stock: ${m.stockTotal} ${m.stockUnit||''} · ${ms.label}</span>
                             ${m.expiry ? `<span class="${isExpired?'text-red-500':expiringSoon?'text-amber-500':'text-gray-400'}">Cad: ${formatDate(m.expiry)}</span>` : ''}
                           </div>
                           <div class="w-full bg-gray-100 rounded-full h-1.5">
                             <div class="h-1.5 rounded-full ${barColor}" style="width:${ms.pct}%"></div>
                           </div>
                         </div>`; })()}
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
        ? emptyState('clipboard','Sin historial clínico','Registra eventos, procedimientos y adjunta documentos')
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
                               ${icon('paperclip','w-3 h-3 inline align-text-bottom')} ${f.name}
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
  if (state.pets.length === 0) {
    return noPetsOnboarding('calendar', 'Tu agenda está esperando', 'Registra una mascota primero para poder agendar vacunas, controles y otros eventos.');
  }
  const now = new Date();
  const year = state.calYear || now.getFullYear();
  const month = state.calMonth !== undefined ? state.calMonth : now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();
  const today = todayStr();
  const events = state.events || [];
  const monthName = firstDay.toLocaleDateString('es-CL', { month:'long', year:'numeric' });
  const days = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);

  const calView = state.calViewMode || 'calendario';

  const eventsListPanel = (() => {
    const upcoming = events.filter(e=>e.date>=today).sort((a,b)=>a.date>b.date?1:-1);
    const { items: evPage, total, pages, page } = paginate(upcoming, 'events');
    return `
    <div class="bg-white rounded-2xl shadow-sm p-5">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="font-semibold text-gray-800">Próximos eventos</h3>
          ${total > 0 ? `<p class="text-xs text-gray-400 mt-0.5">${total} evento${total!==1?'s':''}</p>` : ''}
        </div>
      </div>
      ${total === 0
        ? emptyState('calendar','Sin eventos próximos','Crea tu primer evento para verlo aquí','+ Crear evento','openEventModal()')
        : `<div class="space-y-1">
             ${evPage.map(e => `
               <div class="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors group">
                 <div class="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 flex-shrink-0">${icon(eventIcon(e.type),'w-4.5 h-4.5')}</div>
                 <div class="flex-1 min-w-0">
                   <div class="text-sm font-medium text-gray-900 truncate">${e.title}</div>
                   <div class="text-xs text-gray-400">${formatDate(e.date)}${e.pet ? ` · ${e.pet}` : ''}</div>
                 </div>
                 <button onclick="deleteEvent('${e.id}')"
                   class="w-7 h-7 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors md:opacity-0 md:group-hover:opacity-100">
                   ${icon('trash','w-3.5 h-3.5')}
                 </button>
               </div>`).join('')}
           </div>
           ${pagerHTML('events', pages, page)}`}
    </div>`;
  })();

  const calendarGridPanel = `
    <div class="bg-white rounded-2xl shadow-sm p-3 md:p-4 mb-6">
      <div class="flex items-center justify-between mb-3">
        <button onclick="prevMonth()" class="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 font-medium">‹</button>
        <span class="font-semibold text-gray-800 capitalize text-sm md:text-base">${monthName}</span>
        <button onclick="nextMonth()" class="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 font-medium">›</button>
      </div>
      <div class="grid grid-cols-7 gap-0.5 mb-1">
        ${['D','L','M','X','J','V','S'].map((d,i) => `<div class="text-center text-[10px] md:text-xs font-medium text-gray-500 py-1">${d}</div>`).join('')}
      </div>
      <div class="grid grid-cols-7 gap-0.5">
        ${days.map((d, i) => {
          if (!d) return `<div class="calendar-day other-month"></div>`;
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
          const dayEvents = events.filter(e => e.date === dateStr);
          const isToday = dateStr === today;
          const fullDate = new Date(dateStr + 'T12:00:00').toLocaleDateString('es-CL', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
          const ariaLabel = `${fullDate}${isToday ? ' · hoy' : ''}${dayEvents.length ? ` · ${dayEvents.length} evento${dayEvents.length!==1?'s':''}` : ' · sin eventos'}`;
          return `
            <button type="button" onclick="openEventModal('${dateStr}')" class="calendar-day ${isToday?'today':''} relative w-full text-left" aria-label="${ariaLabel}" aria-current="${isToday ? 'date' : 'false'}">
              <div class="text-[10px] md:text-xs font-semibold ${isToday?'text-brand-600':'text-gray-700'}">${d}</div>
              ${dayEvents.slice(0,2).map(e => `
                <div class="hidden md:block text-xs mt-0.5 px-1 py-0.5 rounded bg-brand-100 text-brand-700 truncate flex items-center gap-1">${icon(eventIcon(e.type),'w-3 h-3 flex-shrink-0')} ${e.title}</div>
                <div class="md:hidden mt-0.5 w-1.5 h-1.5 rounded-full bg-brand-400 mx-auto"></div>
              `).join('')}
            </button>`;
        }).join('')}
      </div>
    </div>

    ${eventsListPanel}`;

  return appShell(`
    ${pageHeader('Agenda', monthName,
      `<div class="flex items-center gap-2 flex-wrap justify-end">
         <div class="flex rounded-xl overflow-hidden border border-gray-200 text-sm font-medium">
           ${[['calendario','calendar','Calendario'],['lista','menu','Lista']].map(([v,ic,label])=>`
             <button onclick="state.calViewMode='${v}';render()"
               class="px-3 py-1.5 flex items-center gap-1.5 transition-colors ${calView===v?'bg-brand-600 text-white':'text-gray-500 hover:bg-gray-50'}">
               ${icon(ic,'w-3.5 h-3.5')} ${label}
             </button>`).join('')}
         </div>
         <button onclick="openEventModal()" class="btn-primary flex items-center gap-1.5">
           ${icon('plus','w-4 h-4')}
           <span>Crear evento</span>
         </button>
       </div>`)}

    ${calView === 'calendario' ? calendarGridPanel : eventsListPanel}
  `);
}

// ---- VISTA: FINANZAS ----
function viewFinance() {
  if (state.pets.length === 0) {
    return noPetsOnboarding('money', 'Aún no hay gastos que mostrar', 'Registra una mascota primero para empezar a llevar el control de sus gastos veterinarios, alimentación y más.');
  }
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
    ${pageHeader('Finanzas', 'Control de gastos por mascota',
      `<button onclick="openExpenseModal()" class="btn-primary flex items-center gap-1.5">
         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
         <span>Registrar gasto</span>
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
              ${m==='listado'?icon('menu','w-3.5 h-3.5 inline align-text-bottom')+' Lista':icon('chartBar','w-3.5 h-3.5 inline align-text-bottom')+' Gráfico'}
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
              <span class="md:hidden">${{mensual:'Mensual',trimestral:'Trimest.',semestral:'Semest.',anual:'Anual'}[p]}</span>
              <span class="hidden md:inline">${{mensual:'Mensual',trimestral:'Trimestral',semestral:'Semestral',anual:'Anual'}[p]}</span>
            </button>`).join('')}
        </div>
      </div>
    </div>

    <!-- Widgets -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger">
      ${statCard(icon('money','w-5 h-5 md:w-6 md:h-6'),'Total '+(petFilter||'todas'), fmtCLP(total), 'brand')}
      ${statCard(icon('calendar','w-5 h-5 md:w-6 md:h-6'),'Este mes', fmtCLP(monthTotal), 'teal')}
      ${statCard(icon('receipt','w-5 h-5 md:w-6 md:h-6'),'Registros', expenses.length, 'amber')}
      ${statCard(icon('paw','w-5 h-5 md:w-6 md:h-6'),'Mascotas', pets.length, 'brand')}
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
          ? emptyState('money','Sin gastos registrados','Comienza a registrar los gastos de tus mascotas')
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
                           class="w-7 h-7 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors ml-auto md:opacity-0 md:group-hover:opacity-100">
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

    ${(() => {
      // Predicción de gastos próximo mes
      const now = new Date();
      const last90Days = new Date(now.getTime() - 90 * 86400000).toISOString().slice(0,10);
      const last90Expenses = allExpenses.filter(e => e.date >= last90Days);
      const last90Amounts = last90Expenses.map(e => Number(e.amount || 0)).filter(a => a > 0);
      if (!last90Amounts.length) return '';
      // Un gasto puntual grande (cirugía, emergencia) no debería inflar la proyección
      // "normal" de gasto mensual: se topa cada gasto a 4x la mediana antes de promediar.
      const sortedAmounts = [...last90Amounts].sort((a, b) => a - b);
      const medianAmount = sortedAmounts[Math.floor(sortedAmounts.length / 2)];
      const cap = medianAmount * 4;
      const hadOutliers = last90Amounts.some(a => a > cap);
      const cappedTotal = last90Amounts.reduce((s, a) => s + Math.min(a, cap), 0);
      const avgMonthly = Math.round(cappedTotal / 3);
      if (avgMonthly === 0) return '';

      // Compare last month vs prev month (maneja el cruce de año con Date en vez de aritmética de string)
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const lastMonthStr = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth()+1).padStart(2,'0')}`;
      const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth()+1).padStart(2,'0')}`;
      const lastMonthTotal = allExpenses.filter(e=>e.date?.startsWith(lastMonthStr)).reduce((s,e)=>s+Number(e.amount||0),0);
      const prevMonthTotal = allExpenses.filter(e=>e.date?.startsWith(prevMonthStr)).reduce((s,e)=>s+Number(e.amount||0),0);
      const trend = lastMonthTotal > prevMonthTotal ? '↑' : lastMonthTotal < prevMonthTotal ? '↓' : '→';
      const trendColor = trend==='↑' ? 'text-red-500' : trend==='↓' ? 'text-green-500' : 'text-gray-400';

      return `
      <div class="bg-white rounded-2xl shadow-sm p-4 md:p-5 mt-4">
        <h3 class="font-semibold text-gray-800 mb-1 flex items-center gap-1.5">${icon('chartBar','w-4 h-4')} Predicción de gastos</h3>
        <p class="text-xs text-gray-400 mb-3">Basado en los últimos 3 meses${hadOutliers ? ' · excluye el efecto de gastos puntuales grandes' : ''}</p>
        <div class="flex items-center gap-4 flex-wrap">
          <div>
            <div class="text-2xl font-bold text-gray-900">~${fmtCLP(avgMonthly)}</div>
            <div class="text-xs text-gray-500">Proyección próximo mes</div>
          </div>
          <div class="flex items-center gap-1">
            <span class="text-2xl font-bold ${trendColor}">${trend}</span>
            <span class="text-xs text-gray-400">vs mes anterior</span>
          </div>
        </div>
      </div>`;
    })()}
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
            ${icon('clipboard','w-3.5 h-3.5 inline align-text-bottom')} Se registrará: <span id="d-dose-preview-text" class="font-semibold text-teal-700"></span>
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
  const today = todayStr();
  openModal(`
    <div class="modal-box p-4 sm:p-6">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-brand-500">${icon('pill','w-6 h-6')}</span>
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

        <div class="overflow-hidden">
          <label class="form-label">Fecha inicio *</label>
          <input id="m-start" type="date" required value="${today}" class="input-field text-center" style="min-width:0;max-width:100%;width:100%;box-sizing:border-box;text-align:center" oninput="updateMedPreview()" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label">Hora inicio *</label>
            <select id="m-start-time" class="input-field text-center" onchange="updateMedPreview()">
              ${Array.from({length:24},(_,i)=>{const h=String(i).padStart(2,'0');return`<option value="${h}:00"${i===8?' selected':''}>${h}:00</option>`;}).join('')}
            </select>
          </div>
          <div>
            <label class="form-label">N° días</label>
            <input id="m-days" type="number" min="1" placeholder="7" class="input-field" oninput="updateMedPreview()" />
          </div>
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
          <label class="form-label flex items-center gap-1">${icon('bell','w-3.5 h-3.5')} Recordatorio por dosis</label>
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
            <label class="text-sm font-semibold text-gray-700 flex items-center gap-1.5">${icon('box','w-4 h-4')} Stock del medicamento <span class="text-gray-400 font-normal">(opcional)</span></label>
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
          <label class="form-label flex items-center gap-1">${icon('paperclip','w-3.5 h-3.5')} Adjuntar archivos <span class="text-gray-400 font-normal">(imágenes, PDFs, resultados)</span></label>
          <div onclick="document.getElementById('h-files').click()"
            class="mt-1 border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-colors">
            <div class="mb-1 flex justify-center">${icon('folder','w-6 h-6')}</div>
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
          <div><label class="form-label">Fecha *</label><input id="ex-date" type="date" required value="${todayStr()}" class="input-field" /></div>
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
  state.editPetData = {
    allergies: [...(p.allergies||[])], chronicConditions: [...(p.chronicConditions||[])],
    personalityTags: [...(p.personalityTags||[])], activityLevel: p.activityLevel || 2,
    photo: p.photo || null,
  };
  const allergyOpts = ['Pollo','Pescado','Pasto','Polen','Ácaros','Maíz','Trigo','Soya','Lácteos'];
  const conditionOpts = ['Ninguna','Diabetes','Epilepsia','Hipotiroidismo','Hipertiroidismo','Displasia de cadera','Displasia de codo','Enfermedad renal crónica','Enfermedad cardíaca','Artritis','Obesidad','Cushing','Addison','Pancreatitis crónica','Enfermedad inflamatoria intestinal','Asma','Dermatitis atópica','Cáncer','Cataratas','Glaucoma','Otra'];
  const personalityOpts = ['Juguetón','Cariñoso','Tranquilo','Activo','Tímido','Sociable','Independiente','Protector'];
  const sizeOpts = [
    { label: 'Pequeño', range: 'hasta 10 kg' },
    { label: 'Mediano', range: '10 – 25 kg' },
    { label: 'Grande',  range: '25 – 45 kg' },
    { label: 'Gigante', range: 'más de 45 kg' },
  ];
  openModal(`
    <div class="modal-box p-4 sm:p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4">Editar mascota</h3>
      <div class="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
        <div class="flex flex-col items-center mb-2">
          <div id="ep-photo-preview" class="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-4xl mb-2 overflow-hidden">
            ${p.photo ? `<img src="${p.photo}" class="w-full h-full object-cover" />` : icon('paw','w-8 h-8 text-gray-300')}
          </div>
          <label class="cursor-pointer text-sm text-brand-600 hover:underline font-medium">
            ${p.photo ? 'Cambiar foto' : 'Subir foto'} <input type="file" accept="image/*" class="hidden" onchange="previewEditPhoto(event)" />
          </label>
        </div>
        <div><label class="form-label">Nombre</label><input id="ep-name" value="${p.name||''}" class="input-field" /></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="form-label">Especie</label>
            <select id="ep-species" class="input-field">${['Perro','Gato','Ave','Conejo','Pez','Hámster','Reptil','Otro'].map(s=>`<option ${p.species===s?'selected':''}>${s}</option>`).join('')}</select>
          </div>
          <div><label class="form-label">Raza</label><input id="ep-breed" value="${p.breed||''}" class="input-field" /></div>
          <div><label class="form-label">Sexo</label>
            <select id="ep-sex" class="input-field">${['Macho','Hembra'].map(s=>`<option ${p.sex===s?'selected':''}>${s}</option>`).join('')}</select>
          </div>
          <div><label class="form-label">Color</label><input id="ep-color" value="${p.color||''}" class="input-field" /></div>
          <div><label class="form-label">Tamaño</label>
            <select id="ep-size" class="input-field">${sizeOpts.map(s=>`<option value="${s.label}" ${p.sizeRange===s.label?'selected':''}>${s.label} (${s.range})</option>`).join('')}</select>
          </div>
          <div><label class="form-label">Peso (kg)</label><input id="ep-wkg" type="number" min="0" value="${p.weightKg||''}" class="input-field" /></div>
          <div><label class="form-label">Peso (gr)</label><input id="ep-wgr" type="number" min="0" max="999" value="${p.weightGr||''}" class="input-field" /></div>
          <div><label class="form-label">Nacimiento</label><input id="ep-dob" type="date" value="${p.dateOfBirth||''}" class="input-field" /></div>
          <div><label class="form-label">Estado reproductivo</label>
            <select id="ep-repro" class="input-field">${['Entero/a','Esterilizado/a','Castrado/a'].map(s=>`<option ${p.reproductiveStatus===s?'selected':''}>${s}</option>`).join('')}</select>
          </div>
          <div class="col-span-2"><label class="form-label">Nro. de chip</label><input id="ep-chip" value="${p.chipNumber||''}" class="input-field" /></div>
        </div>
        <div>
          <label class="form-label">Nivel de actividad</label>
          <div class="flex gap-3 mt-1">
            ${[{v:1,l:'Bajo'},{v:2,l:'Medio'},{v:3,l:'Alto'}].map(a => `
              <button type="button" onclick="setEditActivity(${a.v})" id="ep-act-${a.v}"
                class="flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all
                ${(p.activityLevel||2)===a.v ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-brand-300'}">
                ${a.l}
              </button>`).join('')}
          </div>
        </div>
        <div>
          <label class="form-label">Personalidad</label>
          <div class="flex flex-wrap gap-2 mt-1" id="ep-personality-tags">
            ${personalityOpts.map(t => `<button type="button" onclick="toggleEditPersonality('${t}')" class="tag ${(p.personalityTags||[]).includes(t)?'selected':''}">${t}</button>`).join('')}
          </div>
        </div>
        <div>
          <label class="form-label">Alergias conocidas</label>
          <div class="flex flex-wrap gap-2 mt-1" id="ep-allergy-tags">
            ${allergyOpts.map(a => `<button type="button" onclick="toggleEditAllergy('${a}')" class="tag ${(p.allergies||[]).includes(a)?'selected':''}">${a}</button>`).join('')}
          </div>
        </div>
        <div>
          <label class="form-label">Condiciones crónicas</label>
          <div class="flex flex-wrap gap-2 mt-1" id="ep-condition-tags">
            ${conditionOpts.map(c => `<button type="button" onclick="toggleEditCondition('${c}')" class="tag ${(p.chronicConditions||[]).includes(c)?'selected':''}">${c}</button>`).join('')}
          </div>
        </div>
        <hr class="border-gray-100" />
        <h3 class="font-semibold text-gray-700 text-sm">Veterinario de cabecera</h3>
        <div class="grid grid-cols-2 gap-3">
          <div class="col-span-2"><label class="form-label">Nombre</label><input id="ep-vet-name" value="${p.vet?.name||''}" class="input-field" /></div>
          <div class="col-span-2"><label class="form-label">Clínica</label><input id="ep-vet-clinic" value="${p.vet?.clinic||''}" class="input-field" /></div>
          <div><label class="form-label">Teléfono</label><input id="ep-vet-phone" value="${p.vet?.phone||''}" class="input-field" /></div>
          <div><label class="form-label">Email</label><input id="ep-vet-email" value="${p.vet?.email||''}" class="input-field" /></div>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button onclick="saveEditPet('${petId}')" class="btn-primary flex-1">Guardar</button>
        </div>
      </div>
    </div>`);
}

function toggleEditAllergy(a) {
  const list = state.editPetData.allergies;
  const idx = list.indexOf(a);
  if (idx >= 0) list.splice(idx,1); else list.push(a);
  document.querySelectorAll('#ep-allergy-tags .tag').forEach(el => { if (el.textContent.trim()===a) el.classList.toggle('selected', list.includes(a)); });
}

function toggleEditCondition(c) {
  const list = state.editPetData.chronicConditions;
  if (c === 'Ninguna') {
    state.editPetData.chronicConditions = list.includes('Ninguna') ? [] : ['Ninguna'];
  } else {
    state.editPetData.chronicConditions = list.filter(x => x !== 'Ninguna');
    const idx = state.editPetData.chronicConditions.indexOf(c);
    if (idx >= 0) state.editPetData.chronicConditions.splice(idx,1); else state.editPetData.chronicConditions.push(c);
  }
  document.querySelectorAll('#ep-condition-tags .tag').forEach(el => {
    el.classList.toggle('selected', state.editPetData.chronicConditions.includes(el.textContent.trim()));
  });
}

function toggleEditPersonality(t) {
  const tags = state.editPetData.personalityTags || (state.editPetData.personalityTags = []);
  const idx = tags.indexOf(t);
  if (idx >= 0) tags.splice(idx,1); else tags.push(t);
  document.querySelectorAll('#ep-personality-tags .tag').forEach(el => {
    if (el.textContent.trim() === t) el.classList.toggle('selected', tags.includes(t));
  });
}

function setEditActivity(level) {
  state.editPetData.activityLevel = level;
  [1,2,3].forEach(l => {
    const btn = document.getElementById('ep-act-'+l);
    if (btn) btn.className = `flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${l===level ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-brand-300'}`;
  });
}

function previewEditPhoto(e) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    state.editPetData.photo = ev.target.result;
    const preview = document.getElementById('ep-photo-preview');
    if (preview) preview.innerHTML = `<img src="${ev.target.result}" class="w-full h-full object-cover rounded-full" />`;
  };
  reader.readAsDataURL(file);
}

// ---- CONTROLADORES ----
async function handleLogin(e) {
  e.preventDefault();
  await login();
}

async function login() {
  const email = document.getElementById('l-email')?.value?.trim().toLowerCase();
  const pass  = document.getElementById('l-pass')?.value;
  if (!email || !pass) { showToast('Completa todos los campos', 'error'); return; }

  // Demo mode — bypass Supabase
  if (email === 'demo@mypets.cl') {
    loadDemoAndLogin(); return;
  }

  showToast('Iniciando sesión...', '');
  const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
  if (error) { showToast(error.message === 'Invalid login credentials' ? 'Email o contraseña incorrectos' : error.message, 'error'); return; }

  const userName = data.user.user_metadata?.name || email.split('@')[0];
  state.user = { name: userName, email, id: data.user.id };
  state.isLoggedIn = true;
  saveState();
  // Upsert defensivo: crea el perfil si nunca se creó (ej. trigger ausente) y
  // de paso hace backfill del email para cuentas creadas antes de guardarlo.
  await sb.from('profiles').upsert({ id: data.user.id, email, name: userName }, { onConflict: 'id' });
  await loadDataFromSupabase();
  showToast('¡Bienvenido! 👋', 'success');
  navigate('dashboard', {}, { replace: true });
}

async function handleRegister(e) {
  e.preventDefault();
  await register();
}

async function register() {
  const name  = document.getElementById('r-name')?.value?.trim();
  const email = document.getElementById('r-email')?.value?.trim().toLowerCase();
  const pass  = document.getElementById('r-pass')?.value;
  const pass2 = document.getElementById('r-pass2')?.value;

  if (!name || !email || !pass) { showToast('Completa todos los campos', 'error'); return; }
  if (pass !== pass2) { showToast('Las contraseñas no coinciden', 'error'); return; }
  if (pass.length < 6) { showToast('Mínimo 6 caracteres', 'error'); return; }

  showToast('Creando cuenta...', '');
  const { data, error } = await sb.auth.signUp({
    email, password: pass,
    options: { data: { name } }
  });
  if (error) {
    showToast(error.message === 'User already registered' ? 'Email ya registrado' : error.message, 'error');
    return;
  }

  state.user = { name, email, id: data.user?.id };
  state.isLoggedIn = true;
  state.pets = []; state.events = []; state.expenses = [];
  saveState();
  // profiles no guarda el email por defecto (vive en auth.users) — lo copiamos a
  // la propia fila (creándola vía upsert si no existía) para que el panel de
  // admin pueda mostrarlo sin acceso a auth.users.
  if (data.user?.id) await sb.from('profiles').upsert({ id: data.user.id, email, name }, { onConflict: 'id' });
  await loadDataFromSupabase();
  showToast('¡Cuenta creada! Bienvenido 🎉', 'success');
  navigate('dashboard', {}, { replace: true });
}

async function handleForgot() {
  await sendForgotEmail();
}

async function sendForgotEmail() {
  const email = document.getElementById('f-email')?.value?.trim().toLowerCase();
  if (!email) { showToast('Ingresa tu email', 'error'); return; }

  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '?reset=true'
  });
  if (error) { showToast(error.message, 'error'); return; }
  showToast(`Enlace enviado a ${email}`, 'success');
  setTimeout(() => navigate('login'), 2000);
}

async function logout() {
  await sb.auth.signOut();
  const fresh = { isLoggedIn: false, user: null, pets: [], events: [], expenses: [],
    currentView: 'login', currentPetId: null, currentTab: 'general',
    addPetStep: 1, newPetData: {}, pages: {} };
  Object.assign(state, fresh);
  localStorage.removeItem('mypets_v3');
  history.replaceState(null, '', ROUTE_PATHS.login);
  render();
}

function openPet(id) { navigate('petProfile', { currentPetId: id, currentTab: 'general' }); }
function setTab(t) { state.currentTab = t; render(); }

function cancelAddPet() {
  collectStepData();
  const hasProgress = Object.values(state.newPetData || {}).some(v => Array.isArray(v) ? v.length : v);
  if (hasProgress && !confirm('¿Salir sin guardar? Se perderá el progreso de esta mascota.')) return;
  state.newPetData = {}; state.addPetStep = 1;
  navigate('pets');
}

function prevStep() { if (state.addPetStep > 1) { collectStepData(); state.addPetStep--; render(); } }
function showFieldError(fieldId, errorId) {
  document.getElementById(fieldId)?.classList.add('border-red-400');
  document.getElementById(errorId)?.classList.remove('hidden');
  document.getElementById(fieldId)?.focus();
}

function clearFieldError(fieldId) {
  document.getElementById(fieldId)?.classList.remove('border-red-400');
  document.getElementById(fieldId + '-error')?.classList.add('hidden');
}

function nextStep() {
  collectStepData();
  if (state.addPetStep === 1 && !state.newPetData.name?.trim()) {
    showFieldError('pet-name', 'pet-name-error');
    return;
  }
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

async function savePet() {
  const d = state.newPetData;
  if (!d.name) { showToast('El nombre es requerido', 'error'); state.addPetStep = 1; render(); return; }
  showToast('Guardando...', '');
  const petData = {
    owner_id: state.user.id,
    name: d.name, species: d.species, breed: d.breed,
    date_of_birth: d.dateOfBirth || null, sex: d.sex, color: d.color,
    reproductive_status: d.reproductiveStatus, microchip: d.chipNumber,
    personality_tags: d.personalityTags || [],
    avatar_emoji: d.avatar || '', photo: d.photo || null,
    vet_name: d.vet?.name || '', vet_clinic: d.vet?.clinic || '',
    vet_phone: d.vet?.phone || '', vet_email: d.vet?.email || '',
    weight_kg: d.weightKg || null, weight_gr: d.weightGr || null,
    size_range: d.sizeRange || null, activity_level: d.activityLevel || 2,
    allergies: d.allergies || [], chronic_conditions: d.chronicConditions || [],
  };
  const { data: petRow, error } = await sb.from('pets').insert(petData).select().single();
  if (error) { showToast('Error al guardar mascota', 'error'); console.error(error); return; }
  await sb.from('pet_access').insert({ pet_id: petRow.id, user_id: state.user.id, role: 'owner' });
  const pet = {
    ...d, id: petRow.id,
    vaccines: [], deworming: [], medications: [], clinicalHistory: [],
    personalityTags: d.personalityTags || [], allergies: d.allergies || [],
    chronicConditions: d.chronicConditions || [], activityLevel: d.activityLevel || 2,
    weightHistory: [], moodLog: [], symptomsLog: [], meals: [], activities: [], doseLog: [],
    tutor2: null,
  };
  state.pets.push(pet);
  state.newPetData = {}; state.addPetStep = 1;
  // Si se completaron los datos del segundo tutor en el wizard, enviamos la invitación
  if (d.tutor2?.email) await createPetInvite(pet, d.tutor2);
  showToast(`${pet.name} registrado con éxito!`, 'success');
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
        <div class="mb-2 flex justify-center text-red-400">${icon('trash','w-12 h-12')}</div>
        <h3 class="text-lg font-bold text-gray-900">Eliminar a ${pet.name}</h3>
        <p class="text-sm text-gray-500 mt-1">
          ${hasTwoTutors
            ? `Esta mascota tiene 2 tutores. Solo se eliminará de <strong>tu perfil</strong>. El otro tutor mantendrá acceso.`
            : `Esta acción eliminará toda la información de <strong>${pet.name}</strong> permanentemente.`}
        </p>
      </div>
      <div id="delete-step-1">
        <div class="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-amber-700 mb-4">
          ${icon('warning','w-4 h-4 inline align-text-bottom')} Para confirmar, enviaremos un código de verificación a:<br/>
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
  showToast(`Código enviado a ${state.user?.email} (demo: ${code})`, 'success');
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

async function deletePet(petId) {
  const pet = state.pets.find(p => p.id === petId);
  const hasTwoTutors = pet?.tutor2?.name;
  if (hasTwoTutors) {
    if (!isDemoUser()) await sb.from('invitations').delete().eq('pet_id', petId);
    pet.tutor2 = null;
    showToast(`${pet.name} eliminada de tu perfil`, 'success');
  } else {
    if (!isDemoUser()) {
      const { error } = await sb.from('pets').delete().eq('id', petId);
      if (error) { showToast('Error al eliminar', 'error'); return; }
    }
    state.pets = state.pets.filter(p => p.id !== petId);
    showToast(`${pet?.name} eliminada`, 'error');
  }
  state.deleteCode = null; state.deletePetId = null;
  closeModal(); navigate('pets');
}

async function saveEditPet(petId) {
  const p = state.pets.find(x => x.id === petId);
  if (!p) return;
  const g = id => document.getElementById(id)?.value;
  const name = g('ep-name') || p.name;
  const species = g('ep-species') || p.species;
  const breed = g('ep-breed');
  const sex = g('ep-sex'), color = g('ep-color');
  const weightKg = g('ep-wkg') || null, weightGr = g('ep-wgr') || null;
  const dateOfBirth = g('ep-dob');
  const reproductiveStatus = g('ep-repro');
  const chipNumber = g('ep-chip');
  const vet = { name: g('ep-vet-name')||'', clinic: g('ep-vet-clinic')||'', phone: g('ep-vet-phone')||'', email: g('ep-vet-email')||'' };
  const sizeRange = g('ep-size');
  const allergies = state.editPetData?.allergies || p.allergies || [];
  const chronicConditions = state.editPetData?.chronicConditions || p.chronicConditions || [];
  const personalityTags = state.editPetData?.personalityTags || p.personalityTags || [];
  const activityLevel = state.editPetData?.activityLevel || p.activityLevel || 2;
  const photo = state.editPetData?.photo ?? p.photo ?? null;
  if (!isDemoUser()) {
    const { error } = await sb.from('pets').update({
      name, species, breed, date_of_birth: dateOfBirth || null, sex, color,
      reproductive_status: reproductiveStatus, microchip: chipNumber,
      weight_kg: weightKg, weight_gr: weightGr, size_range: sizeRange || null,
      activity_level: activityLevel, personality_tags: personalityTags,
      allergies, chronic_conditions: chronicConditions, photo,
      vet_name: vet.name, vet_clinic: vet.clinic, vet_phone: vet.phone, vet_email: vet.email,
    }).eq('id', petId);
    if (error) { showToast('Error al guardar', 'error'); console.error(error); return; }
  }
  Object.assign(p, { name, species, breed, dateOfBirth, sex, color, weightKg, weightGr,
    reproductiveStatus, chipNumber, sizeRange, activityLevel, personalityTags, photo,
    allergies, chronicConditions, vet });
  state.editPetData = null;
  closeModal(); render();
  showToast('Cambios guardados', 'success');
}

async function saveVaccine(e, petId) {
  e.preventDefault();
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;
  const g = id => document.getElementById(id)?.value;
  const date = g('v-date'), period = g('v-period');
  const nextDate = period ? addMonths(date, parseFloat(period)) : '';
  const vaccine = { name: g('v-name'), code: g('v-code'), date, periodicity: period,
    nextDate, alertType: g('v-alert'), alertDays: g('v-alert-days') || null, cost: g('v-cost') || null };
  pet.vaccines = pet.vaccines || [];
  if (isDemoUser()) {
    pet.vaccines.push({ id: genId(), ...vaccine });
  } else {
    const { data, error } = await sb.from('vaccines').insert({
      pet_id: petId, name: vaccine.name, code: vaccine.code, date,
      periodicity: period, next_date: nextDate,
      alert_type: vaccine.alertType, alert_days: vaccine.alertDays, cost: vaccine.cost
    }).select().single();
    if (error) { showToast('Error al guardar vacuna', 'error'); console.error(error); return; }
    pet.vaccines.push({ id: data.id, name: data.name, code: data.code, date: data.date,
      periodicity: data.periodicity, nextDate: data.next_date,
      alertType: data.alert_type, alertDays: data.alert_days, cost: data.cost });
  }
  closeModal(); render();
  showToast('Vacuna guardada', 'success');
}

async function deleteVaccine(petId, vId) {
  const pet = state.pets.find(p => p.id === petId);
  await sb.from('vaccines').delete().eq('id', vId);
  if (pet) { pet.vaccines = pet.vaccines.filter(v => v.id !== vId); render(); }
}

async function saveDeworming(e, petId) {
  e.preventDefault();
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;
  const g = id => document.getElementById(id)?.value;
  const date = g('d-date'), period = g('d-period'), format = g('d-format');
  const nextDate = period ? addMonths(date, parseFloat(period)) : '';
  const unitMap = { Comprimido:'Comprimido(s)', Pipeta:'ML', Collar:'Unidad(es)', Spray:'ML', Jarabe:'ML', Inyección:'ML' };
  const deworming = { product: g('d-product'), type: g('d-type'), format, dose: g('d-dose'),
    unit: unitMap[format] || '', date, periodicity: period,
    nextDate, alertType: g('d-alert'), alertDays: g('d-alert-days') || null, cost: g('d-cost') || null };
  pet.deworming = pet.deworming || [];
  if (isDemoUser()) {
    pet.deworming.push({ id: genId(), ...deworming });
  } else {
    const { data, error } = await sb.from('dewormings').insert({
      pet_id: petId, product: deworming.product, type: deworming.type, format: deworming.format,
      dose: deworming.dose, unit: deworming.unit, date,
      periodicity: period, next_date: nextDate,
      alert_type: deworming.alertType, alert_days: deworming.alertDays, cost: deworming.cost
    }).select().single();
    if (error) { showToast('Error al guardar desparasitación', 'error'); console.error(error); return; }
    pet.deworming.push({ id: data.id, product: data.product, type: data.type, format: data.format,
      dose: data.dose, unit: data.unit, date: data.date,
      periodicity: data.periodicity, nextDate: data.next_date,
      alertType: data.alert_type, alertDays: data.alert_days, cost: data.cost });
  }
  closeModal(); render();
  showToast('Desparasitación guardada', 'success');
}

async function deleteDeworming(petId, dId) {
  const pet = state.pets.find(p => p.id === petId);
  await sb.from('dewormings').delete().eq('id', dId);
  if (pet) { pet.deworming = pet.deworming.filter(d => d.id !== dId); render(); }
}

async function saveMedication(e, petId) {
  e.preventDefault();
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;
  const g = id => document.getElementById(id)?.value;
  const name = g('m-name'), doseVal = g('m-dose-val'), doseUnit = g('m-unit');
  const freqN = g('m-freq-n'), freqUnit = g('m-freq-unit');
  const startDate = g('m-start'), startTime = g('m-start-time');
  const treatmentDays = g('m-days') ? parseInt(g('m-days')) : null;
  const active = document.getElementById('m-active')?.checked ?? true;
  const cost = g('m-cost') || null;
  const stockTotal = g('m-stock-total') || null, stockUnit = g('m-stock-unit');
  const expiry = g('m-expiry') || null;
  const reminder = g('m-reminder');
  const frequency = freqN ? `Cada ${freqN} ${freqUnit === 'horas' ? 'horas' : 'días'}` : '';
  let endDate = null;
  if (treatmentDays && startDate) {
    const d = new Date(startDate + 'T12:00:00'); d.setDate(d.getDate() + treatmentDays);
    endDate = d.toISOString().slice(0,10);
  }
  const med = { name, doseVal, doseUnit, dose: `${doseVal||''} ${doseUnit||''}`.trim(),
    freqN, freqUnit, frequency, startDate, startTime, treatmentDays, endDate,
    active, reminder, stockTotal, stockUnit, expiry, cost };
  pet.medications = pet.medications || [];
  if (isDemoUser()) {
    pet.medications.push({ id: genId(), ...med });
  } else {
    const { data, error } = await sb.from('medications').insert({
      pet_id: petId, name, dose_val: doseVal || null, dose_unit: doseUnit,
      freq_n: freqN || null, freq_unit: freqUnit,
      start_date: startDate, start_time: startTime, treatment_days: treatmentDays, end_date: endDate,
      active, reminder, stock_qty: stockTotal, stock_unit: stockUnit, expiry_date: expiry, cost
    }).select().single();
    if (error) { showToast('Error al guardar medicamento', 'error'); console.error(error); return; }
    pet.medications.push({ id: data.id, ...med });
  }
  closeModal(); render();
  showToast('Medicamento guardado', 'success');
}

async function deleteMedication(petId, mId) {
  const pet = state.pets.find(p => p.id === petId);
  if (!isDemoUser()) await sb.from('medications').delete().eq('id', mId);
  if (pet) { pet.medications = pet.medications.filter(m => m.id !== mId); render(); }
}

async function markDoseTaken(petId) {
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;
  const today = todayStr();
  const activeMed = (pet.medications||[]).find(m => m.active);
  pet.doseLog = pet.doseLog || [];
  if (pet.doseLog.some(dl => dl.date === today && dl.given)) return;
  if (isDemoUser()) {
    pet.doseLog.push({ id: genId(), medicationId: activeMed?.id || null, date: today, given: true });
  } else {
    const { data, error } = await sb.from('dose_logs').insert({
      pet_id: petId, med_id: activeMed?.id || null, date: today, confirmed: true
    }).select().single();
    if (error) { showToast('Error al registrar la dosis', 'error'); console.error(error); return; }
    pet.doseLog.push({ id: data.id, medicationId: data.med_id, date: data.date, given: data.confirmed });
  }
  render();
  showToast('¡Dosis de hoy registrada!', 'success');
}

function previewHistoryFiles(input) {
  const preview = document.getElementById('h-files-preview');
  if (!preview) return;
  preview.innerHTML = '';
  Array.from(input.files).forEach(file => {
    const el = document.createElement('div');
    el.className = 'flex items-center gap-1.5 px-2 py-1 bg-brand-50 border border-brand-100 rounded-lg text-xs text-brand-700';
    el.textContent = `${file.name}`;
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
  const record = { title: g('h-title'), type: g('h-type'), date: g('h-date'),
    doctor: g('h-doctor'), clinic: g('h-clinic'), cost: g('h-cost') || null, notes: g('h-notes'), files };
  pet.clinicalHistory = pet.clinicalHistory || [];
  if (isDemoUser()) {
    pet.clinicalHistory.push({ id: genId(), ...record });
  } else {
    // `files` es text[] en la base — cada archivo se guarda como un string JSON
    const { data, error } = await sb.from('history_records').insert({
      pet_id: petId, title: record.title, type: record.type, date: record.date,
      vet: record.doctor, clinic: record.clinic, cost: record.cost, notes: record.notes,
      files: files.map(f => JSON.stringify(f))
    }).select().single();
    if (error) { showToast('Error al guardar', 'error'); console.error(error); return; }
    pet.clinicalHistory.push({ id: data.id, ...record });
  }
  closeModal(); render();
  showToast('Registro guardado', 'success');
}

async function deleteHistory(petId, hId) {
  const pet = state.pets.find(p => p.id === petId);
  if (!isDemoUser()) await sb.from('history_records').delete().eq('id', hId);
  if (pet) { pet.clinicalHistory = pet.clinicalHistory.filter(h => h.id !== hId); render(); }
}

async function saveEvent(e) {
  e.preventDefault();
  const g = id => document.getElementById(id)?.value;
  const { data, error } = await sb.from('events').insert({
    user_id: state.user.id,
    pet_id: g('ev-pet') || null,
    title: g('ev-title'), date: g('ev-date'), time: g('ev-time'),
    type: g('ev-type'), notes: g('ev-notes')
  }).select().single();
  if (error) { showToast('Error al guardar evento', 'error'); return; }
  state.events.push({ id: data.id, title: data.title, date: data.date, time: data.time,
    type: data.type, petId: data.pet_id, notes: data.notes });
  closeModal(); render();
  showToast('Evento guardado', 'success');
}

async function deleteEvent(id) {
  await sb.from('events').delete().eq('id', id);
  state.events = state.events.filter(e => e.id !== id); render();
}

async function saveExpense(e) {
  e.preventDefault();
  const g = id => document.getElementById(id)?.value;
  const { data, error } = await sb.from('expenses').insert({
    user_id: state.user.id,
    pet_id: g('ex-pet') || null,
    date: g('ex-date'), category: g('ex-cat'),
    amount: g('ex-amount'), description: g('ex-desc')
  }).select().single();
  if (error) { showToast('Error al guardar gasto', 'error'); return; }
  state.expenses.push({ id: data.id, petId: data.pet_id, date: data.date,
    category: data.category, amount: data.amount, description: data.description });
  closeModal(); render();
  showToast('Gasto guardado', 'success');
}

async function deleteExpense(id) {
  await sb.from('expenses').delete().eq('id', id);
  state.expenses = state.expenses.filter(e => e.id !== id); render();
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
    sched.innerHTML = times.map(t => `<span class="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-lg text-sm font-semibold text-brand-700 shadow-sm">${icon('clock','w-3.5 h-3.5')} ${t}</span>`).join('');
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
  const months = parseFloat(periodEl.value);
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
    input[type="date"]::-webkit-date-and-time-value{text-align:center;display:block;width:100%}
    input[type="date"]{text-align:center;text-align-last:center;min-width:0!important;max-width:100%!important;width:100%!important;box-sizing:border-box!important}
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
    @media print {
      .modal-overlay { position:static !important; background:none !important; overflow:visible !important; }
      .modal-box { box-shadow:none !important; max-height:none !important; border-radius:0 !important; }
      aside, nav, .modal-overlay > div > div:last-child { display:none !important; }
    }
  `;
  document.head.appendChild(style);
}

// ---- VISTA: BOTIQUÍN ----
function botiquinStatus(item) {
  const qty = Number(item.quantity || 0);
  if (qty <= 0) return 'agotado';
  if (qty <= 5) return 'por_agotarse';
  return 'disponible';
}

// Stock de un medicamento en tratamiento: si se puede inferir el consumo diario
// (frecuencia + dosis, en la misma unidad que el stock), calcula días restantes
// reales en vez de un umbral fijo de unidades ("5 comprimidos" no significa lo
// mismo para un tratamiento diario que para uno semanal).
function medStockDaysRemaining(m) {
  const stock = parseFloat(m.stockTotal);
  const freqN = parseFloat(m.freqN);
  if (!stock || stock <= 0 || !freqN) return null;
  const dosesPerDay = m.freqUnit === 'dias' ? 1 / freqN : 24 / freqN;
  const doseVal = parseFloat(m.doseVal) || 1;
  const sameUnit = (m.doseUnit || '').toLowerCase().replace(/\(s\)$/, '') === (m.stockUnit || '').toLowerCase().replace(/s$/, '');
  const consumptionPerDay = dosesPerDay * (sameUnit ? doseVal : 1);
  if (!consumptionPerDay) return null;
  return Math.floor(stock / consumptionPerDay);
}

function medStockStatus(m) {
  const stock = parseInt(m.stockTotal);
  if (!stock) return null;
  const days = medStockDaysRemaining(m);
  if (days == null) {
    // Sin datos suficientes para estimar consumo: umbral por unidades, como antes
    const level = stock <= 5 ? 'critico' : stock <= 15 ? 'bajo' : 'ok';
    return { level, label: `${stock} ${m.stockUnit || ''}`.trim(), pct: Math.min(100, stock / 30 * 100) };
  }
  const level = days <= 3 ? 'critico' : days <= 10 ? 'bajo' : 'ok';
  return { level, label: `~${days} día${days !== 1 ? 's' : ''} de stock`, pct: Math.min(100, days / 30 * 100), days };
}

function viewBotiquin() {
  const pets = state.pets;
  const allMeds = pets.flatMap(p => (p.medications||[]).map(m => ({ ...m, petName: p.name, petId: p.id })));
  const today = todayStr();
  const active = allMeds.filter(m => m.active);
  const expiringSoon = allMeds.filter(m => m.expiry && m.expiry <= daysFromNowStr(30));
  const lowStock = allMeds.filter(m => { const ms = medStockStatus(m); return ms && ms.level !== 'ok'; });
  const filterPet = state.botiquinFilter || '';
  const filterStatus = state.botiquinStatus || '';
  let displayed = allMeds.filter(m => !filterPet || m.petName === filterPet);
  if (filterStatus === 'active')   displayed = displayed.filter(m => m.active);
  if (filterStatus === 'expired')  displayed = displayed.filter(m => m.expiry && m.expiry < today);
  if (filterStatus === 'finished') displayed = displayed.filter(m => !m.active);

  const inventory = state.botiquin || [];
  const statusLabel = { disponible: 'Disponible', por_agotarse: 'Por agotarse', agotado: 'Agotado' };
  const statusColor = { disponible: 'bg-green-100 text-green-700', por_agotarse: 'bg-amber-100 text-amber-700', agotado: 'bg-red-100 text-red-600' };
  const invExpiringSoon = inventory.filter(i => i.expiryDate && i.expiryDate <= daysFromNowStr(30));
  const invLowStock = inventory.filter(i => botiquinStatus(i) !== 'disponible');

  const botTab = state.botiquinTab || 'inventario';

  const inventoryPanel = `
    <div class="bg-white rounded-2xl shadow-sm p-5">
      <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
        <p class="text-xs text-gray-400 max-w-md">Insumos y medicamentos que guardas en casa (no ligados a un tratamiento activo)</p>
        <button onclick="openBotiquinItemModal()" class="btn-primary text-sm">+ Agregar producto</button>
      </div>
      <div class="grid grid-cols-3 gap-3 mb-4">
        ${statCard(icon('box','w-5 h-5 md:w-6 md:h-6'),'Productos', inventory.length, 'brand')}
        ${statCard(icon('warning','w-5 h-5 md:w-6 md:h-6'),'Stock bajo', invLowStock.length, 'amber')}
        ${statCard(icon('calendar','w-5 h-5 md:w-6 md:h-6'),'Por vencer (30d)', invExpiringSoon.length, 'red')}
      </div>
      ${inventory.length === 0
        ? emptyState('kit','Sin productos en el inventario','Agrega vendas, jeringas u otros insumos que tengas en casa','+ Agregar producto',"openBotiquinItemModal()")
        : `<div class="divide-y divide-gray-50">
             ${inventory.map(item => {
               const st = botiquinStatus(item);
               const isExpired = item.expiryDate && item.expiryDate < today;
               return `
               <div class="flex items-center gap-3 py-3">
                 <div class="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 flex-shrink-0">${icon('kit','w-4.5 h-4.5')}</div>
                 <div class="flex-1 min-w-0">
                   <div class="flex items-center gap-2 flex-wrap">
                     <span class="font-medium text-gray-900 text-sm">${item.name}</span>
                     ${item.category ? `<span class="badge bg-gray-100 text-gray-500 text-xs">${item.category}</span>` : ''}
                     <span class="badge text-xs ${statusColor[st]}">${statusLabel[st]}</span>
                   </div>
                   <div class="text-xs mt-0.5 text-gray-400">
                     ${item.quantity ?? 0} ${item.unit||''}
                     ${item.expiryDate ? ` · <span class="${isExpired?'text-red-500':'text-gray-400'}">${isExpired?'Venció':'Vence'} ${formatDate(item.expiryDate)}</span>` : ''}
                   </div>
                 </div>
                 <div class="flex items-center gap-1 flex-shrink-0">
                   <button onclick="openBotiquinItemModal('${item.id}')" title="Editar"
                     class="w-8 h-8 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 flex items-center justify-center transition-colors">
                     ${icon('pencil','w-3.5 h-3.5')}
                   </button>
                   <button onclick="deleteBotiquinItem('${item.id}')" title="Eliminar"
                     class="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors">
                     ${icon('trash','w-3.5 h-3.5')}
                   </button>
                 </div>
               </div>`;
             }).join('')}
           </div>`}
    </div>`;

  const treatmentsPanel = `
    ${pets.length > 0 ? `
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger">
      ${statCard(icon('pill','w-5 h-5 md:w-6 md:h-6'),'Total', allMeds.length, 'brand')}
      ${statCard(icon('checkCircle','w-5 h-5 md:w-6 md:h-6'),'Activos', active.length, 'teal')}
      ${statCard(icon('warning','w-5 h-5 md:w-6 md:h-6'),'Stock bajo', lowStock.length, 'amber')}
      ${statCard(icon('calendar','w-5 h-5 md:w-6 md:h-6'),'Por vencer (30d)', expiringSoon.length, 'red')}
    </div>` : ''}

    ${expiringSoon.length > 0 ? `
    <div class="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6">
      <h3 class="font-semibold text-amber-700 mb-2 text-sm flex items-center gap-1.5">${icon('warning','w-4 h-4')} Próximos a vencer (30 días)</h3>
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
        <p class="text-xs text-gray-400">Tratamientos activos por mascota</p>
        <div class="flex items-center gap-2 flex-wrap">
          ${pets.length === 0 ? `
          <select disabled title="Registra una mascota para filtrar" class="input-field text-sm py-1.5 w-auto text-gray-400 bg-gray-50 cursor-not-allowed">
            <option>Registra una mascota para filtrar</option>
          </select>` : `
          <select onchange="state.botiquinFilter=this.value;render()" class="input-field text-sm py-1.5 w-auto">
            <option value="">Todas las mascotas</option>
            ${pets.map(p => `<option ${filterPet===p.name?'selected':''}>${p.name}</option>`).join('')}
          </select>
          <select onchange="state.botiquinStatus=this.value;render()" class="input-field text-sm py-1.5 w-auto">
            <option value="">Todos los estados</option>
            <option value="active" ${filterStatus==='active'?'selected':''}>Activos</option>
            <option value="finished" ${filterStatus==='finished'?'selected':''}>Finalizados</option>
            <option value="expired" ${filterStatus==='expired'?'selected':''}>Vencidos</option>
          </select>`}
        </div>
      </div>

      ${(() => {
        const { items: dispPage, total: dispTotal, pages: dispPages, page: dispPage_ } = paginate(displayed, 'botiquin');
        if (pets.length === 0) return emptyState('paw','Sin mascotas registradas','Registra tu primera mascota para empezar a llevar sus tratamientos','+ Registrar mascota',"navigate('addPet')");
        return dispTotal === 0
          ? emptyState('pill','Sin medicamentos','Agrega tratamientos desde el perfil de cada mascota')
          : `<div class="divide-y divide-gray-50">
               ${dispPage.map(m => {
               const isExpired     = m.expiry && m.expiry < today;
               const isExpiringSoon = m.expiry && !isExpired && m.expiry <= daysFromNowStr(30);
               return `
               <div class="flex items-center gap-3 py-3">
                 <div class="w-9 h-9 rounded-xl ${m.active?'bg-brand-50 text-brand-600':'bg-gray-50 text-gray-400'} flex items-center justify-center flex-shrink-0">${icon('pill','w-4.5 h-4.5')}</div>
                 <div class="flex-1 min-w-0">
                   <div class="flex items-center gap-2 flex-wrap">
                     <span class="font-medium text-gray-900 text-sm">${m.name}</span>
                     <span class="badge bg-brand-50 text-brand-600 text-xs">${m.petName}</span>
                     ${m.active ? '<span class="badge bg-green-100 text-green-700 text-xs">Activo</span>' : '<span class="badge bg-gray-100 text-gray-400 text-xs">Finalizado</span>'}
                   </div>
                   <div class="text-xs mt-0.5 ${isExpired?'text-red-500':isExpiringSoon?'text-amber-500':'text-gray-400'}">
                     ${m.expiry ? `${isExpired?'Venció':'Vence'}: ${formatDate(m.expiry)}` : '<span class="text-gray-300">Sin vencimiento</span>'}
                   </div>
                 </div>
                 <button onclick="openPet('${m.petId}');setTab('medicamentos')"
                   class="text-xs text-brand-600 hover:underline whitespace-nowrap flex-shrink-0">Ver detalle →</button>
               </div>`;
             }).join('')}
             </div>
             ${pagerHTML('botiquin', dispPages, dispPage_)}`;
      })()}
    </div>`;

  return appShell(`
    ${pageHeader('Botiquín', 'Inventario del hogar y medicamentos de todas tus mascotas')}

    <div class="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
      <button onclick="state.botiquinTab='inventario';render()" class="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${botTab==='inventario'?'bg-white text-gray-900 shadow-sm':'text-gray-500 hover:text-gray-700'}">
        ${icon('kit','w-4 h-4')} Inventario
      </button>
      <button onclick="state.botiquinTab='tratamientos';render()" class="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${botTab==='tratamientos'?'bg-white text-gray-900 shadow-sm':'text-gray-500 hover:text-gray-700'}">
        ${icon('pill','w-4 h-4')} Tratamientos
      </button>
    </div>

    ${botTab === 'inventario' ? inventoryPanel : treatmentsPanel}
  `);
}

function openBotiquinItemModal(itemId) {
  const item = itemId ? (state.botiquin||[]).find(i => i.id === itemId) : null;
  const categories = ['Medicamento','Vendaje','Higiene','Alimento','Accesorio','Otro'];
  const units = ['unidades','comprimidos','ml','mg','cajas','frascos'];
  openModal(`
    <div class="modal-box p-4 sm:p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">${item ? icon('pencil','w-5 h-5') : icon('kit','w-5 h-5')} ${item ? 'Editar producto' : 'Agregar producto al botiquín'}</h3>
      <form onsubmit="saveBotiquinItem(event${item ? `,'${item.id}'` : ''})" class="space-y-3">
        <div><label class="form-label">Nombre *</label><input id="bq-name" required value="${item?.name||''}" placeholder="Ej: Vendas elásticas" class="input-field" /></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="form-label">Categoría</label>
            <select id="bq-category" class="input-field">${categories.map(c=>`<option ${c===item?.category?'selected':''}>${c}</option>`).join('')}</select>
          </div>
          <div><label class="form-label">Mascota (opcional)</label>
            <select id="bq-pet" class="input-field">
              <option value="">General</option>
              ${state.pets.map(p=>`<option value="${p.id}" ${p.id===item?.petId?'selected':''}>${p.name}</option>`).join('')}
            </select>
          </div>
          <div><label class="form-label">Cantidad *</label><input id="bq-qty" type="number" min="0" step="0.1" required value="${item?.quantity??''}" class="input-field" /></div>
          <div><label class="form-label">Unidad</label>
            <select id="bq-unit" class="input-field">${units.map(u=>`<option ${u===item?.unit?'selected':''}>${u}</option>`).join('')}</select>
          </div>
        </div>
        <div><label class="form-label">Fecha de caducidad (opcional)</label><input id="bq-expiry" type="date" value="${item?.expiryDate||''}" class="input-field" /></div>
        <div><label class="form-label">Notas</label><textarea id="bq-notes" rows="2" class="input-field resize-none">${item?.notes||''}</textarea></div>
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button type="submit" class="btn-primary flex-1">Guardar</button>
        </div>
      </form>
    </div>`);
}

async function saveBotiquinItem(e, itemId) {
  e.preventDefault();
  const g = id => document.getElementById(id)?.value;
  const name = g('bq-name'), category = g('bq-category'), petId = g('bq-pet') || null;
  const quantity = parseFloat(g('bq-qty') || 0), unit = g('bq-unit');
  const expiryDate = g('bq-expiry') || null, notes = g('bq-notes');
  const status = botiquinStatus({ quantity });
  state.botiquin = state.botiquin || [];
  if (isDemoUser()) {
    if (itemId) {
      const item = state.botiquin.find(i => i.id === itemId);
      if (item) Object.assign(item, { name, category, petId, quantity, unit, expiryDate, notes, status });
    } else {
      state.botiquin.push({ id: genId(), name, category, petId, quantity, unit, expiryDate, notes, status });
    }
  } else if (itemId) {
    const { error } = await sb.from('botiquin_items').update({
      name, type: category, pet_id: petId, quantity, unit, expiry_date: expiryDate, notes
    }).eq('id', itemId);
    if (error) { showToast('Error al guardar', 'error'); console.error(error); return; }
    const item = state.botiquin.find(i => i.id === itemId);
    if (item) Object.assign(item, { name, category, petId, quantity, unit, expiryDate, notes, status });
  } else {
    const { data, error } = await sb.from('botiquin_items').insert({
      user_id: state.user.id, name, type: category, pet_id: petId, quantity, unit, expiry_date: expiryDate, notes
    }).select().single();
    if (error) { showToast('Error al guardar', 'error'); console.error(error); return; }
    state.botiquin.push({ id: data.id, petId: data.pet_id, name: data.name, category: data.type,
      quantity: data.quantity, unit: data.unit, expiryDate: data.expiry_date, notes: data.notes, status });
  }
  closeModal(); render();
  showToast('Producto guardado', 'success');
}

async function deleteBotiquinItem(itemId) {
  if (!isDemoUser()) await sb.from('botiquin_items').delete().eq('id', itemId);
  state.botiquin = (state.botiquin||[]).filter(i => i.id !== itemId);
  render();
}

// ---- TAB: SEGUIMIENTO ----
function tabSeguimiento(pet) {
  const today = todayStr();
  const history = pet.weightHistory || [];
  const moodLog = pet.moodLog || [];
  const symptomsLog = pet.symptomsLog || [];

  // Mood for last 7 days
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    last7Days.push(d.toISOString().slice(0, 10));
  }
  const moodColors = { great: 'bg-green-400', ok: 'bg-amber-400', low: 'bg-red-400' };
  const moodEmojis = { great: '😄', ok: '😐', low: '😟' };
  const moodLabels = { great: 'Excelente', ok: 'Normal', low: 'Bajo' };
  const todayMood = moodLog.find(m => m.date === today);

  // BCS description
  const bcs = pet.bcs || null;
  let bcsDesc = '', bcsColor = '';
  if (bcs) {
    if (bcs <= 3) { bcsDesc = 'Bajo peso'; bcsColor = 'text-red-600 bg-red-50'; }
    else if (bcs <= 5) { bcsDesc = 'Peso ideal'; bcsColor = 'text-green-600 bg-green-50'; }
    else if (bcs <= 7) { bcsDesc = 'Sobrepeso'; bcsColor = 'text-amber-600 bg-amber-50'; }
    else { bcsDesc = 'Obesidad'; bcsColor = 'text-red-700 bg-red-100'; }
  }

  const hasWeight = history.length > 0;

  setTimeout(() => { if (hasWeight) renderWeightChart(pet); }, 50);

  return `
  <div class="space-y-4">
    <!-- Gráfico de peso -->
    <div class="bg-white rounded-2xl shadow-sm p-4 md:p-5">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-gray-800 flex items-center gap-1.5">${icon('chartBar','w-4 h-4')} Peso histórico</h3>
        <button onclick="openWeightModal('${pet.id}')" class="btn-primary text-sm">+ Registrar peso</button>
      </div>
      ${hasWeight ? `
        <canvas id="weight-chart-${pet.id}" height="180"></canvas>
        <div class="mt-2 text-xs text-gray-400 text-center">Últimas ${Math.min(history.length, 12)} mediciones</div>
      ` : `
        <div class="text-center py-6">
          <div class="mb-2 flex justify-center text-gray-300">${icon('weight','w-10 h-10')}</div>
          <p class="text-sm text-gray-400">Sin registros de peso. ¡Añade el primero!</p>
        </div>
      `}
    </div>

    <!-- BCS -->
    <div class="bg-white rounded-2xl shadow-sm p-4 md:p-5">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-gray-800 flex items-center gap-1.5">${icon('weight','w-4 h-4')} Índice condición corporal (BCS)</h3>
      </div>
      <div class="flex gap-2 flex-wrap mb-3">
        ${[1,2,3,4,5,6,7,8,9].map(n => `
          <button onclick="setBCS('${pet.id}',${n})"
            class="w-9 h-9 rounded-xl border-2 text-sm font-bold transition-all ${bcs===n ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-brand-300'}">
            ${n}
          </button>`).join('')}
      </div>
      ${bcs ? `
        <div class="flex items-center gap-2">
          <span class="font-bold text-2xl text-gray-800">BCS ${bcs}/9</span>
          <span class="px-3 py-1 rounded-xl text-sm font-semibold ${bcsColor}">${bcsDesc}</span>
        </div>
        <p class="text-xs text-gray-400 mt-1">Escala 1-3: Bajo peso · 4-5: Peso ideal · 6-7: Sobrepeso · 8-9: Obesidad</p>
      ` : `<p class="text-sm text-gray-400">Selecciona un valor del 1 al 9</p>`}
    </div>

    <!-- Mood tracker -->
    <div class="bg-white rounded-2xl shadow-sm p-4 md:p-5">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-gray-800">😊 Estado de ánimo</h3>
        <button onclick="openMoodModal('${pet.id}')" class="btn-primary text-sm">${todayMood ? 'Editar hoy' : '+ Registrar hoy'}</button>
      </div>
      ${todayMood ? `
        <div class="flex items-center gap-2 mb-3 p-3 bg-gray-50 rounded-xl">
          <span class="text-2xl">${moodEmojis[todayMood.mood]}</span>
          <div>
            <div class="font-medium text-sm text-gray-800">Hoy: ${moodLabels[todayMood.mood]}</div>
            ${todayMood.notes ? `<div class="text-xs text-gray-500">${todayMood.notes}</div>` : ''}
          </div>
        </div>
      ` : `<p class="text-xs text-gray-400 mb-3">Aún no registraste el estado de hoy</p>`}
      <div class="flex gap-1.5 items-end">
        ${last7Days.map(d => {
          const entry = moodLog.find(m => m.date === d);
          const isToday = d === today;
          return `
          <div class="flex flex-col items-center gap-1 flex-1">
            <div title="${entry ? moodLabels[entry.mood] : 'Sin dato'}"
              class="w-full rounded-xl ${entry ? moodColors[entry.mood] : 'bg-gray-100'} transition-all"
              style="height:${entry ? (entry.mood==='great'?32:entry.mood==='ok'?24:16) : 10}px"></div>
            <div class="text-[9px] text-gray-400">${isToday ? 'Hoy' : new Date(d+'T12:00:00').toLocaleDateString('es-CL',{weekday:'short'}).slice(0,3)}</div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- Síntomas -->
    <div class="bg-white rounded-2xl shadow-sm p-4 md:p-5">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-gray-800 flex items-center gap-1.5">${icon('heart','w-4 h-4')} Diario de síntomas</h3>
        <button onclick="openSymptomsModal('${pet.id}')" class="btn-primary text-sm">+ Registrar</button>
      </div>
      ${symptomsLog.length === 0
        ? `<div class="text-center py-4"><div class="mb-2 flex justify-center text-gray-300">${icon('heart','w-8 h-8')}</div><p class="text-sm text-gray-400">Sin registros de síntomas</p></div>`
        : `<div class="space-y-2">
             ${[...symptomsLog].sort((a,b)=>b.date>a.date?1:-1).slice(0,5).map(s => `
               <div class="p-3 bg-gray-50 rounded-xl">
                 <div class="flex items-center gap-2 flex-wrap mb-1">
                   <span class="text-xs text-gray-400">${formatDate(s.date)}</span>
                   ${(s.symptoms||[]).map(sym => `<span class="px-2 py-0.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium">${sym}</span>`).join('')}
                 </div>
                 ${s.notes ? `<p class="text-xs text-gray-600">${s.notes}</p>` : ''}
               </div>`).join('')}
           </div>`}
    </div>
  </div>`;
}

// ---- TAB: NUTRICIÓN ----
function tabNutricion(pet) {
  const meals = pet.meals || [];
  const activities = pet.activities || [];
  const today = todayStr();

  // Last 7 days for meals
  const last7MealDays = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    last7MealDays.push(d.toISOString().slice(0, 10));
  }

  // Agrupar comidas por fecha (últimos 7 días)
  const mealsByDate = {};
  meals.forEach(m => { if (!mealsByDate[m.date]) mealsByDate[m.date] = []; mealsByDate[m.date].push(m); });
  const recentMealDates = last7MealDays.filter(d => mealsByDate[d]).reverse();

  // Activity weekly summary
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().slice(0, 10);
  const recentActivities = activities.filter(a => a.date >= weekAgoStr).sort((a,b) => b.date>a.date?1:-1);
  const totalMinutes = recentActivities.reduce((s, a) => s + (parseInt(a.duration)||0), 0);
  const totalWalks = recentActivities.filter(a => a.type === 'Paseo').length;
  const actTypeIcon = { Paseo:'activity', Juego:'activity', Ejercicio:'activity', Natación:'activity', Otro:'bolt' };

  return `
  <div class="space-y-4">
    <!-- Alimentación -->
    <div class="bg-white rounded-2xl shadow-sm p-4 md:p-5">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-gray-800 flex items-center gap-1.5">${icon('food','w-4 h-4')} Registro de alimentación</h3>
        <button onclick="openMealModal('${pet.id}')" class="btn-primary text-sm">+ Registrar comida</button>
      </div>
      ${meals.length === 0
        ? `<div class="text-center py-6"><div class="mb-2 flex justify-center text-gray-300">${icon('food','w-10 h-10')}</div><p class="text-sm text-gray-400">Sin registros de alimentación</p></div>`
        : recentMealDates.length === 0
          ? `<div class="text-center py-4"><p class="text-sm text-gray-400">Sin comidas registradas esta semana</p></div>`
          : `<div class="space-y-3">
               ${recentMealDates.map(date => `
                 <div>
                   <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">${formatDate(date)}</div>
                   <div class="space-y-1.5">
                     ${mealsByDate[date].map(m => `
                       <div class="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                         <div class="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500">${icon('food','w-4 h-4')}</div>
                         <div class="flex-1 min-w-0">
                           <span class="text-sm font-medium text-gray-800">${m.time} · ${m.type}</span>
                           <span class="text-xs text-gray-400 ml-2">${m.amount} ${m.unit}</span>
                           ${m.notes ? `<div class="text-xs text-gray-500">${m.notes}</div>` : ''}
                         </div>
                       </div>`).join('')}
                   </div>
                 </div>`).join('')}
             </div>`}
    </div>

    <!-- Actividad -->
    <div class="bg-white rounded-2xl shadow-sm p-4 md:p-5">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-gray-800 flex items-center gap-1.5">${icon('activity','w-4 h-4')} Registro de actividad</h3>
        <button onclick="openActivityModal('${pet.id}')" class="btn-primary text-sm">+ Registrar actividad</button>
      </div>
      ${recentActivities.length > 0 ? `
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="bg-brand-50 rounded-xl p-3 text-center">
            <div class="text-xl font-bold text-brand-700">${totalMinutes} min</div>
            <div class="text-xs text-gray-500">Total esta semana</div>
          </div>
          <div class="bg-teal-50 rounded-xl p-3 text-center">
            <div class="text-xl font-bold text-teal-700">${totalWalks}</div>
            <div class="text-xs text-gray-500">Paseos esta semana</div>
          </div>
        </div>` : ''}
      ${activities.length === 0
        ? `<div class="text-center py-6"><div class="mb-2 flex justify-center text-gray-300">${icon('activity','w-10 h-10')}</div><p class="text-sm text-gray-400">Sin registros de actividad</p></div>`
        : `<div class="space-y-2">
             ${[...activities].sort((a,b)=>b.date>a.date?1:-1).slice(0,7).map(a => `
               <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                 <div class="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">${icon(actTypeIcon[a.type]||'bolt','w-4.5 h-4.5')}</div>
                 <div class="flex-1 min-w-0">
                   <div class="flex items-center gap-2">
                     <span class="text-sm font-medium text-gray-800">${a.type}</span>
                     <span class="text-xs text-gray-400">${a.duration} min${a.distance ? ` · ${a.distance} km` : ''}</span>
                   </div>
                   <div class="text-xs text-gray-400">${formatDate(a.date)}${a.notes ? ` · ${a.notes}` : ''}</div>
                 </div>
               </div>`).join('')}
           </div>`}
    </div>
  </div>`;
}

// ---- WEIGHT CHART ----
function renderWeightChart(pet) {
  setTimeout(() => {
    const canvas = document.getElementById(`weight-chart-${pet.id}`);
    if (!canvas) return;
    if (window._weightCharts && window._weightCharts[pet.id]) {
      window._weightCharts[pet.id].destroy();
    }
    if (!window._weightCharts) window._weightCharts = {};
    const history = (pet.weightHistory || []).slice(-12);
    if (history.length === 0) return;
    window._weightCharts[pet.id] = new Chart(canvas, {
      type: 'line',
      data: {
        labels: history.map(h => formatDate(h.date)),
        datasets: [{
          label: 'Peso (kg)',
          data: history.map(h => parseFloat(h.kg) + (parseInt(h.gr||0)/1000)),
          borderColor: '#7c3aed',
          backgroundColor: 'rgba(124,58,237,0.08)',
          tension: 0.4, fill: true,
          pointBackgroundColor: '#7c3aed', pointRadius: 4,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: false, grid: { color: '#f3f4f6' } },
          x: { grid: { display: false } }
        }
      }
    });
  }, 100);
}

// ---- BCS setter ----
function setBCS(petId, score) {
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;
  pet.bcs = score;
  saveState(); render();
}

// ---- MODAL: Peso ----
function openWeightModal(petId) {
  const today = todayStr();
  openModal(`
    <div class="modal-box p-4 sm:p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">${icon('weight','w-5 h-5')} Registrar peso</h3>
      <form onsubmit="saveWeight(event,'${petId}')" class="space-y-3">
        <div>
          <label class="form-label">Fecha *</label>
          <input id="wt-date" type="date" required value="${today}" class="input-field" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label">Kg *</label>
            <input id="wt-kg" type="number" required min="0" step="0.1" placeholder="Ej: 12" class="input-field" />
          </div>
          <div>
            <label class="form-label">Gramos (0-999)</label>
            <input id="wt-gr" type="number" min="0" max="999" step="1" placeholder="Ej: 500" class="input-field" />
          </div>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button type="submit" class="btn-primary flex-1">Guardar</button>
        </div>
      </form>
    </div>`);
}

async function saveWeight(e, petId) {
  e.preventDefault();
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;
  const g = id => document.getElementById(id)?.value;
  const kg = parseFloat(g('wt-kg') || 0);
  const gr = parseInt(g('wt-gr') || 0);
  const date = g('wt-date');
  const { data, error } = await sb.from('weight_history').insert({
    pet_id: petId, date, kg, gr
  }).select().single();
  if (error) { showToast('Error al guardar peso', 'error'); return; }
  pet.weightHistory = pet.weightHistory || [];
  pet.weightHistory.push({ id: data.id, date: data.date, kg: data.kg, gr: data.gr, notes: data.notes });
  pet.weightHistory.sort((a, b) => a.date > b.date ? 1 : -1);
  closeModal(); render();
  showToast('Peso registrado ✓', 'success');
}

// ---- MODAL: Mood ----
function openMoodModal(petId) {
  const today = todayStr();
  const pet = state.pets.find(p => p.id === petId);
  const existing = (pet?.moodLog || []).find(m => m.date === today);
  openModal(`
    <div class="modal-box p-4 sm:p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4">😊 Estado de ánimo de hoy</h3>
      <div class="space-y-4">
        <div class="grid grid-cols-3 gap-3">
          ${[{v:'great',e:'😄',l:'Excelente'},{v:'ok',e:'😐',l:'Normal'},{v:'low',e:'😟',l:'Bajo'}].map(o => `
            <button type="button" onclick="selectMood('${o.v}')" id="mood-${o.v}"
              class="py-4 rounded-2xl border-2 text-center transition-all ${existing?.mood===o.v ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'}">
              <div class="text-3xl mb-1">${o.e}</div>
              <div class="text-xs font-semibold text-gray-700">${o.l}</div>
            </button>`).join('')}
        </div>
        <input type="hidden" id="mood-val" value="${existing?.mood||''}" />
        <div>
          <label class="form-label">Notas (opcional)</label>
          <textarea id="mood-notes" rows="2" class="input-field resize-none" placeholder="¿Cómo se comportó hoy?">${existing?.notes||''}</textarea>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button onclick="saveMood('${petId}')" class="btn-primary flex-1">Guardar</button>
        </div>
      </div>
    </div>`);
  // Highlight existing selection
  if (existing?.mood) {
    setTimeout(() => selectMood(existing.mood), 50);
  }
}

function selectMood(val) {
  document.getElementById('mood-val').value = val;
  ['great','ok','low'].forEach(o => {
    const btn = document.getElementById('mood-'+o);
    if (btn) btn.className = `py-4 rounded-2xl border-2 text-center transition-all ${o===val ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'}`;
  });
}

async function saveMood(petId) {
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;
  const mood = document.getElementById('mood-val')?.value;
  if (!mood) { showToast('Selecciona un estado de ánimo', 'error'); return; }
  const notes = document.getElementById('mood-notes')?.value || '';
  const today = todayStr();
  // Remove existing entry for today if any, then insert new one
  const existing = (pet.moodLog || []).find(m => m.date === today);
  pet.moodLog = (pet.moodLog || []).filter(m => m.date !== today);
  if (isDemoUser()) {
    pet.moodLog.push({ id: genId(), date: today, mood, notes });
  } else {
    if (existing?.id) {
      await sb.from('mood_logs').delete().eq('id', existing.id);
    }
    const { data, error } = await sb.from('mood_logs').insert({
      pet_id: petId, date: today, mood, notes
    }).select().single();
    if (error) { showToast('Error al guardar estado de ánimo', 'error'); return; }
    pet.moodLog.push({ id: data.id, date: data.date, mood: data.mood, energy: data.energy, notes: data.notes });
  }
  closeModal(); render();
  showToast('Estado de ánimo registrado ✓', 'success');
}

// ---- MODAL: Síntomas ----
const SYMPTOM_TAGS = ['Vómito','Diarrea','Sin apetito','Letargo','Tos','Estornudos','Cojera','Rascado','Otros'];

function openSymptomsModal(petId) {
  const today = todayStr();
  openModal(`
    <div class="modal-box p-4 sm:p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">${icon('heart','w-5 h-5')} Registrar síntomas</h3>
      <div class="space-y-3">
        <div>
          <label class="form-label">Fecha *</label>
          <input id="sym-date" type="date" value="${today}" class="input-field" />
        </div>
        <div>
          <label class="form-label">Síntomas (selecciona uno o más)</label>
          <div class="flex flex-wrap gap-2 mt-1" id="sym-tags">
            ${SYMPTOM_TAGS.map(s => `
              <button type="button" onclick="toggleSymptomTag(this,'${s}')"
                data-tag="${s}"
                class="px-3 py-1.5 rounded-xl border-2 text-xs font-medium transition-all border-gray-200 text-gray-600 hover:border-brand-300">
                ${s}
              </button>`).join('')}
          </div>
        </div>
        <div>
          <label class="form-label">Notas (opcional)</label>
          <textarea id="sym-notes" rows="2" class="input-field resize-none" placeholder="Observaciones..."></textarea>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button onclick="saveSymptoms('${petId}')" class="btn-primary flex-1">Guardar</button>
        </div>
      </div>
    </div>`);
}

function toggleSymptomTag(btn, tag) {
  btn.classList.toggle('border-brand-500');
  btn.classList.toggle('bg-brand-50');
  btn.classList.toggle('text-brand-700');
  btn.classList.toggle('border-gray-200');
}

async function saveSymptoms(petId) {
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;
  const selected = [...document.querySelectorAll('#sym-tags button.border-brand-500')].map(b => b.dataset.tag);
  if (!selected.length) { showToast('Selecciona al menos un síntoma', 'error'); return; }
  const date = document.getElementById('sym-date')?.value;
  const notes = document.getElementById('sym-notes')?.value || '';
  pet.symptomsLog = pet.symptomsLog || [];
  if (isDemoUser()) {
    pet.symptomsLog.push({ id: genId(), date, symptoms: selected, notes });
  } else {
    const { data, error } = await sb.from('symptoms_logs').insert({
      pet_id: petId, date, symptoms: selected, notes
    }).select().single();
    if (error) { showToast('Error al guardar síntomas', 'error'); return; }
    pet.symptomsLog.push({ id: data.id, date: data.date, symptoms: data.symptoms, severity: data.severity, notes: data.notes });
  }
  closeModal(); render();
  showToast('Síntomas registrados ✓', 'success');
}

// ---- MODAL: Comida ----
function openMealModal(petId) {
  const today = todayStr();
  openModal(`
    <div class="modal-box p-4 sm:p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">${icon('food','w-5 h-5')} Registrar comida</h3>
      <form onsubmit="saveMeal(event,'${petId}')" class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label">Fecha *</label>
            <input id="ml-date" type="date" required value="${today}" class="input-field" />
          </div>
          <div>
            <label class="form-label">Momento del día</label>
            <select id="ml-time" class="input-field">
              <option>Mañana</option><option>Mediodía</option><option>Tarde</option><option>Noche</option>
            </select>
          </div>
        </div>
        <div>
          <label class="form-label">Tipo de alimento *</label>
          <select id="ml-type" class="input-field">
            <option>Seco</option><option>Húmedo</option><option>BARF</option><option>Casero</option><option>Snack</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label">Cantidad *</label>
            <input id="ml-amount" type="number" required min="0" step="0.1" placeholder="Ej: 150" class="input-field" />
          </div>
          <div>
            <label class="form-label">Unidad</label>
            <select id="ml-unit" class="input-field">
              <option value="g">g</option><option value="ml">ml</option><option value="porción">porción</option>
            </select>
          </div>
        </div>
        <div>
          <label class="form-label">Notas (opcional)</label>
          <input id="ml-notes" placeholder="Ej: Royal Canin Adult" class="input-field" />
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button type="submit" class="btn-primary flex-1">Guardar</button>
        </div>
      </form>
    </div>`);
}

async function saveMeal(e, petId) {
  e.preventDefault();
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;
  const g = id => document.getElementById(id)?.value;
  const date = g('ml-date'), time = g('ml-time'), food = g('ml-type');
  const portion = parseFloat(g('ml-amount') || 0), portionUnit = g('ml-unit'), notes = g('ml-notes');
  pet.meals = pet.meals || [];
  if (isDemoUser()) {
    pet.meals.push({ id: genId(), date, time, food, portion, portionUnit, notes });
  } else {
    const { data, error } = await sb.from('meals').insert({
      pet_id: petId, date, time_of_day: time, type: food, amount: portion, unit: portionUnit, notes
    }).select().single();
    if (error) { showToast('Error al guardar comida', 'error'); console.error(error); return; }
    pet.meals.push({ id: data.id, date: data.date, time: data.time_of_day, food: data.type,
      portion: data.amount, portionUnit: data.unit, notes: data.notes });
  }
  closeModal(); render();
  showToast('Comida registrada ✓', 'success');
}

// ---- MODAL: Actividad ----
function openActivityModal(petId) {
  const today = todayStr();
  openModal(`
    <div class="modal-box p-4 sm:p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">${icon('activity','w-5 h-5')} Registrar actividad</h3>
      <form onsubmit="saveActivity(event,'${petId}')" class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label">Fecha *</label>
            <input id="ac-date" type="date" required value="${today}" class="input-field" />
          </div>
          <div>
            <label class="form-label">Tipo *</label>
            <select id="ac-type" class="input-field">
              <option>Paseo</option><option>Juego</option><option>Ejercicio</option><option>Natación</option><option>Otro</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label">Duración (min) *</label>
            <input id="ac-duration" type="number" required min="1" placeholder="Ej: 30" class="input-field" />
          </div>
          <div>
            <label class="form-label">Distancia (km, opcional)</label>
            <input id="ac-distance" type="number" min="0" step="0.1" placeholder="Ej: 2.5" class="input-field" />
          </div>
        </div>
        <div>
          <label class="form-label">Notas (opcional)</label>
          <input id="ac-notes" placeholder="Ej: Parque Las Lilas" class="input-field" />
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button type="submit" class="btn-primary flex-1">Guardar</button>
        </div>
      </form>
    </div>`);
}

async function saveActivity(e, petId) {
  e.preventDefault();
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;
  const g = id => document.getElementById(id)?.value;
  const date = g('ac-date'), type = g('ac-type');
  const duration = parseInt(g('ac-duration') || 0);
  const distance = g('ac-distance') ? parseFloat(g('ac-distance')) : null;
  const notes = g('ac-notes');
  pet.activities = pet.activities || [];
  if (isDemoUser()) {
    pet.activities.push({ id: genId(), date, type, duration, distance, notes });
  } else {
    const { data, error } = await sb.from('activities').insert({
      pet_id: petId, date, type, duration, distance, notes
    }).select().single();
    if (error) { showToast('Error al guardar actividad', 'error'); return; }
    pet.activities.push({ id: data.id, date: data.date, type: data.type, duration: data.duration, distance: data.distance, notes: data.notes });
  }
  closeModal(); render();
  showToast('Actividad registrada ✓', 'success');
}

// ---- EXPORT PET RECORD ----
function exportPetRecord(petId) {
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;
  const activeVaccines = (pet.vaccines || []).filter(v => v.nextDate && v.nextDate >= todayStr()).slice(0,5);
  const activeMeds = (pet.medications || []).filter(m => m.active).slice(0,5);
  const lastHistory = [...(pet.clinicalHistory || [])].sort((a,b)=>b.date>a.date?1:-1).slice(0,5);
  const vet = pet.vet || {};

  openModal(`
    <div class="modal-box p-4 sm:p-6" id="export-record">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">${icon('document','w-5 h-5')} Expediente médico — ${pet.name}</h3>
        <button onclick="closeModal()" class="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center">✕</button>
      </div>

      <div id="printable-record">
        <div class="border-b border-gray-200 pb-4 mb-4">
          <h4 class="font-bold text-gray-800 text-lg">${pet.name}</h4>
          <p class="text-sm text-gray-500">${pet.species} · ${pet.breed||'Mestizo'} · ${pet.sex||''} · ${getAge(pet.dateOfBirth)}</p>
          ${pet.chipNumber ? `<p class="text-xs text-gray-400">Chip: ${pet.chipNumber}</p>` : ''}
          ${pet.reproductiveStatus ? `<p class="text-xs text-gray-400">${pet.reproductiveStatus}</p>` : ''}
          ${(pet.allergies||[]).length ? `<p class="text-xs text-red-500 font-medium">Alergias: ${pet.allergies.join(', ')}</p>` : ''}
          ${(pet.chronicConditions||[]).filter(c=>c!=='Ninguna').length ? `<p class="text-xs text-orange-600 font-medium">Condiciones: ${pet.chronicConditions.join(', ')}</p>` : ''}
        </div>

        ${vet.name ? `
        <div class="mb-4">
          <h5 class="font-semibold text-gray-700 text-sm mb-2">Veterinario</h5>
          <p class="text-sm text-gray-600">${vet.name}${vet.clinic ? ` · ${vet.clinic}` : ''}</p>
          ${vet.phone ? `<p class="text-xs text-gray-400 flex items-center gap-1">${icon('phone','w-3 h-3')} ${vet.phone}</p>` : ''}
          ${vet.email ? `<p class="text-xs text-gray-400 flex items-center gap-1">${icon('mail','w-3 h-3')} ${vet.email}</p>` : ''}
        </div>` : ''}

        ${activeVaccines.length ? `
        <div class="mb-4">
          <h5 class="font-semibold text-gray-700 text-sm mb-2">Vacunas vigentes</h5>
          <div class="space-y-1">
            ${activeVaccines.map(v => `<div class="text-xs bg-blue-50 rounded-lg p-2"><span class="font-medium">${v.name}</span> · Próxima: ${formatDate(v.nextDate)}</div>`).join('')}
          </div>
        </div>` : ''}

        ${activeMeds.length ? `
        <div class="mb-4">
          <h5 class="font-semibold text-gray-700 text-sm mb-2">Medicamentos activos</h5>
          <div class="space-y-1">
            ${activeMeds.map(m => `<div class="text-xs bg-green-50 rounded-lg p-2"><span class="font-medium">${m.name}</span> · ${m.dose} · ${m.frequency}</div>`).join('')}
          </div>
        </div>` : ''}

        ${lastHistory.length ? `
        <div class="mb-4">
          <h5 class="font-semibold text-gray-700 text-sm mb-2">Últimos eventos clínicos</h5>
          <div class="space-y-1">
            ${lastHistory.map(h => `<div class="text-xs bg-gray-50 rounded-lg p-2"><span class="font-medium">${formatDate(h.date)}</span> · ${h.title}${h.doctor ? ` · ${h.doctor}` : ''}</div>`).join('')}
          </div>
        </div>` : ''}

        <p class="text-xs text-gray-300 text-right mt-4">Generado por MyPets 3.0 · ${new Date().toLocaleDateString('es-CL')}</p>
      </div>

      <div class="flex gap-3 pt-4 border-t border-gray-100 mt-4">
        <button onclick="closeModal()" class="btn-secondary flex-1">Cerrar</button>
        <button onclick="window.print()" class="btn-primary flex-1 flex items-center justify-center gap-1.5">${icon('printer','w-4 h-4')} Imprimir / Guardar PDF</button>
      </div>
    </div>`);
}

// ---- RENDER ----
function render() {
  const app = document.getElementById('app');
  const v = state.currentView;
  if (!state.isLoggedIn && !AUTH_VIEWS.includes(v)) { navigate('login', {}, { replace: true }); return; }
  if (state.isLoggedIn && AUTH_VIEWS.includes(v)) { navigate('dashboard', {}, { replace: true }); return; }
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
  else if (v === 'admin')        { if (state.user?.isAdmin) { loadAdminData().then(() => { app.innerHTML = viewAdmin(); }); } else navigate('dashboard', {}, { replace: true }); }
  else navigate('dashboard', {}, { replace: true });
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
    weightHistory: [
      { date: dt(2026,1,15), kg: 12, gr: 200 }, { date: dt(2026,2,1), kg: 12, gr: 500 },
      { date: dt(2026,2,15), kg: 12, gr: 800 }, { date: dt(2026,3,1), kg: 13, gr: 0 },
      { date: dt(2026,3,15), kg: 12, gr: 900 }, { date: dt(2026,4,1), kg: 12, gr: 700 },
      { date: dt(2026,4,15), kg: 12, gr: 600 }, { date: dt(2026,5,1), kg: 12, gr: 500 },
      { date: dt(2026,5,12), kg: 12, gr: 400 },
    ],
    moodLog: [
      { date: dt(2026,5,9), mood: 'great', notes: 'Muy activa en el parque' },
      { date: dt(2026,5,10), mood: 'ok', notes: '' },
      { date: dt(2026,5,11), mood: 'low', notes: 'Comió poco' },
      { date: dt(2026,5,12), mood: 'ok', notes: 'Mejorando' },
      { date: dt(2026,5,13), mood: 'great', notes: '' },
      { date: dt(2026,5,14), mood: 'great', notes: 'Jugó toda la tarde' },
    ],
    symptomsLog: [
      { date: dt(2026,5,11), symptoms: ['Sin apetito','Letargo'], notes: 'Posiblemente por el antibiótico' },
      { date: dt(2026,5,9), symptoms: ['Rascado'], notes: 'Se rasca la pata derecha' },
    ],
    meals: [
      { date: dt(2026,5,14), time: 'Mañana', type: 'Seco', amount: 120, unit: 'g', notes: 'Royal Canin Adult' },
      { date: dt(2026,5,14), time: 'Noche', type: 'Seco', amount: 120, unit: 'g', notes: '' },
      { date: dt(2026,5,13), time: 'Mañana', type: 'Seco', amount: 120, unit: 'g', notes: '' },
      { date: dt(2026,5,13), time: 'Noche', type: 'Húmedo', amount: 100, unit: 'g', notes: 'Lata prémium' },
    ],
    activities: [
      { date: dt(2026,5,14), type: 'Paseo', duration: 45, distance: 3.2, notes: 'Parque Las Lilas' },
      { date: dt(2026,5,13), type: 'Juego', duration: 20, distance: null, notes: 'Pelota en el jardín' },
      { date: dt(2026,5,12), type: 'Paseo', duration: 30, distance: 2.1, notes: '' },
      { date: dt(2026,5,11), type: 'Paseo', duration: 25, distance: 1.8, notes: 'Día corto por lluvia' },
      { date: dt(2026,5,10), type: 'Paseo', duration: 50, distance: 3.8, notes: '' },
    ],
    doseLog: [
      { date: dt(2026,5,8), given: true }, { date: dt(2026,5,9), given: true },
      { date: dt(2026,5,10), given: true }, { date: dt(2026,5,11), given: true },
      { date: dt(2026,5,12), given: true }, { date: dt(2026,5,13), given: true },
      { date: dt(2026,5,14), given: true },
    ],
    bcs: 5,
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
    weightHistory: [
      { date: dt(2026,1,15), kg: 3, gr: 600 }, { date: dt(2026,2,1), kg: 3, gr: 700 },
      { date: dt(2026,2,15), kg: 3, gr: 750 }, { date: dt(2026,3,1), kg: 3, gr: 800 },
      { date: dt(2026,3,15), kg: 3, gr: 800 }, { date: dt(2026,4,1), kg: 3, gr: 750 },
      { date: dt(2026,4,15), kg: 3, gr: 700 }, { date: dt(2026,5,1), kg: 3, gr: 680 },
      { date: dt(2026,5,12), kg: 3, gr: 650 },
    ],
    moodLog: [
      { date: dt(2026,5,9), mood: 'ok', notes: 'Normal, durmió mucho' },
      { date: dt(2026,5,10), mood: 'ok', notes: '' },
      { date: dt(2026,5,11), mood: 'great', notes: 'Jugó con el ratón de peluche' },
      { date: dt(2026,5,12), mood: 'ok', notes: '' },
      { date: dt(2026,5,13), mood: 'great', notes: 'Muy activa' },
      { date: dt(2026,5,14), mood: 'ok', notes: 'Tranquila' },
    ],
    symptomsLog: [
      { date: dt(2026,5,10), symptoms: ['Estornudos'], notes: 'Algunos estornudos por la mañana' },
    ],
    meals: [
      { date: dt(2026,5,14), time: 'Mañana', type: 'Seco', amount: 40, unit: 'g', notes: 'Royal Canin Siamese' },
      { date: dt(2026,5,14), time: 'Noche', type: 'Húmedo', amount: 85, unit: 'g', notes: 'Lata sabor salmón' },
      { date: dt(2026,5,13), time: 'Mañana', type: 'Seco', amount: 40, unit: 'g', notes: '' },
      { date: dt(2026,5,13), time: 'Noche', type: 'Húmedo', amount: 85, unit: 'g', notes: '' },
    ],
    activities: [
      { date: dt(2026,5,14), type: 'Juego', duration: 15, distance: null, notes: 'Ratón de peluche' },
      { date: dt(2026,5,13), type: 'Juego', duration: 20, distance: null, notes: 'Pluma interactiva' },
      { date: dt(2026,5,12), type: 'Juego', duration: 10, distance: null, notes: '' },
      { date: dt(2026,5,11), type: 'Ejercicio', duration: 25, distance: null, notes: 'Persiguió el laser' },
      { date: dt(2026,5,10), type: 'Juego', duration: 15, distance: null, notes: '' },
    ],
    doseLog: [
      { date: dt(2026,5,10), given: true }, { date: dt(2026,5,11), given: true },
      { date: dt(2026,5,12), given: true }, { date: dt(2026,5,13), given: true },
      { date: dt(2026,5,14), given: true },
    ],
    bcs: 4,
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
    weightHistory: [
      { date: dt(2026,1,15), kg: 1, gr: 150 }, { date: dt(2026,2,1), kg: 1, gr: 180 },
      { date: dt(2026,2,15), kg: 1, gr: 200 }, { date: dt(2026,3,1), kg: 1, gr: 210 },
      { date: dt(2026,3,15), kg: 1, gr: 220 }, { date: dt(2026,4,1), kg: 1, gr: 200 },
      { date: dt(2026,5,1), kg: 1, gr: 190 }, { date: dt(2026,5,12), kg: 1, gr: 180 },
    ],
    moodLog: [
      { date: dt(2026,5,12), mood: 'great', notes: 'Corrió por toda la habitación' },
      { date: dt(2026,5,13), mood: 'ok', notes: '' },
      { date: dt(2026,5,14), mood: 'great', notes: 'Comió bien todos sus pellets' },
    ],
    symptomsLog: [],
    meals: [
      { date: dt(2026,5,14), time: 'Mañana', type: 'Seco', amount: 30, unit: 'g', notes: 'Pellets + heno Timothy' },
      { date: dt(2026,5,14), time: 'Noche', type: 'Casero', amount: 1, unit: 'porción', notes: 'Zanahoria y perejil' },
      { date: dt(2026,5,13), time: 'Mañana', type: 'Seco', amount: 30, unit: 'g', notes: '' },
    ],
    activities: [
      { date: dt(2026,5,14), type: 'Juego', duration: 30, distance: null, notes: 'Hora libre en la sala' },
      { date: dt(2026,5,13), type: 'Juego', duration: 20, distance: null, notes: 'Exploró la terraza' },
      { date: dt(2026,5,12), type: 'Juego', duration: 25, distance: null, notes: 'Corrió y saltó mucho' },
    ],
    doseLog: [],
    bcs: 5,
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
    botiquin: [
      { id: genId(), name: 'Vendas elásticas', category: 'Vendaje', petId: null, quantity: 3, unit: 'unidades', expiryDate: null, notes: '', status: 'disponible' },
      { id: genId(), name: 'Jeringas 5ml', category: 'Accesorio', petId: null, quantity: 4, unit: 'unidades', expiryDate: dt(2027,3,1), notes: '', status: 'por_agotarse' },
      { id: genId(), name: 'Suero fisiológico', category: 'Higiene', petId: null, quantity: 0, unit: 'frascos', expiryDate: dt(2026,10,1), notes: 'Reponer en próxima compra', status: 'agotado' },
    ],
  };

  Object.assign(state, demoState);
  saveState();
  showToast('Datos de prueba cargados (3 años)', 'success');
  navigate('dashboard', {}, { replace: true });
}

// ---- EDITAR VACUNA ----
function openEditVaccineModal(petId, vaccineId) {
  const pet = state.pets.find(p => p.id === petId);
  const v = pet?.vaccines?.find(x => x.id === vaccineId);
  if (!v) return;
  const vaccines = VACCINES_BY_SPECIES[pet.species] || VACCINES_BY_SPECIES['Otro'];
  openModal(`
    <div class="modal-box p-4 sm:p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">${icon('pencil','w-5 h-5')} Editar Vacuna</h3>
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
        <div>
          <label class="form-label">¿Cuándo recibir la alerta?</label>
          <div class="grid grid-cols-3 gap-2 mt-1">
            ${[{v:'same',l:'El mismo día'},{v:'week',l:'1 sem antes'},{v:'custom',l:'Personalizado'}].map(o => `
              <button type="button" onclick="selectEditVaccineAlert('${o.v}')" id="eva-${o.v}"
                class="py-2.5 px-1 rounded-xl border-2 text-xs font-medium transition-all text-center leading-tight
                ${(v.alertType||'same')===o.v ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-brand-300'}">
                ${o.l}
              </button>`).join('')}
          </div>
          <input type="hidden" id="ev-alert" value="${v.alertType||'same'}" />
          <div id="eva-custom-field" class="${(v.alertType||'same')==='custom'?'':'hidden'} mt-2">
            <label class="form-label">Días de anticipación</label>
            <input id="ev-alert-days" type="number" min="1" max="365" value="${v.alertDays||''}" placeholder="Ej: 15" class="input-field" />
          </div>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button type="submit" class="btn-primary flex-1">Guardar cambios</button>
        </div>
      </form>
    </div>`);
}

function selectEditVaccineAlert(val) {
  document.getElementById('ev-alert').value = val;
  ['same','week','custom'].forEach(o => {
    const btn = document.getElementById('eva-'+o);
    if (btn) btn.className = `py-2.5 px-1 rounded-xl border-2 text-xs font-medium transition-all text-center leading-tight ${o===val ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500 hover:border-brand-300'}`;
  });
  const cf = document.getElementById('eva-custom-field');
  if (cf) cf.classList.toggle('hidden', val !== 'custom');
}

async function saveEditVaccine(e, petId, vaccineId) {
  e.preventDefault();
  const pet = state.pets.find(p => p.id === petId);
  const v = pet?.vaccines?.find(x => x.id === vaccineId);
  if (!v) return;
  const g = id => document.getElementById(id)?.value;
  const date = g('ev-date'), period = g('ev-period');
  const name = g('ev-name'), code = g('ev-code'), cost = g('ev-cost') || null;
  const alertType = g('ev-alert'), alertDays = g('ev-alert-days') || null;
  const nextDate = period ? addMonths(date, parseFloat(period)) : '';
  if (!isDemoUser()) {
    const { error } = await sb.from('vaccines').update({
      name, code, date, periodicity: period, next_date: nextDate, cost,
      alert_type: alertType, alert_days: alertDays
    }).eq('id', vaccineId);
    if (error) { showToast('Error al guardar cambios', 'error'); console.error(error); return; }
  }
  v.name = name; v.code = code; v.date = date;
  v.periodicity = period; v.nextDate = nextDate;
  v.cost = cost; v.alertType = alertType; v.alertDays = alertDays;
  closeModal(); render();
  showToast('Vacuna actualizada ✓', 'success');
}

// ---- EDITAR DESPARASITACIÓN ----
function openEditDewormModal(petId, dewormId) {
  const pet = state.pets.find(p => p.id === petId);
  const d = pet?.deworming?.find(x => x.id === dewormId);
  if (!d) return;
  openModal(`
    <div class="modal-box p-4 sm:p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">${icon('pencil','w-5 h-5')} Editar Desparasitación</h3>
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
        <div>
          <label class="form-label">¿Cuándo recibir la alerta?</label>
          <div class="grid grid-cols-3 gap-2 mt-1">
            ${[{v:'same',l:'El mismo día'},{v:'week',l:'1 sem antes'},{v:'custom',l:'Personalizado'}].map(o => `
              <button type="button" onclick="selectEditDewormAlert('${o.v}')" id="eda-${o.v}"
                class="py-2.5 px-1 rounded-xl border-2 text-xs font-medium transition-all text-center leading-tight
                ${(d.alertType||'same')===o.v ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500 hover:border-teal-300'}">
                ${o.l}
              </button>`).join('')}
          </div>
          <input type="hidden" id="edw-alert" value="${d.alertType||'same'}" />
          <div id="eda-custom-field" class="${(d.alertType||'same')==='custom'?'':'hidden'} mt-2">
            <label class="form-label">Días de anticipación</label>
            <input id="edw-alert-days" type="number" min="1" max="365" value="${d.alertDays||''}" placeholder="Ej: 15" class="input-field" />
          </div>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button type="submit" class="btn-primary flex-1">Guardar cambios</button>
        </div>
      </form>
    </div>`);
}

function selectEditDewormAlert(val) {
  document.getElementById('edw-alert').value = val;
  ['same','week','custom'].forEach(o => {
    const btn = document.getElementById('eda-'+o);
    if (btn) btn.className = `py-2.5 px-1 rounded-xl border-2 text-xs font-medium transition-all text-center leading-tight ${o===val ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500 hover:border-teal-300'}`;
  });
  const cf = document.getElementById('eda-custom-field');
  if (cf) cf.classList.toggle('hidden', val !== 'custom');
}

async function saveEditDeworming(e, petId, dewormId) {
  e.preventDefault();
  const pet = state.pets.find(p => p.id === petId);
  const d = pet?.deworming?.find(x => x.id === dewormId);
  if (!d) return;
  const g = id => document.getElementById(id)?.value;
  const product = g('edw-product'), type = g('edw-type'), format = g('edw-format');
  const dose = g('edw-dose'), date = g('edw-date'), cost = g('edw-cost') || null;
  const alertType = g('edw-alert'), alertDays = g('edw-alert-days') || null;
  if (!isDemoUser()) {
    const { error } = await sb.from('dewormings').update({
      product, type, format, dose, date, cost, alert_type: alertType, alert_days: alertDays
    }).eq('id', dewormId);
    if (error) { showToast('Error al guardar cambios', 'error'); console.error(error); return; }
  }
  d.product = product; d.type = type;
  d.format = format; d.dose = dose;
  d.date = date; d.cost = cost;
  d.alertType = alertType; d.alertDays = alertDays;
  closeModal(); render();
  showToast('Desparasitación actualizada ✓', 'success');
}

// ---- EDITAR MEDICAMENTO/TRATAMIENTO ----
function openEditMedModal(petId, medId) {
  const pet = state.pets.find(p => p.id === petId);
  const m = pet?.medications?.find(x => x.id === medId);
  if (!m) return;
  openModal(`
    <div class="modal-box p-4 sm:p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">${icon('pencil','w-5 h-5')} Editar Tratamiento</h3>
      <form onsubmit="saveEditMedication(event,'${petId}','${medId}')" class="space-y-3">
        <div><label class="form-label">Medicamento *</label><input id="em-name" required value="${m.name||''}" class="input-field" /></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="form-label">Dosis</label><input id="em-dose-val" type="number" step="0.1" value="${m.doseVal||''}" class="input-field" /></div>
          <div><label class="form-label">Unidad</label>
            <select id="em-unit" class="input-field">
              ${['mg','ml','Comprimido(s)','Gotas','UI'].map(u => `<option ${u===m.doseUnit?'selected':''}>${u}</option>`).join('')}
            </select>
          </div>
        </div>
        <div>
          <label class="form-label">Frecuencia</label>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-400 font-medium whitespace-nowrap flex-shrink-0">Cada</span>
            <input id="em-freq-n" type="number" min="1" max="72" value="${m.freqN||''}" class="input-field !w-16 text-center flex-shrink-0" />
            <select id="em-freq-unit" class="input-field flex-1">
              <option value="horas" ${m.freqUnit==='horas'?'selected':''}>Horas</option>
              <option value="dias" ${m.freqUnit==='dias'?'selected':''}>Días</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="form-label">Fecha inicio</label><input id="em-start" type="date" value="${m.startDate||''}" class="input-field" /></div>
          <div><label class="form-label">Días tratamiento</label><input id="em-days" type="number" min="1" value="${m.treatmentDays||''}" class="input-field" /></div>
          <div><label class="form-label">Fecha caducidad</label><input id="em-expiry" type="date" value="${m.expiry||''}" class="input-field" /></div>
          <div><label class="form-label">Costo (CLP)</label><input id="em-cost" type="number" min="0" value="${m.cost||''}" class="input-field" /></div>
        </div>
        <div class="flex items-center gap-2">
          <input type="checkbox" id="em-active" ${m.active?'checked':''} class="rounded text-brand-500" />
          <label for="em-active" class="text-sm text-gray-700">Tratamiento activo</label>
        </div>
        <hr class="border-gray-100" />
        <div>
          <label class="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-2">${icon('box','w-4 h-4')} Stock del medicamento <span class="text-gray-400 font-normal">(opcional)</span></label>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="form-label">Cantidad total</label><input id="em-stock-total" type="number" min="0" value="${m.stockTotal||''}" class="input-field" /></div>
            <div><label class="form-label">Unidad</label>
              <select id="em-stock-unit" class="input-field">
                ${['Comprimidos','ml','mg','Ampollas','Frascos'].map(u => `<option ${u===m.stockUnit?'selected':''}>${u}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button>
          <button type="submit" class="btn-primary flex-1">Guardar cambios</button>
        </div>
      </form>
    </div>`);
}

async function saveEditMedication(e, petId, medId) {
  e.preventDefault();
  const pet = state.pets.find(p => p.id === petId);
  const m = pet?.medications?.find(x => x.id === medId);
  if (!m) return;
  const g = id => document.getElementById(id)?.value;
  const days = parseInt(g('em-days') || 0);
  const startDate = g('em-start');
  const name = g('em-name'), doseVal = g('em-dose-val'), doseUnit = g('em-unit');
  const freqN = g('em-freq-n'), freqUnit = g('em-freq-unit');
  const frequency = freqN ? `Cada ${freqN} ${freqUnit === 'horas' ? 'horas' : 'días'}` : '';
  const expiry = g('em-expiry') || null, cost = g('em-cost') || null;
  const stockTotal = g('em-stock-total') || null, stockUnit = g('em-stock-unit');
  const active = document.getElementById('em-active')?.checked;
  let endDate = m.endDate || null;
  if (days && startDate) {
    const d = new Date(startDate + 'T12:00:00'); d.setDate(d.getDate() + days);
    endDate = d.toISOString().slice(0,10);
  }
  if (!isDemoUser()) {
    const { error } = await sb.from('medications').update({
      name, dose_val: doseVal || null, dose_unit: doseUnit,
      freq_n: freqN || null, freq_unit: freqUnit,
      start_date: startDate, treatment_days: days || null, end_date: endDate,
      expiry_date: expiry, cost, active, stock_qty: stockTotal, stock_unit: stockUnit
    }).eq('id', medId);
    if (error) { showToast('Error al guardar cambios', 'error'); console.error(error); return; }
  }
  m.name = name;
  m.doseVal = doseVal; m.doseUnit = doseUnit;
  m.dose = `${doseVal||''} ${doseUnit||''}`.trim();
  m.freqN = freqN; m.freqUnit = freqUnit; m.frequency = frequency;
  m.startDate = startDate; m.treatmentDays = days;
  m.endDate = endDate;
  m.expiry = expiry; m.cost = cost;
  m.active = active; m.stockTotal = stockTotal; m.stockUnit = stockUnit;
  closeModal(); render();
  showToast('Tratamiento actualizado ✓', 'success');
}

// ---- EDITAR HISTORIAL ----
function openEditHistoryModal(petId, histId) {
  const pet = state.pets.find(p => p.id === petId);
  const h = pet?.clinicalHistory?.find(x => x.id === histId);
  if (!h) return;
  openModal(`
    <div class="modal-box p-4 sm:p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">${icon('pencil','w-5 h-5')} Editar evento clínico</h3>
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
                ${icon('paperclip','w-3 h-3 inline align-text-bottom')} ${f.name}
                <button type="button" onclick="removeHistoryFile('${petId}','${histId}',${fi})" class="ml-1 text-red-400 hover:text-red-600">✕</button>
              </div>`).join('')}
          </div>
        </div>` : ''}
        <div>
          <label class="form-label flex items-center gap-1">${icon('paperclip','w-3.5 h-3.5')} Agregar más archivos</label>
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
    el.textContent = `${file.name}`;
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
  const title = g('eh-title'), type = g('eh-type'), date = g('eh-date');
  const doctor = g('eh-doctor'), clinic = g('eh-clinic'), cost = g('eh-cost') || null, notes = g('eh-notes');
  const files = [...(h.files||[]), ...newFiles];
  if (!isDemoUser()) {
    const { error } = await sb.from('history_records').update({
      title, type, date, vet: doctor, clinic, cost, notes,
      files: files.map(f => JSON.stringify(f))
    }).eq('id', histId);
    if (error) { showToast('Error al guardar cambios', 'error'); console.error(error); return; }
  }
  h.title = title; h.type = type; h.date = date; h.doctor = doctor;
  h.clinic = clinic; h.cost = cost; h.notes = notes; h.files = files;
  closeModal(); render();
  showToast('Evento actualizado ✓', 'success');
}

// ---- SEGUNDO TUTOR ----
function openInviteTutor2Modal(petId) {
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;
  openModal(`
    <div class="modal-box p-4 sm:p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">${icon('users','w-5 h-5')} Invitar Segundo Tutor</h3>
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
          <button type="submit" class="btn-primary flex-1 flex items-center justify-center gap-1.5">${icon('mail','w-4 h-4')} Enviar invitación</button>
        </div>
      </form>
    </div>`);
}

// Crea la invitación (tabla invitations) y dispara el magic link de Supabase.
// Se usa tanto desde el wizard de alta (paso 4) como desde el botón "+ Invitar"
// del perfil de la mascota. En modo demo no hay sesión real de Supabase, así que
// solo simulamos el estado "pendiente" localmente.
async function createPetInvite(pet, { name, email, role }) {
  if (isDemoUser()) {
    pet.tutor2 = { name, email, role, pending: true };
    showToast(`Invitación simulada para ${email} (modo demo)`, 'success');
    return true;
  }
  const token = genId() + genId();
  const link = `${location.origin}${location.pathname}?invite=${token}`;
  const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
  const { error: inviteError } = await sb.from('invitations').insert({
    token, pet_id: pet.id, pet_name: pet.name, inviter_id: state.user.id,
    invited_email: email, invited_name: name, role, used: false, expires_at: expiresAt,
  });
  if (inviteError) { showToast('Error al crear la invitación', 'error'); console.error(inviteError); return false; }
  // Enviado vía Supabase Auth (magic link) en vez de un tercero: requiere SMTP
  // configurado en el proyecto de Supabase (Auth → Emails → SMTP Settings).
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: link,
      data: { invited_name: name, pet_name: pet.name, inviter_name: state.user?.name || '', role },
    },
  });
  if (error) { showToast('Error al enviar el correo de invitación', 'error'); console.error(error); return false; }
  pet.tutor2 = { name, email, role, pending: true };
  showToast(`Invitación enviada a ${email}`, 'success');
  return true;
}

// Se ejecuta cuando alguien llega a la app desde el link del magic link (?invite=TOKEN).
// El magic link ya autentica a la persona invitada — solo falta darle acceso a la mascota.
async function acceptPetInvite(token) {
  const { data: invite, error } = await sb.from('invitations').select('*').eq('token', token).eq('used', false).maybeSingle();
  if (error || !invite) return;
  if ((invite.invited_email || '').toLowerCase() !== (state.user?.email || '').toLowerCase()) {
    showToast('Esta invitación fue enviada a otro correo', 'error');
    return;
  }
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    showToast('Esta invitación ya expiró', 'error');
    return;
  }
  const { error: accessError } = await sb.from('pet_access').insert({
    pet_id: invite.pet_id, user_id: state.user.id, role: invite.role === 'edicion' ? 'editor' : 'viewer'
  });
  if (accessError) { showToast('No se pudo aceptar la invitación', 'error'); console.error(accessError); return; }
  await sb.from('invitations').update({ used: true }).eq('token', token);
  showToast(`🎉 Ahora tienes acceso a ${invite.pet_name}`, 'success');
  await loadDataFromSupabase();
}

async function sendTutor2Invite(e, petId) {
  e.preventDefault();
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;
  const name  = document.getElementById('t2-inv-name')?.value?.trim();
  const email = document.getElementById('t2-inv-email')?.value?.trim().toLowerCase();
  const role  = document.getElementById('t2-inv-role')?.value;
  const ok = await createPetInvite(pet, { name, email, role });
  if (ok) { closeModal(); render(); }
}

async function removeTutor2(petId) {
  const pet = state.pets.find(p => p.id === petId);
  if (!pet) return;
  if (!confirm(`¿Quitar a ${pet.tutor2?.name} como segundo tutor de ${pet.name}?`)) return;
  if (!isDemoUser()) {
    await sb.from('invitations').delete().eq('pet_id', petId).eq('invited_email', pet.tutor2.email);
    if (!pet.tutor2.pending) {
      // Ya había aceptado la invitación: también se le quita el acceso a la mascota
      await sb.from('pet_access').delete().eq('pet_id', petId).neq('user_id', state.user.id);
    }
  }
  pet.tutor2 = null; render();
  showToast('Segundo tutor eliminado', 'success');
}

// ---- VISTA ADMINISTRADOR ----
function viewAdmin() {
  if (!state.user?.isAdmin) { navigate('dashboard', {}, { replace: true }); return ''; }
  const ad = state.adminData || { profiles: [], pets: [] };
  const profiles = ad.profiles;
  const allPets  = ad.pets;

  const planColors = {
    free:   'bg-gray-100 text-gray-600',
    basic:  'bg-blue-100 text-blue-700',
    pro:    'bg-brand-100 text-brand-700',
    clinic: 'bg-amber-100 text-amber-700',
  };
  const planLabel = { free:'Free', basic:'Basic', pro:'Pro', clinic:'Clínica' };

  const totalUsers  = profiles.length;
  const totalPets   = allPets.length;
  const proUsers    = profiles.filter(p => p.plan === 'pro').length;
  const basicUsers  = profiles.filter(p => p.plan === 'basic').length;
  const clinicUsers = profiles.filter(p => p.plan === 'clinic').length;
  const paidUsers   = proUsers + basicUsers + clinicUsers;

  const speciesDist = allPets.reduce((acc, p) => { acc[p.species] = (acc[p.species]||0)+1; return acc; }, {});

  // Bucketea por día CALENDARIO LOCAL, no por día UTC: created_at llega de Supabase
  // como timestamp UTC, así que comparar con startsWith() contra una fecha UTC
  // clasificaba mal los registros nocturnos (ej: 21:00 en Chile ya es "mañana" en UTC).
  const localDateOf = (isoTimestamp) => {
    const dt = new Date(isoTimestamp);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  };
  const week = Array.from({length:7}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate()-6+i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const signupsByDay = week.map(wd => profiles.filter(p => p.created_at && localDateOf(p.created_at) === wd).length);

  const tab = state.adminTab || 'dashboard';
  const tabs = [
    { id:'dashboard', label:'Dashboard', iconName:'chartBar' },
    { id:'usuarios',  label:'Usuarios',  iconName:'users' },
    { id:'planes',    label:'Planes',    iconName:'creditCard' },
  ];

  const tabContent = () => {
    if (tab === 'dashboard') return `
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        ${statCard(icon('users','w-5 h-5 md:w-6 md:h-6'), 'Usuarios', totalUsers, 'brand')}
        ${statCard(icon('paw','w-5 h-5 md:w-6 md:h-6'), 'Mascotas', totalPets, 'teal')}
        ${statCard(icon('creditCard','w-5 h-5 md:w-6 md:h-6'), 'Usuarios pagos', paidUsers, 'amber')}
        ${statCard(icon('box','w-5 h-5 md:w-6 md:h-6'), 'Plan Free', totalUsers - paidUsers, 'red')}
      </div>
      <div class="grid md:grid-cols-2 gap-6 mb-6">
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <h3 class="font-semibold text-gray-800 mb-4 flex items-center gap-1.5">${icon('creditCard','w-4 h-4')} Distribución de planes</h3>
          <div class="space-y-3">
            ${[['free','Free',totalUsers-paidUsers,'bg-gray-400'],['basic','Basic',basicUsers,'bg-blue-500'],['pro','Pro',proUsers,'bg-brand-500'],['clinic','Clínica',clinicUsers,'bg-amber-500']].map(([_,label,n,color]) => {
              const pct = totalUsers > 0 ? Math.round(n/totalUsers*100) : 0;
              return '<div><div class="flex justify-between text-sm mb-1"><span class="font-medium text-gray-700">'+label+'</span><span class="text-gray-500">'+n+' usuarios ('+pct+'%)</span></div><div class="bg-gray-100 rounded-full h-2"><div class="h-2 rounded-full '+color+'" style="width:'+pct+'%"></div></div></div>';
            }).join('')}
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <h3 class="font-semibold text-gray-800 mb-4 flex items-center gap-1.5">${icon('paw','w-4 h-4')} Mascotas por especie</h3>
          <div class="space-y-2">
            ${Object.entries(speciesDist).length === 0
              ? '<p class="text-sm text-gray-400 text-center py-6">Sin mascotas registradas</p>'
              : Object.entries(speciesDist).sort((a,b)=>b[1]-a[1]).map(([sp,n]) => {
                  const pct = Math.round(n/totalPets*100);
                  return '<div class="flex items-center gap-3"><span class="text-xl w-8">'+speciesEmoji(sp)+'</span><div class="flex-1 bg-gray-100 rounded-full h-2"><div class="h-2 rounded-full bg-teal-500" style="width:'+pct+'%"></div></div><span class="text-sm text-gray-500 w-28 text-right">'+sp+' · '+n+'</span></div>';
                }).join('')}
          </div>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm p-5">
        <h3 class="font-semibold text-gray-800 mb-4 flex items-center gap-1.5">${icon('chartBar','w-4 h-4')} Registros últimos 7 días</h3>
        <div class="flex items-end gap-2 h-24">
          ${signupsByDay.map((n, i) => {
            const max = Math.max(...signupsByDay, 1);
            const h   = Math.round((n/max)*100);
            const day = week[i].slice(5).replace('-','/');
            return '<div class="flex-1 flex flex-col items-center gap-1"><span class="text-xs font-semibold text-brand-600">'+(n>0?n:'')+'</span><div class="w-full rounded-t-md bg-brand-500 transition-all" style="height:'+h+'%;min-height:'+(n>0?8:2)+'px"></div><span class="text-[10px] text-gray-400">'+day+'</span></div>';
          }).join('')}
        </div>
      </div>`;

    if (tab === 'usuarios') return `
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div class="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 class="font-semibold text-gray-800">Todos los usuarios <span class="text-xs text-gray-400 font-normal ml-2">${totalUsers} total</span></h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs text-gray-400 bg-gray-50">
                <th class="px-5 py-3 font-medium">Usuario</th>
                <th class="px-4 py-3 font-medium hidden md:table-cell">Email</th>
                <th class="px-4 py-3 font-medium">Plan</th>
                <th class="px-4 py-3 font-medium hidden md:table-cell">Mascotas</th>
                <th class="px-4 py-3 font-medium hidden md:table-cell">Registro</th>
                <th class="px-4 py-3 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              ${profiles.length === 0
                ? '<tr><td colspan="6" class="text-center py-10 text-gray-400">Sin usuarios</td></tr>'
                : profiles.map(u => {
                    const petCount = allPets.filter(p => p.owner_id === u.id).length;
                    const plan = u.plan || 'free';
                    const pColor = planColors[plan] || planColors.free;
                    const pLbl   = planLabel[plan] || plan;
                    return '<tr class="hover:bg-gray-50 transition-colors"><td class="px-5 py-3"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">'+((u.name||'?')[0].toUpperCase())+'</div><div><div class="font-medium text-gray-900">'+(u.name||'—')+'</div>'+(u.is_admin?'<span class="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">ADMIN</span>':'')+'</div></div></td><td class="px-4 py-3 text-gray-500 hidden md:table-cell">'+(u.email||'—')+'</td><td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-semibold '+pColor+'">'+pLbl+'</span></td><td class="px-4 py-3 text-gray-500 hidden md:table-cell">'+petCount+'</td><td class="px-4 py-3 text-gray-400 hidden md:table-cell">'+(u.created_at?new Date(u.created_at).toLocaleDateString('es-CL',{day:'2-digit',month:'2-digit',year:'numeric'}):'—')+'</td><td class="px-4 py-3"><button onclick="openChangePlanModal(\''+u.id+'\',\''+((u.name||'').replace(/'/g,"\\'"))+'\',\''+plan+'\')" class="text-xs px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 font-medium transition-colors">Cambiar plan</button></td></tr>';
                  }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;

    if (tab === 'planes') return `
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        ${[
          { id:'free',   name:'Free',    price:'$0',         features:['1 mascota','Historial básico','Vacunas y medicamentos','Sin soporte'] },
          { id:'basic',  name:'Basic',   price:'$4.990/mes', features:['3 mascotas','Todo Free','Agenda y finanzas','Soporte por email'] },
          { id:'pro',    name:'Pro',     price:'$9.990/mes', features:['Mascotas ilimitadas','Todo Basic','Seguimiento avanzado','IA veterinaria','Soporte prioritario'] },
          { id:'clinic', name:'Clínica', price:'$29.990/mes',features:['Multi-usuario','Gestión clínica','Panel de análisis','API acceso','Soporte dedicado'] },
        ].map(p => {
          const cnt = profiles.filter(u=>(u.plan||'free')===p.id).length;
          return '<div class="bg-white rounded-2xl shadow-sm p-5 border-2 '+(p.id==='pro'?'border-brand-400':'border-transparent')+'"><div class="mb-3">'+(p.id==='pro'?'<span class="text-[10px] bg-brand-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Popular</span>':'')+'<h3 class="font-bold text-gray-900 text-lg mt-1">'+p.name+'</h3><p class="text-2xl font-black text-gray-900 mt-1">'+p.price+'</p></div><ul class="space-y-1.5 mb-4">'+p.features.map(f=>'<li class="flex items-start gap-2 text-sm text-gray-600"><span class="text-green-500 mt-0.5">✓</span>'+f+'</li>').join('')+'</ul><div class="pt-3 border-t border-gray-100 text-xs text-gray-400">'+cnt+' usuario'+(cnt!==1?'s':'')+' activo'+(cnt!==1?'s':'')+'</div></div>';
        }).join('')}
      </div>`;
    return '';
  };

  return appShell(`
    <div class="max-w-5xl mx-auto">
      ${pageHeader('Panel Administrador', 'Command Center · MyPets SaaS')}
      <div class="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        ${tabs.map(t => '<button onclick="state.adminTab=\''+t.id+'\';render()" class="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 '+(tab===t.id?'bg-white text-gray-900 shadow-sm':'text-gray-500 hover:text-gray-700')+'">'+icon(t.iconName,'w-4 h-4')+t.label+'</button>').join('')}
      </div>
      ${tabContent()}
    </div>
  `);
}

async function openChangePlanModal(userId, userName, currentPlan) {
  const plans = [
    { id:'free',   label:'Free',    desc:'Gratis' },
    { id:'basic',  label:'Basic',   desc:'$4.990/mes' },
    { id:'pro',    label:'Pro',     desc:'$9.990/mes' },
    { id:'clinic', label:'Clínica', desc:'$29.990/mes' },
  ];
  openModal('<div class="modal-box p-5"><h3 class="text-lg font-bold text-gray-900 mb-1">Cambiar plan</h3><p class="text-sm text-gray-500 mb-4">Usuario: <strong>'+userName+'</strong></p><div class="space-y-2 mb-5">'+plans.map(p=>'<label class="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all '+(p.id===currentPlan?'border-brand-400 bg-brand-50':'border-gray-100 hover:border-gray-200')+'"><input type="radio" name="new-plan" value="'+p.id+'" '+(p.id===currentPlan?'checked':'')+' class="accent-brand-600"><div class="flex-1"><div class="font-semibold text-sm text-gray-900">'+p.label+'</div><div class="text-xs text-gray-400">'+p.desc+'</div></div></label>').join('')+'</div><div class="flex gap-3"><button onclick="closeModal()" class="btn-secondary flex-1">Cancelar</button><button onclick="applyPlanChange(\''+userId+'\')" class="btn-primary flex-1">Guardar</button></div></div>');
}

async function applyPlanChange(userId) {
  const plan = document.querySelector('input[name="new-plan"]:checked')?.value;
  if (!plan) return;
  const { error } = await sb.from('profiles').update({ plan }).eq('id', userId);
  if (error) { showToast('Error al cambiar plan', 'error'); return; }
  const profile = (state.adminData?.profiles||[]).find(p=>p.id===userId);
  if (profile) profile.plan = plan;
  closeModal();
  showToast('Plan actualizado', 'success');
  render();
}
// ---- INIT ----
async function initApp() {
  injectStyles();
  loadState();

  // Detect password recovery link FIRST (hash contains type=recovery)
  const hash = location.hash;
  const isRecovery = hash.includes('type=recovery');
  if (isRecovery) {
    // Let Supabase exchange the token silently, then show reset form
    await sb.auth.getSession(); // exchanges the token from hash
    state.currentView = 'resetPassword';
    state.isLoggedIn = false;
    history.replaceState(null, '', ROUTE_PATHS.resetPassword);
    render();
    // Register listener for sign-out after reset
    sb.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') { state.isLoggedIn = false; state.user = null; navigate('login', {}, { replace: true }); }
    });
    return; // skip normal init
  }

  // Check for existing Supabase session
  const { data: { session } } = await sb.auth.getSession();
  if (session && !state.isLoggedIn) {
    const userName = session.user.user_metadata?.name || session.user.email.split('@')[0];
    state.user = { name: userName, email: session.user.email, id: session.user.id };
    state.isLoggedIn = true;
    // Cubre sesiones que nunca pasan por register()/login() — ej. un segundo
    // tutor que crea su cuenta vía el magic link de una invitación — para que
    // siempre exista una fila en profiles antes de cualquier insert que dependa
    // de ella (pet_access.user_id, etc.).
    await sb.from('profiles').upsert({ id: session.user.id, email: session.user.email, name: userName }, { onConflict: 'id' });
    if (!state.currentView || state.currentView === 'login') {
      const route = resolveInitialViewFromUrl(true);
      state.currentView = route ? route.view : 'dashboard';
      if (route?.params) Object.assign(state, route.params);
    }
    await loadDataFromSupabase();
  }

  // Invitación de segundo tutor pendiente (llegó por ?invite=TOKEN, ver loadState())
  if (session && state.inviteToken) {
    const token = state.inviteToken;
    state.inviteToken = null;
    await acceptPetInvite(token);
    state.currentView = 'dashboard';
    history.replaceState(null, '', ROUTE_PATHS.dashboard);
  }

  // Listen for auth changes
  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      state.currentView = 'resetPassword';
      state.isLoggedIn = false;
      history.replaceState(null, '', ROUTE_PATHS.resetPassword);
      render();
      return;
    }
    if (event === 'SIGNED_OUT') {
      state.isLoggedIn = false;
      state.user = null;
      state.currentView = 'login';
      history.replaceState(null, '', ROUTE_PATHS.login);
      render();
    }
    if (event === 'TOKEN_REFRESHED' && session) {
      state.user = {
        name: session.user.user_metadata?.name || session.user.email.split('@')[0],
        email: session.user.email,
        id: session.user.id
      };
    }
  });

  // Si el deep link inicial no era válido para el estado de sesión resuelto
  // (ej: sin sesión pidiendo /pets/x), la URL debe reflejar la vista real.
  const expectedPath = viewToPath(state.currentView, state);
  if (location.pathname !== expectedPath) history.replaceState(null, '', expectedPath);

  render();
}

document.addEventListener('DOMContentLoaded', initApp);

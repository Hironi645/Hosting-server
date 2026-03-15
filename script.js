// ===== DEVIL REIGN — Premium iOS Form =====
// Website by Hironi | Firebase Edition

// ===== FIREBASE CONFIG =====
const FIREBASE_URL = 'https://from-9bd21-default-rtdb.asia-southeast1.firebasedatabase.app';
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyngWDrUvB7pMwISgbeg2c-RYT-sZVmyoKjjYva2f9DF_eshS1cztyzo80FJm1Y-p6dVQ/exec';

// ===== STATE =====
let locationMode = 'manual';
let isLocating = false;
let currentTutorialStep = 0;
let tutorialShown = localStorage.getItem('devilReign_tutorialShown') === 'true';
let isTutorialActive = false;
let typingInterval = null;
let isTyping = false;
let currentSlide = 0;
let slideTimer = null;
let progressEl = null;

// ===== LIVE DATA (diisi dari Firebase) =====
let adminList = [];
let bannerImages = [];
let siteSettings = {};

const adminThemes = {
  red:    { primary: '#C1121F', secondary: '#7B0010', glow: 'rgba(193,18,31,0.4)' },
  blue:   { primary: '#007AFF', secondary: '#0051D5', glow: 'rgba(0,122,255,0.4)' },
  purple: { primary: '#BF5AF2', secondary: '#8E3DB8', glow: 'rgba(191,90,242,0.4)' },
  green:  { primary: '#2ECC71', secondary: '#248A3D', glow: 'rgba(46,204,113,0.4)' },
  orange: { primary: '#FF9F0A', secondary: '#C77700', glow: 'rgba(255,159,10,0.4)' },
  pink:   { primary: '#FF2D55', secondary: '#C41E42', glow: 'rgba(255,45,85,0.4)' },
  cyan:   { primary: '#5AC8FA', secondary: '#2A9BC4', glow: 'rgba(90,200,250,0.4)' }
};

// ===== TUTORIAL STEPS =====
const tutorialStepsData = [
  { step: 1, targetId: 'namaGroup',   title: 'Nama Lengkap',        message: 'Ketik nama lengkap Anda di sini. Gunakan nama asli untuk verifikasi data.',                        placeholder: 'Contoh: Budi Santoso' },
  { step: 2, targetId: 'umurGroup',   title: 'Umur',                message: 'Masukkan umur Anda. Minimal 10 tahun untuk bergabung dengan komunitas.',                           placeholder: 'Contoh: 20' },
  { step: 3, targetId: 'usnGroup',    title: 'USN Hotel Hideaway',  message: 'Masukkan username game Anda untuk identifikasi dalam komunitas.',                                   placeholder: 'Contoh: Player123' },
  { step: 4, targetId: 'kotaGroup',   title: 'Asal Kota',           message: 'Pilih "Manual" untuk ketik sendiri, atau "Auto Detect" untuk deteksi GPS otomatis.',               placeholder: 'Contoh: Jakarta' },
  { step: 5, targetId: 'alasanGroup', title: 'Alasan Bergabung',    message: 'Ceritakan mengapa Anda ingin bergabung dengan DEVIL REIGN. Tulis dengan jujur dan menarik!',       placeholder: 'Saya ingin bergabung karena...' }
];

// ===== DOM REFS =====
const toast              = document.getElementById('toast');
const processing         = document.getElementById('processing');
const successModal       = document.getElementById('successModal');
const form               = document.getElementById('memberForm');
const btnManual          = document.getElementById('btnManual');
const btnAuto            = document.getElementById('btnAuto');
const asalKotaInput      = document.getElementById('asalKota');
const locatingIndicator  = document.getElementById('locatingIndicator');
const fabBtn             = document.getElementById('fabBtn');
const statusTime         = document.getElementById('statusTime');
const tutorialOverlay    = document.getElementById('tutorialOverlay');
const tutorialHand       = document.getElementById('tutorialHand');
const tutorialTooltip    = document.getElementById('tutorialTooltip');
const stepNumber         = document.getElementById('stepNumber');
const tooltipTitle       = document.getElementById('tooltipTitle');
const tooltipMessage     = document.getElementById('tooltipMessage');
const adPopupModal       = document.getElementById('adPopupModal');
const announcementBanner = document.getElementById('announcementBanner');
const formCard           = document.getElementById('formCard');

// ===== FIREBASE HELPERS =====
async function fbGet(path) {
  const res = await fetch(`${FIREBASE_URL}/${path}.json`);
  return res.ok ? res.json() : null;
}

function fbListen(path, cb) {
  const es = new EventSource(`${FIREBASE_URL}/${path}.json?orderBy="$key"`);
  // Fallback: poll setiap 10 detik karena EventSource tidak reliable di semua host
  const poll = async () => { const d = await fbGet(path); if (d !== null) cb(d); };
  poll();
  const interval = setInterval(poll, 10000);
  return () => clearInterval(interval);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  updateClock();
  setInterval(updateClock, 1000);
  setupScrollListener();
  setupInputAnimations();

  // Load dari Firebase dulu, lalu inisialisasi UI
  await loadFromFirebase();

  // Real-time listeners
  startRealtimeSync();

  setTimeout(() => {
    if (!tutorialShown) {
      showToast('Selamat Datang! 👋', 'Klik "Lihat Tutorial" untuk panduan pengisian form', 4000);
    } else {
      showToast('Selamat Datang Kembali!', 'Silakan lengkapi form pendaftaran member', 3000);
    }
  }, 1200);
});

// ===== LOAD SEMUA DATA DARI FIREBASE =====
async function loadFromFirebase() {
  try {
    const [adminsRaw, bannersRaw, settings, announcement] = await Promise.all([
      fbGet('admins'),
      fbGet('banners'),
      fbGet('settings'),
      fbGet('announcement')
    ]);

    // Admins
    if (adminsRaw && typeof adminsRaw === 'object') {
      adminList = Object.values(adminsRaw).filter(a => a && a.active !== false);
    }
    // Banners
    if (bannersRaw && typeof bannersRaw === 'object') {
      bannerImages = Object.values(bannersRaw)
        .filter(b => b && b.active !== false)
        .map(b => ({ src: b.src, caption: b.caption || '' }));
    }
    // Settings
    if (settings) {
      siteSettings = settings;
      applySettings(settings);
    }
    // Announcement
    if (announcement) {
      applyAnnouncement(announcement);
    }

    // Generate UI
    generateAdminCards();
    generateAutoSlideBanner();

    // Popup ad (setelah delay)
    if (siteSettings.adPopup !== false) {
      setTimeout(showAdPopup, 8000);
    }
  } catch(e) {
    console.warn('[DEVIL REIGN] Firebase load error, fallback ke default:', e);
    // Fallback data statis
    adminList = [
      { nomor: "6285751316809", nama: "Lyonar Nna", label: "Admin 1", theme: "red",    initial: "LN", active: true },
      { nomor: "6285824168807", nama: "ÐR SanRa",   label: "Admin 2", theme: "orange", initial: "DS", active: true },
      { nomor: "6281318685216", nama: "Lucanne",     label: "Admin 3", theme: "pink",   initial: "LC", active: true },
      { nomor: "6289504498328", nama: "vhany",       label: "Admin 4", theme: "cyan",   initial: "VH", active: true },
      { nomor: "6288991037227", nama: "dika",        label: "Admin 5", theme: "purple", initial: "RH", active: true }
    ];
    bannerImages = [
      { src: 'IMG-20260204-WA0052.jpg', caption: '' },
      { src: 'IMG-20260211-WA0065.jpg', caption: '' },
      { src: 'IMG-20260211-WA0017.jpg', caption: '' },
      { src: 'IMG-20260131-WA0024.jpg', caption: '' },
      { src: 'IMG-20260213-WA0005.jpg', caption: '' },
      { src: 'IMG-20260213-WA0006.jpg', caption: '' },
      { src: 'IMG-20260211-WA0079.jpg', caption: '' },
      { src: 'IMG-20260211-WA0076.jpg', caption: '' }
    ];
    generateAdminCards();
    generateAutoSlideBanner();
    setTimeout(showAdPopup, 8000);
  }
}

// ===== APPLY SETTINGS FROM FIREBASE =====
function applySettings(s) {
  // Toggle form
  if (formCard) {
    if (s.formActive === false) {
      formCard.innerHTML = `
        <div style="padding:40px 24px;text-align:center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(193,18,31,0.6)" stroke-width="1.5" style="margin-bottom:16px"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          <h3 style="font-family:'Syne',sans-serif;font-size:18px;font-weight:700;margin-bottom:8px">Pendaftaran Ditutup</h3>
          <p style="color:rgba(240,240,245,0.55);font-size:13px">Rekrutmen saat ini sedang ditutup sementara. Pantau terus media sosial kami untuk info pembukaan selanjutnya.</p>
        </div>
      `;
    }
  }

  // Community name / tagline
  const headerTitle = document.querySelector('.header-title');
  if (headerTitle && s.name) headerTitle.textContent = s.name;
  const headerSub = document.querySelector('.header-subtitle');
  if (headerSub && s.tagline) headerSub.textContent = s.tagline;

  // Social links
  if (s.discord) {
    const discordLink = document.querySelector('.social-discord');
    if (discordLink) discordLink.href = s.discord;
  }
  if (s.instagram) {
    const igDesc = document.querySelector('.social-instagram .social-link-desc');
    if (igDesc) igDesc.textContent = s.instagram;
  }

  // GPS toggle
  if (s.gps === false && btnAuto) {
    btnAuto.style.display = 'none';
  }
}

// ===== APPLY ANNOUNCEMENT =====
function applyAnnouncement(ann) {
  if (!announcementBanner || !ann || !ann.active || !ann.title) {
    if (announcementBanner) announcementBanner.style.display = 'none';
    return;
  }
  const colorMap = {
    blood:   { bg: 'rgba(193,18,31,0.18)',  border: 'rgba(193,18,31,0.35)',   color: '#E63946' },
    warn:    { bg: 'rgba(255,159,10,0.15)', border: 'rgba(255,159,10,0.3)',   color: '#FF9F0A' },
    success: { bg: 'rgba(46,204,113,0.12)', border: 'rgba(46,204,113,0.25)', color: '#2ECC71' },
    info:    { bg: 'rgba(90,200,250,0.12)', border: 'rgba(90,200,250,0.25)', color: '#5AC8FA' }
  };
  const c = colorMap[ann.color] || colorMap.blood;
  announcementBanner.style.display = 'flex';
  announcementBanner.style.background = c.bg;
  announcementBanner.style.borderColor = c.border;
  announcementBanner.querySelector('.ann-title').textContent = ann.title;
  announcementBanner.querySelector('.ann-title').style.color = c.color;
  announcementBanner.querySelector('.ann-body').textContent = ann.body || '';
}

// ===== REAL-TIME SYNC (polling ringan) =====
function startRealtimeSync() {
  // Sync admins & banners tiap 15 detik
  setInterval(async () => {
    try {
      const [adminsRaw, bannersRaw, settings, announcement] = await Promise.all([
        fbGet('admins'), fbGet('banners'), fbGet('settings'), fbGet('announcement')
      ]);
      if (adminsRaw) {
        const newList = Object.values(adminsRaw).filter(a => a && a.active !== false);
        if (JSON.stringify(newList) !== JSON.stringify(adminList)) {
          adminList = newList;
          generateAdminCards();
        }
      }
      if (bannersRaw) {
        const newBanners = Object.values(bannersRaw)
          .filter(b => b && b.active !== false)
          .map(b => ({ src: b.src, caption: b.caption || '' }));
        if (JSON.stringify(newBanners) !== JSON.stringify(bannerImages)) {
          bannerImages = newBanners;
          generateAutoSlideBanner();
        }
      }
      if (settings) applySettings(settings);
      if (announcement) applyAnnouncement(announcement);
    } catch(e) { /* silent */ }
  }, 15000);
}

// ===== AD POPUP =====
function showAdPopup() {
  if (adPopupModal) {
    adPopupModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    if (navigator.vibrate) navigator.vibrate(20);
  }
}

function closeAdPopup() {
  if (adPopupModal) {
    adPopupModal.classList.remove('show');
    document.body.style.overflow = '';
    localStorage.setItem('devilReign_adPopupShown', new Date().toISOString());
  }
}

// ===== ADMIN CARDS (dirender dari Firebase data) =====
function generateAdminCards() {
  const adminGrid = document.getElementById('adminGrid');
  if (!adminGrid) return;
  adminGrid.innerHTML = '';

  if (!adminList.length) {
    adminGrid.innerHTML = '<p style="color:rgba(240,240,245,0.4);font-size:13px;text-align:center;padding:20px">Admin tidak tersedia saat ini.</p>';
    return;
  }

  adminList.forEach((admin) => {
    const theme = adminThemes[admin.theme] || adminThemes.red;
    const card = document.createElement('label');
    card.className = `admin-card admin-theme-${admin.theme}`;
    card.style.setProperty('--admin-primary', theme.primary);
    card.style.setProperty('--admin-secondary', theme.secondary);
    card.style.setProperty('--admin-glow', theme.glow);
    card.innerHTML = `
      <input type="radio" name="admin" value="${admin.nomor}" data-admin-name="${admin.nama}" class="admin-radio" required>
      <div class="admin-content">
        <div class="admin-avatar">
          <span class="admin-initial">${admin.initial || admin.nama.slice(0,2).toUpperCase()}</span>
        </div>
        <div class="admin-info">
          <span class="admin-name">${admin.nama}</span>
          <span class="admin-phone">${admin.label}</span>
        </div>
        <div class="admin-check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </div>
    `;
    adminGrid.appendChild(card);
  });
  setupAdminCards();
}

// ===== AUTO SLIDESHOW BANNER =====
function generateAutoSlideBanner() {
  const bannerContainer = document.getElementById('movingBanner');
  if (!bannerContainer) return;

  if (slideTimer) clearInterval(slideTimer);
  currentSlide = 0;
  bannerContainer.innerHTML = '';

  if (!bannerImages.length) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'slider-wrapper';
  const track = document.createElement('div');
  track.className = 'slider-track';
  track.id = 'sliderTrack';

  bannerImages.forEach((img, i) => {
    const slide = document.createElement('div');
    slide.className = 'slider-slide' + (i === 0 ? ' active' : '');
    slide.innerHTML = `
      <img src="${img.src}" alt="Galeri ${i + 1}" loading="lazy">
      <div class="slide-overlay"></div>
    `;
    track.appendChild(slide);
  });

  wrapper.appendChild(track);
  bannerContainer.appendChild(wrapper);

  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'slider-dots';
  dotsContainer.id = 'sliderDots';
  bannerImages.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => { goToSlideAuto(i, track); resetProgress(); });
    dotsContainer.appendChild(dot);
  });
  bannerContainer.appendChild(dotsContainer);

  const progress = document.createElement('div');
  progress.className = 'slider-progress';
  progress.id = 'sliderProgress';
  bannerContainer.appendChild(progress);
  progressEl = progress;

  let touchStartX = 0;
  wrapper.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  wrapper.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) { goToSlideAuto(diff > 0 ? currentSlide + 1 : currentSlide - 1, track); resetProgress(); }
  }, { passive: true });

  startAutoPlay(track);
}

function goToSlideAuto(index, track) {
  const total = bannerImages.length;
  if (index < 0) currentSlide = total - 1;
  else if (index >= total) currentSlide = 0;
  else currentSlide = index;
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  document.querySelectorAll('.slider-slide').forEach((s, i) => s.classList.toggle('active', i === currentSlide));
  document.querySelectorAll('.slider-dot').forEach((d, i) => d.classList.toggle('active', i === currentSlide));
}

function resetProgress() {
  if (progressEl) {
    progressEl.style.animation = 'none';
    progressEl.offsetHeight;
    progressEl.style.animation = 'slideProgress 5s linear infinite';
  }
}

function startAutoPlay(track) {
  clearInterval(slideTimer);
  slideTimer = setInterval(() => { goToSlideAuto(currentSlide + 1, track); resetProgress(); }, 5000);
}

// ===== TUTORIAL =====
function startInteractiveTutorial() {
  if (siteSettings.tutorial === false) return;
  isTutorialActive = true;
  currentTutorialStep = 0;
  tutorialOverlay.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => showTutorialStep(0), 500);
}

function showTutorialStep(stepIndex) {
  if (stepIndex >= tutorialStepsData.length) { endTutorial(); return; }
  currentTutorialStep = stepIndex;
  const step = tutorialStepsData[stepIndex];
  const targetElement = document.getElementById(step.targetId);
  if (!targetElement) { endTutorial(); return; }

  stopTypingSimulation();
  document.querySelectorAll('.tutorial-target').forEach(el => {
    el.classList.remove('highlighted');
    el.style.position = '';
    el.style.zIndex = '';
    const input = el.querySelector('.ios-input, .ios-textarea');
    if (input) input.value = '';
  });

  targetElement.classList.add('highlighted');
  if (window.getComputedStyle(targetElement).position === 'static') targetElement.style.position = 'relative';
  targetElement.style.zIndex = '9999';
  targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

  setTimeout(() => {
    const rect = targetElement.getBoundingClientRect();
    const tooltipW = 280, tooltipH = 160, margin = 20;
    tutorialHand.style.left = `${rect.left + rect.width / 2 - 40}px`;
    tutorialHand.style.top  = `${rect.top + rect.height / 2 - 40}px`;
    tutorialHand.classList.add('tapping');
    setTimeout(() => tutorialHand.classList.remove('tapping'), 400);

    let tooltipX = rect.left + rect.width / 2 - tooltipW / 2;
    let tooltipY = rect.bottom + margin;
    if (tooltipX + tooltipW > window.innerWidth - margin) tooltipX = window.innerWidth - tooltipW - margin;
    if (tooltipX < margin) tooltipX = margin;
    if (tooltipY + tooltipH > window.innerHeight - margin) tooltipY = rect.top - tooltipH - margin;

    tutorialTooltip.style.left = `${tooltipX}px`;
    tutorialTooltip.style.top  = `${tooltipY}px`;
    stepNumber.textContent      = step.step;
    tooltipTitle.textContent    = step.title;
    tooltipMessage.textContent  = step.message;

    document.querySelectorAll('.step-dots .dot').forEach((dot, i) => dot.classList.toggle('active', i === stepIndex));
    tutorialTooltip.classList.add('show');
    updateTutorialGuideCard(stepIndex);
    if (step.placeholder) simulateTyping(step.targetId, step.placeholder);
  }, 500);
}

function simulateTyping(targetId, text) {
  const input = document.querySelector(`#${targetId} .ios-input, #${targetId} .ios-textarea`);
  if (!input || !text) return;
  if (typingInterval) { clearTimeout(typingInterval); typingInterval = null; }
  isTyping = false;
  input.value = '';
  input.classList.add('typing-active');
  let charIndex = 0;
  isTyping = true;
  function typeNext() {
    if (!isTyping || charIndex >= text.length) {
      clearTimeout(typingInterval); typingInterval = null; isTyping = false;
      input.classList.remove('typing-active');
      setTimeout(() => { if (input.value === text) input.value = ''; }, 1500);
      return;
    }
    input.value += text[charIndex++];
    typingInterval = setTimeout(typeNext, Math.random() * 80 + 40);
  }
  setTimeout(typeNext, 400);
}

function stopTypingSimulation() {
  isTyping = false;
  if (typingInterval) { clearTimeout(typingInterval); typingInterval = null; }
  document.querySelectorAll('.typing-active').forEach(el => el.classList.remove('typing-active'));
}

function nextTutorialStep() {
  stopTypingSimulation();
  const currentStep = tutorialStepsData[currentTutorialStep];
  if (currentStep) {
    const el = document.getElementById(currentStep.targetId);
    if (el) { el.classList.remove('highlighted'); el.style.zIndex = ''; el.style.position = ''; const inp = el.querySelector('.ios-input,.ios-textarea'); if(inp) inp.value=''; }
  }
  tutorialTooltip.classList.remove('show');
  setTimeout(() => showTutorialStep(currentTutorialStep + 1), 300);
}

function skipTutorial() {
  stopTypingSimulation();
  localStorage.setItem('devilReign_tutorialShown', 'true');
  tutorialShown = true;
  endTutorial();
}

function endTutorial() {
  isTutorialActive = false;
  stopTypingSimulation();
  document.querySelectorAll('.tutorial-target').forEach(el => {
    el.classList.remove('highlighted'); el.style.zIndex = ''; el.style.position = '';
    const inp = el.querySelector('.ios-input,.ios-textarea'); if(inp) inp.value='';
  });
  tutorialTooltip.classList.remove('show');
  tutorialOverlay.classList.remove('active');
  localStorage.setItem('devilReign_tutorialShown', 'true');
  tutorialShown = true;
  showToast('Tutorial Selesai! 🎉', 'Silakan isi form dengan data Anda', 3000);
}

function updateTutorialGuideCard(activeStep) {
  document.querySelectorAll('.tutorial-step').forEach((s, i) => s.classList.toggle('active', i === activeStep));
}

function showTutorialAgain() {
  localStorage.removeItem('devilReign_tutorialShown');
  tutorialShown = false;
  startInteractiveTutorial();
}

// ===== CLOCK =====
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  if (statusTime) statusTime.textContent = `${h}:${m}`;
}

// ===== TOAST =====
function showToast(title, message, duration = 3000) {
  const toastTitle   = toast.querySelector('.toast-title');
  const toastMessage = toast.querySelector('.toast-message');
  if (toastTitle)   toastTitle.textContent   = title;
  if (toastMessage) toastMessage.textContent = message;
  toast.classList.add('show');
  if (duration > 0) setTimeout(() => toast.classList.remove('show'), duration);
}

// ===== MODAL =====
function showModal() {
  successModal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  successModal.classList.remove('show');
  document.body.style.overflow = '';
}

// ===== PROCESSING =====
function showProcessing() {
  processing.style.display = 'flex';
  processing.offsetHeight;
  processing.classList.add('show');
}

function hideProcessing() {
  processing.classList.remove('show');
  setTimeout(() => { processing.style.display = 'none'; }, 300);
}

// ===== LOCATION =====
function setLocationMode(mode) {
  locationMode = mode;
  if (mode === 'manual') {
    btnManual.classList.add('active');
    btnAuto.classList.remove('active');
    asalKotaInput.placeholder = 'Masukkan asal kota';
    asalKotaInput.disabled = false;
    asalKotaInput.value = '';
    locatingIndicator.style.display = 'none';
  } else {
    btnManual.classList.remove('active');
    btnAuto.classList.add('active');
    getCurrentLocation();
  }
}

function getCurrentLocation() {
  if (!navigator.geolocation) { showToast('Error', 'Browser tidak mendukung geolokasi'); setLocationMode('manual'); return; }
  isLocating = true;
  asalKotaInput.disabled = true;
  asalKotaInput.placeholder = 'Mendeteksi lokasi...';
  asalKotaInput.value = '';
  locatingIndicator.style.display = 'flex';

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
        const data = await res.json();
        const city = data.address.city || data.address.town || data.address.district || data.address.state || data.address.county || 'Lokasi tidak diketahui';
        asalKotaInput.value = city;
        isLocating = false; asalKotaInput.disabled = false; locatingIndicator.style.display = 'none';
        showToast('Lokasi Ditemukan! 📍', `Kota: ${city}`, 2500);
      } catch { handleLocationError('Gagal mendapatkan nama kota'); }
    },
    (error) => {
      const msgs = { 1: 'Izin lokasi ditolak', 2: 'Lokasi tidak tersedia', 3: 'Timeout mendapatkan lokasi' };
      handleLocationError(msgs[error.code] || 'Gagal mendapatkan lokasi');
    },
    { timeout: 15000, enableHighAccuracy: true }
  );
}

function handleLocationError(message) {
  isLocating = false; asalKotaInput.disabled = false;
  asalKotaInput.placeholder = 'Masukkan asal kota';
  locatingIndicator.style.display = 'none';
  showToast('Error', message, 3000);
  setLocationMode('manual');
}

// ===== ADMIN CARDS SETUP =====
function setupAdminCards() {
  document.querySelectorAll('.admin-card').forEach(card => {
    card.addEventListener('click', () => {
      if (navigator.vibrate) navigator.vibrate(10);
      document.querySelectorAll('.admin-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });
}

// ===== SCROLL =====
function setupScrollListener() {
  window.addEventListener('scroll', () => {
    if (fabBtn) fabBtn.classList.toggle('show', window.scrollY > 300);
  }, { passive: true });
}

function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

// ===== INPUT ANIMATIONS =====
function setupInputAnimations() {
  document.querySelectorAll('.ios-input, .ios-textarea, .ios-select').forEach(input => {
    input.addEventListener('focus', () => { input.closest('.input-wrapper')?.classList.add('focused'); if (navigator.vibrate) navigator.vibrate(10); });
    input.addEventListener('blur',  () => { input.closest('.input-wrapper')?.classList.remove('focused'); });
  });
}

// ===== SELECTED ADMIN =====
function getSelectedAdmin()     { const r = document.querySelector('input[name="admin"]:checked'); return r ? r.value : null; }
function getSelectedAdminName() { const r = document.querySelector('input[name="admin"]:checked'); return r ? r.getAttribute('data-admin-name') : null; }

// ===== WHATSAPP MESSAGE =====
function generateWhatsAppMessage(formData) {
  const date = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  const communityName = siteSettings.name || 'DEVIL REIGN';
  return `*${communityName} — FORM MEMBER*
━━━━━━━━━━━━━━━

📅 *Tanggal:* ${date}

👤 *Nama:* ${formData.nama}
🎂 *Umur:* ${formData.umur} tahun
🎮 *USN Hotel Hideaway:* ${formData.usnHotel}
📍 *Asal Kota:* ${formData.asalKota}
💬 *Alasan Bergabung:*
${formData.alasan}

━━━━━━━━━━━━━━━
*STATUS:* ⏳ MENUNGGU PERSETUJUAN ADMIN
━━━━━━━━━━━━━━━

۝ ${siteSettings.tagline || 'Satu Reign, Satu Kekuasaan'} ۝`;
}

// ===== SAVE TO FIREBASE =====
async function saveMemberToFirebase(formData) {
  try {
    const member = {
      nama:      formData.nama,
      umur:      formData.umur,
      usnHotel:  formData.usnHotel,
      asalKota:  formData.asalKota,
      alasan:    formData.alasan,
      admin:     formData.admin,
      adminName: formData.adminName,
      status:    'pending',
      tanggal:   new Date().toLocaleString('id-ID'),
      timestamp: new Date().toISOString()
    };
    await fetch(`${FIREBASE_URL}/members.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member)
    });
  } catch(e) { console.warn('[DEVIL REIGN] Firebase save error:', e); }
}

// ===== GOOGLE SHEETS =====
async function sendToGoogleSheets(formData) {
  if (siteSettings.sheets === false) return true;
  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nama: formData.nama, umur: formData.umur, usnHotel: formData.usnHotel,
        asalKota: formData.asalKota, alasan: formData.alasan,
        admin: formData.adminName, adminNomor: formData.admin,
        tanggal: new Date().toLocaleString('id-ID'), timestamp: new Date().toISOString()
      })
    });
  } catch { /* silent */ }
  return true;
}

// ===== FORM SUBMIT =====
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Cek apakah form aktif
  if (siteSettings.formActive === false) {
    showToast('Ditutup ⚠️', 'Pendaftaran sedang ditutup sementara', 3000);
    return;
  }

  const formData = {
    nama:      document.getElementById('nama').value.trim(),
    umur:      document.getElementById('umur').value.trim(),
    usnHotel:  document.getElementById('usnHotel').value.trim(),
    asalKota:  document.getElementById('asalKota').value.trim(),
    alasan:    document.getElementById('alasan').value.trim(),
    admin:     getSelectedAdmin(),
    adminName: getSelectedAdminName()
  };

  const validations = [
    { field: 'nama',     message: 'Mohon isi nama lengkap' },
    { field: 'umur',     message: 'Mohon isi umur' },
    { field: 'usnHotel', message: 'Mohon isi USN Hotel Hideaway' },
    { field: 'asalKota', message: 'Mohon isi asal kota' },
    { field: 'alasan',   message: 'Mohon isi alasan bergabung' }
  ];

  for (const v of validations) {
    if (!formData[v.field]) {
      showToast('Form Belum Lengkap ⚠️', v.message, 3000);
      const input = document.getElementById(v.field);
      if (input) { input.focus(); input.style.animation = 'shake 0.5s ease'; setTimeout(() => input.style.animation = '', 500); }
      return;
    }
  }

  if (!formData.admin) {
    showToast('Form Belum Lengkap ⚠️', 'Mohon pilih admin tujuan', 3000);
    document.querySelector('.admin-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  showProcessing();
  await Promise.all([
    saveMemberToFirebase(formData),
    sendToGoogleSheets(formData),
    new Promise(r => setTimeout(r, 1800))
  ]);
  hideProcessing();
  showModal();

  const modalBtn = successModal.querySelector('.modal-btn');
  modalBtn.onclick = () => {
    closeModal();
    const message = encodeURIComponent(generateWhatsAppMessage(formData));
    window.open(`https://wa.me/${formData.admin}?text=${message}`, '_blank');
    setTimeout(() => showToast('Berhasil! ✅', 'Data telah dikirim ke WhatsApp admin', 2500), 500);
    setTimeout(() => { form.reset(); setLocationMode('manual'); generateAdminCards(); }, 2000);
  };
});

// ===== iOS ZOOM PREVENTION =====
document.addEventListener('gesturestart', e => e.preventDefault());
let lastTouchEnd = 0;
document.addEventListener('touchend', e => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) e.preventDefault();
  lastTouchEnd = now;
}, false);

// ===== EXPORTS =====
window.showTutorialAgain      = showTutorialAgain;
window.showAdPopup            = showAdPopup;
window.closeAdPopup           = closeAdPopup;
window.startInteractiveTutorial = startInteractiveTutorial;
window.nextTutorialStep       = nextTutorialStep;
window.skipTutorial           = skipTutorial;
window.scrollToTop            = scrollToTop;
window.closeModal             = closeModal;
window.setLocationMode        = setLocationMode;

// Console branding
console.log('%c DEVIL REIGN ', 'background:linear-gradient(135deg,#C1121F,#7B0010);color:white;font-size:24px;font-weight:bold;padding:10px 20px;border-radius:10px;');
console.log('%c Firebase Edition — Real-time Sync ', 'color:#C1121F;font-size:14px;');
console.log('%c Crafted by Hironi × Upgraded by Claude ', 'color:#666;font-size:12px;');

/**
 * DEVIL REIGN v9.0 - Main Script
 * Features: Dynamic Themes, Reading Progress, Form Validation, Tutorial System, Bug Fixes
 */

// ===== CONFIGURATION =====
const CONFIG = {
  version: '9.0',
  firebase: {
    apiKey: "AIzaSyA4qQj7mJ0T5n3t5z5z5z5z5z5z5z5z5z5z",
    authDomain: "devil-reign.firebaseapp.com",
    databaseURL: "https://devil-reign-default-rtdb.firebaseio.com",
    projectId: "devil-reign",
    storageBucket: "devil-reign.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
  },
  adPopupDelay: 3000,
  sliderInterval: 5000,
  rateLimitSeconds: 10
};

// ===== STATE =====
let state = {
  locationMode: 'manual',
  selectedAdmin: null,
  sliderIndex: 0,
  sliderInterval: null,
  isProcessing: false,
  lastSubmitTime: 0,
  tutorialStep: 0,
  isTyping: {},
  formProgress: 0,
  themeHue: 355 // Default red theme
};

// ===== GALLERY IMAGES =====
const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=450&fit=crop'
];

// ===== ADMINS DATA =====
const ADMINS = [
  { id: 'admin1', name: 'Admin 1', phone: '+6281234567890', hue: 0 },
  { id: 'admin2', name: 'Admin 2', phone: '+6281234567891', hue: 30 },
  { id: 'admin3', name: 'Admin 3', phone: '+6281234567892', hue: 60 },
  { id: 'admin4', name: 'Admin 4', phone: '+6281234567893', hue: 90 },
  { id: 'admin5', name: 'Admin 5', phone: '+6281234567894', hue: 120 },
  { id: 'admin6', name: 'Admin 6', phone: '+6281234567895', hue: 150 },
  { id: 'admin7', name: 'Admin 7', phone: '+6281234567896', hue: 180 },
  { id: 'admin8', name: 'Admin 8', phone: '+6281234567897', hue: 210 },
  { id: 'admin9', name: 'Admin 9', phone: '+6281234567898', hue: 240 },
  { id: 'admin10', name: 'Admin 10', phone: '+6281234567899', hue: 270 },
  { id: 'admin11', name: 'Admin 11', phone: '+6281234567900', hue: 300 },
  { id: 'admin12', name: 'Admin 12', phone: '+6281234567901', hue: 330 },
  { id: 'admin13', name: 'Admin 13', phone: '+6281234567902', hue: 15 },
  { id: 'admin14', name: 'Admin 14', phone: '+6281234567903', hue: 45 },
  { id: 'admin15', name: 'Admin 15', phone: '+6281234567904', hue: 75 }
];

// ===== THEME PRESETS =====
const THEMES = {
  red: { hue: 355, name: 'Merah' },
  blue: { hue: 210, name: 'Biru' },
  purple: { hue: 270, name: 'Ungu' },
  green: { hue: 145, name: 'Hijau' },
  orange: { hue: 30, name: 'Oranye' },
  pink: { hue: 330, name: 'Pink' },
  cyan: { hue: 190, name: 'Cyan' },
  gold: { hue: 45, name: 'Emas' }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
  initFirebase();
  initGallery();
  initAdminGrid();
  initForm();
  initEventListeners();
  initAnimations();
  initReadingProgress();
  initTimeUpdate();
  initToast();
  initAdPopup();
  loadTheme();
  updateMemberCount();
  loadAnnouncement();
});

// ===== FIREBASE =====
function initFirebase() {
  try {
    firebase.initializeApp(CONFIG.firebase);
    console.log('Firebase initialized');
  } catch (e) {
    console.log('Firebase demo mode');
  }
}

// ===== GALLERY =====
function initGallery() {
  const banner = document.getElementById('movingBanner');
  if (!banner) return;

  banner.innerHTML = `
    <div class="slider-wrapper" id="sliderWrapper">
      <div class="slider-track" id="sliderTrack"></div>
      <div class="slider-dots" id="sliderDots"></div>
      <div class="slider-progress"></div>
    </div>
  `;

  const track = document.getElementById('sliderTrack');
  const dots = document.getElementById('sliderDots');

  GALLERY_IMAGES.forEach((src, i) => {
    track.innerHTML += `
      <div class="slider-slide ${i === 0 ? 'active' : ''}">
        <img src="${src}" alt="Gallery ${i + 1}" loading="lazy">
        <div class="slide-overlay"></div>
      </div>
    `;
    dots.innerHTML += `<button class="slider-dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></button>`;
  });

  startSlider();

  // Touch support
  let touchStartX = 0;
  const wrapper = document.getElementById('sliderWrapper');
  wrapper.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX, { passive: true });
  wrapper.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
  }, { passive: true });
}

function startSlider() {
  state.sliderInterval = setInterval(nextSlide, CONFIG.sliderInterval);
}

function nextSlide() {
  goToSlide((state.sliderIndex + 1) % GALLERY_IMAGES.length);
}

function prevSlide() {
  goToSlide((state.sliderIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
}

function goToSlide(index) {
  state.sliderIndex = index;
  const track = document.getElementById('sliderTrack');
  const dots = document.querySelectorAll('.slider-dot');
  const slides = document.querySelectorAll('.slider-slide');

  if (track) track.style.transform = `translateX(-${index * 100}%)`;
  dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  slides.forEach((slide, i) => slide.classList.toggle('active', i === index));

  // Reset progress animation
  const progress = document.querySelector('.slider-progress');
  if (progress) {
    progress.style.animation = 'none';
    progress.offsetHeight;
    progress.style.animation = 'slideProgress 5s linear infinite';
  }
}

// ===== ADMIN GRID =====
function initAdminGrid() {
  const grid = document.getElementById('adminGrid');
  if (!grid) return;

  grid.innerHTML = ADMINS.map(admin => `
    <label class="admin-card" data-admin-id="${admin.id}" style="--admin-hue: ${admin.hue}">
      <input type="radio" name="admin" value="${admin.id}" onchange="selectAdmin('${admin.id}')">
      <div class="admin-content">
        <div class="admin-avatar">
          <span class="admin-initial">${admin.name.split(' ').map(w => w[0]).join('')}</span>
        </div>
        <div class="admin-info">
          <span class="admin-name">${admin.name}</span>
          <span class="admin-phone">${admin.phone}</span>
        </div>
        <div class="admin-check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </div>
    </label>
  `).join('');
}

function selectAdmin(adminId) {
  state.selectedAdmin = adminId;
  document.querySelectorAll('.admin-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.adminId === adminId);
  });
  updateFormProgress();
  hideFieldError('adminError');
}

// ===== FORM =====
function initForm() {
  const form = document.getElementById('memberForm');
  if (!form) return;

  // Input validation
  const nama = document.getElementById('nama');
  const umur = document.getElementById('umur');
  const usn = document.getElementById('usnHotel');
  const kota = document.getElementById('asalKota');
  const alasan = document.getElementById('alasan');

  // Real-time validation
  nama?.addEventListener('input', () => {
    validateField(nama, 'namaError', v => v.length >= 3, 'Nama minimal 3 karakter');
    updateFormProgress();
    updateTutorialStep(1, nama.value.length >= 3);
  });

  nama?.addEventListener('blur', () => {
    validateField(nama, 'namaError', v => v.length >= 3, 'Nama minimal 3 karakter');
  });

  umur?.addEventListener('input', () => {
    const val = parseInt(umur.value);
    validateField(umur, 'umurError', v => v && val >= 10 && val <= 80, 'Umur harus 10-80 tahun');
    updateFormProgress();
    updateTutorialStep(2, val >= 10 && val <= 80);
  });

  usn?.addEventListener('input', () => {
    validateField(usn, 'usnError', v => v.length >= 3, 'Username minimal 3 karakter');
    updateFormProgress();
    updateTutorialStep(3, usn.value.length >= 3);
  });

  kota?.addEventListener('input', () => {
    validateField(kota, 'kotaError', v => v.length >= 2, 'Kota minimal 2 karakter');
    updateFormProgress();
    updateTutorialStep(4, kota.value.length >= 2);
  });

  // Character counter
  alasan?.addEventListener('input', () => {
    const count = alasan.value.length;
    const counter = document.getElementById('charCount');
    const minNote = document.getElementById('charMinNote');
    if (counter) counter.textContent = count;
    if (minNote) minNote.style.color = count >= 20 ? '#2ECC71' : 'rgba(255,159,10,0.8)';
    validateField(alasan, 'alasanError', v => v.length >= 20, 'Alasan minimal 20 karakter');
    updateFormProgress();
    updateTutorialStep(5, count >= 20);
  });

  // Form submission
  form.addEventListener('submit', handleSubmit);
}

function validateField(input, errorId, validator, errorMsg) {
  const errorEl = document.getElementById(errorId);
  const isValid = validator(input.value);

  if (input.value && !isValid) {
    input.classList.add('input-error');
    input.classList.remove('input-valid');
    if (errorEl) {
      errorEl.textContent = errorMsg;
      errorEl.style.display = 'flex';
    }
  } else if (isValid) {
    input.classList.remove('input-error');
    input.classList.add('input-valid');
    if (errorEl) errorEl.style.display = 'none';
  } else {
    input.classList.remove('input-error', 'input-valid');
    if (errorEl) errorEl.style.display = 'none';
  }

  return isValid;
}

function hideFieldError(errorId) {
  const errorEl = document.getElementById(errorId);
  if (errorEl) errorEl.style.display = 'none';
}

function updateFormProgress() {
  const nama = document.getElementById('nama')?.value.length >= 3 ? 20 : 0;
  const umur = document.getElementById('umur')?.value && parseInt(document.getElementById('umur').value) >= 10 ? 20 : 0;
  const usn = document.getElementById('usnHotel')?.value.length >= 3 ? 20 : 0;
  const kota = document.getElementById('asalKota')?.value.length >= 2 ? 20 : 0;
  const alasan = document.getElementById('alasan')?.value.length >= 20 ? 10 : 0;
  const admin = state.selectedAdmin ? 10 : 0;

  const progress = nama + umur + usn + kota + alasan + admin;
  state.formProgress = progress;

  const fill = document.getElementById('formProgressFill');
  const pct = document.getElementById('formProgressPct');
  if (fill) fill.style.width = `${progress}%`;
  if (pct) pct.textContent = `${progress}%`;
}

function updateTutorialStep(step, completed) {
  const stepEl = document.querySelector(`.tutorial-step[data-step="${step}"]`);
  const checkEl = document.getElementById(`scheck${step}`);
  if (stepEl) {
    stepEl.classList.toggle('active', completed);
    if (checkEl) checkEl.textContent = completed ? '✓' : '';
  }
}

// ===== LOCATION MODE =====
function setLocationMode(mode) {
  state.locationMode = mode;
  document.getElementById('btnManual')?.classList.toggle('active', mode === 'manual');
  document.getElementById('btnAuto')?.classList.toggle('active', mode === 'auto');

  if (mode === 'auto') {
    detectLocation();
  }
}

function detectLocation() {
  const indicator = document.getElementById('locatingIndicator');
  const input = document.getElementById('asalKota');

  if (indicator) indicator.style.display = 'flex';

  if (!navigator.geolocation) {
    showToast('Geolocation tidak didukung', 'error');
    if (indicator) indicator.style.display = 'none';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=id`);
        const data = await res.json();
        if (input) input.value = data.city || data.locality || 'Tidak diketahui';
        updateFormProgress();
        updateTutorialStep(4, input.value.length >= 2);
      } catch (e) {
        showToast('Gagal mendeteksi lokasi', 'error');
      }
      if (indicator) indicator.style.display = 'none';
    },
    () => {
      showToast('Izin lokasi ditolak', 'error');
      if (indicator) indicator.style.display = 'none';
    },
    { timeout: 10000 }
  );
}

// ===== FORM SUBMISSION =====
async function handleSubmit(e) {
  e.preventDefault();

  // Rate limiting
  const now = Date.now();
  const timeSinceLastSubmit = (now - state.lastSubmitTime) / 1000;
  if (timeSinceLastSubmit < CONFIG.rateLimitSeconds) {
    const waitTime = Math.ceil(CONFIG.rateLimitSeconds - timeSinceLastSubmit);
    const warnEl = document.getElementById('rateLimitWarn');
    const textEl = document.getElementById('rateLimitText');
    if (warnEl) warnEl.style.display = 'flex';
    if (textEl) textEl.textContent = `Tunggu ${waitTime} detik sebelum submit lagi`;
    setTimeout(() => { if (warnEl) warnEl.style.display = 'none'; }, 3000);
    return;
  }

  // Validation
  const nama = document.getElementById('nama');
  const umur = document.getElementById('umur');
  const usn = document.getElementById('usnHotel');
  const kota = document.getElementById('asalKota');
  const alasan = document.getElementById('alasan');

  let hasError = false;

  if (!validateField(nama, 'namaError', v => v.length >= 3, 'Nama minimal 3 karakter')) hasError = true;
  if (!validateField(umur, 'umurError', v => v && parseInt(v) >= 10 && parseInt(v) <= 80, 'Umur harus 10-80 tahun')) hasError = true;
  if (!validateField(usn, 'usnError', v => v.length >= 3, 'Username minimal 3 karakter')) hasError = true;
  if (!validateField(kota, 'kotaError', v => v.length >= 2, 'Kota minimal 2 karakter')) hasError = true;
  if (!validateField(alasan, 'alasanError', v => v.length >= 20, 'Alasan minimal 20 karakter')) hasError = true;

  if (!state.selectedAdmin) {
    const adminError = document.getElementById('adminError');
    if (adminError) {
      adminError.textContent = 'Silakan pilih admin';
      adminError.style.display = 'flex';
    }
    hasError = true;
  }

  if (hasError) {
    showToast('Mohon lengkapi semua field', 'error');
    return;
  }

  // Show processing
  showProcessing();

  // Get admin data
  const admin = ADMINS.find(a => a.id === state.selectedAdmin);

  // Build message
  const message = `*Pendaftaran Member DEVIL REIGN v${CONFIG.version}*

*Nama:* ${nama.value}
*Umur:* ${umur.value} tahun
*USN Hotel Hideaway:* ${usn.value}
*Asal Kota:* ${kota.value}
*Alasan Bergabung:* ${alasan.value}

_Terimakasih telah mendaftar!_`;

  const whatsappUrl = `https://wa.me/${admin.phone}?text=${encodeURIComponent(message)}`;

  // Save to Firebase
  try {
    const db = firebase.database();
    await db.ref('pendaftaran').push({
      nama: nama.value,
      umur: umur.value,
      usnHotel: usn.value,
      asalKota: kota.value,
      alasan: alasan.value,
      adminId: state.selectedAdmin,
      adminName: admin.name,
      timestamp: Date.now(),
      status: 'pending'
    });
  } catch (e) {
    console.log('Firebase save skipped (demo mode)');
  }

  state.lastSubmitTime = Date.now();

  // Hide processing and show success
  setTimeout(() => {
    hideProcessing();
    showSuccessModal(message, whatsappUrl, {
      nama: nama.value,
      umur: umur.value,
      usn: usn.value,
      kota: kota.value
    });
  }, 1500);
}

// ===== UI COMPONENTS =====
function showProcessing() {
  const overlay = document.getElementById('processing');
  if (overlay) {
    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('show'), 10);
  }
}

function hideProcessing() {
  const overlay = document.getElementById('processing');
  if (overlay) {
    overlay.classList.remove('show');
    setTimeout(() => overlay.style.display = 'none', 300);
  }
}

function showSuccessModal(message, whatsappUrl, data) {
  const modal = document.getElementById('successModal');
  const infoEl = document.getElementById('modalMemberInfo');
  const btn = document.getElementById('modalContinueBtn');

  if (infoEl) {
    infoEl.innerHTML = `
      <div class="modal-info-row"><span>👤</span><span>${data.nama}</span></div>
      <div class="modal-info-row"><span>🎂</span><span>${data.umur} tahun</span></div>
      <div class="modal-info-row"><span>🎮</span><span>${data.usn}</span></div>
      <div class="modal-info-row"><span>📍</span><span>${data.kota}</span></div>
    `;
  }

  if (btn) {
    btn.onclick = () => {
      window.open(whatsappUrl, '_blank');
      closeSuccessModal();
    };
  }

  if (modal) {
    modal.classList.add('show');
    startConfetti();
  }
}

function closeSuccessModal() {
  const modal = document.getElementById('successModal');
  if (modal) modal.classList.remove('show');
  stopConfetti();
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const titleEl = toast?.querySelector('.toast-title');
  const msgEl = toast?.querySelector('.toast-message');
  const iconEl = toast?.querySelector('.toast-icon');

  if (titleEl) titleEl.textContent = type === 'error' ? 'Error' : 'Info';
  if (msgEl) msgEl.textContent = message;
  if (iconEl) {
    iconEl.style.background = type === 'error'
      ? 'linear-gradient(135deg, #FF2D55, #FF3B30)'
      : 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))';
  }

  if (toast) {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

// ===== AD POPUP =====
function initAdPopup() {
  setTimeout(() => {
    const modal = document.getElementById('adPopupModal');
    if (modal && !modal.classList.contains('show')) {
      modal.classList.add('show');
    }
  }, CONFIG.adPopupDelay);
}

function closeAdPopup() {
  const modal = document.getElementById('adPopupModal');
  if (modal) modal.classList.remove('show');
}

// ===== TUTORIAL =====
function startInteractiveTutorial() {
  const overlay = document.getElementById('tutorialOverlay');
  if (overlay) {
    overlay.classList.add('active');
    state.tutorialStep = 1;
    updateTutorialPosition();
  }
}

function nextTutorialStep() {
  state.tutorialStep++;
  if (state.tutorialStep > 5) {
    skipTutorial();
    return;
  }
  updateTutorialPosition();
}

function skipTutorial() {
  const overlay = document.getElementById('tutorialOverlay');
  if (overlay) overlay.classList.remove('active');
  state.tutorialStep = 0;
}

function updateTutorialPosition() {
  const target = document.querySelector(`[data-tutorial-step="${state.tutorialStep}"]`);
  const hand = document.getElementById('tutorialHand');
  const tooltip = document.getElementById('tutorialTooltip');
  const stepNum = document.getElementById('stepNumber');
  const title = document.getElementById('tooltipTitle');
  const msg = document.getElementById('tooltipMessage');
  const dots = document.querySelectorAll('.step-dots .dot');

  const steps = [
    { title: 'Nama Lengkap', msg: 'Ketik nama lengkap Anda di sini' },
    { title: 'Umur', msg: 'Masukkan umur Anda (10-80 tahun)' },
    { title: 'USN Hotel Hideaway', msg: 'Masukkan username game Anda' },
    { title: 'Asal Kota', msg: 'Pilih lokasi Anda' },
    { title: 'Alasan Bergabung', msg: 'Ceritakan mengapa Anda ingin bergabung' }
  ];

  if (target && hand && tooltip) {
    const rect = target.getBoundingClientRect();
    hand.style.left = `${rect.left + rect.width / 2 - 30}px`;
    hand.style.top = `${rect.top + rect.height / 2 - 30}px`;

    tooltip.style.left = `${Math.min(rect.left, window.innerWidth - 300)}px`;
    tooltip.style.top = `${rect.bottom + 20}px`;
    tooltip.classList.add('show');

    target.classList.add('highlighted');
  }

  if (stepNum) stepNum.textContent = state.tutorialStep;
  if (title) title.textContent = steps[state.tutorialStep - 1]?.title || '';
  if (msg) msg.textContent = steps[state.tutorialStep - 1]?.msg || '';

  dots.forEach((dot, i) => dot.classList.toggle('active', i === state.tutorialStep - 1));
}

// ===== READING PROGRESS =====
function initReadingProgress() {
  const progress = document.getElementById('readingProgress');
  if (!progress) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progress.style.width = `${scrollPercent}%`;
  }, { passive: true });
}

// ===== TIME UPDATE =====
function initTimeUpdate() {
  const timeEl = document.getElementById('statusTime');
  if (!timeEl) return;

  const update = () => {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  };
  update();
  setInterval(update, 60000);
}

// ===== TOAST =====
function initToast() {
  setTimeout(() => {
    showToast('Selamat datang! Silakan lengkapi form pendaftaran');
  }, 1000);
}

// ===== ANIMATIONS =====
function initAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.ios-glass, .ios-header-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
  // FAB scroll
  const fab = document.getElementById('fabBtn');
  window.addEventListener('scroll', () => {
    if (fab) fab.classList.toggle('show', window.scrollY > 300);
  }, { passive: true });

  // Input focus effects
  document.querySelectorAll('.ios-input, .ios-textarea').forEach(input => {
    input.addEventListener('focus', () => {
      input.closest('.input-wrapper')?.classList.add('focused');
    });
    input.addEventListener('blur', () => {
      input.closest('.input-wrapper')?.classList.remove('focused');
    });
  });

  // Keyboard handling for mobile
  const inputs = document.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      document.body.classList.add('keyboard-open');
    });
    input.addEventListener('blur', () => {
      document.body.classList.remove('keyboard-open');
    });
  });
}

// ===== SCROLL TO TOP =====
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== THEME SYSTEM =====
function setTheme(themeName) {
  const theme = THEMES[themeName];
  if (!theme) return;

  state.themeHue = theme.hue;
  document.documentElement.style.setProperty('--primary-hue', theme.hue);
  document.body.setAttribute('data-theme', themeName);

  // Save to localStorage
  localStorage.setItem('devilreign-theme', themeName);

  // Update Firebase if available
  try {
    const db = firebase.database();
    db.ref('settings/theme').set(themeName);
  } catch (e) {
    console.log('Theme saved locally only');
  }

  showToast(`Tema ${theme.name} diterapkan`);
}

function loadTheme() {
  const savedTheme = localStorage.getItem('devilreign-theme') || 'red';
  setTheme(savedTheme);
}

function getThemeList() {
  return Object.entries(THEMES).map(([key, theme]) => ({
    key,
    name: theme.name,
    hue: theme.hue
  }));
}

// ===== MEMBER COUNT =====
async function updateMemberCount() {
  try {
    const db = firebase.database();
    const snapshot = await db.ref('pendaftaran').once('value');
    const count = snapshot.numChildren();

    const badge = document.getElementById('memberCountBadge');
    const text = document.getElementById('memberCountText');

    if (badge) badge.style.display = 'inline-flex';
    if (text) text.textContent = `${count} Anggota`;
  } catch (e) {
    console.log('Member count unavailable');
  }
}

// ===== ANNOUNCEMENT =====
async function loadAnnouncement() {
  try {
    const db = firebase.database();
    const snapshot = await db.ref('announcement').once('value');
    const data = snapshot.val();

    if (data && data.active) {
      const banner = document.getElementById('announcementBanner');
      const title = banner?.querySelector('.ann-title');
      const body = banner?.querySelector('.ann-body');

      if (banner) {
        banner.style.display = 'flex';
        banner.style.borderColor = data.color || 'rgba(255,255,255,0.1)';
      }
      if (title) title.textContent = data.title || '';
      if (body) body.textContent = data.body || '';
    }
  } catch (e) {
    console.log('Announcement unavailable');
  }
}

// ===== CONFETTI =====
let confettiInterval;
function startConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const particles = [];
  const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55'];

  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 6 + 2,
      rotation: Math.random() * 360
    });
  }

  confettiInterval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += 5;

      if (p.y > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });
  }, 30);
}

function stopConfetti() {
  if (confettiInterval) {
    clearInterval(confettiInterval);
    confettiInterval = null;
  }
  const canvas = document.getElementById('confettiCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// ===== UTILITY FUNCTIONS =====
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ===== EXPORT FOR ADMIN PANEL =====
window.DEVIL_REIGN = {
  version: CONFIG.version,
  setTheme,
  getThemeList,
  ADMINS,
  THEMES
};

// ===== CONSOLE WELCOME =====
console.log(`%c🔥 DEVIL REIGN v${CONFIG.version} 🔥`, 'color: #FF3B30; font-size: 20px; font-weight: bold;');
console.log('%cSelamat datang di konsol DEVIL REIGN!', 'color: #666;');
console.log('%cGunakan DEVIL_REIGN.setTheme("blue") untuk mengubah tema', 'color: #007AFF;');

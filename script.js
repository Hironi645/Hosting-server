// ===== DEVIL REIGN - iOS Professional Form =====
// Website by Hironi

let locationMode = 'manual';
let isLocating = false;
let currentTutorialStep = 0;
let tutorialShown = localStorage.getItem('devilReign_tutorialShown') === 'true';
let isTutorialActive = false;

// ===== GOOGLE APPS SCRIPT CONFIG =====
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwwK7GCv8_fxn9Ni_yfqp4d8I5CiArvD-3bqawiWyhoq-kcHEQlTz0Gy-uF1KrH_dXWZw/exec';

// ===== DATA ADMIN =====
// Setiap admin memiliki tema warna unik dan inisial untuk avatar
const adminList = [
  { nomor: "6285751316809", nama: "Lyonar Nna", label: "Admin 1", theme: "red", initial: "LN" },
  { nomor: "6289523827108", nama: "ÐR Nasgor", label: "Admin 2", theme: "blue", initial: "ÐN" },
  { nomor: "6285155293344", nama: "Cici Lateza", label: "Admin 3", theme: "purple", initial: "CL" },
  { nomor: "62895320390613", nama: "ÐR Cimay", label: "Admin 4", theme: "green", initial: "ÐC" },
  { nomor: "6285824168807", nama: "ÐR SanRa", label: "Admin 5", theme: "orange", initial: "ÐS" },
  { nomor: "6281318685216", nama: "Lucanne", label: "Admin 6", theme: "pink", initial: "LC" },
  { nomor: "6289504498328", nama: "vhany", label: "Admin 7", theme: "cyan", initial: "VH" }
];

// ===== ADMIN THEME COLORS =====
const adminThemes = {
  red: { primary: '#FF3B30', secondary: '#D70015', glow: 'rgba(255, 59, 48, 0.4)' },
  blue: { primary: '#007AFF', secondary: '#0051D5', glow: 'rgba(0, 122, 255, 0.4)' },
  purple: { primary: '#AF52DE', secondary: '#8E3DB8', glow: 'rgba(175, 82, 222, 0.4)' },
  green: { primary: '#34C759', secondary: '#248A3D', glow: 'rgba(52, 199, 89, 0.4)' },
  orange: { primary: '#FF9500', secondary: '#C77700', glow: 'rgba(255, 149, 0, 0.4)' },
  pink: { primary: '#FF2D55', secondary: '#C41E42', glow: 'rgba(255, 45, 85, 0.4)' },
  cyan: { primary: '#5AC8FA', secondary: '#2A9BC4', glow: 'rgba(90, 200, 250, 0.4)' }
};

// ===== BANNER IMAGES DATA =====
const bannerImages = [
  'IMG-20260204-WA0052.jpg',
  'IMG-20260211-WA0065.jpg',
  'IMG-20260211-WA0017.jpg',
  'IMG-20260131-WA0024.jpg',
  'IMG-20260213-WA0005.jpg',
  'IMG-20260213-WA0006.jpg',
  'IMG-20260211-WA0079.jpg',
  'IMG-20260211-WA0076.jpg'
];

// ===== TUTORIAL STEPS DATA =====
const tutorialStepsData = [
  {
    step: 1,
    targetId: 'namaGroup',
    title: 'Nama Lengkap',
    message: 'Ketik nama lengkap Anda di sini. Gunakan nama asli untuk verifikasi data.',
    placeholder: 'Contoh: Budi Santoso'
  },
  {
    step: 2,
    targetId: 'umurGroup',
    title: 'Umur',
    message: 'Masukkan umur Anda. Minimal 10 tahun untuk bergabung dengan komunitas.',
    placeholder: 'Contoh: 20'
  },
  {
    step: 3,
    targetId: 'usnGroup',
    title: 'USN Hotel Hideaway',
    message: 'Masukkan username game Anda untuk identifikasi dalam komunitas.',
    placeholder: 'Contoh: Player123'
  },
  {
    step: 4,
    targetId: 'kotaGroup',
    title: 'Asal Kota',
    message: 'Pilih "Manual" untuk ketik sendiri, atau "Auto Detect" untuk deteksi GPS otomatis.',
    placeholder: 'Contoh: Jakarta'
  },
  {
    step: 5,
    targetId: 'alasanGroup',
    title: 'Alasan Bergabung',
    message: 'Ceritakan mengapa Anda ingin bergabung dengan DEVIL REIGN. Tulis dengan jujur dan menarik!',
    placeholder: 'Saya ingin bergabung karena...'
  }
];

// ===== DOM Elements =====
const toast = document.getElementById('toast');
const processing = document.getElementById('processing');
const successModal = document.getElementById('successModal');
const form = document.getElementById('memberForm');
const btnManual = document.getElementById('btnManual');
const btnAuto = document.getElementById('btnAuto');
const asalKotaInput = document.getElementById('asalKota');
const locatingIndicator = document.getElementById('locatingIndicator');
const fabBtn = document.getElementById('fabBtn');
const statusTime = document.getElementById('statusTime');
const tutorialOverlay = document.getElementById('tutorialOverlay');
const tutorialHand = document.getElementById('tutorialHand');
const tutorialTooltip = document.getElementById('tutorialTooltip');
const stepNumber = document.getElementById('stepNumber');
const tooltipTitle = document.getElementById('tooltipTitle');
const tooltipMessage = document.getElementById('tooltipMessage');
const adPopupModal = document.getElementById('adPopupModal');

// Typing simulation state
let typingInterval = null;
let isTyping = false;

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
  // Generate admin cards dinamis
  generateAdminCards();

  // Generate moving banner
  generateMovingBanner();

  // Start clock
  updateClock();
  setInterval(updateClock, 1000);

  // Setup scroll listener for FAB
  setupScrollListener();

  // Setup input animations
  setupInputAnimations();

  // Show advertisement popup after delay
  setTimeout(showAdPopup, 8000);

  // Show welcome message
  setTimeout(() => {
    if (!tutorialShown) {
      showToast('Selamat Datang! 👋', 'Klik "Lihat Tutorial" untuk panduan pengisian form', 4000);
    } else {
      showToast('Selamat Datang Kembali!', 'Silakan lengkapi form pendaftaran member', 3000);
    }
  }, 1000);
});

// ===== ADVERTISEMENT POPUP FUNCTIONS =====
function showAdPopup() {
  if (adPopupModal) {
    adPopupModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
    
    console.log('%c [IKLAN] Popup ditampilkan ', 'background: #007AFF; color: white; font-size: 12px; padding: 4px 8px; border-radius: 4px;');
  }
}

function closeAdPopup() {
  if (adPopupModal) {
    adPopupModal.classList.remove('show');
    document.body.style.overflow = '';
    
    // Simpan ke localStorage bahwa user sudah melihat popup
    localStorage.setItem('devilReign_adPopupShown', new Date().toISOString());
  }
}

// ===== GENERATE ADMIN CARDS =====
function generateAdminCards() {
  const adminGrid = document.getElementById('adminGrid');
  if (!adminGrid) return;

  adminGrid.innerHTML = '';

  adminList.forEach((admin, index) => {
    const theme = adminThemes[admin.theme];
    const card = document.createElement('label');
    card.className = `admin-card admin-theme-${admin.theme}`;
    card.style.setProperty('--admin-primary', theme.primary);
    card.style.setProperty('--admin-secondary', theme.secondary);
    card.style.setProperty('--admin-glow', theme.glow);
    
    card.innerHTML = `
      <input type="radio" name="admin" value="${admin.nomor}" data-admin-name="${admin.nama}" class="admin-radio" required>
      <div class="admin-content">
        <div class="admin-avatar">
          <span class="admin-initial">${admin.initial}</span>
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

// ===== GENERATE SLIDER BANNER =====
let currentSlide = 0;
let slideInterval;
let isSliderPaused = false;

function generateMovingBanner() {
  const bannerContainer = document.getElementById('movingBanner');
  if (!bannerContainer) return;

  bannerContainer.innerHTML = '';

  const bannerWrapper = document.createElement('div');
  bannerWrapper.className = 'slider-wrapper';

  const bannerTrack = document.createElement('div');
  bannerTrack.className = 'slider-track';
  bannerTrack.id = 'sliderTrack';

  bannerImages.forEach((imgSrc, index) => {
    const bannerSlide = document.createElement('div');
    bannerSlide.className = 'slider-slide';
    bannerSlide.innerHTML = `
      <img src="${imgSrc}" alt="Banner ${index + 1}" loading="lazy">
      <div class="slide-overlay">
        <span class="slide-number">${index + 1}/${bannerImages.length}</span>
      </div>
    `;
    bannerTrack.appendChild(bannerSlide);
  });

  bannerWrapper.appendChild(bannerTrack);
  bannerContainer.appendChild(bannerWrapper);

  addSliderNavigation(bannerContainer, bannerTrack);
  startAutoSlide(bannerTrack);
}

// ===== SLIDER NAVIGATION =====
function addSliderNavigation(container, track) {
  // Prev Button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'slider-nav prev';
  prevBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  `;
  prevBtn.title = 'Sebelumnya';
  prevBtn.onclick = () => {
    goToSlide(currentSlide - 1, track);
    resetAutoSlide(track);
  };
  container.appendChild(prevBtn);

  // Next Button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'slider-nav next';
  nextBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  `;
  nextBtn.title = 'Berikutnya';
  nextBtn.onclick = () => {
    goToSlide(currentSlide + 1, track);
    resetAutoSlide(track);
  };
  container.appendChild(nextBtn);

  // Dots
  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'slider-dots';
  bannerImages.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (index === 0 ? ' active' : '');
    dot.onclick = () => {
      goToSlide(index, track);
      resetAutoSlide(track);
    };
    dotsContainer.appendChild(dot);
  });
  container.appendChild(dotsContainer);

  // Hover pause
  container.addEventListener('mouseenter', () => {
    isSliderPaused = true;
    clearInterval(slideInterval);
  });

  container.addEventListener('mouseleave', () => {
    isSliderPaused = false;
    startAutoSlide(track);
  });

  // Touch swipe
  let touchStartX = 0;
  let touchEndX = 0;

  container.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe(track);
  }, { passive: true });

  function handleSwipe(track) {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        goToSlide(currentSlide + 1, track);
      } else {
        goToSlide(currentSlide - 1, track);
      }
      resetAutoSlide(track);
    }
  }
}

// ===== SLIDER FUNCTIONS =====
function goToSlide(index, track) {
  const totalSlides = bannerImages.length;
  
  if (index < 0) {
    currentSlide = totalSlides - 1;
  } else if (index >= totalSlides) {
    currentSlide = 0;
  } else {
    currentSlide = index;
  }

  track.style.transform = `translateX(-${currentSlide * 100}%)`;

  const dots = document.querySelectorAll('.slider-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });
}

function startAutoSlide(track) {
  if (isSliderPaused) return;
  
  clearInterval(slideInterval);
  slideInterval = setInterval(() => {
    goToSlide(currentSlide + 1, track);
  }, 5000);
}

function resetAutoSlide(track) {
  clearInterval(slideInterval);
  if (!isSliderPaused) {
    startAutoSlide(track);
  }
}

// ===== INTERACTIVE TUTORIAL =====
function startInteractiveTutorial() {
  isTutorialActive = true;
  currentTutorialStep = 0;
  tutorialOverlay.classList.add('active');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  setTimeout(() => {
    showTutorialStep(0);
  }, 500);
}

function showTutorialStep(stepIndex) {
  if (stepIndex >= tutorialStepsData.length) {
    endTutorial();
    return;
  }

  currentTutorialStep = stepIndex;
  const step = tutorialStepsData[stepIndex];
  const targetElement = document.getElementById(step.targetId);
  
  if (!targetElement) {
    endTutorial();
    return;
  }

  stopTypingSimulation();

  document.querySelectorAll('.tutorial-target').forEach(el => {
    el.classList.remove('highlighted');
    el.style.position = '';
    el.style.zIndex = '';
    
    const input = el.querySelector('.ios-input, .ios-textarea');
    if (input) input.value = '';
  });
  
  targetElement.classList.add('highlighted');
  
  const computedStyle = window.getComputedStyle(targetElement);
  if (computedStyle.position === 'static') {
    targetElement.style.position = 'relative';
  }
  targetElement.style.zIndex = '9999';

  targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

  setTimeout(() => {
    const rect = targetElement.getBoundingClientRect();
    const tooltipWidth = 280;
    const tooltipHeight = 160;
    const margin = 20;
    
    // Position hand on the input element
    const handX = rect.left + rect.width / 2 - 40;
    const handY = rect.top + rect.height / 2 - 40;

    tutorialHand.style.left = `${handX}px`;
    tutorialHand.style.top = `${handY}px`;

    tutorialHand.classList.add('tapping');
    setTimeout(() => tutorialHand.classList.remove('tapping'), 400);

    // Calculate tooltip position - always below the element
    let tooltipX = rect.left + (rect.width / 2) - (tooltipWidth / 2);
    let tooltipY = rect.bottom + margin;
    let positionClass = 'tooltip-below';
    
    // Check if tooltip would go off-screen on the right
    if (tooltipX + tooltipWidth > window.innerWidth - margin) {
      tooltipX = window.innerWidth - tooltipWidth - margin;
    }
    // Check if tooltip would go off-screen on the left
    if (tooltipX < margin) {
      tooltipX = margin;
    }
    
    // If tooltip would go below the viewport, position it above the element
    if (tooltipY + tooltipHeight > window.innerHeight - margin) {
      tooltipY = rect.top - tooltipHeight - margin;
      positionClass = 'tooltip-above';
    }

    tutorialTooltip.style.left = `${tooltipX}px`;
    tutorialTooltip.style.top = `${tooltipY}px`;
    
    // Remove old position classes and add new one
    tutorialTooltip.classList.remove('tooltip-below', 'tooltip-above');
    tutorialTooltip.classList.add(positionClass);

    stepNumber.textContent = step.step;
    tooltipTitle.textContent = step.title;
    tooltipMessage.textContent = step.message;

    const dots = document.querySelectorAll('.step-dots .dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === stepIndex);
    });

    tutorialTooltip.classList.add('show');

    updateTutorialGuideCard(stepIndex);

    if (step.placeholder) {
      simulateTyping(step.targetId, step.placeholder);
    }
  }, 500);
}

function simulateTyping(targetId, text) {
  const input = document.querySelector(`#${targetId} .ios-input, #${targetId} .ios-textarea`);
  if (!input || !text) return;

  if (typingInterval) {
    clearInterval(typingInterval);
    typingInterval = null;
  }
  isTyping = false;

  input.value = '';
  input.classList.add('typing-active');
  input.parentElement.classList.add('typing-cursor');
  
  let charIndex = 0;
  isTyping = true;
  
  const getTypingSpeed = () => Math.random() * 80 + 40;
  
  function typeNextChar() {
    if (!isTyping || charIndex >= text.length) {
      clearInterval(typingInterval);
      typingInterval = null;
      isTyping = false;
      input.classList.remove('typing-active');
      input.parentElement.classList.remove('typing-cursor');
      
      setTimeout(() => {
        if (input.value === text) {
          input.classList.add('typing-fade-out');
          setTimeout(() => {
            input.value = '';
            input.classList.remove('typing-fade-out');
          }, 300);
        }
      }, 1500);
      return;
    }
    
    input.value += text[charIndex];
    charIndex++;
    
    clearInterval(typingInterval);
    typingInterval = setTimeout(typeNextChar, getTypingSpeed());
  }
  
  setTimeout(typeNextChar, 400);
}

function stopTypingSimulation() {
  isTyping = false;
  if (typingInterval) {
    clearTimeout(typingInterval);
    typingInterval = null;
  }
  
  document.querySelectorAll('.typing-active, .typing-cursor, .typing-fade-out').forEach(el => {
    el.classList.remove('typing-active', 'typing-cursor', 'typing-fade-out');
  });
}

function nextTutorialStep() {
  stopTypingSimulation();
  
  const currentStep = tutorialStepsData[currentTutorialStep];
  if (currentStep) {
    const targetElement = document.getElementById(currentStep.targetId);
    if (targetElement) {
      targetElement.classList.remove('highlighted');
      targetElement.style.zIndex = '';
      targetElement.style.position = '';
      
      const input = targetElement.querySelector('.ios-input, .ios-textarea');
      if (input) input.value = '';
    }
  }

  tutorialTooltip.classList.remove('show');
  
  setTimeout(() => {
    showTutorialStep(currentTutorialStep + 1);
  }, 300);
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
    el.classList.remove('highlighted');
    el.style.zIndex = '';
    el.style.position = '';
    
    const input = el.querySelector('.ios-input, .ios-textarea');
    if (input) input.value = '';
  });

  tutorialTooltip.classList.remove('show');
  tutorialOverlay.classList.remove('active');
  
  localStorage.setItem('devilReign_tutorialShown', 'true');
  tutorialShown = true;

  showToast('Tutorial Selesai! 🎉', 'Silakan isi form dengan data Anda', 3000);
}

function updateTutorialGuideCard(activeStep) {
  const steps = document.querySelectorAll('.tutorial-step');
  steps.forEach((step, index) => {
    step.classList.toggle('active', index === activeStep);
  });
}

// ===== CLOCK =====
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  if (statusTime) {
    statusTime.textContent = `${hours}:${minutes}`;
  }
}

// ===== TOAST FUNCTIONS =====
function showToast(title, message, duration = 3000) {
  const toastTitle = toast.querySelector('.toast-title');
  const toastMessage = toast.querySelector('.toast-message');
  
  const oldIndicator = toast.querySelector('.toast-step-indicator');
  const oldActions = toast.querySelector('.toast-actions');
  if (oldIndicator) oldIndicator.remove();
  if (oldActions) oldActions.remove();

  toastTitle.textContent = title;
  toastMessage.textContent = message;

  toast.classList.add('show');
  
  if (duration > 0) {
    setTimeout(() => hideToast(), duration);
  }
}

function hideToast() {
  toast.classList.remove('show');
  
  setTimeout(() => {
    const oldIndicator = toast.querySelector('.toast-step-indicator');
    const oldActions = toast.querySelector('.toast-actions');
    if (oldIndicator) oldIndicator.remove();
    if (oldActions) oldActions.remove();
  }, 400);
}

// ===== MODAL FUNCTIONS =====
function showModal() {
  successModal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  successModal.classList.remove('show');
  document.body.style.overflow = '';
}

// ===== PROCESSING OVERLAY =====
function showProcessing() {
  processing.style.display = 'flex';
  processing.offsetHeight;
  processing.classList.add('show');
}

function hideProcessing() {
  processing.classList.remove('show');
  setTimeout(() => {
    processing.style.display = 'none';
  }, 300);
}

// ===== LOCATION MODE TOGGLE =====
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

// ===== GET CURRENT LOCATION =====
function getCurrentLocation() {
  if (!navigator.geolocation) {
    showToast('Error', 'Browser tidak mendukung geolokasi');
    setLocationMode('manual');
    return;
  }

  isLocating = true;
  asalKotaInput.disabled = true;
  asalKotaInput.placeholder = 'Mendeteksi lokasi...';
  asalKotaInput.value = '';
  locatingIndicator.style.display = 'flex';

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
        );
        const data = await response.json();

        const city = data.address.city || 
                    data.address.town || 
                    data.address.district || 
                    data.address.state || 
                    data.address.county ||
                    'Lokasi tidak diketahui';

        asalKotaInput.value = city;
        isLocating = false;
        asalKotaInput.disabled = false;
        locatingIndicator.style.display = 'none';

        showToast('Lokasi Ditemukan! 📍', `Kota: ${city}`, 2500);
      } catch (error) {
        handleLocationError('Gagal mendapatkan nama kota');
      }
    },
    (error) => {
      let errorMsg = 'Gagal mendapatkan lokasi';
      if (error.code === 1) errorMsg = 'Izin lokasi ditolak';
      else if (error.code === 2) errorMsg = 'Lokasi tidak tersedia';
      else if (error.code === 3) errorMsg = 'Timeout mendapatkan lokasi';

      handleLocationError(errorMsg);
    },
    { timeout: 15000, enableHighAccuracy: true }
  );
}

function handleLocationError(message) {
  isLocating = false;
  asalKotaInput.disabled = false;
  asalKotaInput.placeholder = 'Masukkan asal kota';
  locatingIndicator.style.display = 'none';

  showToast('Error', message, 3000);
  setLocationMode('manual');
}

// ===== ADMIN CARDS SETUP =====
function setupAdminCards() {
  const adminCards = document.querySelectorAll('.admin-card');

  adminCards.forEach(card => {
    card.replaceWith(card.cloneNode(true));
  });

  const newAdminCards = document.querySelectorAll('.admin-card');

  newAdminCards.forEach(card => {
    card.addEventListener('click', () => {
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }

      newAdminCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });
}

// ===== SCROLL LISTENER =====
function setupScrollListener() {
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 300) {
      fabBtn.classList.add('show');
    } else {
      fabBtn.classList.remove('show');
    }

    lastScrollY = currentScrollY;
  }, { passive: true });
}

// ===== SCROLL TO TOP =====
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// ===== INPUT ANIMATIONS =====
function setupInputAnimations() {
  const inputs = document.querySelectorAll('.ios-input, .ios-textarea, .ios-select');

  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement.classList.add('focused');
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    });

    input.addEventListener('blur', () => {
      input.parentElement.classList.remove('focused');
    });
  });
}

// ===== GET SELECTED ADMIN =====
function getSelectedAdmin() {
  const selectedRadio = document.querySelector('input[name="admin"]:checked');
  return selectedRadio ? selectedRadio.value : null;
}

// ===== GET SELECTED ADMIN NAME =====
function getSelectedAdminName() {
  const selectedRadio = document.querySelector('input[name="admin"]:checked');
  return selectedRadio ? selectedRadio.getAttribute('data-admin-name') : null;
}

// ===== GENERATE WHATSAPP MESSAGE =====
function generateWhatsAppMessage(formData) {
  const date = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return `*DEVIL REIGN — FORM MEMBER*
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

۝ Satu Reign, Satu Kekuasaan ۝`;
}

// ===== SEND DATA TO GOOGLE SHEETS =====
async function sendToGoogleSheets(formData) {
  try {
    const data = {
      nama: formData.nama,
      umur: formData.umur,
      usnHotel: formData.usnHotel,
      asalKota: formData.asalKota,
      alasan: formData.alasan,
      admin: formData.adminName,
      adminNomor: formData.admin,
      tanggal: new Date().toLocaleString('id-ID'),
      timestamp: new Date().toISOString()
    };

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    console.log('%c [GOOGLE SHEETS] Data terkirim ', 'background: #34C759; color: white; font-size: 12px; padding: 4px 8px; border-radius: 4px;');
    return true;
  } catch (error) {
    console.error('%c [GOOGLE SHEETS] Error: ', 'background: #FF3B30; color: white; font-size: 12px; padding: 4px 8px; border-radius: 4px;', error);
    // Return true anyway since no-cors doesn't give us response info
    return true;
  }
}

// ===== FORM SUBMIT HANDLER =====
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    nama: document.getElementById('nama').value.trim(),
    umur: document.getElementById('umur').value.trim(),
    usnHotel: document.getElementById('usnHotel').value.trim(),
    asalKota: document.getElementById('asalKota').value.trim(),
    alasan: document.getElementById('alasan').value.trim(),
    admin: getSelectedAdmin(),
    adminName: getSelectedAdminName()
  };

  const validations = [
    { field: 'nama', message: 'Mohon isi nama lengkap' },
    { field: 'umur', message: 'Mohon isi umur' },
    { field: 'usnHotel', message: 'Mohon isi USN Hotel Hideaway' },
    { field: 'asalKota', message: 'Mohon isi asal kota' },
    { field: 'alasan', message: 'Mohon isi alasan bergabung' }
  ];

  for (const validation of validations) {
    if (!formData[validation.field]) {
      showToast('Form Belum Lengkap ⚠️', validation.message, 3000);
      document.getElementById(validation.field).focus();

      const input = document.getElementById(validation.field);
      input.style.animation = 'shake 0.5s ease';
      setTimeout(() => input.style.animation = '', 500);

      return;
    }
  }

  if (!formData.admin) {
    showToast('Form Belum Lengkap ⚠️', 'Mohon pilih admin tujuan', 3000);
    document.querySelector('.admin-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  showProcessing();

  // Kirim data ke Google Sheets
  const sheetsPromise = sendToGoogleSheets(formData);
  
  // Tunggu minimal 2 detik untuk UX
  const delayPromise = new Promise(resolve => setTimeout(resolve, 2000));
  
  await Promise.all([sheetsPromise, delayPromise]);

  hideProcessing();
  showModal();

  const modalBtn = successModal.querySelector('.modal-btn');
  modalBtn.onclick = () => {
    closeModal();

    const message = encodeURIComponent(generateWhatsAppMessage(formData));
    const whatsappUrl = `https://wa.me/${formData.admin}?text=${message}`;

    window.open(whatsappUrl, '_blank');

    setTimeout(() => {
      showToast('Berhasil! ✅', 'Data telah dikirim ke Google Sheets & WhatsApp admin', 2500);
    }, 500);

    setTimeout(() => {
      form.reset();
      setLocationMode('manual');
      generateAdminCards();
    }, 2000);
  };
});

// ===== TUTORIAL AGAIN FUNCTION =====
function showTutorialAgain() {
  localStorage.removeItem('devilReign_tutorialShown');
  tutorialShown = false;
  startInteractiveTutorial();
}

// ===== SHAKE ANIMATION =====
const shakeKeyframes = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

@keyframes typingSimulation {
  0%, 100% { border-color: rgba(255, 59, 48, 0.4); }
  50% { border-color: rgba(255, 59, 48, 0.8); }
}

.typing-simulation {
  animation: typingSimulation 0.5s ease-in-out 3;
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = shakeKeyframes;
document.head.appendChild(styleSheet);

// ===== PREVENT ZOOM ON IOS =====
document.addEventListener('gesturestart', (e) => {
  e.preventDefault();
});

// ===== DOUBLE TAP PREVENTION =====
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    e.preventDefault();
  }
  lastTouchEnd = now;
}, false);

// ===== CONSOLE BRANDING =====
console.log('%c DEVIL REIGN ', 'background: linear-gradient(135deg, #FF3B30, #D70015); color: white; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 10px;');
console.log('%c Form Pendaftaran Member ', 'color: #FF3B30; font-size: 14px;');
console.log('%c Crafted by Hironi ', 'color: #666; font-size: 12px;');
console.log('%c Tutorial: Ketik showTutorialAgain() untuk melihat tutorial lagi ', 'color: #FF9500; font-size: 12px;');
console.log('%c Iklan: Ketik showAdPopup() untuk melihat popup iklan ', 'color: #007AFF; font-size: 12px;');

// ===== EXPORT FUNCTIONS =====
window.showTutorialAgain = showTutorialAgain;
window.showAdPopup = showAdPopup;
window.closeAdPopup = closeAdPopup;

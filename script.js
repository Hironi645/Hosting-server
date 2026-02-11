// ===== DEVIL REIGN - iOS Professional Form =====
// Website by Hironi

let locationMode = 'manual';
let isLocating = false;
let currentTutorialStep = 0;
let tutorialShown = localStorage.getItem('devilReign_tutorialShown') === 'true';
let isTutorialActive = false;

// Tutorial steps data
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
    placeholder: ''
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

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
  // Start clock
  updateClock();
  setInterval(updateClock, 1000);

  // Setup scroll listener for FAB
  setupScrollListener();

  // Setup input animations
  setupInputAnimations();

  // Setup admin card selection
  setupAdminCards();

  // Show welcome message (not auto tutorial anymore)
  setTimeout(() => {
    if (!tutorialShown) {
      showToast('Selamat Datang! 👋', 'Klik "Lihat Tutorial" untuk panduan pengisian form');
      setTimeout(() => hideToast(), 4000);
    } else {
      showToast('Selamat Datang Kembali!', 'Silakan lengkapi form pendaftaran member');
      setTimeout(() => hideToast(), 3000);
    }
  }, 800);
});

// ===== INTERACTIVE TUTORIAL =====
function startInteractiveTutorial() {
  isTutorialActive = true;
  currentTutorialStep = 0;
  tutorialOverlay.classList.add('active');
  
  // Scroll to top first
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

  // Remove previous highlights
  document.querySelectorAll('.tutorial-target').forEach(el => {
    el.classList.remove('highlighted');
  });
  
  // Highlight current target
  targetElement.classList.add('highlighted');

  // Scroll to target
  targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Get target position
  setTimeout(() => {
    const rect = targetElement.getBoundingClientRect();
    const handX = rect.left + rect.width / 2 - 40;
    const handY = rect.top + rect.height / 2 - 40;

    // Move hand to target
    tutorialHand.style.left = `${handX}px`;
    tutorialHand.style.top = `${handY}px`;

    // Add tapping animation
    tutorialHand.classList.add('tapping');
    setTimeout(() => tutorialHand.classList.remove('tapping'), 400);

    // Position tooltip
    let tooltipX = rect.right + 20;
    let tooltipY = rect.top;

    // Adjust if tooltip goes off screen
    if (tooltipX + 320 > window.innerWidth) {
      tooltipX = rect.left - 340;
    }
    if (tooltipY + 200 > window.innerHeight) {
      tooltipY = window.innerHeight - 220;
    }
    if (tooltipX < 10) tooltipX = 10;
    if (tooltipY < 10) tooltipY = rect.top + rect.height + 20;

    tutorialTooltip.style.left = `${tooltipX}px`;
    tutorialTooltip.style.top = `${tooltipY}px`;

    // Update tooltip content
    stepNumber.textContent = step.step;
    tooltipTitle.textContent = step.title;
    tooltipMessage.textContent = step.message;

    // Update dots
    const dots = document.querySelectorAll('.step-dots .dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === stepIndex);
    });

    // Show tooltip
    tutorialTooltip.classList.add('show');

    // Update tutorial guide card
    updateTutorialGuideCard(stepIndex);

    // Simulate typing effect in the input
    if (step.placeholder) {
      simulateTyping(step.targetId, step.placeholder);
    }
  }, 500);
}

function simulateTyping(targetId, text) {
  const input = document.querySelector(`#${targetId} .ios-input`);
  if (!input) return;

  // Clear previous simulation
  input.placeholder = text;
  
  // Add typing animation class
  input.classList.add('typing-simulation');
  setTimeout(() => {
    input.classList.remove('typing-simulation');
  }, 1500);
}

function nextTutorialStep() {
  // Remove current highlight
  const currentStep = tutorialStepsData[currentTutorialStep];
  if (currentStep) {
    const targetElement = document.getElementById(currentStep.targetId);
    if (targetElement) {
      targetElement.classList.remove('highlighted');
    }
  }

  tutorialTooltip.classList.remove('show');
  
  setTimeout(() => {
    showTutorialStep(currentTutorialStep + 1);
  }, 300);
}

function skipTutorial() {
  localStorage.setItem('devilReign_tutorialShown', 'true');
  tutorialShown = true;
  endTutorial();
}

function endTutorial() {
  isTutorialActive = false;
  
  // Remove all highlights
  document.querySelectorAll('.tutorial-target').forEach(el => {
    el.classList.remove('highlighted');
  });

  tutorialTooltip.classList.remove('show');
  tutorialOverlay.classList.remove('active');
  
  localStorage.setItem('devilReign_tutorialShown', 'true');
  tutorialShown = true;

  showToast('Tutorial Selesai! 🎉', 'Silakan isi form dengan data Anda');
  setTimeout(() => hideToast(), 3000);
}

function updateTutorialGuideCard(activeStep) {
  const steps = document.querySelectorAll('.tutorial-step');
  steps.forEach((step, index) => {
    step.classList.toggle('active', index === activeStep);
  });
}

// ===== Clock =====
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  if (statusTime) {
    statusTime.textContent = `${hours}:${minutes}`;
  }
}

// ===== Toast Functions =====
function showToast(title, message, duration = 3000) {
  const toastTitle = toast.querySelector('.toast-title');
  const toastMessage = toast.querySelector('.toast-message');
  
  // Remove tutorial elements if present
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
  
  // Clean up tutorial elements after animation
  setTimeout(() => {
    const oldIndicator = toast.querySelector('.toast-step-indicator');
    const oldActions = toast.querySelector('.toast-actions');
    if (oldIndicator) oldIndicator.remove();
    if (oldActions) oldActions.remove();
  }, 400);
}

// ===== Modal Functions =====
function showModal() {
  successModal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  successModal.classList.remove('show');
  document.body.style.overflow = '';
}

// ===== Processing Overlay =====
function showProcessing() {
  processing.style.display = 'flex';
  // Force reflow
  processing.offsetHeight;
  processing.classList.add('show');
}

function hideProcessing() {
  processing.classList.remove('show');
  setTimeout(() => {
    processing.style.display = 'none';
  }, 300);
}

// ===== Location Mode Toggle =====
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

// ===== Get Current Location =====
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

        // Using OpenStreetMap Nominatim API
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

        showToast('Lokasi Ditemukan! 📍', `Kota: ${city}`);
        setTimeout(hideToast, 2500);
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

  showToast('Error', message);
  setTimeout(hideToast, 3000);
  setLocationMode('manual');
}

// ===== Admin Cards Setup =====
function setupAdminCards() {
  const adminCards = document.querySelectorAll('.admin-card');
  
  adminCards.forEach(card => {
    card.addEventListener('click', () => {
      // Haptic feedback on mobile
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    });
  });
}

// ===== Scroll Listener for FAB =====
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

// ===== Scroll to Top =====
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// ===== Input Animations =====
function setupInputAnimations() {
  const inputs = document.querySelectorAll('.ios-input, .ios-textarea, .ios-select');

  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement.classList.add('focused');
      // Haptic feedback on mobile
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    });

    input.addEventListener('blur', () => {
      input.parentElement.classList.remove('focused');
    });
  });
}

// ===== Get Selected Admin =====
function getSelectedAdmin() {
  const selectedRadio = document.querySelector('input[name="admin"]:checked');
  return selectedRadio ? selectedRadio.value : null;
}

// ===== Generate WhatsApp Message =====
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

// ===== Form Submit Handler =====
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Get form data
  const formData = {
    nama: document.getElementById('nama').value.trim(),
    umur: document.getElementById('umur').value.trim(),
    usnHotel: document.getElementById('usnHotel').value.trim(),
    asalKota: document.getElementById('asalKota').value.trim(),
    alasan: document.getElementById('alasan').value.trim(),
    admin: getSelectedAdmin()
  };

  // Validation
  const validations = [
    { field: 'nama', message: 'Mohon isi nama lengkap' },
    { field: 'umur', message: 'Mohon isi umur' },
    { field: 'usnHotel', message: 'Mohon isi USN Hotel Hideaway' },
    { field: 'asalKota', message: 'Mohon isi asal kota' },
    { field: 'alasan', message: 'Mohon isi alasan bergabung' }
  ];

  for (const validation of validations) {
    if (!formData[validation.field]) {
      showToast('Form Belum Lengkap ⚠️', validation.message);
      setTimeout(hideToast, 3000);
      document.getElementById(validation.field).focus();

      // Shake animation
      const input = document.getElementById(validation.field);
      input.style.animation = 'shake 0.5s ease';
      setTimeout(() => input.style.animation = '', 500);

      return;
    }
  }

  if (!formData.admin) {
    showToast('Form Belum Lengkap ⚠️', 'Mohon pilih admin tujuan');
    setTimeout(hideToast, 3000);
    // Scroll to admin section
    document.querySelector('.admin-group').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Show processing overlay
  showProcessing();

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Hide processing
  hideProcessing();

  // Show success modal
  showModal();

  // Wait for modal close then open WhatsApp
  const modalBtn = successModal.querySelector('.modal-btn');
  modalBtn.onclick = () => {
    closeModal();

    // Generate WhatsApp message
    const message = encodeURIComponent(generateWhatsAppMessage(formData));
    const whatsappUrl = `https://wa.me/${formData.admin}?text=${message}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');

    // Show success toast
    setTimeout(() => {
      showToast('Berhasil! ✅', 'Data akan dikirim ke WhatsApp admin');
      setTimeout(hideToast, 2500);
    }, 500);

    // Reset form after delay
    setTimeout(() => {
      form.reset();
      setLocationMode('manual');
      // Remove selected class from admin cards
      document.querySelectorAll('.admin-card').forEach(card => {
        card.classList.remove('selected');
      });
    }, 2000);
  };
});

// ===== Help Button Function =====
function showTutorialAgain() {
  localStorage.removeItem('devilReign_tutorialShown');
  tutorialShown = false;
  startInteractiveTutorial();
}

// ===== Shake Animation Keyframes =====
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

// ===== Prevent zoom on iOS =====
document.addEventListener('gesturestart', (e) => {
  e.preventDefault();
});

// ===== Double tap prevention =====
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    e.preventDefault();
  }
  lastTouchEnd = now;
}, false);
// ===== DELAYED ADVERTISEMENT BANNER =====
// Menampilkan iklan setelah 5 detik

document.addEventListener('DOMContentLoaded', function() {
  // Sembunyikan banner iklan saat pertama kali load
  const adBanner = document.getElementById('adBanner');
  if (adBanner) {
    adBanner.style.display = 'none';
    
    // Tampilkan iklan setelah 5 detik
    setTimeout(function() {
      adBanner.style.display = 'block';
      
      // Animasi fade in
      adBanner.style.animation = 'none';
      adBanner.offsetHeight; // Trigger reflow
      adBanner.style.animation = 'adSlideDown 0.6s ease-out';
      
      // Haptic feedback jika tersedia
      if (navigator.vibrate) {
        navigator.vibrate(20);
      }
      
      // Kirim event ke Google Analytics jika ada
      if (typeof gtag !== 'undefined') {
        gtag('event', 'ad_shown', {
          'event_category': 'advertisement',
          'event_label': 'jasa_pembuatan_website',
          'value': 5000
        });
      }
      
      console.log('%c [IKLAN] Banner ditampilkan setelah 5 detik ', 'background: #007AFF; color: white; font-size: 12px; padding: 4px 8px; border-radius: 4px;');
    }, 5000); // 5000ms = 5 detik
  }
});

// ===== INTERAKSI IKLAN YANG LEBIH BAIK =====
// Menambahkan efek saat iklan diklik

document.addEventListener('DOMContentLoaded', function() {
  const adBanner = document.getElementById('adBanner');
  if (adBanner) {
    adBanner.addEventListener('click', function(e) {
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([10, 20, 10]);
      }
      
      // Animasi klik
      this.style.transform = 'scale(0.98)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 200);
      
      // Simpan ke localStorage bahwa user pernah klik iklan
      localStorage.setItem('hironi_ad_clicked', new Date().toISOString());
      
      console.log('%c [IKLAN] Diklik oleh user ', 'background: #34C759; color: white; font-size: 12px; padding: 4px 8px; border-radius: 4px;');
    });
  }
});

// ===== FUNGSI UNTUK TESTING IKLAN =====
// Bisa dipanggil dari console untuk testing

function showAdNow() {
  const adBanner = document.getElementById('adBanner');
  if (adBanner) {
    adBanner.style.display = 'block';
    adBanner.style.animation = 'adSlideDown 0.6s ease-out';
    console.log('%c [TEST] Iklan ditampilkan secara manual ', 'background: #FF9500; color: white; font-size: 12px; padding: 4px 8px; border-radius: 4px;');
  }
}

function hideAdNow() {
  const adBanner = document.getElementById('adBanner');
  if (adBanner) {
    adBanner.style.display = 'none';
    console.log('%c [TEST] Iklan disembunyikan ', 'background: #FF3B30; color: white; font-size: 12px; padding: 4px 8px; border-radius: 4px;');
  }
}

// Export fungsi ke window agar bisa dipanggil dari console
window.showAdNow = showAdNow;
window.hideAdNow = hideAdNow;

// ===== Console branding =====
console.log('%c DEVIL REIGN ', 'background: linear-gradient(135deg, #FF3B30, #D70015); color: white; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 10px;');
console.log('%c Form Pendaftaran Member ', 'color: #FF3B30; font-size: 14px;');
console.log('%c Crafted by Hironi ', 'color: #666; font-size: 12px;');
console.log('%c Tutorial: Ketik showTutorialAgain() untuk melihat tutorial lagi ', 'color: #FF9500; font-size: 12px;');

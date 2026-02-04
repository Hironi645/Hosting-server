// ===== DEVIL REIGN - iOS Professional Form =====
// Website by Hironi

let locationMode = 'manual';
let isLocating = false;

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

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
  // Show welcome toast
  setTimeout(() => {
    showToast('Selamat Datang!', 'Silakan lengkapi form pendaftaran member');
    setTimeout(() => hideToast(), 4500);
  }, 600);

  // Start clock
  updateClock();
  setInterval(updateClock, 1000);

  // Animate stats
  animateStats();

  // Setup scroll listener for FAB
  setupScrollListener();

  // Setup input animations
  setupInputAnimations();
});

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
function showToast(title, message) {
  const toastTitle = toast.querySelector('.toast-title');
  const toastMessage = toast.querySelector('.toast-message');

  toastTitle.textContent = title;
  toastMessage.textContent = message;

  toast.classList.add('show');
}

function hideToast() {
  toast.classList.remove('show');
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

        showToast('Lokasi Ditemukan', `Kota: ${city}`);
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

// ===== Stats Animation =====
function animateStats() {
  const statNumbers = document.querySelectorAll('.stat-number');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const count = parseInt(target.getAttribute('data-count'));
        animateNumber(target, count);
        observer.unobserve(target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(stat => observer.observe(stat));
}

function animateNumber(element, target) {
  const duration = 2000;
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(start + (target - start) * easeOutQuart);

    element.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target.toLocaleString();
    }
  }

  requestAnimationFrame(update);
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
    admin: document.getElementById('admin').value
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
      showToast('Form Belum Lengkap', validation.message);
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
    showToast('Form Belum Lengkap', 'Mohon pilih admin');
    setTimeout(hideToast, 3000);
    document.getElementById('admin').focus();
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
      showToast('Berhasil!', 'Data akan dikirim ke WhatsApp');
      setTimeout(hideToast, 2500);
    }, 500);

    // Reset form after delay
    setTimeout(() => {
      form.reset();
      setLocationMode('manual');
    }, 2000);
  };
});

// ===== Shake Animation Keyframes =====
const shakeKeyframes = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
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

// ===== Console branding =====
console.log('%c DEVIL REIGN ', 'background: linear-gradient(135deg, #FF3B30, #D70015); color: white; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 10px;');
console.log('%c Form Pendaftaran Member ', 'color: #FF3B30; font-size: 14px;');
console.log('%c Crafted by Hironi ', 'color: #666; font-size: 12px;');

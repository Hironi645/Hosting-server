// ===== DEVIL REIGN - Form Member =====
// Website by Hironi

let locationMode = 'manual';
let isLocating = false;

// ===== DOM Elements =====
const toast = document.getElementById('toast');
const processing = document.getElementById('processing');
const form = document.getElementById('memberForm');
const btnManual = document.getElementById('btnManual');
const btnAuto = document.getElementById('btnAuto');
const asalKotaInput = document.getElementById('asalKota');
const locatingText = document.getElementById('locatingText');

// ===== Show Toast on Load =====
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }, 500);
});

// ===== Location Mode Toggle =====
function setLocationMode(mode) {
  locationMode = mode;
  
  if (mode === 'manual') {
    btnManual.classList.add('active');
    btnAuto.classList.remove('active');
    asalKotaInput.placeholder = 'Masukkan asal kota';
    asalKotaInput.disabled = false;
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
  locatingText.style.display = 'flex';

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
        locatingText.style.display = 'none';
        
        showToast('Lokasi Ditemukan', `Kota: ${city}`);
      } catch (error) {
        isLocating = false;
        asalKotaInput.disabled = false;
        asalKotaInput.placeholder = 'Masukkan asal kota';
        locatingText.style.display = 'none';
        showToast('Error', 'Gagal mendapatkan nama kota');
        setLocationMode('manual');
      }
    },
    (error) => {
      isLocating = false;
      asalKotaInput.disabled = false;
      asalKotaInput.placeholder = 'Masukkan asal kota';
      locatingText.style.display = 'none';
      
      let errorMsg = 'Gagal mendapatkan lokasi';
      if (error.code === 1) errorMsg = 'Izin lokasi ditolak';
      else if (error.code === 2) errorMsg = 'Lokasi tidak tersedia';
      else if (error.code === 3) errorMsg = 'Timeout mendapatkan lokasi';
      
      showToast('Error', errorMsg);
      setLocationMode('manual');
    },
    { timeout: 15000, enableHighAccuracy: true }
  );
}

// ===== Show Toast =====
function showToast(title, message) {
  const toastTitle = toast.querySelector('.toast-title');
  const toastMessage = toast.querySelector('.toast-message');
  
  toastTitle.textContent = title;
  toastMessage.textContent = message;
  
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ===== Show Processing Overlay =====
function showProcessing() {
  processing.style.display = 'flex';
  // Force reflow
  processing.offsetHeight;
  processing.classList.add('show');
}

// ===== Hide Processing Overlay =====
function hideProcessing() {
  processing.classList.remove('show');
  setTimeout(() => {
    processing.style.display = 'none';
  }, 300);
}

// ===== Generate WhatsApp Message =====
function generateWhatsAppMessage(formData) {
  return `DEVIL REIGN — FORM MEMBER
━━━━━━━━━━━━━━━

⌁ Nama : ${formData.nama}
⌁ Umur : ${formData.umur}
⌁ USN Hotel Hideaway : ${formData.usnHotel}
⌁ Asal Kota : ${formData.asalKota}
⌁ Alasan Bergabung : ${formData.alasan}
━━━━━━━━━━━━━━━
STATUS : TERIMAKASIH SUDAH MENGISI
MENUNGGU PERSETUJUAN ADMIN
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
  if (!formData.nama) {
    showToast('Form Belum Lengkap', 'Mohon isi nama lengkap');
    document.getElementById('nama').focus();
    return;
  }
  
  if (!formData.umur) {
    showToast('Form Belum Lengkap', 'Mohon isi umur');
    document.getElementById('umur').focus();
    return;
  }
  
  if (!formData.usnHotel) {
    showToast('Form Belum Lengkap', 'Mohon isi USN Hotel Hideaway');
    document.getElementById('usnHotel').focus();
    return;
  }
  
  if (!formData.asalKota) {
    showToast('Form Belum Lengkap', 'Mohon isi asal kota');
    document.getElementById('asalKota').focus();
    return;
  }
  
  if (!formData.alasan) {
    showToast('Form Belum Lengkap', 'Mohon isi alasan bergabung');
    document.getElementById('alasan').focus();
    return;
  }
  
  if (!formData.admin) {
    showToast('Form Belum Lengkap', 'Mohon pilih admin');
    document.getElementById('admin').focus();
    return;
  }
  
  // Show processing overlay
  showProcessing();
  
  // Simulate processing delay (2 seconds)
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate WhatsApp message
  const message = encodeURIComponent(generateWhatsAppMessage(formData));
  const whatsappUrl = `https://wa.me/${formData.admin}?text=${message}`;
  
  // Hide processing
  hideProcessing();
  
  // Open WhatsApp
  window.open(whatsappUrl, '_blank');
  
  // Show success toast
  showToast('Berhasil!', 'Data akan dikirim ke WhatsApp');
  
  // Reset form after short delay
  setTimeout(() => {
    form.reset();
    setLocationMode('manual');
  }, 1500);
});

// ===== Input Focus Effects =====
const inputs = document.querySelectorAll('.ios-input, .ios-textarea, .ios-select');
inputs.forEach(input => {
  input.addEventListener('focus', () => {
    input.parentElement.classList.add('focused');
  });
  
  input.addEventListener('blur', () => {
    input.parentElement.classList.remove('focused');
  });
});

// ===== Prevent zoom on iOS =====
document.addEventListener('gesturestart', (e) => {
  e.preventDefault();
});

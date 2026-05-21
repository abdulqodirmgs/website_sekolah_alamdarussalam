/* ==========================================================================
   INTERACTIVE JAVASCRIPT FOR SMK ENTREPRENEUR ALAM DARUSSALAM
   Dynamic View Switching, PPDB Registration to WhatsApp, Grade Tracker
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- MOBILE NAV TOGGLE ---
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('show');
      const icon = menuToggle.querySelector('i');
      if (icon) {
        if (navMenu.classList.contains('show')) {
          icon.className = 'fas fa-times';
        } else {
          icon.className = 'fas fa-bars';
        }
      }
    });
  }

  // Close mobile menu on nav link click
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu && navMenu.classList.contains('show')) {
        navMenu.classList.remove('show');
        const icon = menuToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      }
    });
  });

  // --- SINGLE PAGE VIEW ROUTING ---
  const views = ['beranda', 'profil', 'jurusan', 'portal', 'ppdb'];
  
  window.navigateToSection = function(sectionId) {
    views.forEach(view => {
      const el = document.getElementById(`section-${view}`);
      if (el) {
        if (view === sectionId) {
          el.style.display = 'block';
          // Trigger animations in the page if needed
        } else {
          el.style.display = 'none';
        }
      }
    });

    // Update active state in nav menu
    navLinks.forEach(link => {
      if (link.getAttribute('onclick')?.includes(sectionId)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Scroll to top of section smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- PORTAL TABS SWITCHING (Guru / Siswa / Wali Murid) ---
  const portalTabs = document.querySelectorAll('.portal-tab-btn');
  const portalPanes = document.querySelectorAll('.portal-pane');

  portalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetPaneId = tab.getAttribute('data-target');

      portalTabs.forEach(t => t.classList.remove('active'));
      portalPanes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(targetPaneId);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // --- GURU PORTAL: INTERACTIVE LESSON SCHEDULE MAKER ---
  const addScheduleBtn = document.getElementById('add-schedule-btn');
  if (addScheduleBtn) {
    addScheduleBtn.addEventListener('click', () => {
      const day = prompt("Masukkan Hari (contoh: Senin):");
      const time = prompt("Masukkan Jam (contoh: 08:00 - 09:30):");
      const subject = prompt("Masukkan Mata Pelajaran:");
      const classRoom = prompt("Masukkan Kelas (contoh: X TKJ):");

      if (day && time && subject && classRoom) {
        const tableBody = document.querySelector('#schedule-table-body');
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
          <td><strong>${day}</strong></td>
          <td>${time}</td>
          <td>${subject}</td>
          <td>${classRoom}</td>
          <td><span class="badge-status status-success">Aktif</span></td>
        `;
        tableBody.appendChild(newRow);
        alert("Jadwal mengajar berhasil ditambahkan!");
      }
    });
  }

  // --- SISWA PORTAL: INTERACTIVE GRADE CALCULATOR ---
  const calculateGradeBtn = document.getElementById('btn-calculate-grade');
  if (calculateGradeBtn) {
    calculateGradeBtn.addEventListener('click', () => {
      const tkrGrade = parseFloat(document.getElementById('grade-tkr')?.value || 0);
      const tkjGrade = parseFloat(document.getElementById('grade-tkj')?.value || 0);
      const entGrade = parseFloat(document.getElementById('grade-ent')?.value || 0);
      const relGrade = parseFloat(document.getElementById('grade-religion')?.value || 0);

      const total = tkrGrade + tkjGrade + entGrade + relGrade;
      const average = total / 4;

      const resultBox = document.getElementById('grade-result-box');
      const resultText = document.getElementById('grade-result-text');

      if (resultBox && resultText) {
        resultBox.style.display = 'block';
        
        let status = '';
        let colorClass = '';
        if (average >= 75) {
          status = 'LULUS (Amat Baik)';
          colorClass = 'status-success';
          resultBox.style.borderColor = '#10b981';
          resultBox.style.backgroundColor = '#f0fdf4';
        } else {
          status = 'PERLU PERBAIKAN';
          colorClass = 'status-warning';
          resultBox.style.borderColor = '#f59e0b';
          resultBox.style.backgroundColor = '#fffbeb';
        }

        resultText.innerHTML = `
          <p style="font-size: 15px; margin-bottom: 8px;">Nilai Rata-rata Anda: <strong style="font-size: 20px; color: var(--primary);">${average.toFixed(2)}</strong></p>
          <p>Status Kelulusan: <span class="badge-status ${colorClass}" style="font-size: 13px;">${status}</span></p>
        `;
      }
    });
  }

  // --- WALI MURID: DYNAMIC BILL PAYMENT MOCKUP ---
  window.paySppBill = function(month, amount) {
    const confirmation = confirm(`Apakah Anda yakin ingin membayar SPP Bulan ${month} sebesar Rp ${amount.toLocaleString('id-ID')}?`);
    if (confirmation) {
      const btn = document.getElementById(`pay-btn-${month.toLowerCase()}`);
      const statusBadge = document.getElementById(`status-${month.toLowerCase()}`);
      if (btn && statusBadge) {
        statusBadge.className = 'badge-status status-success';
        statusBadge.textContent = 'Lunas (E-Wallet)';
        btn.style.display = 'none';
        
        // Show animated alert
        alert(`Pembayaran SPP Bulan ${month} Berhasil! Kuitansi digital telah dikirimkan ke WhatsApp Anda.`);
      }
    }
  };

  // --- PPDB REGISTRATION FORM SUBMIT TO WHATSAPP ---
  const ppdbForm = document.getElementById('ppdb-registration-form');
  if (ppdbForm) {
    ppdbForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Gather form inputs
      const fullName = document.getElementById('ppdb-name').value.trim();
      const nisn = document.getElementById('ppdb-nisn').value.trim();
      const originSchool = document.getElementById('ppdb-school').value.trim();
      const major = document.getElementById('ppdb-major').value;
      const phone = document.getElementById('ppdb-phone').value.trim();
      const adminTarget = document.getElementById('ppdb-admin').value;

      // Map admin target to phone numbers
      // Putri: 085783130243
      // Qodir: 085357630009
      // Anam: 081278669721
      let waNumber = '';
      let adminName = '';
      if (adminTarget === 'putri') {
        waNumber = '6285783130243';
        adminName = 'Ibu Putri';
      } else if (adminTarget === 'anam') {
        waNumber = '6281278669721';
        adminName = 'Bapak Anam';
      } else {
        waNumber = '6285357630009'; // Default Qodir
        adminName = 'Bapak Qodir';
      }

      // Compile message
      const waMessage = `*FORMULIR PENDAFTARAN ONLINE (PPDB)*
*SMK ENTREPRENEUR ALAM DARUSSALAM*

Halo ${adminName}, saya ingin mendaftar sebagai calon siswa baru. Berikut adalah data lengkap saya:

📝 *Data Calon Siswa:*
• *Nama Lengkap:* ${fullName}
• *NISN:* ${nisn}
• *Asal Sekolah:* ${originSchool}
• *Pilihan Program Keahlian:* ${major}
• *No. HP Aktif:* ${phone}

Mohon informasi langkah pendaftaran selanjutnya. Terima kasih! 🙏✨`;

      // Encode URL
      const encodedMessage = encodeURIComponent(waMessage);
      const waLink = `https://api.whatsapp.com/send?phone=${waNumber}&text=${encodedMessage}`;

      // Show temporary loader
      const submitBtn = ppdbForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghubungkan ke WhatsApp...';

      setTimeout(() => {
        // Open WhatsApp Link in new tab
        window.open(waLink, '_blank');
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        
        // Success Alert
        alert(`Formulir Pendaftaran atas nama ${fullName} telah siap. Klik 'OK' untuk melanjutkan ke WhatsApp ${adminName} untuk verifikasi berkas.`);
        ppdbForm.reset();
      }, 1200);
    });
  }

  // --- DYNAMIC HERO IMAGE SLIDER ---
  let currentSlide = 0;
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const totalSlides = slides.length;
  let slideInterval;

  function showSlide(index) {
    if (totalSlides === 0) return;
    
    // Boundary handling
    if (index >= totalSlides) currentSlide = 0;
    else if (index < 0) currentSlide = totalSlides - 1;
    else currentSlide = index;

    // Reset active classes
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));

    // Apply active class
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  window.nextSlide = function() {
    showSlide(currentSlide + 1);
  };

  window.prevSlide = function() {
    showSlide(currentSlide - 1);
  };

  window.setSlide = function(index) {
    showSlide(index);
    resetInterval();
  };

  function startInterval() {
    slideInterval = setInterval(nextSlide, 5000); // Change image every 5 seconds
  }

  function resetInterval() {
    clearInterval(slideInterval);
    startInterval();
  }

  // Connect Dot Click Handlers
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      setSlide(idx);
    });
  });

  // Connect Prev/Next Button Click Handlers
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetInterval(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetInterval(); });

  // Initialize Slider Autoplay
  if (totalSlides > 0) {
    startInterval();
  }

  // Set default view to home (Beranda)
  navigateToSection('beranda');
});

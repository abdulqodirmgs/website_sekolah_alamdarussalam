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
  const views = ['beranda', 'informasi', 'profil', 'jurusan', 'portal', 'ppdb', 'login'];
  
  window.navigateToSection = function(sectionId) {
    const sessionStr = sessionStorage.getItem('logged_in_user');
    let sessionUser = null;
    if (sessionStr) {
      try {
        sessionUser = JSON.parse(sessionStr);
      } catch (e) {
        sessionStorage.removeItem('logged_in_user');
      }
    }

    if (sectionId === 'portal') {
      if (!sessionUser) {
        alert("Akses Ditolak! Anda harus masuk terlebih dahulu untuk mengakses Portal Akademik.");
        navigateToSection('login');
        return;
      } else {
        applyRoleAccess(sessionUser.role, sessionUser.username);
      }
    }

    if (sectionId === 'login') {
      if (sessionUser) {
        navigateToSection('portal');
        return;
      }
    }

    views.forEach(view => {
      const el = document.getElementById(`section-${view}`);
      if (el) {
        if (view === sectionId) {
          el.style.display = 'block';
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
    const mLower = month.toLowerCase();
    const confirmation = confirm(`Apakah Anda yakin ingin membayar SPP Bulan ${month} sebesar Rp ${amount.toLocaleString('id-ID')}?`);
    if (confirmation) {
      const paidMonths = getPaidMonths();
      if (!paidMonths.includes(mLower)) {
        paidMonths.push(mLower);
        savePaidMonths(paidMonths);
      }
      
      loadWaliSppPaymentStates();
      alert(`Pembayaran SPP Bulan ${month} Berhasil! Kuitansi digital telah dikirimkan ke WhatsApp Anda.`);
    }
  };

  // ===========================
  // --- INFORMASI PPDB MODULE ---
  // ===========================

  const DEFAULT_INFO_DATA = {
    syarat: {
      items: [
        { icon: 'fas fa-user', title: 'Fotokopi Ijazah / SKHUN', desc: 'Fotokopi ijazah atau Surat Keterangan Hasil Ujian Nasional (SKHUN) SMP/MTs yang telah dilegalisir.' },
        { icon: 'fas fa-camera', title: 'Pas Foto Terbaru 3x4', desc: 'Pas foto berwarna terbaru ukuran 3x4 cm sebanyak 4 lembar dengan latar belakang merah.' },
        { icon: 'fas fa-id-card', title: 'Kartu Keluarga (KK)', desc: 'Fotokopi Kartu Keluarga yang masih berlaku dan telah dilegalisir oleh pejabat berwenang.' },
        { icon: 'fas fa-file-alt', title: 'Akta Kelahiran', desc: 'Fotokopi akta kelahiran asli yang telah dilegalisir oleh pejabat kantor catatan sipil.' },
        { icon: 'fas fa-file-contract', title: 'Surat Pernyataan Orang Tua', desc: 'Surat pernyataan bermeterai dari orang tua/wali yang menyatakan kesanggupan mengikuti aturan sekolah. (Template tersedia di halaman Pendaftaran)' },
        { icon: 'fas fa-map-marker-alt', title: 'Surat Keterangan Domisili', desc: 'Surat keterangan domisili dari RT/RW setempat (jika alamat berbeda dengan KK).' }
      ]
    },
    biaya: {
      note: 'Biaya di atas dapat berubah sewaktu-waktu. Konfirmasi ke panitia PPDB untuk informasi terkini. Tersedia program beasiswa bagi siswa berprestasi dan kurang mampu.',
      items: [
        { label: 'Uang Pendaftaran', amount: 'Rp 50.000', type: 'sekali', icon: 'fas fa-file-signature', highlight: false },
        { label: 'Uang Pangkal / Masuk', amount: 'Rp 500.000', type: 'sekali bayar', icon: 'fas fa-door-open', highlight: true },
        { label: 'SPP Bulanan', amount: 'Rp 150.000', type: 'per bulan', icon: 'fas fa-calendar-check', highlight: false },
        { label: 'Seragam Sekolah (3 Stel)', amount: 'Rp 350.000', type: 'sekali', icon: 'fas fa-tshirt', highlight: false },
        { label: 'Buku Paket & LKS', amount: 'Rp 200.000', type: 'per tahun', icon: 'fas fa-book', highlight: false },
        { label: 'Praktikum & Kegiatan', amount: 'Rp 100.000', type: 'per semester', icon: 'fas fa-flask', highlight: false }
      ]
    },
    jadwal: {
      items: [
        { phase: 'Gelombang I', date: '01 – 30 Juni 2026', status: 'buka', desc: 'Pendaftaran gelombang pertama. Tersedia potongan uang pangkal 20% dan beasiswa khusus wirausaha muda bagi pendaftar gelombang pertama.' },
        { phase: 'Seleksi Berkas & Administrasi', date: '01 – 07 Juli 2026', status: 'proses', desc: 'Panitia PPDB akan memverifikasi kelengkapan dan keaslian berkas pendaftaran yang telah diunggah.' },
        { phase: 'Pengumuman Hasil Seleksi', date: '10 Juli 2026', status: 'proses', desc: 'Pengumuman calon siswa yang dinyatakan lolos seleksi tahap administrasi akan diumumkan melalui website dan WhatsApp.' },
        { phase: 'Daftar Ulang', date: '11 – 20 Juli 2026', status: 'proses', desc: 'Calon siswa yang dinyatakan lolos wajib melakukan daftar ulang dengan melengkapi berkas fisik dan membayar biaya pendidikan.' },
        { phase: 'Gelombang II', date: '01 – 20 Juli 2026', status: 'buka', desc: 'Pendaftaran gelombang kedua (kuota terbatas). Tanpa potongan uang pangkal.' },
        { phase: 'Hari Pertama Masuk Sekolah', date: '14 Juli 2026', status: 'mendatang', desc: 'Masa Pengenalan Lingkungan Sekolah (MPLS) untuk seluruh siswa baru Tahun Ajaran 2026/2027.' }
      ]
    },
    faq: {
      items: [
        { q: 'Apakah ada tes masuk / ujian seleksi?', a: 'Tidak ada ujian tertulis. Seleksi dilakukan berdasarkan kelengkapan berkas administrasi dan wawancara motivasi singkat dengan panitia PPDB.' },
        { q: 'Apakah bisa mendaftar dari luar Kabupaten Musi Rawas?', a: 'Ya, kami menerima calon siswa dari seluruh wilayah Indonesia. Tersedia informasi mengenai kos/pondok pesantren terdekat untuk calon siswa yang berasal dari luar kota.' },
        { q: 'Apa itu jurusan Bisnis Digital & Kewirausahaan?', a: 'Jurusan ini membekali siswa dengan keterampilan pemasaran digital, pengelolaan e-commerce, pembuatan konten bisnis, dan pengelolaan keuangan usaha. Lulusan siap menjadi pengusaha muda mandiri.' },
        { q: 'Apakah ada beasiswa yang tersedia?', a: 'Ya! SMK Entrepreneur Alam Darussalam menyediakan beasiswa khusus wirausaha muda bagi pendaftar gelombang pertama, beasiswa bagi siswa hafidz/hafidzah Quran, dan program keringanan SPP bagi keluarga kurang mampu.' },
        { q: 'Bagaimana cara konfirmasi pendaftaran setelah mengisi formulir online?', a: 'Setelah mengisi formulir dan klik kirim, sistem akan otomatis membuka WhatsApp Anda untuk mengirimkan data ke admin PPDB. Admin kami akan merespons dalam 1x24 jam kerja.' },
        { q: 'Apakah ada seragam khusus dan berapa jumlahnya?', a: 'Siswa mendapatkan 3 stel seragam: seragam putih-abu (hari Senin-Selasa), seragam batik khas sekolah (Rabu-Kamis), dan seragam olahraga/pramuka (Jumat). Biaya seragam sudah termasuk dalam rincian biaya pendidikan.' }
      ]
    }
  };

  window.getInfoData = function() {
    const stored = localStorage.getItem('ppdb_info_data');
    if (!stored) {
      localStorage.setItem('ppdb_info_data', JSON.stringify(DEFAULT_INFO_DATA));
      return DEFAULT_INFO_DATA;
    }
    try { return JSON.parse(stored); } catch(e) { return DEFAULT_INFO_DATA; }
  };

  window.saveInfoData = function(data) {
    localStorage.setItem('ppdb_info_data', JSON.stringify(data));
  };

  window.resetInfoData = function() {
    if (!confirm('Reset semua informasi PPDB ke data default? Perubahan yang sudah disimpan akan hilang.')) return;
    localStorage.removeItem('ppdb_info_data');
    renderInfoSection();
    renderInfoEditor();
    alert('Informasi PPDB berhasil di-reset ke data default!');
  };

  // Render informasi section (public view)
  window.renderInfoSection = function() {
    const data = getInfoData();

    // --- Persyaratan ---
    const syaratCon = document.getElementById('syarat-items-container');
    if (syaratCon) {
      syaratCon.innerHTML = data.syarat.items.map(item => `
        <div class="info-req-card">
          <div class="info-req-icon"><i class="${item.icon}"></i></div>
          <div class="info-req-body">
            <h5>${item.title}</h5>
            <p>${item.desc}</p>
          </div>
        </div>
      `).join('');
    }

    // --- Biaya ---
    const biayaCon = document.getElementById('biaya-items-container');
    if (biayaCon) {
      biayaCon.innerHTML = data.biaya.items.map(item => `
        <div class="biaya-card ${item.highlight ? 'biaya-highlight' : ''}">
          <div class="biaya-icon"><i class="${item.icon}"></i></div>
          <div class="biaya-label">${item.label}</div>
          <div class="biaya-amount">${item.amount}</div>
          <div class="biaya-type">${item.type}</div>
        </div>
      `).join('');
    }
    const biayaNote = document.getElementById('biaya-note-display');
    if (biayaNote) biayaNote.querySelector('p').textContent = data.biaya.note;

    // --- Jadwal ---
    const jadwalCon = document.getElementById('jadwal-items-container');
    if (jadwalCon) {
      jadwalCon.innerHTML = data.jadwal.items.map((item, i) => {
        const statusMap = { 'buka': 'status-success', 'proses': 'status-warning', 'mendatang': 'status-info', 'selesai': '' };
        const statusLabel = { 'buka': 'Dibuka', 'proses': 'Dalam Proses', 'mendatang': 'Akan Datang', 'selesai': 'Selesai' };
        const cls = statusMap[item.status] || 'status-info';
        const label = statusLabel[item.status] || item.status;
        return `
          <div class="jadwal-item">
            <div class="jadwal-step">${i + 1}</div>
            <div class="jadwal-content">
              <div class="jadwal-top">
                <h5 class="jadwal-phase">${item.phase}</h5>
                <span class="badge-status ${cls}">${label}</span>
              </div>
              <div class="jadwal-date"><i class="fas fa-calendar"></i> ${item.date}</div>
              <p class="jadwal-desc">${item.desc}</p>
            </div>
          </div>
        `;
      }).join('');
    }

    // --- FAQ Accordion ---
    const faqCon = document.getElementById('faq-items-container');
    if (faqCon) {
      faqCon.innerHTML = data.faq.items.map((item, i) => `
        <div class="faq-item" id="faq-item-${i}">
          <button class="faq-question" onclick="toggleFaq(${i})">
            <span>${item.q}</span>
            <i class="fas fa-chevron-down faq-icon" id="faq-icon-${i}"></i>
          </button>
          <div class="faq-answer" id="faq-answer-${i}">
            <p>${item.a}</p>
          </div>
        </div>
      `).join('');
    }
  };

  window.toggleFaq = function(idx) {
    const answer = document.getElementById(`faq-answer-${idx}`);
    const icon = document.getElementById(`faq-icon-${idx}`);
    const item = document.getElementById(`faq-item-${idx}`);
    if (!answer) return;
    const isOpen = answer.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
    document.querySelectorAll('.faq-icon').forEach(ic => ic.classList.remove('rotate'));
    document.querySelectorAll('.faq-item').forEach(it => it.classList.remove('active'));
    if (!isOpen) {
      answer.classList.add('open');
      icon.classList.add('rotate');
      item.classList.add('active');
    }
  };

  // Info tabs switching in the informasi section
  const infoTabBtns = document.querySelectorAll('.info-tab-btn');
  const infoTabPanes = document.querySelectorAll('.info-tab-pane');
  infoTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      infoTabBtns.forEach(b => b.classList.remove('active'));
      infoTabPanes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(btn.getAttribute('data-info-target'));
      if (target) target.classList.add('active');
    });
  });

  // =====================
  // --- ADMIN INFO EDITOR ---
  // =====================

  window.switchInfoEditorTab = function(tabId) {
    document.querySelectorAll('.editor-pane').forEach(p => p.style.display = 'none');
    const target = document.getElementById(tabId);
    if (target) target.style.display = 'block';
    // Update sidebar nav active state
    ['editor-nav-syarat','editor-nav-biaya','editor-nav-jadwal','editor-nav-faq'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });
    const navId = 'editor-nav-' + tabId.replace('editor-', '');
    const navEl = document.getElementById(navId);
    if (navEl) navEl.classList.add('active');
  };

  window.renderInfoEditor = function() {
    const data = getInfoData();

    // --- Editor: Persyaratan ---
    const syaratList = document.getElementById('editor-syarat-list');
    if (syaratList) {
      syaratList.innerHTML = data.syarat.items.map((item, i) => `
        <div class="editor-item" id="editor-syarat-item-${i}">
          <div class="editor-item-header">
            <span class="editor-item-label"><i class="${item.icon}"></i> Item ${i + 1}</span>
            <button onclick="removeInfoItem('syarat', ${i})" class="editor-remove-btn"><i class="fas fa-trash"></i></button>
          </div>
          <div class="editor-item-fields">
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label class="form-label" style="font-size:11px;">Judul</label>
              <input class="form-input" data-idx="${i}" data-field="title" data-section="syarat" value="${item.title}" placeholder="Judul persyaratan" style="font-size:13px;">
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label class="form-label" style="font-size:11px;">Icon (Font Awesome class)</label>
              <input class="form-input" data-idx="${i}" data-field="icon" data-section="syarat" value="${item.icon}" placeholder="fas fa-file-alt" style="font-size:13px;">
            </div>
            <div style="display:flex; flex-direction:column; gap:4px; grid-column: 1/-1;">
              <label class="form-label" style="font-size:11px;">Deskripsi</label>
              <textarea class="form-input" data-idx="${i}" data-field="desc" data-section="syarat" placeholder="Deskripsi persyaratan..." style="font-size:13px; resize:vertical; min-height:60px;">${item.desc}</textarea>
            </div>
          </div>
        </div>
      `).join('');
    }

    // --- Editor: Biaya ---
    const biayaList = document.getElementById('editor-biaya-list');
    if (biayaList) {
      biayaList.innerHTML = data.biaya.items.map((item, i) => `
        <div class="editor-item" id="editor-biaya-item-${i}">
          <div class="editor-item-header">
            <span class="editor-item-label">Biaya ${i + 1}</span>
            <button onclick="removeInfoItem('biaya', ${i})" class="editor-remove-btn"><i class="fas fa-trash"></i></button>
          </div>
          <div class="editor-item-fields">
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label class="form-label" style="font-size:11px;">Nama Biaya</label>
              <input class="form-input" data-idx="${i}" data-field="label" data-section="biaya" value="${item.label}" style="font-size:13px;">
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label class="form-label" style="font-size:11px;">Jumlah (contoh: Rp 150.000)</label>
              <input class="form-input" data-idx="${i}" data-field="amount" data-section="biaya" value="${item.amount}" style="font-size:13px;">
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label class="form-label" style="font-size:11px;">Keterangan (contoh: per bulan)</label>
              <input class="form-input" data-idx="${i}" data-field="type" data-section="biaya" value="${item.type}" style="font-size:13px;">
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label class="form-label" style="font-size:11px;">Icon (Font Awesome)</label>
              <input class="form-input" data-idx="${i}" data-field="icon" data-section="biaya" value="${item.icon}" style="font-size:13px;">
            </div>
          </div>
        </div>
      `).join('');
    }
    const biayaNoteEl = document.getElementById('editor-biaya-note');
    if (biayaNoteEl) biayaNoteEl.value = data.biaya.note;

    // --- Editor: Jadwal ---
    const jadwalList = document.getElementById('editor-jadwal-list');
    if (jadwalList) {
      jadwalList.innerHTML = data.jadwal.items.map((item, i) => `
        <div class="editor-item" id="editor-jadwal-item-${i}">
          <div class="editor-item-header">
            <span class="editor-item-label">Tahapan ${i + 1}</span>
            <button onclick="removeInfoItem('jadwal', ${i})" class="editor-remove-btn"><i class="fas fa-trash"></i></button>
          </div>
          <div class="editor-item-fields">
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label class="form-label" style="font-size:11px;">Nama Tahapan</label>
              <input class="form-input" data-idx="${i}" data-field="phase" data-section="jadwal" value="${item.phase}" style="font-size:13px;">
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label class="form-label" style="font-size:11px;">Tanggal</label>
              <input class="form-input" data-idx="${i}" data-field="date" data-section="jadwal" value="${item.date}" style="font-size:13px;">
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label class="form-label" style="font-size:11px;">Status (buka/proses/mendatang/selesai)</label>
              <select class="form-input" data-idx="${i}" data-field="status" data-section="jadwal" style="font-size:13px; background:white;">
                <option value="buka" ${item.status==='buka'?'selected':''}>Dibuka</option>
                <option value="proses" ${item.status==='proses'?'selected':''}>Dalam Proses</option>
                <option value="mendatang" ${item.status==='mendatang'?'selected':''}>Akan Datang</option>
                <option value="selesai" ${item.status==='selesai'?'selected':''}>Selesai</option>
              </select>
            </div>
            <div style="display:flex; flex-direction:column; gap:4px; grid-column: 1/-1;">
              <label class="form-label" style="font-size:11px;">Keterangan</label>
              <textarea class="form-input" data-idx="${i}" data-field="desc" data-section="jadwal" style="font-size:13px; resize:vertical; min-height:60px;">${item.desc}</textarea>
            </div>
          </div>
        </div>
      `).join('');
    }

    // --- Editor: FAQ ---
    const faqList = document.getElementById('editor-faq-list');
    if (faqList) {
      faqList.innerHTML = data.faq.items.map((item, i) => `
        <div class="editor-item" id="editor-faq-item-${i}">
          <div class="editor-item-header">
            <span class="editor-item-label">FAQ ${i + 1}</span>
            <button onclick="removeInfoItem('faq', ${i})" class="editor-remove-btn"><i class="fas fa-trash"></i></button>
          </div>
          <div class="editor-item-fields" style="grid-template-columns: 1fr;">
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label class="form-label" style="font-size:11px;">Pertanyaan</label>
              <input class="form-input" data-idx="${i}" data-field="q" data-section="faq" value="${item.q}" style="font-size:13px;">
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label class="form-label" style="font-size:11px;">Jawaban</label>
              <textarea class="form-input" data-idx="${i}" data-field="a" data-section="faq" style="font-size:13px; resize:vertical; min-height:70px;">${item.a}</textarea>
            </div>
          </div>
        </div>
      `).join('');
    }
  };

  window.addInfoItem = function(section) {
    const data = getInfoData();
    const templates = {
      syarat: { icon: 'fas fa-check-circle', title: 'Persyaratan Baru', desc: 'Deskripsi persyaratan baru.' },
      biaya: { label: 'Biaya Baru', amount: 'Rp 0', type: 'sekali', icon: 'fas fa-money-bill', highlight: false },
      jadwal: { phase: 'Tahapan Baru', date: 'TBD', status: 'mendatang', desc: 'Keterangan tahapan baru.' },
      faq: { q: 'Pertanyaan baru?', a: 'Jawaban pertanyaan baru.' }
    };
    data[section].items.push(templates[section]);
    saveInfoData(data);
    renderInfoEditor();
    renderInfoSection();
  };

  window.removeInfoItem = function(section, idx) {
    if (!confirm('Hapus item ini?')) return;
    const data = getInfoData();
    data[section].items.splice(idx, 1);
    saveInfoData(data);
    renderInfoEditor();
    renderInfoSection();
  };

  window.saveInfoSection = function(section) {
    const data = getInfoData();
    // Collect all inputs in the editor for this section
    const editorEl = document.getElementById(`editor-${section}-list`);
    if (editorEl) {
      editorEl.querySelectorAll('[data-section]').forEach(input => {
        const idx = parseInt(input.getAttribute('data-idx'));
        const field = input.getAttribute('data-field');
        if (data[section].items[idx] !== undefined) {
          data[section].items[idx][field] = input.value;
        }
      });
    }
    // Save biaya note
    if (section === 'biaya') {
      const noteEl = document.getElementById('editor-biaya-note');
      if (noteEl) data.biaya.note = noteEl.value;
    }
    saveInfoData(data);
    renderInfoSection();
    const savedMsg = `<span style="color:var(--success); font-size:13px; font-weight:600;"><i class="fas fa-check-circle"></i> Tersimpan!</span>`;
    const btnEl = document.querySelector(`#editor-${section} .btn-accent`);
    if (btnEl) {
      const orig = btnEl.innerHTML;
      btnEl.innerHTML = savedMsg;
      setTimeout(() => { btnEl.innerHTML = orig; }, 2000);
    }
  };

  // Initialize info section
  renderInfoSection();
  renderInfoEditor();

  // --- DATABASE PPDB (LOCAL STORAGE) ---
  const DEFAULT_PPDB_DATA = [
    { 
      id: 'PPDB-1', 
      name: 'Budi Santoso', 
      nisn: '0081234567', 
      school: 'SMP Negeri 1 Megang Sakti', 
      major: 'Teknik Kendaraan Ringan (TKR)', 
      phone: '081273849201', 
      parent: 'Herman Santoso', 
      address: 'Jl. Raya Lintas Sumatra, RT. 02, Megang Sakti V, Musi Rawas', 
      photoFile: 'pas_foto_budi.jpg', 
      birthFile: 'akta_budi.pdf', 
      kkFile: 'kk_budi.pdf', 
      statementFile: 'pernyataan_budi.pdf', 
      date: '2026-05-20', 
      status: 'Terverifikasi' 
    },
    { 
      id: 'PPDB-2', 
      name: 'Siti Aminah', 
      nisn: '0092345678', 
      school: 'MTs Model Musi Rawas', 
      major: 'Bisnis Digital & Kewirausahaan', 
      phone: '085283940211', 
      parent: 'Rahmat Hidayat', 
      address: 'Dusun III, RT. 05, Desa Megang Sakti I, Musi Rawas', 
      photoFile: 'pas_foto_siti.png', 
      birthFile: 'akta_siti.pdf', 
      kkFile: 'kk_siti.pdf', 
      statementFile: 'pernyataan_siti.pdf', 
      date: '2026-05-21', 
      status: 'Menunggu Verifikasi' 
    },
    { 
      id: 'PPDB-3', 
      name: 'Rizky Pratama', 
      nisn: '0087654321', 
      school: 'SMP PGRI Megang Sakti', 
      major: 'Teknik Komputer & Jaringan (TKJ)', 
      phone: '087792830122', 
      parent: 'Slamet Widodo', 
      address: 'Jl. Cendrawasih No. 12, RT. 01, RW. 03, Megang Sakti, Musi Rawas', 
      photoFile: 'pas_foto_rizky.jpg', 
      birthFile: 'akta_rizky.pdf', 
      kkFile: 'kk_rizky.pdf', 
      statementFile: 'pernyataan_rizky.pdf', 
      date: '2026-05-21', 
      status: 'Terverifikasi' 
    },
    { 
      id: 'PPDB-4', 
      name: 'Dewi Lestari', 
      nisn: '0098765432', 
      school: 'SMP Negeri 2 Megang Sakti', 
      major: 'Bisnis Digital & Kewirausahaan', 
      phone: '081394820399', 
      parent: 'Bambang Hermawan', 
      address: 'Dusun IV, RT. 09, Desa Muara Megang, Megang Sakti, Musi Rawas', 
      photoFile: 'pas_foto_dewi.png', 
      birthFile: 'akta_dewi.pdf', 
      kkFile: 'kk_dewi.pdf', 
      statementFile: 'pernyataan_dewi.pdf', 
      date: '2026-05-21', 
      status: 'Menunggu Verifikasi' 
    }
  ];

  window.getPPDBData = function() {
    let data = localStorage.getItem('ppdb_registrants');
    if (!data) {
      localStorage.setItem('ppdb_registrants', JSON.stringify(DEFAULT_PPDB_DATA));
      return DEFAULT_PPDB_DATA;
    }
    return JSON.parse(data);
  }

  window.savePPDBData = function(data) {
    localStorage.setItem('ppdb_registrants', JSON.stringify(data));
  }

  window.loadPpdbTable = function() {
    const tableBody = document.getElementById('ppdb-table-body');
    if (!tableBody) return;

    const data = getPPDBData();
    tableBody.innerHTML = '';

    if (data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px; color: var(--text-muted);">Belum ada data pendaftar baru.</td></tr>`;
      updatePpdbStats(data);
      return;
    }

    data.forEach(student => {
      let badgeClass = student.status === 'Terverifikasi' ? 'status-success' : 'status-warning';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${student.name}</strong><br><span style="font-size: 11px; color: var(--text-muted);">${student.phone}</span></td>
        <td><code>${student.nisn}</code></td>
        <td>${student.school}</td>
        <td><span style="font-weight:600; color: var(--primary);">${student.major}</span></td>
        <td>${student.date}</td>
        <td><span class="badge-status ${badgeClass}" id="status-badge-${student.id}">${student.status}</span></td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-primary" onclick="showStudentDetails('${student.id}')" style="padding: 4px 8px; font-size: 10px; border-radius: 4px; border:none; background-color: var(--accent); color: #1e293b; font-weight:700;"><i class="fas fa-eye"></i> Detail</button>
            ${student.status !== 'Terverifikasi' ? 
              `<button class="btn btn-primary" onclick="verifyStudent('${student.id}')" style="padding: 4px 8px; font-size: 10px; border-radius: 4px; border:none;"><i class="fas fa-check"></i> Verif</button>` : 
              ''
            }
            <a href="https://wa.me/${student.phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}" target="_blank" class="btn btn-outline" style="padding: 4px 8px; font-size: 10px; border-radius: 4px; border-color:#25d366; color:#128c7e; text-decoration:none;"><i class="fab fa-whatsapp"></i> Chat</a>
            <button class="btn btn-outline" onclick="deleteStudent('${student.id}')" style="padding: 4px 8px; font-size: 10px; border-radius: 4px; border-color:var(--danger); color:var(--danger); background:none;"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    updatePpdbStats(data);
  }

  window.verifyStudent = function(id) {
    const data = getPPDBData();
    const student = data.find(s => s.id === id);
    if (student) {
      student.status = 'Terverifikasi';
      savePPDBData(data);
      loadPpdbTable();
      alert(`Siswa ${student.name} berhasil diverifikasi!`);
    }
  }

  window.deleteStudent = function(id) {
    const confirmation = confirm("Apakah Anda yakin ingin menghapus data calon siswa ini?");
    if (confirmation) {
      let data = getPPDBData();
      data = data.filter(s => s.id !== id);
      savePPDBData(data);
      loadPpdbTable();
    }
  }

  window.resetPpdbDatabase = function() {
    const confirmation = confirm("Apakah Anda yakin ingin mereset database ke data dummy awal?");
    if (confirmation) {
      localStorage.removeItem('ppdb_registrants');
      loadPpdbTable();
      alert("Database PPDB berhasil di-reset ke data dummy bawaan!");
    }
  }

  window.updatePpdbStats = function(data) {
    const total = data.length;
    const tkj = data.filter(s => s.major.includes('TKJ') || s.major.includes('Teknik Komputer')).length;
    const tkr = data.filter(s => s.major.includes('TKR') || s.major.includes('Teknik Kendaraan')).length;
    const bd = data.filter(s => s.major.includes('Bisnis') || s.major.includes('Digital')).length;

    const totalEl = document.getElementById('stat-total-reg');
    const tkjEl = document.getElementById('stat-tkj-reg');
    const tkrEl = document.getElementById('stat-tkr-reg');
    const bdEl = document.getElementById('stat-bd-reg');

    if (totalEl) totalEl.textContent = total;
    if (tkjEl) tkjEl.textContent = tkj;
    if (tkrEl) tkrEl.textContent = tkr;
    if (bdEl) bdEl.textContent = bd;
  }

  // --- EXTENSION: FILE SELECTION VISUALS ---
  window.handleFileChange = function(input, targetId) {
    const span = document.getElementById(targetId);
    const card = input.closest('.upload-card');
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Check file size (2MB = 2097152 bytes)
      if (file.size > 2097152) {
        alert("Ukuran berkas tidak boleh melebihi 2MB!");
        input.value = "";
        if (span) {
          span.textContent = "Ukuran berkas > 2MB";
          span.style.color = "var(--danger)";
          span.style.fontWeight = "bold";
        }
        if (card) card.classList.remove('selected');
        return;
      }
      if (span) {
        span.textContent = file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
        span.style.color = 'var(--primary)';
        span.style.fontWeight = '700';
      }
      if (card) card.classList.add('selected');
    } else {
      if (span) {
        span.textContent = targetId === 'photo-filename' ? 'Pilih berkas JPG/PNG' : 'Pilih berkas PDF/Gambar';
        span.style.color = 'var(--text-muted)';
        span.style.fontWeight = 'normal';
      }
      if (card) card.classList.remove('selected');
    }
  };

  // --- EXTENSION: STATEMENT LETTER TEMPLATE GENERATION ---
  window.downloadStatementTemplate = function() {
    const text = `SURAT PERNYATAAN ORANG TUA / WALI
CALON SISWA BARU SMK ENTREPRENEUR ALAM DARUSSALAM
TAHUN AJARAN 2026/2027

Yang bertanda tangan di bawah ini:
Nama Orang Tua / Wali : _____________________________________
Alamat Lengkap       : _____________________________________
No. HP / WhatsApp    : _____________________________________

Menyatakan dengan sesungguhnya bahwa selaku Orang Tua / Wali dari Calon Siswa:
Nama Calon Siswa     : _____________________________________
NISN                 : _____________________________________
Asal Sekolah         : _____________________________________
Pilihan Jurusan      : _____________________________________

Dengan ini menyatakan secara sadar dan tanpa paksaan:
1. Menyerahkan sepenuhnya pembinaan anak kami kepada pihak sekolah SMK Entrepreneur Alam Darussalam.
2. Mendukung penuh seluruh program pembelajaran kewirausahaan (entrepreneurship), praktek lapangan, keagamaan islami, dan program green campus (harmoni alam) sekolah.
3. Menjaga nama baik keluarga dan institusi sekolah baik di dalam maupun di luar lingkungan sekolah.
4. Mentaati seluruh tata tertib dan peraturan akademik serta kedisiplinan yang ditetapkan oleh pihak sekolah.
5. Bersedia mengunggah berkas pendaftaran (Pas Foto, Akta Kelahiran, Kartu Keluarga, dan Surat Pernyataan) secara jujur dan benar demi validitas database sekolah.

Demikian surat pernyataan ini dibuat dengan sadar, sukarela, dan penuh tanggung jawab untuk digunakan sebagai kelengkapan berkas wajib PPDB.

Megang Sakti, _________________ 2026

Orang Tua / Wali,                      Calon Siswa,


( ______________________ )            ( ______________________ )
`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Surat_Pernyataan_PPDB_SMK_Alam_Darussalam.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("Berhasil mengunduh template Surat Pernyataan. Silakan isi, cetak, tanda tangani, lalu foto/scan dan unggah kembali.");
  };

  // --- EXTENSION: ADMIN STUDENT DETAIL MODAL CONTROL & SIM DOWNLOADS ---
  window.showStudentDetails = function(id) {
    const data = getPPDBData();
    const student = data.find(s => s.id === id);
    if (!student) return;

    // Populate text details
    document.getElementById('det-student-name').textContent = student.name || '-';
    document.getElementById('det-student-nisn').textContent = student.nisn || '-';
    document.getElementById('det-student-school').textContent = student.school || '-';
    document.getElementById('det-student-major').textContent = student.major || '-';
    document.getElementById('det-student-phone').textContent = student.phone || '-';
    document.getElementById('det-student-date').textContent = student.date || '-';
    document.getElementById('det-parent-name').textContent = student.parent || 'Belum diisi';
    document.getElementById('det-student-address').textContent = student.address || 'Belum diisi';

    // Populate files
    const photoVal = student.photoFile || 'pas_foto_default.jpg';
    const birthVal = student.birthFile || 'akta_kelahiran_default.pdf';
    const kkVal = student.kkFile || 'kartu_keluarga_default.pdf';
    const statementVal = student.statementFile || 'surat_pernyataan_default.pdf';

    document.getElementById('det-doc-photo').textContent = photoVal;
    document.getElementById('det-doc-birth').textContent = birthVal;
    document.getElementById('det-doc-kk').textContent = kkVal;
    document.getElementById('det-doc-statement').textContent = statementVal;

    // Attach simulation downloads
    setupSimulatedDownload('dl-doc-photo', photoVal, `Berkas Pas Foto 3x4 Calon Siswa\nNama Siswa: ${student.name}\nNISN: ${student.nisn}`);
    setupSimulatedDownload('dl-doc-birth', birthVal, `Berkas Akta Kelahiran Calon Siswa\nNama Siswa: ${student.name}\nNISN: ${student.nisn}`);
    setupSimulatedDownload('dl-doc-kk', kkVal, `Berkas Kartu Keluarga Calon Siswa\nNama Siswa: ${student.name}\nNISN: ${student.nisn}`);
    setupSimulatedDownload('dl-doc-statement', statementVal, `Berkas Surat Pernyataan Orang Tua / Wali Calon Siswa\nNama Siswa: ${student.name}\nNama Orang Tua: ${student.parent}`);

    // Show modal
    const modal = document.getElementById('ppdb-detail-modal');
    if (modal) modal.classList.add('show');
  };

  window.closeStudentDetails = function() {
    const modal = document.getElementById('ppdb-detail-modal');
    if (modal) modal.classList.remove('show');
  };

  // Close modal when clicking outside content area
  const modalOverlay = document.getElementById('ppdb-detail-modal');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeStudentDetails();
      }
    });
  }

  function setupSimulatedDownload(btnId, filename, description) {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.onclick = function(e) {
        e.preventDefault();
        const content = `========================================================\n` +
                        `SMK ENTREPRENEUR ALAM DARUSSALAM - PPDB ONLINE MOCKUP\n` +
                        `========================================================\n\n` +
                        `Nama Dokumen  : ${filename}\n` +
                        `Jenis Berkas  : Dokumen Kelengkapan Calon Siswa Baru\n` +
                        `Deskripsi     : ${description}\n` +
                        `Status Berkas : Terbaca Sempurna (100% OK)\n\n` +
                        `Catatan Panitia:\n` +
                        `Berkas pendaftaran pendaftar ini disimpan di client-side Local Database browser\n` +
                        `selama masa simulasi sistem administrasi sekolah.`;
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename + ".txt";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    }
  }

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
      const parentName = document.getElementById('ppdb-parent').value.trim();
      const address = document.getElementById('ppdb-address').value.trim();
      const adminTarget = document.getElementById('ppdb-admin').value;

      // File elements
      const photoInput = document.getElementById('ppdb-file-photo');
      const birthInput = document.getElementById('ppdb-file-birth');
      const kkInput = document.getElementById('ppdb-file-kk');
      const statementInput = document.getElementById('ppdb-file-statement');

      const photoFile = photoInput.files[0];
      const birthFile = birthInput.files[0];
      const kkFile = kkInput.files[0];
      const statementFile = statementInput.files[0];

      // Map admin target to phone numbers
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
      const waMessage = `*FORMULIR PENDAFTARAN ONLINE (PPDB)*\n` +
                        `*SMK ENTREPRENEUR ALAM DARUSSALAM*\n\n` +
                        `Halo ${adminName}, saya ingin mendaftar sebagai calon siswa baru. Berikut adalah data lengkap saya:\n\n` +
                        `📝 *Data Calon Siswa:*\n` +
                        `• *Nama Lengkap:* ${fullName}\n` +
                        `• *NISN:* ${nisn}\n` +
                        `• *Asal Sekolah:* ${originSchool}\n` +
                        `• *Pilihan Program Keahlian:* ${major}\n` +
                        `• *No. HP Aktif:* ${phone}\n\n` +
                        `👨‍👩‍👧‍👦 *Data Orang Tua / Wali:*\n` +
                        `• *Nama Orang Tua/Wali:* ${parentName}\n` +
                        `• *Alamat Lengkap:* ${address}\n\n` +
                        `📁 *Berkas Terunggah (Simulasi):*\n` +
                        `• *Pas Foto 3x4:* ${photoFile ? photoFile.name : '-'}\n` +
                        `• *Akta Kelahiran:* ${birthFile ? birthFile.name : '-'}\n` +
                        `• *Kartu Keluarga:* ${kkFile ? kkFile.name : '-'}\n` +
                        `• *Surat Pernyataan:* ${statementFile ? statementFile.name : '-'}\n\n` +
                        `Mohon informasi langkah verifikasi berkas selanjutnya. Terima kasih! 🙏✨`;

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
        
        // Save to LocalStorage PPDB Database
        const newStudent = {
          id: 'PPDB-' + Date.now(),
          name: fullName,
          nisn: nisn,
          school: originSchool,
          major: major,
          phone: phone,
          parent: parentName,
          address: address,
          photoFile: photoFile ? photoFile.name : '',
          birthFile: birthFile ? birthFile.name : '',
          kkFile: kkFile ? kkFile.name : '',
          statementFile: statementFile ? statementFile.name : '',
          date: new Date().toISOString().split('T')[0],
          status: 'Menunggu Verifikasi'
        };

        const currentData = getPPDBData();
        currentData.push(newStudent);
        savePPDBData(currentData);
        loadPpdbTable(); // Refresh table view

        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        
        // Success Alert
        alert(`Formulir Pendaftaran atas nama ${fullName} telah disimpan di Database Sekolah dan siap dikirim.\n\n` +
              `Klik 'OK' untuk melanjutkan ke WhatsApp ${adminName} untuk koordinasi verifikasi berkas.`);
        
        // Reset form & Visual upload indicators
        ppdbForm.reset();
        document.querySelectorAll('.upload-card').forEach(card => {
          card.classList.remove('selected');
        });
        document.getElementById('photo-filename').textContent = "Pilih berkas JPG/PNG";
        document.getElementById('photo-filename').style.color = "var(--text-muted)";
        document.getElementById('photo-filename').style.fontWeight = "normal";
        document.getElementById('birth-filename').textContent = "Pilih berkas PDF/Gambar";
        document.getElementById('birth-filename').style.color = "var(--text-muted)";
        document.getElementById('birth-filename').style.fontWeight = "normal";
        document.getElementById('kk-filename').textContent = "Pilih berkas PDF/Gambar";
        document.getElementById('kk-filename').style.color = "var(--text-muted)";
        document.getElementById('kk-filename').style.fontWeight = "normal";
        document.getElementById('statement-filename').textContent = "Pilih berkas PDF/Gambar";
        document.getElementById('statement-filename').style.color = "var(--text-muted)";
        document.getElementById('statement-filename').style.fontWeight = "normal";
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

  // ==========================================================================
  // --- MULTI-ROLE LOGIN, SESSION CONTROL & PERSISTENCE ---
  // ==========================================================================

  const DEFAULT_CREDENTIALS = {
    admin: { username: 'admin', password: 'admin123' },
    guru: { username: 'guru', password: 'guru123' },
    siswa: { username: 'siswa', password: 'siswa123' },
    wali: { username: 'wali', password: 'wali123' },
    yayasan: { username: 'yayasan', password: 'yayasan123' }
  };

  window.getCredentials = function() {
    let creds = localStorage.getItem('ppdb_role_credentials');
    if (!creds) {
      localStorage.setItem('ppdb_role_credentials', JSON.stringify(DEFAULT_CREDENTIALS));
      return DEFAULT_CREDENTIALS;
    }
    try {
      return JSON.parse(creds);
    } catch (e) {
      return DEFAULT_CREDENTIALS;
    }
  };

  window.saveCredentials = function(creds) {
    localStorage.setItem('ppdb_role_credentials', JSON.stringify(creds));
  };

  window.selectLoginRole = function(role) {
    document.querySelectorAll('.role-card').forEach(card => {
      card.classList.remove('active');
    });
    
    const selectedCard = document.querySelector(`.role-card[data-role="${role}"]`);
    if (selectedCard) selectedCard.classList.add('active');
    
    const hiddenRoleInput = document.getElementById('login-role');
    if (hiddenRoleInput) hiddenRoleInput.value = role;
    
    const roleTitleSpan = document.querySelector('#login-role-title span');
    if (roleTitleSpan) {
      const roleNames = {
        admin: 'Admin',
        guru: 'Portal Guru',
        siswa: 'Portal Siswa',
        wali: 'Wali Murid',
        yayasan: 'Yayasan'
      };
      roleTitleSpan.textContent = roleNames[role] || role;
    }
  };

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const role = document.getElementById('login-role').value;
      const usernameInput = document.getElementById('login-username').value.trim();
      const passwordInput = document.getElementById('login-password').value;
      
      const creds = getCredentials();
      const targetCred = creds[role];
      
      if (!targetCred) {
        alert('Peran tidak valid!');
        return;
      }
      
      let isUsernameValid = false;
      if (role === 'admin') {
        isUsernameValid = (usernameInput === targetCred.username || usernameInput === '.amin');
      } else {
        isUsernameValid = (usernameInput === targetCred.username);
      }
      
      if (isUsernameValid && passwordInput === targetCred.password) {
        const displayName = role === 'admin' ? (usernameInput === '.amin' ? '.amin' : 'Admin') : usernameInput;
        const sessionUser = {
          role: role,
          username: displayName
        };
        sessionStorage.setItem('logged_in_user', JSON.stringify(sessionUser));
        
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        
        navigateToSection('portal');
        alert(`Selamat datang kembali, ${displayName}! Anda berhasil masuk.`);
      } else {
        alert('Username atau password salah! Silakan coba lagi.');
      }
    });
  }

  window.applyRoleAccess = function(role, username) {
    const sessionName = document.getElementById('session-user-name');
    const sessionRole = document.getElementById('session-user-role');
    if (sessionName) sessionName.textContent = username;
    if (sessionRole) {
      const roleMap = {
        admin: 'Administrator',
        guru: 'Guru / Pendidik',
        siswa: 'Siswa',
        wali: 'Wali Murid',
        yayasan: 'Yayasan'
      };
      sessionRole.textContent = roleMap[role] || role;
    }

    const allTabBtns = [
      'tab-btn-guru', 'tab-btn-siswa', 'tab-btn-wali', 'tab-btn-yayasan',
      'tab-btn-admin-data', 'tab-btn-admin-editor', 'tab-btn-admin-form',
      'tab-btn-admin-users', 'tab-btn-admin-backup'
    ];
    allTabBtns.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.style.display = 'none';
        el.classList.remove('active');
      }
    });

    const allPanes = [
      'portal-guru', 'portal-siswa', 'portal-wali', 'portal-yayasan',
      'portal-admin', 'portal-info-editor', 'portal-admin-form',
      'portal-admin-users', 'portal-admin-backup'
    ];
    allPanes.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });

    if (role === 'admin') {
      const adminTabs = ['tab-btn-admin-data', 'tab-btn-admin-editor', 'tab-btn-admin-form', 'tab-btn-admin-users', 'tab-btn-admin-backup'];
      adminTabs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = '';
      });
      
      const defaultTab = document.getElementById('tab-btn-admin-data');
      const defaultPane = document.getElementById('portal-admin');
      if (defaultTab) defaultTab.classList.add('active');
      if (defaultPane) defaultPane.classList.add('active');
      
      renderAdminAccountManagement();
    } else if (role === 'guru') {
      const el = document.getElementById('tab-btn-guru');
      if (el) {
        el.style.display = '';
        el.classList.add('active');
      }
      const pane = document.getElementById('portal-guru');
      if (pane) pane.classList.add('active');
    } else if (role === 'siswa') {
      const el = document.getElementById('tab-btn-siswa');
      if (el) {
        el.style.display = '';
        el.classList.add('active');
      }
      const pane = document.getElementById('portal-siswa');
      if (pane) pane.classList.add('active');
    } else if (role === 'wali') {
      const el = document.getElementById('tab-btn-wali');
      if (el) {
        el.style.display = '';
        el.classList.add('active');
      }
      const pane = document.getElementById('portal-wali');
      if (pane) pane.classList.add('active');
      
      loadWaliSppPaymentStates();
    } else if (role === 'yayasan') {
      const el = document.getElementById('tab-btn-yayasan');
      if (el) {
        el.style.display = '';
        el.classList.add('active');
      }
      const pane = document.getElementById('portal-yayasan');
      if (pane) pane.classList.add('active');
      
      loadYayasanDashboard();
    }
  };

  window.handleLogout = function() {
    if (confirm("Apakah Anda yakin ingin keluar dari portal akademik?")) {
      sessionStorage.removeItem('logged_in_user');
      navigateToSection('beranda');
      alert("Anda telah berhasil keluar.");
    }
  };

  // --- CREDENTIALS MANAGEMENT PANEL ---
  window.renderAdminAccountManagement = function() {
    const listContainer = document.getElementById('admin-user-accounts-list');
    if (!listContainer) return;
    
    const creds = getCredentials();
    const rolesInfo = {
      admin: { name: 'Administrator', icon: 'fa-user-shield', desc: 'Hak akses penuh ke database, pendaftaran, dan pengaturan.' },
      guru: { name: 'Portal Guru', icon: 'fa-user-tie', desc: 'Hak akses untuk mengajar, presensi, dan melihat jadwal.' },
      siswa: { name: 'Portal Siswa', icon: 'fa-user-graduate', desc: 'Hak akses melihat tugas, nilai, dan kalkulator kelulusan.' },
      wali: { name: 'Wali Murid', icon: 'fa-users', desc: 'Hak akses memantau tagihan SPP dan laporan belajar siswa.' },
      yayasan: { name: 'Yayasan', icon: 'fa-building-columns', desc: 'Hak akses pantauan finansial, statistik SDM, dan target anggaran.' }
    };
    
    listContainer.innerHTML = Object.keys(creds).map(roleKey => {
      const role = rolesInfo[roleKey] || { name: roleKey, icon: 'fa-user', desc: '' };
      const cred = creds[roleKey];
      return `
        <div class="db-card" style="margin-bottom: 16px; padding: 20px; border: 1px solid rgba(0,0,0,0.06); background: white; border-radius: var(--border-radius-sm);">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;">
            <div style="display: flex; gap: 12px; align-items: center;">
              <div style="width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--primary-ultra-light); color: var(--primary); font-size: 18px;">
                <i class="fas ${role.icon}"></i>
              </div>
              <div>
                <h4 style="margin: 0; font-size: 15px; color: var(--secondary); font-weight: 700;">${role.name}</h4>
                <p style="margin: 0; font-size: 11px; color: var(--text-muted);">${role.desc}</p>
              </div>
            </div>
            <span class="badge-tag" style="background: var(--bg-main); color: var(--text-muted); font-size: 10px; padding: 4px 8px; border-radius: 4px; text-transform: uppercase;">Peran: ${roleKey}</span>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label class="form-label" style="font-size: 11px;">Username Aktif</label>
              <input type="text" id="admin-user-username-${roleKey}" class="form-input" value="${cred.username}" style="font-size: 13px;" ${roleKey === 'admin' ? 'readonly placeholder="admin (menerima .amin juga)"' : ''}>
              ${roleKey === 'admin' ? '<span style="font-size: 10px; color: var(--text-muted);">*Username Admin tidak dapat diubah (menerima <code>admin</code> atau <code>.amin</code>)</span>' : ''}
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label class="form-label" style="font-size: 11px;">Password Baru</label>
              <input type="text" id="admin-user-password-${roleKey}" class="form-input" value="${cred.password}" style="font-size: 13px;">
            </div>
          </div>
          
          <div style="text-align: right;">
            <button onclick="updateRoleCredentials('${roleKey}')" class="btn btn-primary" style="padding: 6px 14px; font-size: 12px; border-radius: 4px;">
              <i class="fas fa-save"></i> Perbarui Akun
            </button>
          </div>
        </div>
      `;
    }).join('');
  };

  window.updateRoleCredentials = function(roleKey) {
    const usernameInput = document.getElementById(`admin-user-username-${roleKey}`);
    const passwordInput = document.getElementById(`admin-user-password-${roleKey}`);
    
    if (!passwordInput || (roleKey !== 'admin' && !usernameInput)) return;
    
    const newUsername = roleKey === 'admin' ? 'admin' : usernameInput.value.trim();
    const newPassword = passwordInput.value.trim();
    
    if (!newUsername || !newPassword) {
      alert("Username dan Password tidak boleh kosong!");
      return;
    }
    
    const creds = getCredentials();
    creds[roleKey] = { username: newUsername, password: newPassword };
    saveCredentials(creds);
    
    alert(`Akun untuk ${roleKey.toUpperCase()} berhasil diperbarui!\nUsername: ${newUsername}\nPassword: ${newPassword}`);
    renderAdminAccountManagement();
  };

  window.resetDefaultCredentials = function() {
    if (confirm("Apakah Anda yakin ingin mereset semua username & sandi ke setelan default pabrik?")) {
      localStorage.removeItem('ppdb_role_credentials');
      renderAdminAccountManagement();
      alert("Semua kredensial telah di-reset ke nilai default.");
    }
  };

  // --- DATABASE EXPORT & BACKUPS ---
  window.exportPpdbDatabase = function(type) {
    const data = getPPDBData();
    if (data.length === 0) {
      alert("Tidak ada data pendaftaran yang tersedia untuk diekspor!");
      return;
    }
    
    let content = "";
    let filename = "";
    let mimeType = "";
    
    if (type === 'json') {
      content = JSON.stringify(data, null, 2);
      filename = `backup_ppdb_smk_alamdarussalam_${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json;charset=utf-8';
    } else if (type === 'csv') {
      const headers = ['ID Pendaftaran', 'Nama Calon Siswa', 'NISN', 'Asal Sekolah', 'Program Keahlian', 'No HP/WA', 'Nama Wali', 'Alamat Lengkap', 'Tanggal Daftar', 'Status'];
      const rows = data.map(item => [
        item.id || '',
        `"${(item.name || '').replace(/"/g, '""')}"`,
        `'${item.nisn || ''}`,
        `"${(item.school || '').replace(/"/g, '""')}"`,
        `"${(item.major || '').replace(/"/g, '""')}"`,
        `'${item.phone || ''}`,
        `"${(item.parent || '').replace(/"/g, '""')}"`,
        `"${(item.address || '').replace(/"/g, '""')}"`,
        item.date || '',
        item.status || ''
      ]);
      
      content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      filename = `data_ppdb_smk_alamdarussalam_${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv;charset=utf-8';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`Berhasil mengekspor database PPDB dalam format ${type.toUpperCase()}! File '${filename}' siap disimpan.`);
  };

  // --- WALI MURID: SPP PAYMENT PERSISTENCE ---
  window.getPaidMonths = function() {
    let months = localStorage.getItem('spp_paid_months');
    if (!months) {
      const defaultPaid = ['januari'];
      localStorage.setItem('spp_paid_months', JSON.stringify(defaultPaid));
      return defaultPaid;
    }
    try {
      return JSON.parse(months);
    } catch(e) {
      return ['januari'];
    }
  };

  window.savePaidMonths = function(months) {
    localStorage.setItem('spp_paid_months', JSON.stringify(months));
  };

  window.loadWaliSppPaymentStates = function() {
    const paidMonths = getPaidMonths();
    ['januari', 'februari', 'maret'].forEach(m => {
      const statusBadge = document.getElementById(`status-${m}`);
      const btn = document.getElementById(`pay-btn-${m}`);
      
      if (paidMonths.includes(m)) {
        if (statusBadge) {
          statusBadge.className = 'badge-status status-success';
          statusBadge.textContent = 'Lunas (E-Wallet)';
        }
        if (btn) btn.style.display = 'none';
      } else {
        if (statusBadge) {
          statusBadge.className = 'badge-status status-warning';
          statusBadge.textContent = 'Belum Bayar';
        }
        if (btn) btn.style.display = '';
      }
    });
  };

  // --- YAYASAN DASHBOARD REPORT SYSTEM ---
  window.loadYayasanDashboard = function() {
    const paidMonths = getPaidMonths();
    const ppdbData = getPPDBData();
    
    const suggengPayments = paidMonths.length;
    const sppIncome = 24300000 + (suggengPayments * 150000);
    
    const ppdbIncome = 3500000 + (ppdbData.length * 50000);
    
    const verifiedRegistrantsCount = ppdbData.filter(s => s.status === 'Terverifikasi').length;
    const uangPangkalIncome = 15000000 + (verifiedRegistrantsCount * 500000);
    
    const totalFunds = 50000000 + sppIncome + ppdbIncome + uangPangkalIncome;
    const surplus = Math.round(totalFunds * 0.55);
    
    const sppEl = document.getElementById('y-spp-income');
    const ppdbEl = document.getElementById('y-ppdb-income');
    const totalEl = document.getElementById('y-total-funds');
    const surplusEl = document.getElementById('y-surplus');
    
    if (sppEl) sppEl.textContent = `Rp ${sppIncome.toLocaleString('id-ID')}`;
    if (ppdbEl) ppdbEl.textContent = `Rp ${ppdbIncome.toLocaleString('id-ID')}`;
    if (totalEl) totalEl.textContent = `Rp ${totalFunds.toLocaleString('id-ID')}`;
    if (surplusEl) surplusEl.textContent = `Rp ${surplus.toLocaleString('id-ID')}`;
    
    const sppPercent = Math.min(Math.round((sppIncome / 30000000) * 100), 100);
    const sppPercentEl = document.getElementById('y-spp-percent');
    const sppBarEl = document.getElementById('y-spp-progress-bar');
    if (sppPercentEl) sppPercentEl.textContent = `${sppPercent}%`;
    if (sppBarEl) sppBarEl.style.width = `${sppPercent}%`;
    
    const totalRegistrantsCount = 30 + ppdbData.length;
    const ppdbPercent = Math.min(Math.round((totalRegistrantsCount / 50) * 100), 100);
    const ppdbPercentEl = document.getElementById('y-ppdb-percent');
    const ppdbBarEl = document.getElementById('y-ppdb-progress-bar');
    if (ppdbPercentEl) ppdbPercentEl.textContent = `${ppdbPercent}% (${totalRegistrantsCount}/50 Calon Siswa)`;
    if (ppdbBarEl) ppdbBarEl.style.width = `${ppdbPercent}%`;
  };

  // --- ADMIN MANUAL PPDB FORM HANDLER ---
  const adminPpdbForm = document.getElementById('admin-ppdb-form');
  if (adminPpdbForm) {
    adminPpdbForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const fullName = document.getElementById('admin-ppdb-name').value.trim();
      const nisn = document.getElementById('admin-ppdb-nisn').value.trim();
      const originSchool = document.getElementById('admin-ppdb-school').value.trim();
      const major = document.getElementById('admin-ppdb-major').value;
      const phone = document.getElementById('admin-ppdb-phone').value.trim();
      const parentName = document.getElementById('admin-ppdb-parent').value.trim();
      const address = document.getElementById('admin-ppdb-address').value.trim();
      
      const newStudent = {
        id: 'PPDB-ADM-' + Date.now(),
        name: fullName,
        nisn: nisn,
        school: originSchool,
        major: major,
        phone: phone,
        parent: parentName,
        address: address,
        photoFile: 'pas_foto_manual.png',
        birthFile: 'akta_manual.pdf',
        kkFile: 'kk_manual.pdf',
        statementFile: 'pernyataan_manual.pdf',
        date: new Date().toISOString().split('T')[0],
        status: 'Terverifikasi'
      };
      
      const currentData = getPPDBData();
      currentData.push(newStudent);
      savePPDBData(currentData);
      
      alert(`Siswa ${fullName} berhasil didaftarkan langsung oleh Panitia! Status otomatis 'Terverifikasi'.`);
      
      adminPpdbForm.reset();
      loadPpdbTable();
      
      const tabBtn = document.getElementById('tab-btn-admin-data');
      if (tabBtn) tabBtn.click();
    });
  }

  // --- PERSISTENCE RESTORE & RENDER ON LOAD ---
  selectLoginRole('admin');
  loadPpdbTable();

  const initialSessionStr = sessionStorage.getItem('logged_in_user');
  if (initialSessionStr) {
    try {
      const parsedUser = JSON.parse(initialSessionStr);
      if (parsedUser && parsedUser.role && parsedUser.username) {
        applyRoleAccess(parsedUser.role, parsedUser.username);
        navigateToSection('portal');
      } else {
        navigateToSection('beranda');
      }
    } catch(e) {
      sessionStorage.removeItem('logged_in_user');
      navigateToSection('beranda');
    }
  } else {
    navigateToSection('beranda');
  }
});

// ============================================================
// ParkSmart — Online Vehicle Parking Reservation System
// Shared JavaScript File
// ============================================================

// ── Active Nav Link ──────────────────────────────────────────
function setActiveNavLink() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === page) link.classList.add('active-nav');
  });
}

// ── Mobile Menu ──────────────────────────────────────────────
function initMobileMenu() {
  const btn  = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    menu.classList.toggle('hidden');
    const ic = btn.querySelector('i');
    if (ic) { ic.classList.toggle('fa-bars'); ic.classList.toggle('fa-xmark'); }
  });
}

// ── Modules Dropdown ─────────────────────────────────────────
function initDropdown() {
  const btn  = document.getElementById('modules-btn');
  const menu = document.getElementById('modules-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', e => { e.stopPropagation(); menu.classList.toggle('hidden'); });
  document.addEventListener('click', () => menu.classList.add('hidden'));
  menu.addEventListener('click', e => e.stopPropagation());
}

// ── Navbar Scroll ────────────────────────────────────────────
function initNavbarScroll() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.style.background = 'rgba(5,10,24,0.97)';
      nav.style.boxShadow  = '0 4px 40px rgba(0,0,0,0.4)';
    } else {
      nav.style.background = 'rgba(5,10,24,0.82)';
      nav.style.boxShadow  = 'none';
    }
  }, { passive: true });
}

// ── Reveal on Scroll ─────────────────────────────────────────
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ── Animated Counters ────────────────────────────────────────
function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target   = parseFloat(el.dataset.count);
      const suffix   = el.dataset.suffix || '';
      const prefix   = el.dataset.prefix || '';
      const decimal  = el.dataset.decimal === 'true';
      const steps = 60, duration = 2000;
      let cur = 0;
      const iv = setInterval(() => {
        cur = Math.min(cur + target / steps, target);
        el.textContent = prefix + (decimal ? cur.toFixed(1) : Math.floor(cur).toLocaleString()) + suffix;
        if (cur >= target) clearInterval(iv);
      }, duration / steps);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => obs.observe(el));
}

// ── Booking Form ─────────────────────────────────────────────
const ZONES = {
  A:   { label: 'Zone A – Ground Floor', rate: 20, slots: ['A-01','A-02','A-04','A-05','A-07','A-08'] },
  B:   { label: 'Zone B – First Floor',  rate: 25, slots: ['B-01','B-03','B-04']                       },
  C:   { label: 'Zone C – Basement',     rate: 15, slots: ['C-01','C-02','C-04','C-05','C-06']         },
  VIP: { label: 'VIP Zone – Premium',    rate: 50, slots: ['VIP-01','VIP-02']                           },
};

function initBookingForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const dateEl  = document.getElementById('date');
  const zoneEl  = document.getElementById('zone');
  const slotEl  = document.getElementById('slot');
  const durEl   = document.getElementById('duration');
  const rateEl  = document.getElementById('rate-display');
  const totalEl = document.getElementById('total-display');
  const modal   = document.getElementById('conf-modal');

  function hideModal() { if (modal) modal.style.display = 'none'; }

  if (dateEl) dateEl.min = new Date().toISOString().split('T')[0];

  function calcTotal() {
    const z = ZONES[zoneEl?.value];
    const d = parseInt(durEl?.value || 1);
    if (z && rateEl)  rateEl.textContent  = '₹' + z.rate + '/hr';
    if (z && totalEl) totalEl.textContent  = '₹' + (z.rate * d);
  }

  zoneEl?.addEventListener('change', () => {
    slotEl.innerHTML = '<option value="">-- Select Slot --</option>';
    const z = ZONES[zoneEl.value];
    if (z) z.slots.forEach(s => {
      const o = document.createElement('option');
      o.value = s; o.textContent = s + '  ✓ Available'; slotEl.appendChild(o);
    });
    calcTotal();
  });

  durEl?.addEventListener('change', calcTotal);

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (validateForm()) showConfirmation();
  });

  document.getElementById('close-modal')?.addEventListener('click', hideModal);
  document.getElementById('new-booking-btn')?.addEventListener('click', () => {
    hideModal();
    form.reset();
    slotEl.innerHTML = '<option value="">-- Select Slot --</option>';
    if (rateEl)  rateEl.textContent  = '--';
    if (totalEl) totalEl.textContent = '--';
  });
  modal?.addEventListener('click', e => { if (e.target === modal) hideModal(); });
}

function clearErrors() {
  document.querySelectorAll('.err').forEach(e => { e.textContent = ''; e.classList.add('hidden'); });
  document.querySelectorAll('.form-input').forEach(e => e.classList.remove('inp-err'));
}

function showErr(id, msg) {
  const inp = document.getElementById(id); if (inp) inp.classList.add('inp-err');
  const err = document.getElementById(id + '-err'); if (err) { err.textContent = msg; err.classList.remove('hidden'); }
}

function validateForm() {
  clearErrors(); let ok = true;

  const name = document.getElementById('fullname')?.value.trim();
  if (!name || name.length < 2) { showErr('fullname','Full name is required (min 2 chars)'); ok = false; }

  const phone = document.getElementById('phone')?.value.trim();
  if (!phone || !/^[6-9]\d{9}$/.test(phone)) { showErr('phone','Enter a valid 10-digit mobile number'); ok = false; }

  const vn = document.getElementById('vehicle-number')?.value.trim();
  if (!vn) { showErr('vehicle-number','Vehicle number is required'); ok = false; }
  else if (!/^[A-Za-z]{2}[0-9]{2}[A-Za-z]{1,2}[0-9]{4}$/.test(vn.replace(/[\s-]/g,'')))
    { showErr('vehicle-number','Invalid format. Example: MH12AB1234'); ok = false; }

  ['vehicle-type','date','time','duration','zone','slot'].forEach(fid => {
    const el = document.getElementById(fid);
    if (!el || !el.value) { showErr(fid, 'This field is required'); ok = false; }
  });
  return ok;
}

function showConfirmation() {
  const modal = document.getElementById('conf-modal'); if (!modal) return;
  const id = 'PKR-' + Date.now().toString().slice(-8).toUpperCase();
  const set = (sid, val) => { const el = document.getElementById(sid); if (el && val != null) el.textContent = val; };
  set('conf-id',       id);
  set('conf-name',     document.getElementById('fullname')?.value);
  set('conf-phone',    document.getElementById('phone')?.value);
  set('conf-vehicle',  document.getElementById('vehicle-number')?.value.toUpperCase());
  set('conf-type',     document.getElementById('vehicle-type')?.value);
  set('conf-date',     document.getElementById('date')?.value);
  set('conf-time',     document.getElementById('time')?.value);
  set('conf-duration', (document.getElementById('duration')?.value || '') + ' hour(s)');
  set('conf-zone',     ZONES[document.getElementById('zone')?.value]?.label || '');
  set('conf-slot',     document.getElementById('slot')?.value);
  set('conf-total',    document.getElementById('total-display')?.textContent);
  modal.style.display = 'flex';
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setActiveNavLink();
  initMobileMenu();
  initDropdown();
  initNavbarScroll();
  initReveal();
  initCounters();
  initBookingForm();
});

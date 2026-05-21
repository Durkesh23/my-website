/* =============================================
   BIO DATA WEBSITE — SHARED JS
   assets/js/app.js
   ============================================= */

'use strict';

/* ── PAGE TRANSITION ── */
function navigateTo(url) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:9999;
    background:#0071e3;
    transform:translateY(100%);
    transition:transform 0.45s cubic-bezier(0.76,0,0.24,1);
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.style.transform = 'translateY(0)';
    });
  });
  setTimeout(() => {
    window.location.href = url;
  }, 450);
}

/* ── PHOTO UPLOAD PREVIEW ── */
function initPhotoUpload() {
  const input   = document.getElementById('photo-input');
  const ring    = document.getElementById('photo-ring');
  const preview = document.getElementById('photo-preview');
  const icon    = document.getElementById('photo-icon');
  if (!input) return;

  ring.addEventListener('click', () => input.click());

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.style.display = 'block';
      icon.style.display    = 'none';
      // store base64 for result page
      sessionStorage.setItem('bioPhoto', e.target.result);
    };
    reader.readAsDataURL(file);
  });
}

/* ── FLOATING LABEL: SELECT ── */
function initSelectLabels() {
  document.querySelectorAll('.field-group select').forEach(sel => {
    const update = () => {
      sel.value ? sel.classList.add('has-value') : sel.classList.remove('has-value');
    };
    sel.addEventListener('change', update);
    update();
  });
}

/* ── FORM VALIDATION ── */
function validateForm(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(el => {
    const group = el.closest('.field-group');
    if (!el.value.trim()) {
      group.classList.add('error-state');
      valid = false;
    } else {
      group.classList.remove('error-state');
    }
  });
  return valid;
}

/* ── SAVE & NAVIGATE ── */
function initForm() {
  const form = document.getElementById('bio-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(form)) {
      const firstError = form.querySelector('.error-state');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const data = {
      name:          form.fullname.value.trim(),
      dob:           form.dob.value,
      gender:        form.gender.value,
      email:         form.email.value.trim(),
      phone:         form.phone.value.trim(),
      address:       form.address.value.trim(),
      city:          form.city.value.trim(),
      state:         form.state.value.trim(),
      country:       form.country.value.trim(),
      occupation:    form.occupation.value.trim(),
      company:       form.company.value.trim(),
      education:     form.education.value.trim(),
      skills:        form.skills.value.trim(),
      bio:           form.bio.value.trim(),
      linkedin:      form.linkedin ? form.linkedin.value.trim() : '',
      github:        form.github   ? form.github.value.trim()   : '',
      website:       form.website  ? form.website.value.trim()  : '',
    };

    sessionStorage.setItem('bioData', JSON.stringify(data));
    navigateTo('result.html');
  });
}

/* ── SCROLL REVEAL (result page) ── */
function initScrollReveal() {
  const els = document.querySelectorAll('.sr');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}

/* ── COUNTER ANIMATION ── */
function animateValue(el, target, duration) {
  const start = performance.now();
  const update = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * target);
    if (p < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

/* ── RESULT PAGE: LOAD DATA ── */
function initResultPage() {
  const raw = sessionStorage.getItem('bioData');
  if (!raw) {
    document.getElementById('result-root').innerHTML = `
      <div style="text-align:center;padding:80px 24px;">
        <p style="font-size:18px;color:#6e6e73;margin-bottom:24px;">No bio data found.</p>
        <a href="index.html" class="btn-secondary">← Fill the Form</a>
      </div>`;
    return;
  }

  const d = JSON.parse(raw);
  const photo = sessionStorage.getItem('bioPhoto');

  // Calculate age
  let age = '—';
  if (d.dob) {
    const diff = Date.now() - new Date(d.dob).getTime();
    age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)) + ' yrs';
  }

  // Format DOB
  let dobDisplay = '—';
  if (d.dob) {
    dobDisplay = new Date(d.dob).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  // Skills array
  const skillsArr = d.skills
    ? d.skills.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  // Avatar placeholder if no photo
  const avatarHTML = photo
    ? `<img src="${photo}" alt="${d.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
    : `<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="30" r="18" fill="#c7d9f0"/>
        <ellipse cx="40" cy="70" rx="28" ry="18" fill="#c7d9f0"/>
       </svg>`;

  // Gender icon
  const genderIcon = d.gender === 'male' ? '♂' : d.gender === 'female' ? '♀' : '⚥';

  // Social links
  const socials = [];
  if (d.linkedin) socials.push({ label: 'LinkedIn', url: d.linkedin, icon: '💼' });
  if (d.github)   socials.push({ label: 'GitHub',   url: d.github,   icon: '🐙' });
  if (d.website)  socials.push({ label: 'Website',  url: d.website,  icon: '🌐' });

  const socialsHTML = socials.map(s =>
    `<a href="${s.url.startsWith('http') ? s.url : 'https://'+s.url}" target="_blank"
        style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;
               background:var(--off-white);border:1px solid var(--border);
               border-radius:100px;font-size:13px;font-weight:600;color:var(--text-primary);
               text-decoration:none;transition:all 0.2s;"
        onmouseenter="this.style.background='var(--accent-soft)';this.style.borderColor='var(--accent)';this.style.color='var(--accent)'"
        onmouseleave="this.style.background='var(--off-white)';this.style.borderColor='var(--border)';this.style.color='var(--text-primary)'">
      ${s.icon} ${s.label}
    </a>`
  ).join('');

  const skillsHTML = skillsArr.map(s =>
    `<span class="skill-pill">${s}</span>`
  ).join('');

  document.getElementById('result-root').innerHTML = `
    <!-- HERO BANNER -->
    <div class="result-hero sr" style="text-align:center;padding:60px 24px 40px;">
      <div style="width:110px;height:110px;border-radius:50%;
                  border:3px solid #fff;box-shadow:0 8px 32px rgba(0,113,227,0.18);
                  margin:0 auto 20px;overflow:hidden;background:var(--accent-soft);
                  display:flex;align-items:center;justify-content:center;">
        ${avatarHTML}
      </div>
      <h1 class="serif" style="font-size:clamp(28px,5vw,44px);font-weight:400;letter-spacing:-0.5px;margin-bottom:8px;">${d.name}</h1>
      <p style="font-size:16px;color:var(--text-second);margin-bottom:16px;">${d.occupation || ''}${d.company ? ' · ' + d.company : ''}</p>
      <div style="display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;">
        ${d.city ? `<span class="badge badge-gray">📍 ${d.city}${d.country ? ', '+d.country : ''}</span>` : ''}
        ${d.gender ? `<span class="badge badge-blue">${genderIcon} ${d.gender.charAt(0).toUpperCase()+d.gender.slice(1)}</span>` : ''}
        <span class="badge badge-green">✓ Profile Complete</span>
      </div>
    </div>

    <!-- STATS ROW -->
    <div class="sr" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:2px;margin-bottom:2px;">
      ${[
        { label:'Age', val: age },
        { label:'Skills', val: skillsArr.length || '—' },
        { label:'Education', val: d.education ? d.education.split(' ').slice(-1)[0] : '—' },
      ].map(s => `
        <div style="background:var(--white);padding:28px 20px;text-align:center;">
          <div style="font-size:28px;font-weight:700;color:var(--text-primary);">${s.val}</div>
          <div style="font-size:12px;color:var(--text-hint);text-transform:uppercase;letter-spacing:1px;margin-top:4px;">${s.label}</div>
        </div>`).join('')}
    </div>

    <!-- ABOUT -->
    ${d.bio ? `
    <div class="result-block sr" style="background:var(--white);padding:36px 40px;margin-bottom:2px;">
      <div class="block-title">About</div>
      <p style="font-size:16px;color:var(--text-second);line-height:1.8;margin-top:16px;">${d.bio}</p>
    </div>` : ''}

    <!-- PERSONAL INFO -->
    <div class="result-block sr" style="background:var(--white);padding:36px 40px;margin-bottom:2px;">
      <div class="block-title">Personal Information</div>
      <div class="info-grid">
        ${[
          { icon:'📅', label:'Date of Birth', val: dobDisplay },
          { icon:'📧', label:'Email Address', val: d.email || '—' },
          { icon:'📱', label:'Phone Number',  val: d.phone  || '—' },
          { icon:'🏠', label:'Address',       val: d.address || '—' },
          { icon:'🌆', label:'City / State',  val: [d.city, d.state].filter(Boolean).join(', ') || '—' },
          { icon:'🌍', label:'Country',       val: d.country || '—' },
        ].map(row => `
          <div class="info-row">
            <div style="display:flex;align-items:center;gap:10px;min-width:0;">
              <span style="font-size:18px;width:28px;text-align:center;flex-shrink:0;">${row.icon}</span>
              <div>
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--text-hint);font-weight:600;">${row.label}</div>
                <div style="font-size:15px;font-weight:500;margin-top:2px;word-break:break-word;">${row.val}</div>
              </div>
            </div>
          </div>`).join('')}
      </div>
    </div>

    <!-- PROFESSIONAL -->
    <div class="result-block sr" style="background:var(--white);padding:36px 40px;margin-bottom:2px;">
      <div class="block-title">Professional Details</div>
      <div class="info-grid">
        ${[
          { icon:'💼', label:'Occupation',  val: d.occupation  || '—' },
          { icon:'🏢', label:'Company / Org', val: d.company   || '—' },
          { icon:'🎓', label:'Education',   val: d.education   || '—' },
        ].map(row => `
          <div class="info-row">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="font-size:18px;width:28px;text-align:center;flex-shrink:0;">${row.icon}</span>
              <div>
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--text-hint);font-weight:600;">${row.label}</div>
                <div style="font-size:15px;font-weight:500;margin-top:2px;">${row.val}</div>
              </div>
            </div>
          </div>`).join('')}
      </div>
    </div>

    <!-- SKILLS -->
    ${skillsArr.length ? `
    <div class="result-block sr" style="background:var(--white);padding:36px 40px;margin-bottom:2px;">
      <div class="block-title">Skills & Interests</div>
      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:20px;">
        ${skillsHTML}
      </div>
    </div>` : ''}

    <!-- SOCIAL -->
    ${socials.length ? `
    <div class="result-block sr" style="background:var(--white);padding:36px 40px;margin-bottom:2px;">
      <div class="block-title">Connect</div>
      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:20px;">
        ${socialsHTML}
      </div>
    </div>` : ''}

    <!-- ACTIONS -->
    <div class="sr" style="padding:40px;text-align:center;display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
      <a href="index.html" class="btn-secondary">← Edit Profile</a>
      <button onclick="window.print()" class="btn-primary" style="width:auto;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Print / Save PDF
      </button>
    </div>
  `;

  // Trigger scroll reveal
  setTimeout(initScrollReveal, 50);
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initPhotoUpload();
  initSelectLabels();
  initForm();
  initScrollReveal();
  if (document.getElementById('result-root')) {
    initResultPage();
  }
});

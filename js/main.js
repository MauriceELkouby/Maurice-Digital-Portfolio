// -------- GLOBAL FLAGS --------
let isFiltering = false;

/* =============================
   Smooth Scroll Navigation
================================*/
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', function (e) {
    const targetSel = this.getAttribute('href');
    const target = document.querySelector(targetSel);
    if (!target) return; // allow normal nav if not found
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

/* =============================
   Scrollspy Active Link
================================*/
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section');
  const scrollPos = window.scrollY + 100;
  sections.forEach(section => {
    if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
      document.querySelectorAll('nav a').forEach(link => link.classList.remove('active'));
      const activeLink = document.querySelector(`nav a[href="#${section.id}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
});

/* =============================
   Mobile Nav Toggle
================================*/
const navLinks = document.querySelector('#navbar .nav-links');
const burger = document.querySelector('.menu-toggle');
if (burger && navLinks) {
  burger.addEventListener('click', () => navLinks.classList.toggle('show'));
}

/* =============================
   Back to Top Button (guarded)
================================*/
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  if (!backToTop) return;
  backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
});
if (backToTop) {
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* =============================
   Reveal-on-scroll helpers
================================*/
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      obs.unobserve(e.target);
    }
  });
}, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

function makeReveal(el) {
  el.classList.add('reveal');
  revealObserver.observe(el);
}

// Pre-tag only static items (NOT project cards created later)
document.querySelectorAll('section, .skill-bubble').forEach((el, i) => {
  el.classList.add('reveal');
  if (i % 3 === 1) el.classList.add('stagger-1');
  if (i % 3 === 2) el.classList.add('stagger-2');
  if (i % 3 === 0) el.classList.add('stagger-3');
  revealObserver.observe(el);
});

/* =============================
   Load & Render Projects
================================*/
(async function boot() {
  const grid = document.getElementById('project-cards');
  if (!grid) return console.error('Missing #project-cards container.');

  // Try absolute path (Vite/public) then relative (static server from project root)
  const urls = ['/json/data.json', 'json/data.json'];
  let data = null;
  for (const url of urls) {
    try {
      const r = await fetch(url, { cache: 'no-store' });
      if (r.ok) { data = await r.json(); break; }
    } catch (e) { /* ignore and try next */ }
  }
  if (!data || !Array.isArray(data.projects)) {
    console.error('Failed to load projects from /json/data.json or json/data.json');
    return;
  }
  if (Array.isArray(data.timeline)) {
    renderTimeline(data.timeline);
  }
  // Render cards
  data.projects.forEach(p => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.type = p.type || 'professional';
    card.innerHTML = `
      <picture>
        <img src="${p.image || ''}" alt="${p.name || ''}"
             loading="lazy" decoding="async" width="800" height="450">
      </picture>
      <div class="content">
        <h3>${p.name || ''}</h3>
        <p class="project-summary">${p.description || ''}</p>
        <p>${(p.technologies || []).map(t => `<button class="skill-bubble">${t}</button>`).join('')}</p>
        ${p.link ? `<a href="${p.link}" target="_blank" rel="noopener">View more…</a>` : ``}
      </div>
    `;
    grid.appendChild(card);
    makeReveal(card);
  });

  // Wire filter buttons (single system)
  const filterBar = document.querySelector('.filter-buttons');
  if (filterBar) {
    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-type]');
      if (!btn) return;
      filterTo(btn.dataset.type);
    });
  }

  function allCards() { return Array.from(grid.querySelectorAll('.project-card')); }

  // Smooth FLIP filter (animations on remaining visible cards)
  function filterTo(type) {
    const cards = allCards();

    // 1) measure FIRST
    const first = new Map(cards.map(c => [c, c.getBoundingClientRect()]));

    // 2) update visibility
    cards.forEach(c => {
      const show = type === 'all' || c.dataset.type === type;
      c.classList.toggle('is-hidden', !show);
    });

    // force layout
    grid.getBoundingClientRect();

    // 3) measure LAST
    const last = new Map(allCards().map(c => [c, c.getBoundingClientRect()]));

    // 4) INVERT + PLAY
    isFiltering = true;
    let pending = 0;
    last.forEach((l, c) => {
      const f = first.get(c);
      if (!f) return;
      const dx = f.left - l.left;
      const dy = f.top - l.top;
      const sx = f.width / Math.max(1, l.width);

      // Start inverted
      c.style.transform = `translate(${dx}px, ${dy}px) scale(${sx})`;
      c.style.transition = 'none';
      // Next frame: animate back to identity
      requestAnimationFrame(() => {
        pending++;
        c.style.transition = 'transform 320ms cubic-bezier(.2,.7,.2,1)';
        c.style.transform = '';
        const onEnd = () => {
          c.style.transition = '';
          c.removeEventListener('transitionend', onEnd);
          if (--pending === 0) isFiltering = false;
        };
        c.addEventListener('transitionend', onEnd, { once: true });
      });
    });
  }
})();

/* =============================
   Subtle 3D tilt (disabled during filter)
================================*/
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
document.addEventListener('pointermove', (e) => {
  if (isFiltering) return;
  document.querySelectorAll('.project-card').forEach(card => {
    const r = card.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dx = (e.clientX - cx) / (r.width / 2);
    const dy = (e.clientY - cy) / (r.height / 2);
    const rx = clamp(-dy * 6, -6, 6);
    const ry = clamp(dx * 6, -6, 6);
    // If you added CSS variables for composition:
    card.style.setProperty('--tiltX', `${rx}deg`);
    card.style.setProperty('--tiltY', `${ry}deg`);
  });
});
document.addEventListener('pointerleave', () => {
  document.querySelectorAll('.project-card').forEach(card => {
    card.style.setProperty('--tiltX', `0deg`);
    card.style.setProperty('--tiltY', `0deg`);
  });
});

function renderTimeline(items) {
  const container = document.getElementById('timeline-container');
  if (!container) return;

  items = items.slice().sort((a,b) => new Date(b.start||'1900') - new Date(a.start||'1900'));
  container.innerHTML = '';

  items.forEach(item => {
    const type = (item.type || '').toLowerCase();
    const side = item.side || (type === 'education' ? 'left' : 'right');

    const wrapper = document.createElement('div');
    wrapper.className = `timeline-item ${side}`;

    const imgHTML = item.image ? `<img class="thumb" src="${item.image}" alt="${item.org || item.title || 'logo'}">` : '';
    const titleLine = item.org ? `<h3>${item.title||''}</h3>` : `<h3>${item.title||''}</h3>`;
    const dateText  = formatDateRange(item.start, item.end);
    wrapper.innerHTML = `
      <div class="content" data-aos="fade-up" href="${item.link}">
        ${imgHTML}
        ${titleLine}
        <span class="date">${dateText}</span>
        <p>${item.desc || ''}</p>
      </div>
    `;

    container.appendChild(wrapper);
    // 👉 observe AFTER it’s in the DOM
    makeReveal(wrapper);
  });
}


function formatDateRange(start, end) {
  const fmt = (s) => {
    if (!s) return null;
    const [y, m = '01'] = s.split('-');
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleString(undefined, { month: 'short', year: 'numeric' });
  };
  const s = fmt(start), e = fmt(end);
  if (s && e)   return `${s} – ${e}`;
  if (s && !e)  return `${s} – Present`;
  return e || s || '';
}

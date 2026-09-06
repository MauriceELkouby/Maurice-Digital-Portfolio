const navLinks = document.querySelector('#navbar .nav-links');
const menuButton = document.querySelector('.menu-toggle');
const backToTop = document.getElementById('back-to-top');
const t = (key) => window.portfolioI18n?.t(key) || key;

if (menuButton && navLinks) {
  menuButton.addEventListener('click', () => {
    const open = navLinks.classList.toggle('show');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  navLinks.addEventListener('click', (event) => {
    if (!event.target.closest('a')) return;
    navLinks.classList.remove('show');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  });
}

const sections = Array.from(document.querySelectorAll('main section[id]'));
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll('#navbar .nav-links a').forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
    });
  });
}, { rootMargin: '-25% 0px -65%', threshold: 0 });
sections.forEach((section) => sectionObserver.observe(section));

window.addEventListener('scroll', () => {
  if (backToTop) backToTop.style.display = window.scrollY > 600 ? 'block' : 'none';
}, { passive: true });
backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in');
    observer.unobserve(entry.target);
  });
}, { rootMargin: '80px 0px -5%', threshold: .05 });

function reveal(element) {
  element.classList.add('reveal');
  revealObserver.observe(element);
}
document.querySelectorAll('.content-section > h2, .content-section > p, .skill-item, .cert-card').forEach(reveal);

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

const detailDialog = createDetailDialog();
let dialogTrigger = null;

function createDetailDialog() {
  const dialog = createElement('dialog', 'detail-dialog');
  dialog.setAttribute('aria-labelledby', 'detail-dialog-title');

  const panel = createElement('div', 'detail-dialog-panel');
  const close = createElement('button', 'detail-dialog-close', '×');
  close.type = 'button';
  close.setAttribute('aria-label', t('closeDetails'));
  close.addEventListener('click', () => dialog.close());

  const body = createElement('div', 'detail-dialog-body');
  panel.append(close, body);
  dialog.append(panel);
  document.body.append(dialog);

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    dialogTrigger?.focus();
  });
  return dialog;
}

function openDetails(item, kind, trigger) {
  dialogTrigger = trigger;
  detailDialog.dataset.kind = kind;
  const body = detailDialog.querySelector('.detail-dialog-body');
  body.replaceChildren();

  const visual = createElement('div', 'detail-dialog-visual');
  if (item.image) {
    const image = document.createElement('img');
    image.src = item.image;
    image.alt = `${item.name || item.org || item.title || 'Detail'} image`;
    visual.append(image);
  }

  const content = createElement('div', 'detail-dialog-content');
  const eyebrow = createElement('p', 'detail-dialog-eyebrow', kind === 'project' ? projectTypeLabel(item.type) : item.type === 'education' ? t('education') : t('experience'));
  const title = createElement('h2', '', item.name || item.title || 'Details');
  title.id = 'detail-dialog-title';
  content.append(eyebrow, title);

  if (kind === 'timeline') {
    if (item.org) content.append(createElement('p', 'detail-dialog-organization', item.org));
    content.append(createElement('p', 'detail-dialog-date', formatDateRange(item.start, item.end)));
  }

  content.append(createElement('p', 'detail-dialog-description', expandedDescription(item, kind)));

  const skills = kind === 'project' ? item.technologies || [] : timelineSkills(item);
  if (skills.length) {
    const list = createElement('ul', 'technology-list');
    list.setAttribute('aria-label', kind === 'project' ? t('technologiesUsed') : t('areasOfFocus'));
    skills.forEach((skill) => list.append(createElement('li', 'skill-bubble', skill)));
    content.append(list);
  }

  if (item.link) {
    const link = createElement('a', 'button button-primary detail-dialog-link', kind === 'project' ? t('openFullProject') : t('visitOrganization'));
    link.href = item.link;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.append(document.createTextNode(' ↗'));
    content.append(link);
  }

  body.append(visual, content);
  document.body.classList.add('dialog-open');
  detailDialog.showModal();
  detailDialog.querySelector('.detail-dialog-close').focus();
}

function projectTypeLabel(type) {
  return ({ sim: t('industrialSimulation'), design: t('engineeringDesign'), software: t('softwareProject'), games: t('gameDevelopment') })[type] || t('project');
}

function expandedDescription(item, kind) {
  if (item.longDescription) return item.longDescription;
  if (kind === 'timeline') return item.desc || '';
  const technologyText = (item.technologies || []).join(', ');
  const followUp = technologyText ? t('technologySentence').replace('{technologies}', technologyText) : '';
  return `${item.description || ''}${followUp}`;
}

function timelineSkills(item) {
  if (Array.isArray(item.skills)) return item.skills;
  return (item.desc || '').split(',').map((skill) => skill.trim().replace(/\.$/, '')).filter(Boolean);
}

function makeCardInteractive(card, item, kind) {
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `${t('openDetailsFor')} ${item.name || item.title || item.org || ''}`);

  const open = () => openDetails(item, kind, card);
  card.addEventListener('click', (event) => {
    if (event.target.closest('a, button')) return;
    open();
  });
  card.addEventListener('keydown', (event) => {
    if (event.target.closest('a, button')) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    open();
  });
}

async function loadPortfolio() {
  const grid = document.getElementById('project-cards');
  if (!grid) return;

  let data;
  try {
    const language = window.portfolioI18n?.lang === 'fr' ? 'fr' : 'en';
    const response = await fetch(language === 'fr' ? 'json/data.fr.json' : 'json/data.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Portfolio data returned ${response.status}`);
    data = await response.json();
  } catch (error) {
    console.error(error);
    grid.append(createElement('p', 'load-error', t('loadError')));
    return;
  }

  renderTimeline(Array.isArray(data.timeline) ? data.timeline : []);

  (data.projects || []).forEach((project) => {
    const card = createElement('article', 'project-card');
    card.dataset.type = project.type || 'other';
    card.dataset.featured = String(Boolean(project.featured));

    const picture = document.createElement('picture');
    const image = document.createElement('img');
    image.src = project.image || '';
    image.alt = project.name ? `${project.name} — ${t('projectPreview')}` : t('projectPreview');
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = 800;
    image.height = 450;
    picture.append(image);

    const content = createElement('div', 'content');
    content.append(createElement('h3', '', project.name || 'Untitled project'));
    const technologies = createElement('ul', 'technology-list');
    technologies.setAttribute('aria-label', t('technologiesUsed'));
    (project.technologies || []).forEach((technology) => {
      technologies.append(createElement('li', 'skill-bubble', technology));
    });
    content.append(technologies);

    const actions = createElement('div', 'card-actions');
    const detailsCue = createElement('span', 'card-details-cue', t('openDetails'));
    detailsCue.setAttribute('aria-hidden', 'true');
    actions.append(detailsCue);

    content.append(actions);

    card.append(picture, content);
    makeCardInteractive(card, project, 'project');
    grid.append(card);
    reveal(card);
  });

  const buttons = Array.from(document.querySelectorAll('.filter-buttons button[data-type]'));
  const filter = (type) => {
    grid.querySelectorAll('.project-card').forEach((card) => {
      const visible = type === 'all' || (type === 'featured' ? card.dataset.featured === 'true' : card.dataset.type === type);
      card.classList.toggle('is-hidden', !visible);
      card.setAttribute('aria-hidden', String(!visible));
    });
    buttons.forEach((button) => {
      const active = button.dataset.type === type;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };
  buttons.forEach((button) => button.addEventListener('click', () => filter(button.dataset.type)));
  filter('featured');
}

function renderTimeline(items) {
  const container = document.getElementById('timeline-container');
  if (!container) return;
  [...items].sort((a, b) => new Date(b.start || '1900') - new Date(a.start || '1900')).forEach((item) => {
    const wrapper = createElement('article', `timeline-item ${item.type === 'education' ? 'left' : 'right'}`);
    const content = createElement('div', 'content');
    if (item.image) {
      const image = document.createElement('img');
      image.className = 'thumb';
      image.src = item.image;
      image.alt = `${item.org || item.title || 'Organization'} logo`;
      image.loading = 'lazy';
      content.append(image);
    }
    content.append(createElement('h3', '', item.title || ''));
    if (item.org) content.append(createElement('p', 'organization', item.org));
    content.append(createElement('span', 'date', formatDateRange(item.start, item.end)));
    content.append(createElement('p', '', item.desc || ''));
    const detailsCue = createElement('span', 'card-details-cue', t('openDetails'));
    detailsCue.setAttribute('aria-hidden', 'true');
    content.append(detailsCue);
    wrapper.append(content);
    makeCardInteractive(wrapper, item, 'timeline');
    container.append(wrapper);
    reveal(wrapper);
  });
}

function formatDateRange(start, end) {
  const format = (value) => {
    if (!value) return null;
    const [year, month = '01'] = value.split('-');
    const locale = window.portfolioI18n?.lang === 'fr' ? 'fr-CA' : 'en-CA';
    return new Date(Number(year), Number(month) - 1, 1).toLocaleString(locale, { month: 'short', year: 'numeric' });
  };
  const startText = format(start);
  const endText = format(end);
  return startText ? `${startText} – ${endText || t('present')}` : endText || '';
}

loadPortfolio();

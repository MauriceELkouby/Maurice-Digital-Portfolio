const navLinks = document.querySelector('#navbar .nav-links');
const menuButton = document.querySelector('.menu-toggle');
const backToTop = document.getElementById('back-to-top');

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

async function loadPortfolio() {
  const grid = document.getElementById('project-cards');
  if (!grid) return;

  let data;
  try {
    const response = await fetch('json/data.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Portfolio data returned ${response.status}`);
    data = await response.json();
  } catch (error) {
    console.error(error);
    grid.append(createElement('p', 'load-error', 'Projects could not be loaded. Please refresh the page.'));
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
    image.alt = project.name ? `${project.name} project preview` : 'Project preview';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = 800;
    image.height = 450;
    picture.append(image);

    const content = createElement('div', 'content');
    content.append(createElement('h3', '', project.name || 'Untitled project'));
    content.append(createElement('p', 'project-summary', project.description || ''));

    const technologies = createElement('ul', 'technology-list');
    technologies.setAttribute('aria-label', 'Technologies used');
    (project.technologies || []).forEach((technology) => {
      technologies.append(createElement('li', 'skill-bubble', technology));
    });
    content.append(technologies);

    if (project.link) {
      const link = createElement('a', '', project.linkLabel || 'View project');
      link.href = project.link;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.append(document.createTextNode(' ↗'));
      content.append(link);
    }

    card.append(picture, content);
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
    wrapper.append(content);
    container.append(wrapper);
    reveal(wrapper);
  });
}

function formatDateRange(start, end) {
  const format = (value) => {
    if (!value) return null;
    const [year, month = '01'] = value.split('-');
    return new Date(Number(year), Number(month) - 1, 1).toLocaleString(undefined, { month: 'short', year: 'numeric' });
  };
  const startText = format(start);
  const endText = format(end);
  return startText ? `${startText} – ${endText || 'Present'}` : endText || '';
}

loadPortfolio();

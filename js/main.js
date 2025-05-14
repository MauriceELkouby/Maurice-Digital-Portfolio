
// Smooth Scroll Navigation
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Scrollspy Active Link
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

// Mobile Nav Toggle
const navLinks = document.querySelector('#navbar .nav-links');
const burger = document.querySelector('.menu-toggle');
if (burger) {
    burger.addEventListener('click', () => {
        navLinks.classList.toggle('show');
    });
}

// Back to Top Button
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTop.style.display = 'block';
    } else {
        backToTop.style.display = 'none';
    }
});
backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Load Projects from data.json
fetch('json/data.json')
    .then(response => response.json())
    .then(data => {
        const projectsGrid = document.getElementById('project-cards');
        const projects = data.projects;

        projects.forEach(project => {
            const card = document.createElement('div');
            card.classList.add('project-card');
            card.setAttribute('data-type', project.type || 'professional'); // default to professional

            card.innerHTML = `
                <img src="${project.image || 'assets/default.png'}" alt="${project.name}">
                <h3>${project.name}</h3>
                <p>${project.description}</p>
                <a href="${project.link}" target="_blank">View Project</a>
            `;

            projectsGrid.appendChild(card);
        });

        setupFilterButtons();
    })
    .catch(err => console.error('Failed to load projects:', err));

// Filter Buttons Logic
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-buttons button');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.getAttribute('data-type');

            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            projectCards.forEach(card => {
                if (type === 'all' || card.getAttribute('data-type') === type) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}


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
            const skillsHTML = project.technologies.map(tech => {
                return `<button class="skill-bubble">${tech}</button>`;
            }).join('');
            card.innerHTML = `
                <img src="${project.image || 'assets/default.png'}" alt="${project.name}">
                <h3>${project.name}</h3>
                <p class="project-summary">${project.description}</p>
                <p>${skillsHTML}</p>
                <a href="${project.link}" target="_blank">View PDF report summary</a>
            `;
            projectsGrid.appendChild(card);
        });

        setupFilterButtons();
    })
    .catch(err => console.error('Failed to load projects:', err));

// Filter Buttons Logic
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-buttons button');
    const projectGrid = document.querySelector('.projects-grid');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.getAttribute('data-type');
            const cards = Array.from(document.querySelectorAll('.project-card'));
    
            // Step 1: Capture first positions
            const firstRects = new Map();
            cards.forEach(card => {
                firstRects.set(card, card.getBoundingClientRect());
            });
    
            // Step 2: Update visibility classes
            cards.forEach(card => {
                const cardType = card.getAttribute('data-type');
                if (type === 'all' || cardType === type) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
    
            // Step 3: Force reflow (sync layout)
            projectGrid.offsetHeight;
    
            // Step 4: Capture last positions & apply invert transform
            cards.forEach(card => {
                const firstRect = firstRects.get(card);
                const lastRect = card.getBoundingClientRect();
    
                const dx = firstRect.left - lastRect.left;
                const dy = firstRect.top - lastRect.top;
    
                if (dx !== 0 || dy !== 0) {
                    card.style.transform = `translate(${dx}px, ${dy}px)`;
                    card.style.transition = 'none';
                    
                    // Trigger next frame for smooth animation back
                    requestAnimationFrame(() => {
                        card.style.transition = 'transform 0.4s ease, opacity 0.3s ease';
                        card.style.transform = '';
                    });
                }
            });
        });
    });
     
}

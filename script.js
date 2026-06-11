import { firebaseConfig, hasFirebaseConfig } from './firebase-config.js';

const fallbackProjects = [
    {
        title: "Personalized News Digest - In Progress",
        description: "Utilized WebScraping, Machine Learning, NLPs, and LLMs for text summarization.",
        githubLink: "https://github.com/Amaan247788"
    },
    {
        title: "Industry based Project coming soon too",
        description: "They havent given me anything to do yet. Coming soon!",
        githubLink: "https://github.com/Amaan247788"
    },
    {
        title: "Carbon Emission Calculator Project",
        description: "Parsed over 700,000 lines of JSON data to calculate carbon emitted by planes on various flight paths",
        githubLink: "https://github.com/Amaan247788/carbon-emission-calculator"
    },
];

function setupSmoothScrolling() {
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            targetSection.scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

function createProjectCards(projects) {
    const projectsGrid = document.querySelector('.projects-grid');
    projectsGrid.innerHTML = '';

    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';

        const cardInner = document.createElement('div');
        cardInner.className = 'card-inner';

        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';

        const title = document.createElement('h3');
        title.textContent = project.title;
        cardFront.appendChild(title);

        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';

        const description = document.createElement('p');
        description.textContent = project.description;

        const githubLink = document.createElement('a');
        githubLink.href = project.githubLink || '#';
        githubLink.className = 'github-link';
        githubLink.target = '_blank';
        githubLink.rel = 'noreferrer';
        githubLink.innerHTML = '<i class="fab fa-github"></i> View on GitHub';

        cardBack.append(description, githubLink);
        cardInner.append(cardFront, cardBack);
        projectCard.appendChild(cardInner);
        projectsGrid.appendChild(projectCard);
    });
}

function setupProjectCardClicks() {
    const projectsGrid = document.querySelector('.projects-grid');

    projectsGrid.addEventListener('click', function(e) {
        if (e.target.closest('a')) {
            return;
        }

        const cardInner = e.target.closest('.card-inner');

        if (cardInner) {
            cardInner.classList.toggle('flipped');
        }
    });
}

async function loadProjectsFromFirebase() {
    if (!hasFirebaseConfig()) {
        createProjectCards(fallbackProjects);
        return;
    }

    try {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js');
        const { getDatabase, onValue, ref } = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js');

        const app = initializeApp(firebaseConfig);
        const database = getDatabase(app);
        const projectsRef = ref(database, 'projects');

        onValue(projectsRef, snapshot => {
            const data = snapshot.val() || {};
            const projects = Object.values(data).sort((a, b) => {
                return (a.order || 0) - (b.order || 0);
            });

            createProjectCards(projects.length ? projects : fallbackProjects);
        });
    } catch (error) {
        console.error('Could not load Firebase projects:', error);
        createProjectCards(fallbackProjects);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setupSmoothScrolling();
    setupProjectCardClicks();
    loadProjectsFromFirebase();
});

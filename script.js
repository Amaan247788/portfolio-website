// Smooth scrolling for navigation links
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

// Sample project data - Replace with your actual projects
const projects = [
    {
        title: "AI/ML Project",
        description: "Utilized WebScraping, Machine Learning, NLPs, and LLMs for text summarization.",
        /*
        I also utilized cloud storage to make the entire project work serverlessly. We implemented a web application that can enable you to earn points from purchases at various stores. These points can then be redeemded on our website to buy gift cards for a wide variety of stores
        */
        githubLink: "https://github.com/Amaan247788"
    },
    {
        title: "Project with Company in Noida",
        description: "They havent given me anything to do yet. Coming soon!",
        githubLink: "https://github.com/Amaan247788"
    },
    {
        title: "Carbon Emission Calculator Project",
        description: "Parsed over 700,000 lines of JSON data to calculate carbon emitted by planes on various flight paths",
        githubLink: "https://github.com/Amaan247788/carbon-emission-calculator"
    },
    /* {
        title: "Personalized News Digest"
        description: "Webscrapped apple news -> trained ML model to personalize to users -> integrated Alexa AI to give voice assistance -> used chatgpt model to provide TLDR's to digest -> made a chatbot to ask about particular parts of the digest
        Can use gradio to make a quick web app where users will input and output things",
        githubLink: "https://github.com/Amaan247788"
    } */
];

// Function to create project cards
function createProjectCards() {
    const projectsGrid = document.querySelector('.projects-grid');
    projectsGrid.innerHTML = ''; // Clear existing content

    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <h3>${project.title}</h3>
                </div>
                <div class="card-back">
                    <p>${project.description}</p>
                    <a href="${project.githubLink}" class="github-link" target="_blank">
                        <i class="fab fa-github"></i> View on GitHub
                    </a>
                </div>
            </div>
        `;
        projectsGrid.appendChild(projectCard);
    });
}

// Initialize project cards when the page loads
document.addEventListener('DOMContentLoaded', createProjectCards);

document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.card-front');
    
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Prevent click if it's on a link
            if (e.target.closest('a')) {
                return;
            }
            
            const cardInner = this.parentElement;
            cardInner.classList.toggle('flipped');
        });
    });
});
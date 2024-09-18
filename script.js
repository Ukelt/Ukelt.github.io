const toggleInput = document.querySelector('.theme-swap');
const projectSidebar = document.getElementById('project-sidebar');
const projectExpanded = document.getElementById('project-expanded');
const card = document.querySelector('.card');

// Toggle Theme
function toggleTheme(e) {
    const theme = e.target.value;
    if (theme === 'KC') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
}

toggleInput.addEventListener('change', toggleTheme, false);

// Close Project
function closeProj() {
    projectSidebar.style.width = '100%';
    card.style.width = '100%';

    projectExpanded.style.transform = 'translateX(100%)';
    document.querySelectorAll('.project').forEach(p => p.classList.remove('active'));
}

// Add event listener for closing projects
document.getElementById('projects-container').addEventListener('click', (event) => {
    if (event.target && event.target.classList.contains('close-p-expanded')) {
        closeProj();
    }
});

let counter = 1;

// Fetch projects and generate HTML
fetch('projects.xml')
    .then(response => response.text())
    .then(data => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, "application/xml");
        const projects = xml.getElementsByTagName('project');
        let projectPreviewsHtml = '';
        let projectExpandedHtml = '';

        for (let project of projects) {
            const title = project.getElementsByTagName('title')[0].textContent;
            const description = project.getElementsByTagName('description')[0].textContent;
            const imageUrl = project.getElementsByTagName('image_url')[0].textContent;
            const projectUrl = project.getElementsByTagName('project_url')[0].textContent;
            const videoUrl = project.getElementsByTagName('project_video')[0].textContent;

            // Create project preview elements
            projectPreviewsHtml += `
                <div>
                    <div class="project-preview" data-project="${counter}">
                        <img src="${imageUrl}" alt="${title}">
                    </div>
                    <h2 class="project-title">${title}</h2>
                </div>`;

            // Create project expanded elements
            projectExpandedHtml += `
                <div class="project" id="project-${counter}">
                    <button class="close-p-expanded">Close</button>
                    <h2>${title}</h2>
                    <p>${description}</p>
                    <img src="${imageUrl}" alt="${title}">
                    <a href="${projectUrl}" target="_blank">View Project</a>
                    <video width="320" height="240" controls>
                        <source src="${videoUrl}" type="video/mp4">
                    </video>
                </div>`;
            counter++;
        }

        // Insert generated HTML into the DOM
        document.getElementById('project-sidebar').innerHTML = projectPreviewsHtml;
        document.getElementById('projects-container').innerHTML = projectExpandedHtml;
    });

// Open selected project
projectSidebar.addEventListener('click', (event) => {
    const preview = event.target.closest('.project-preview');
    if (preview) {
        const projectId = preview.getAttribute('data-project');
        const project = document.getElementById(`project-${projectId}`);

        projectSidebar.style.width = '20%';
        card.style.width = '40%';

        projectExpanded.style.transform = 'translateX(0)';

        document.querySelectorAll('.project').forEach(p => p.classList.remove('active'));
        project.classList.add('active');
    }
});

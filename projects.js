let counter = 1;
const cprojectSidebar = document.getElementById('project-sidebar');
const ccard = document.getElementById('card');
const cshapesChildren = document.querySelectorAll('.shape');
const ccircle = document.getElementById('circle');
const ccircle3 = document.getElementById('circle3');
const cprojectExpanded = document.getElementById('project-expanded');
const ccloseProject = document.getElementById('close-p-expanded');
fetch('projects.xml')
    .then(response => response.text())
    .then(data => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, "application/xml");
        const projects = xml.getElementsByTagName('project');
        let html = '';
        for (let project of projects) {
            const title = project.getElementsByTagName('title')[0].textContent;
            const description = project.getElementsByTagName('description')[0].textContent;
            const imageUrl = project.getElementsByTagName('image_url')[0].textContent;
            const projectUrl = project.getElementsByTagName('project_url')[0].textContent;
            const videoUrl = project.getElementsByTagName('project_video')[0].textContent;
            html += `<div class="project" id="project-${counter}">
                        <button class="close-p-expanded">Close</button>
                        <h2>${title}</h2>
                        <p>${description}</p>
                        <img src="${imageUrl}" alt="${title}">
                        <a href="${projectUrl}">View Project</a>
                        <video width="320" height="240" controls>
                        <source src="${videoUrl}" type="video/mp4" alt="">
                    </div>`;
                    counter++;
        }

        document.getElementById('projects-container').innerHTML = html;

    });



const toggleInput = document.querySelector('.theme-swap');

function toggleTheme(e) {
    let theme = e.target.value;
    console.log(theme);
    if (theme == 'KC') {
        document.documentElement.removeAttribute('data-theme');
        KCToDark();
    } else {
        document.documentElement.setAttribute('data-theme', theme);
        KCToDark();
    }
}

toggleInput.addEventListener('change', toggleTheme, false);

const projectPreviews = document.querySelectorAll('.project-preview');
const projectSidebar = document.getElementById('project-sidebar');
const projectExpanded = document.getElementById('project-expanded');
const card = document.querySelector('.card');
const closeProject = document.querySelector('.close-p-expanded');
const shapesChildren = Array.from(document.querySelector('.shapes').children);
const circle = document.querySelector('.circle');
const circle3 = document.querySelector('.circle3');

projectPreviews.forEach(preview => {
    preview.addEventListener('click', () => {
        // Shrink the project-sidebar and card
        projectSidebar.style.width = '20%';
        card.style.width = '40%';
        if (document.documentElement.getAttribute('data-theme') == 'Dark' || document.documentElement.getAttribute('data-theme') == 'Light') {
        shapesChildren.forEach(shape => {
            const currentWidth = shape.clientWidth;
            const currentHeight = shape.clientHeight;
            shape.style.width = currentWidth * 0.3 + 'px';
            shape.style.height = currentHeight * 1.2 + 'px';
        });

        circle.style.transform = 'translate(20%, 80%)';
        circle3.style.transform = 'translate(-105%, -10%)';
    }else{
        
    }

        // Expand the project-expanded
        projectExpanded.style.transform = 'translateX(0)';

        // Show the selected project
        const projectId = preview.getAttribute('data-project');
        const project = document.getElementById(`project-${projectId}`);
        document.querySelectorAll('.project').forEach(p => p.classList.remove('active'));
        project.classList.add('active');
    });
});

closeProject.addEventListener('click', () => {
    projectSidebar.style.width = '100%';
    card.style.width = '100%';
    if (document.documentElement.getAttribute('data-theme') == 'Dark' || document.documentElement.getAttribute('data-theme') == 'Light') {


        shapesChildren.forEach(shape => {
            const currentWidth = shape.clientWidth;
            const currentHeight = shape.clientHeight;
            shape.style.width = currentWidth / 0.3 + 'px'; // Reverse the width change
            shape.style.height = currentHeight / 1.2 + 'px'; // Reset the height
        });

        circle.style.transform = 'translate(0, 25%)';
        circle3.style.transform = 'translate(-60%, 25%)';
    } else {

    }

    projectExpanded.style.transform = 'translateX(100%)';

    document.querySelectorAll('.project').forEach(p => p.classList.remove('active'));
});



function KCToDark() {

    if (document.documentElement.getAttribute('data-theme') == 'Dark' || document.documentElement.getAttribute('data-theme') == 'Light') {
        circle.style.borderRadius = '0';
        circle3.style.borderRadius = '0';
        circle.style.transition = 'border-radius 1s';
        circle3.style.transition = 'border-radius 1s';

        circle.style.width = '40%';
        circle.style.height = '25%';
        circle3.style.width = '50%';
        circle3.style.height = '25%';

        circle.style.transition = 'width 1s, height 1s, transform 1s';
        circle.style.transform = 'translateY(25%)';

        circle3.style.transition = 'width 1s, height 1s, transform 1s';
        circle3.style.transform = 'translate(-60%, 25%)';
    } else {
        circle.style.borderRadius = '50%';
        circle.style.transition = 'border-radius 1s';

        circle3.style.borderRadius = '50%';
        circle3.style.transition = 'border-radius 1s';

        // Revert transformations and dimensions
        circle.style.width = '35%';
        circle.style.height = '70%';
        circle3.style.width = '20%';
        circle3.style.height = '40%';

        circle.style.transform = 'translate(0, 0)';
        circle3.style.transform = 'translate(0, 0)';



        // Ensure the transitions are still smooth
        circle.style.transition = 'width 1s, height 1s, transform 1s, border-radius 1s';
        circle3.style.transition = 'width 1s, height 1s, transform 1s, border-radius 1s';
    }
}



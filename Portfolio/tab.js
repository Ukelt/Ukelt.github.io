// script.js
let tabs = ['Projects', 'Contact'];
document.addEventListener('DOMContentLoaded', () => {
    const tabContent = document.querySelector('.tab-content');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const tabName = document.querySelector('.tab-name');
    let index = 0;

    function updateTabContent() {
        tabContent.style.transform = `translateX(-${index * 100}%)`;
        tabName.textContent = tabs[index];
    }

    document.querySelector('.left-arrow').addEventListener('click', () => {
        index = (index > 0) ? index - 1 : tabPanels.length - 1;
        updateTabContent();
    });

    document.querySelector('.right-arrow').addEventListener('click', () => {
        index = (index < tabPanels.length - 1) ? index + 1 : 0;
        updateTabContent();
    });

    updateTabContent(); // Initialize tab content
});

document.addEventListener("DOMContentLoaded", function () {
    const toggleInput = document.querySelector('.theme-swap');
    const Usertheme = localStorage.getItem('theme');
        document.documentElement.setAttribute('data-theme', Usertheme);
    // Toggle Theme
    function toggleTheme(e) {
        const theme = e.target.value;
        if (theme === 'KC') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'KC');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }
    }

    toggleInput.addEventListener('change', toggleTheme, false);
});
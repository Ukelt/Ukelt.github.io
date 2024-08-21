document.querySelectorAll('.glass-option').forEach(option => {
    option.addEventListener('click', function() {
        const selectedOptionId = this.id;

        if (selectedOptionId === 'optionSelected') {
            // If the contact form is selected, bring it onscreen
            document.getElementById('contact-panel').classList.add('visible');

            // Hide the projects panel or any other content
            document.getElementById('projects-panel').classList.remove('visible');
        } else {
            // If a non-contact option is selected, hide the contact panel
            document.getElementById('contact-panel').classList.remove('visible');

            // Show the projects panel or whatever should be displayed
            document.getElementById('projects-panel').classList.add('visible');
        }
    });
});


document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector('form');
    const toggleInput = document.querySelector('.theme-swap');

    function toggleTheme(e) {
      const theme = e.target.value;
      if (theme === 'KC') {
          document.documentElement.removeAttribute('data-theme');
      } else {
          document.documentElement.setAttribute('data-theme', theme);
      }
  }

  toggleInput.addEventListener('change', toggleTheme, false);
    
    form.addEventListener('submit', function(event) {
        // Prevent the default form submission
        event.preventDefault();

        // Basic form validation
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        if (name === "" || email === "" || message === "") {
            alert("All fields are required.");
            return;
        }

        if (!validateEmail(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        // If validation passes, you could proceed to submit the form via AJAX, or just submit it normally
        alert("Form submitted successfully!");

        fetch('http://localhost:3000/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              name: name,
              message: message,
            }),
          })
            .then((response) => response.text())
            .then((data) => console.log(data))
            .catch((error) => console.error('Error:', error));
    });

    // Email validation function
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});

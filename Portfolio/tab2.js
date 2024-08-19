const options = ["Projects", "Contact"];
let currentIndex = 0;

const setOptions = () => {
    document.getElementById('optionBefore').innerText = options[(currentIndex + options.length - 1) % options.length];
    document.getElementById('optionSelected').innerText = options[currentIndex];
    document.getElementById('optionAfter').innerText = options[(currentIndex + 1) % options.length];
    document.getElementById('optionAfterAfter').innerText = options[(currentIndex + 2) % options.length];
};

const updateOptions = (direction) => {
    const optionsList = document.querySelectorAll('.glass-option');

    optionsList.forEach(option => {
        option.style.transition = 'transform 0.3s ease';
        option.style.transform = direction === 'up' ? 'translateY(-38px)' : 'translateY(38px)';
    });

    document.querySelector('.glass-content').addEventListener('transitionend', () => {
        // Reset transitions and transform
        optionsList.forEach(option => {
            option.style.transition = 'none';
            option.style.transform = 'translateY(0)';
        });

        if (direction === 'up') {
            document.querySelector('.glass-content').appendChild(optionsList[0]);
            currentIndex = (currentIndex + 1) % options.length;
        } else if (direction === 'down') {
            document.querySelector('.glass-content').prepend(optionsList[optionsList.length - 1]);
            currentIndex = (currentIndex + options.length - 1) % options.length;
        }

    }, { once: true });
};

// Event listeners for buttons
document.querySelector('.nextArrow').addEventListener('click', () => {
    updateOptions('up');
});

document.querySelector('.beforeArrow').addEventListener('click', () => {
    updateOptions('down');
});

// Initialize
setOptions();

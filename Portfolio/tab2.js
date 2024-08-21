const options = ["Projects", "Contact"];
let currentIndex = 0;
currentOption = options[currentIndex];  

const opBe = document.getElementById('optionBefore');
const opSe = document.getElementById('optionSelected');
const opAf = document.getElementById('optionAfter');
const opAfAf = document.getElementById('optionAfterAfter');

const elems = [opBe, opSe, opAf, opAfAf];

const setOptions = () => {
    opBe.innerText = options[(currentIndex + options.length - 1) % options.length];
    opSe.innerText = options[currentIndex];
    opAf.innerText = options[(currentIndex + 1) % options.length];
    opAfAf.innerText = options[(currentIndex + 2) % options.length];
    
    // Clear all classes
    elems.forEach(elem => elem.classList.remove('glass-option-selected'));
    
    // Add the class to the middle element
};

const updateOptions = (direction) => {
    const optionsList = Array.from(document.querySelectorAll('.glass-option'));

    elems.forEach(elem => elem.classList.remove('glass-option-selected'));

    optionsList.forEach(option => {
        option.style.transition = 'transform 0.3s ease';
        option.style.transform = direction === 'up' ? 'translateY(-38px)' : 'translateY(38px)';
    });

    document.querySelector('.glass-content').addEventListener('transitionend', () => {
        // Reset transitions and transform

        if (direction === 'up') {
            document.querySelector('.glass-content').appendChild(optionsList[0]);
            currentIndex = (currentIndex + 1) % options.length;

        } else if (direction === 'down') {
            document.querySelector('.glass-content').prepend(optionsList[optionsList.length - 1]);
            currentIndex = (currentIndex + options.length - 1) % options.length;

        }
        optionsList.forEach(option => {
            option.style.transition = 'none';
            option.style.transform = 'translateY(0)';
        });

        console.log('currentIndex: ', currentIndex + '\ncurrentElement: ', elems[currentIndex + options.length -1]);


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

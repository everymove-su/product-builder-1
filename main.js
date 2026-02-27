class LottoBall extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        const wrapper = document.createElement('div');
        wrapper.setAttribute('class', 'ball');

        const numberText = document.createElement('span');
        numberText.textContent = this.getAttribute('number');

        const style = document.createElement('style');
        style.textContent = `
            .ball {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 60px;
                height: 60px;
                background: var(--ball-background, linear-gradient(145deg, #f0f0f0, #cacaca));
                border-radius: 50%;
                box-shadow: var(--ball-shadow, 5px 5px 15px #121212, -5px -5px 15px #222222);
                font-size: 1.5rem;
                font-weight: bold;
                color: red; /* Temporarily set to red for debugging */
            }
        `;

        shadow.appendChild(style);
        shadow.appendChild(wrapper);
        wrapper.appendChild(numberText);
    }
}

customElements.define('lotto-ball', LottoBall);

// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generate-button');
    const lottoBallsContainer = document.getElementById('lotto-balls-container');
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement; // Get the html element

    // Function to set the theme
    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            themeToggle.textContent = 'Switch to Light Mode';
        } else {
            themeToggle.textContent = 'Switch to Dark Mode';
        }
    }

    // Toggle theme on button click
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            if (currentTheme === 'light') {
                setTheme('dark');
            } else {
                setTheme('light');
            }
        });
    }

    // Apply saved theme or default to dark
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme('dark'); // Default theme
    }


    function generateLottoNumbers() {
        const numbers = new Set();
        while (numbers.size < 6) {
            const randomNumber = Math.floor(Math.random() * 45) + 1;
            numbers.add(randomNumber);
        }
        return Array.from(numbers);
    }

    function displayNumbers() {
        console.log('displayNumbers function called.');
        if (!lottoBallsContainer) {
            console.error('lottoBallsContainer not found!');
            return;
        }
        lottoBallsContainer.innerHTML = '';
        const numbers = generateLottoNumbers();
        console.log('Generated numbers:', numbers);
        numbers.forEach(number => {
            const lottoBall = document.createElement('lotto-ball');
            lottoBall.setAttribute('number', number);
            lottoBallsContainer.appendChild(lottoBall);
            console.log('Appended lotto-ball with number:', number);
        });
    }

    if (generateButton) {
        generateButton.addEventListener('click', displayNumbers);
    }

    // Initial display
    displayNumbers();
});

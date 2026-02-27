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
                color: var(--text-color); /* Use CSS variable for text color */
            }
        `;

        shadow.appendChild(style);
        shadow.appendChild(wrapper);
        wrapper.appendChild(numberText);
    }
}

customElements.define('lotto-ball', LottoBall);

document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generate-button');
    const lottoBallsContainer = document.getElementById('lotto-balls-container');
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            themeToggle.textContent = 'Switch to Light Mode';
        } else {
            themeToggle.textContent = 'Switch to Dark Mode';
        }
    }

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

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme('dark');
    }

    function generateLottoNumbers() {
        const numbers = new Set();
        while (numbers.size < 6) {
            const randomNumber = Math.floor(Math.random() * 45) + 1;
            numbers.add(randomNumber);
        }
        return Array.from(numbers);
    }

    function displayNumbers(generate = true) {
        if (!lottoBallsContainer) return;
        lottoBallsContainer.innerHTML = '';
        const numbers = generate ? generateLottoNumbers() : Array(6).fill(''); // Create 6 empty placeholders

        numbers.forEach(number => {
            const lottoBall = document.createElement('lotto-ball');
            lottoBall.setAttribute('number', number);
            lottoBallsContainer.appendChild(lottoBall);
        });
    }

    if (generateButton) {
        generateButton.addEventListener('click', () => displayNumbers(true));
    }

    // Initial display: empty balls
    displayNumbers(false);
});

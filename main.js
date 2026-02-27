class LottoBall extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        const wrapper = document.createElement('div');
        wrapper.setAttribute('class', 'ball');

        const numberText = document.createElement('span');
        // numberText.textContent = this.getAttribute('number'); // Set in connectedCallback

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
                /* color is set dynamically via JS in connectedCallback */
            }
        `;

        shadow.appendChild(style);
        shadow.appendChild(wrapper);
        wrapper.appendChild(numberText);
        this._numberText = numberText; // Store reference to update later
    }

    connectedCallback() {
        // Set text content and color when connected to DOM
        this._numberText.textContent = this.getAttribute('number');
        const textColor = this.getAttribute('data-text-color');
        if (this._numberText && textColor) {
            this._numberText.style.color = textColor;
        }
    }

    static get observedAttributes() {
        return ['number', 'data-text-color'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'number' && this._numberText) {
            this._numberText.textContent = newValue;
        }
        if (name === 'data-text-color' && this._numberText) {
            this._numberText.style.color = newValue;
        }
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
        // Re-render balls to apply new theme color if they exist
        // This is important because attributeChangedCallback for data-text-color relies on it
        displayNumbers(false); // Re-display existing (empty) balls with new theme
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
        while (numbers.size < 5) { // Changed from 6 to 5
            const randomNumber = Math.floor(Math.random() * 45) + 1;
            numbers.add(randomNumber);
        }
        return Array.from(numbers);
    }

    function displayNumbers(generate = true) {
        if (!lottoBallsContainer) return;
        lottoBallsContainer.innerHTML = '';
        const numbers = generate ? generateLottoNumbers() : Array(5).fill(''); // Changed from 6 to 5 for placeholders

        const computedHtmlStyles = getComputedStyle(htmlElement);
        const currentTextColor = computedHtmlStyles.getPropertyValue('--text-color').trim();

        numbers.forEach(number => {
            const lottoBall = document.createElement('lotto-ball');
            lottoBall.setAttribute('number', number);
            lottoBall.setAttribute('data-text-color', currentTextColor);
            lottoBallsContainer.appendChild(lottoBall);
        });
    }

    if (generateButton) {
        generateButton.addEventListener('click', () => displayNumbers(true));
    }

    displayNumbers(false);
});

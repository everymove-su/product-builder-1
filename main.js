class LottoBall extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        const wrapper = document.createElement('div');
        wrapper.setAttribute('class', 'ball');

        const numberText = document.createElement('span');

        const style = document.createElement('style');
        style.textContent = `
            .ball {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 65px; /* Adjusted size for new design */
                height: 65px; /* Adjusted size for new design */
                background-color: var(--ball-background); /* Use CSS variable */
                border-radius: 50%;
                box-shadow: var(--ball-shadow); /* Use CSS variable */
                font-size: 1.8rem; /* Larger font size */
                font-weight: bold;
                color: var(--ball-text-color); /* Use specific ball text color variable */
                transition: background-color 0.5s ease, box-shadow 0.5s ease, color 0.5s ease;
                margin: 5px; /* Small margin around balls for visual separation */
            }
        `;

        shadow.appendChild(style);
        shadow.appendChild(wrapper);
        wrapper.appendChild(numberText);
        this._numberText = numberText; // Store reference to update later
    }

    connectedCallback() {
        this._numberText.textContent = this.getAttribute('number');
        // No longer need to manually set color if var(--ball-text-color) works
    }

    static get observedAttributes() {
        return ['number']; // No longer observing data-text-color
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'number' && this._numberText) {
            this._numberText.textContent = newValue;
        }
        // No longer handling data-text-color via attributeChangedCallback
    }
}

customElements.define('lotto-ball', LottoBall);

document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generate-button');
    const lottoBallsContainer = document.getElementById('lotto-balls-container');
    // const rowIndicatorsContainer = document.getElementById('row-indicators-container'); // Removed
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
        // No need to re-render balls here; CSS variables will handle it
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
        while (numbers.size < 6) { // Reverted to 6 numbers per set
            const randomNumber = Math.floor(Math.random() * 45) + 1;
            numbers.add(randomNumber);
        }
        return Array.from(numbers);
    }

    function displayNumbers(generate = true) {
        if (!lottoBallsContainer) return;
        lottoBallsContainer.innerHTML = '';
        // if (rowIndicatorsContainer) { // Removed
        //     rowIndicatorsContainer.innerHTML = ''; // Removed
        // }

        const numbers = generate ? generateLottoNumbers() : Array(6).fill(''); // Reverted to 6 placeholders

        // const computedHtmlStyles = getComputedStyle(htmlElement); // Removed
        // const currentTextColor = computedHtmlStyles.getPropertyValue('--text-color').trim(); // Removed

        // // Removed row indicator generation
        // if (rowIndicatorsContainer) {
        //     for (let i = 1; i <= 5; i++) {
        //         const indicator = document.createElement('div');
        //         indicator.classList.add('row-indicator');
        //         indicator.textContent = i;
        //         indicator.style.color = currentTextColor;
        //         rowIndicatorsContainer.appendChild(indicator);
        //     }
        // }

        numbers.forEach(number => {
            const lottoBall = document.createElement('lotto-ball');
            lottoBall.setAttribute('number', number);
            // lottoBall.setAttribute('data-text-color', currentTextColor); // Removed
            lottoBallsContainer.appendChild(lottoBall);
        });
    }

    if (generateButton) {
        generateButton.addEventListener('click', () => {
            displayNumbers(true);
            generateButton.disabled = false;
            generateButton.textContent = 'Generate Numbers';
        });
    }

    displayNumbers(false);
});

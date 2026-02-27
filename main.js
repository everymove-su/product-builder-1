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
                width: 60px; /* Adjusted size for new design */
                height: 60px; /* Adjusted size for new design */
                background-color: var(--ball-background); /* Use CSS variable */
                border-radius: 50%;
                box-shadow: var(--ball-shadow); /* Use CSS variable */
                font-size: 1.7rem; /* Adjusted font size */
                font-weight: bold;
                color: var(--ball-text-color); /* Use specific ball text color variable */
                transition: background-color 0.3s ease, box-shadow 0.3s ease, color 0.3s ease;
            }
        `;

        shadow.appendChild(style);
        shadow.appendChild(wrapper);
        wrapper.appendChild(numberText);
        this._numberText = numberText;
    }

    connectedCallback() {
        this._numberText.textContent = this.getAttribute('number');
    }

    static get observedAttributes() {
        return ['number'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'number' && this._numberText) {
            this._numberText.textContent = newValue;
        }
    }
}

customElements.define('lotto-ball', LottoBall);

document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generate-button');
    const numSetsInput = document.getElementById('num-sets');
    const includedNumbersInput = document.getElementById('included-numbers');
    const excludedNumbersInput = document.getElementById('excluded-numbers');
    const lottoResultsContainer = document.getElementById('lotto-results-container');
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

    function parseNumbersInput(inputString) {
        if (!inputString) return [];
        return inputString.split(',')
                          .map(s => parseInt(s.trim()))
                          .filter(n => !isNaN(n) && n >= 1 && n <= 45);
    }

    function generateLottoNumbers(included = [], excluded = []) {
        const lottoNumbers = new Set(included);
        const availableNumbers = Array.from({ length: 45 }, (_, i) => i + 1)
                                      .filter(n => !excluded.includes(n) && !included.includes(n));

        // Ensure included numbers are valid and don't conflict with excluded
        if (included.some(n => excluded.includes(n))) {
            console.error("Included numbers conflict with excluded numbers!");
            // Handle error, perhaps throw or return empty
            return [];
        }
        if (included.length > 6) {
            console.error("Too many included numbers!");
            return [];
        }

        while (lottoNumbers.size < 6 && availableNumbers.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableNumbers.length);
            const randomNumber = availableNumbers.splice(randomIndex, 1)[0];
            lottoNumbers.add(randomNumber);
        }

        // If after trying to fill, we still don't have 6 numbers (e.g., due to too many excluded)
        if (lottoNumbers.size < 6) {
             console.warn("Could not generate 6 unique numbers with given constraints. Resulting set size: " + lottoNumbers.size);
        }

        return Array.from(lottoNumbers).sort((a, b) => a - b);
    }

    function displayLottoSets() {
        if (!lottoResultsContainer) return;
        lottoResultsContainer.innerHTML = ''; // Clear previous results

        const numSets = parseInt(numSetsInput.value) || 1;
        const included = parseNumbersInput(includedNumbersInput.value);
        const excluded = parseNumbersInput(excludedNumbersInput.value);

        for (let i = 0; i < numSets; i++) {
            const lottoSetDiv = document.createElement('div');
            lottoSetDiv.classList.add('lotto-set');

            const numbers = generateLottoNumbers(included, excluded);

            numbers.forEach(number => {
                const lottoBall = document.createElement('lotto-ball');
                lottoBall.setAttribute('number', number);
                lottoSetDiv.appendChild(lottoBall);
            });
            lottoResultsContainer.appendChild(lottoSetDiv);
        }
    }

    if (generateButton) {
        generateButton.addEventListener('click', displayLottoSets);
    }

    // Initial display of one empty set
    numSetsInput.value = 1; // Default to 1 set
    displayLottoSets();
});

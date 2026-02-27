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
                width: 60px;
                height: 60px;
                background-color: var(--ball-background);
                border-radius: 50%;
                box-shadow: var(--ball-shadow);
                font-size: 1.7rem;
                font-weight: bold;
                color: var(--ball-text-color);
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
    const numSetsRange = document.getElementById('num-sets-range'); // Changed to range input
    const numSetsValue = document.getElementById('num-sets-value'); // Span to display value
    const includedNumbersInput = document.getElementById('included-numbers');
    const excludedNumbersInput = document.getElementById('excluded-numbers');
    const lottoResultsContainer = document.getElementById('lotto-results-container');
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Initialize range input value display
    if (numSetsRange && numSetsValue) {
        numSetsValue.textContent = numSetsRange.value;
        numSetsRange.addEventListener('input', () => {
            numSetsValue.textContent = numSetsRange.value;
        });
    }

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
        const allNumbers = Array.from({ length: 45 }, (_, i) => i + 1);

        // Filter out excluded numbers first
        const availableNumbers = allNumbers.filter(n => !excluded.includes(n));

        // Validate included numbers against excluded numbers
        if (included.some(n => excluded.includes(n))) {
            console.error("Included numbers conflict with excluded numbers!");
            return []; // Return empty or handle as appropriate
        }
        // Validate if included numbers are within 1-45 range
        if (included.some(n => n < 1 || n > 45)) {
            console.error("Included numbers out of range (1-45)!");
            return [];
        }
        // Validate if excluded numbers are within 1-45 range
        if (excluded.some(n => n < 1 || n > 45)) {
            console.error("Excluded numbers out of range (1-45)!");
            return [];
        }
        
        // Ensure that included numbers are actually available (not in excluded list)
        const validIncluded = included.filter(n => availableNumbers.includes(n));
        lottoNumbers.clear(); // Clear initial set if it had invalid included numbers
        validIncluded.forEach(n => lottoNumbers.add(n));


        if (validIncluded.length > 6) {
            console.error("Too many valid included numbers!");
            return Array.from(validIncluded).slice(0, 6).sort((a, b) => a - b); // Return first 6 valid included
        }
        
        // Now fill the rest with available numbers, avoiding already included
        const numbersToPickFrom = availableNumbers.filter(n => !lottoNumbers.has(n));

        while (lottoNumbers.size < 6 && numbersToPickFrom.length > 0) {
            const randomIndex = Math.floor(Math.random() * numbersToPickFrom.length);
            const randomNumber = numbersToPickFrom.splice(randomIndex, 1)[0];
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

        const numSets = parseInt(numSetsRange.value) || 1; // Get value from range input
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
    // Ensure initial display uses the default value of the range input
    numSetsRange.value = numSetsRange.value || 1; // Set default if not already
    numSetsValue.textContent = numSetsRange.value; // Update display
    displayLottoSets();
});

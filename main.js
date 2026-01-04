/**
 * Symbols information based on the provided CSV data
 */
const symbols = [
  { symbol: 'AUDJPY', digit: 3, contactSize: 100000, profitCurrency: 'JPY' },
  { symbol: 'AUDUSD', digit: 5, contactSize: 100000, profitCurrency: 'USD' },
  { symbol: 'AUS200', digit: 1, contactSize:      1, profitCurrency: 'AUD' },
  { symbol: 'BTCUSD', digit: 2, contactSize:      1, profitCurrency: 'USD' },
  { symbol: 'CADJPY', digit: 3, contactSize: 100000, profitCurrency: 'JPY' },
  { symbol: 'CHFJPY', digit: 3, contactSize: 100000, profitCurrency: 'JPY' },
  { symbol:  'CN500', digit: 1, contactSize:      1, profitCurrency: 'USD' },
  { symbol: 'ETHUSD', digit: 2, contactSize:      1, profitCurrency: 'USD' },
  { symbol:  'EU500', digit: 1, contactSize:      1, profitCurrency: 'EUR' },
  { symbol: 'EURAUD', digit: 5, contactSize: 100000, profitCurrency: 'AUD' },
  { symbol: 'EURCAD', digit: 5, contactSize: 100000, profitCurrency: 'CAD' },
  { symbol: 'EURCHF', digit: 5, contactSize: 100000, profitCurrency: 'CHF' },
  { symbol: 'EURGBP', digit: 5, contactSize: 100000, profitCurrency: 'GBP' },
  { symbol: 'EURJPY', digit: 3, contactSize: 100000, profitCurrency: 'JPY' },
  { symbol: 'EURNZD', digit: 5, contactSize: 100000, profitCurrency: 'NZD' },
  { symbol: 'EURUSD', digit: 5, contactSize: 100000, profitCurrency: 'USD' },
  { symbol:   'FR40', digit: 1, contactSize:      1, profitCurrency: 'EUR' },
  { symbol: 'GBPAUD', digit: 5, contactSize: 100000, profitCurrency: 'AUD' },
  { symbol: 'GBPCAD', digit: 5, contactSize: 100000, profitCurrency: 'CAD' },
  { symbol: 'GBPCHF', digit: 5, contactSize: 100000, profitCurrency: 'CHF' },
  { symbol: 'GBPJPY', digit: 3, contactSize: 100000, profitCurrency: 'JPY' },
  { symbol: 'GBPNZD', digit: 5, contactSize: 100000, profitCurrency: 'NZD' },
  { symbol: 'GBPUSD', digit: 5, contactSize: 100000, profitCurrency: 'USD' },
  { symbol:   'US30', digit: 1, contactSize:      1, profitCurrency: 'USD' },
  { symbol: 'USDCHF', digit: 5, contactSize: 100000, profitCurrency: 'CHF' },
  { symbol: 'USDJPY', digit: 3, contactSize: 100000, profitCurrency: 'JPY' },
  { symbol: 'XAUUSD', digit: 2, contactSize:    100, profitCurrency: 'USD' },
];

const symbolSelect = document.getElementById('symbol-select');
const lotInput = document.getElementById('lot-input');
const pointInput = document.getElementById('point-input');
const calcBtn = document.getElementById('calc-btn');
const resultArea = document.getElementById('result-area');
const profitJpyText = document.getElementById('profit-jpy');
const detailText = document.getElementById('calc-detail');

/**
 * Initialize symbol select options in alphabetical order
 */
function initSymbolSelect() {
  // Sort symbols alphabetically by their symbol name
  const sortedSymbols = [...symbols].sort((a, b) => a.symbol.localeCompare(b.symbol));
  
  // Clear existing options
  symbolSelect.innerHTML = '';
  
  // Create and append option elements
  sortedSymbols.forEach(config => {
    const option = document.createElement('option');
    option.value = config.symbol;
    option.textContent = config.symbol;
    // Default to USDJPY if present
    if (config.symbol === 'EURUSD') {
      option.selected = true;
    }
    symbolSelect.appendChild(option);
  });
}

/**
 * Calculate profit based on the specified formula:
 * 10^(-digit) * pointInput * contactSize * lotInput * (profitCurrency to JPY rate)
 */
async function calculateProfit() {
  const symbolKey = symbolSelect.value;
  const lots = parseFloat(lotInput.value) || 0;
  const points = parseFloat(pointInput.value) || 0;

  const config = symbols.find(s => s.symbol === symbolKey);
  if (!config) return;

  // 1. Calculate the price movement value: 10^(-digit)
  const pipValue = Math.pow(10, -config.digit);

  // 2. Get exchange rate for the profit currency to JPY
  let exchangeRate = 1.0;
  if (config.profitCurrency !== 'JPY') {
    const rate = await getExchangeRate(config.profitCurrency, 'JPY');
    if (rate) {
      exchangeRate = rate;
    } else {
      console.error(`Failed to fetch rate for ${config.profitCurrency}JPY`);
      profitJpyText.textContent = 'Error (Rate)';
      return;
    }
  }

  // 3. Final calculation based on the requested formula
  // profit = pipValue * points * contactSize * lots * exchangeRate
  const profitInJpy = pipValue * points * config.contactSize * lots * exchangeRate;

  // Display results
  profitJpyText.textContent = `¥${Math.round(profitInJpy).toLocaleString()}`;
  detailText.textContent = `換算レート (${config.profitCurrency}JPY): ${exchangeRate.toFixed(3)} | 1ポイント値: ${pipValue.toFixed(config.digit)}`;
  resultArea.classList.remove('hidden');
}

/**
 * Fetch exchange rate using Frankfurter API
 */
async function getExchangeRate(from = 'USD', to = 'JPY') {
  const fromCurr = from.toUpperCase();
  const toCurr = to.toUpperCase();

  if (fromCurr === toCurr) return 1.0;

  const url = `https://api.frankfurter.app/latest?from=${fromCurr}&to=${toCurr}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.rates && data.rates[toCurr]) {
      return data.rates[toCurr];
    } else {
      throw new Error(`Rate for ${toCurr} not found`);
    }
  } catch (error) {
    console.error(`Failed to fetch ${fromCurr}${toCurr} rate:`, error);
    return null;
  }
}

/**
 * Reset the profit text to "¥-" instead of hiding the result area
 */
function resetProfitDisplay() {
  profitJpyText.textContent = '¥-';
}

// Event Listeners for inputs to reset the profit display when clicked or changed
[symbolSelect, lotInput, pointInput].forEach(el => {
  el.addEventListener('focus', resetProfitDisplay);
  el.addEventListener('change', resetProfitDisplay);
});

// Event Listeners for the calculation button
calcBtn.addEventListener('click', async () => {
  calcBtn.disabled = true;
  const originalText = calcBtn.textContent;
  calcBtn.textContent = '計算中...';
  
  try {
    await calculateProfit();
  } catch (error) {
    console.error('Calculation error:', error);
  } finally {
    calcBtn.disabled = false;
    calcBtn.textContent = originalText;
  }
});

// Initialize the symbol list on load
initSymbolSelect();
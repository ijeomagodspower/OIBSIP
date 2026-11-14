const form = document.querySelector("#converter-form");
const temperatureInput = document.querySelector("#temperature");
const unitSelect = document.querySelector("#from-unit");
const message = document.querySelector("#form-message");
const resetButton = document.querySelector("#reset-button");
const resultStatus = document.querySelector("#result-status");

const outputElements = {
  celsius: document.querySelector("#result-celsius"),
  fahrenheit: document.querySelector("#result-fahrenheit"),
  kelvin: document.querySelector("#result-kelvin")
};

const ABSOLUTE_ZERO = {
  celsius: -273.15,
  fahrenheit: -459.67,
  kelvin: 0
};

function formatTemperature(value) {
  const safeValue = Math.abs(value) < 0.0000001 ? 0 : value;
  return safeValue.toFixed(2);
}

function toCelsius(value, unit) {
  if (unit === "fahrenheit") return (value - 32) * 5 / 9;
  if (unit === "kelvin") return value - 273.15;
  return value;
}

function fromCelsius(celsius) {
  return {
    celsius,
    fahrenheit: (celsius * 9 / 5) + 32,
    kelvin: celsius + 273.15
  };
}

function showMessage(text, type = "error") {
  message.textContent = text;
  message.classList.toggle("success", type === "success");
}

function renderResults(results) {
  Object.entries(results).forEach(([unit, value]) => {
    const symbol = unit === "celsius" ? "°C" : unit === "fahrenheit" ? "°F" : "K";
    outputElements[unit].innerHTML = `${formatTemperature(value)}<span>${symbol}</span>`;
  });
  resultStatus.innerHTML = '<i data-lucide="check-circle-2"></i> Converted';
  if (window.lucide) lucide.createIcons();
}

function convertTemperature(event) {
  event.preventDefault();
  const rawValue = temperatureInput.value.trim();
  const selectedUnit = unitSelect.value;

  if (rawValue === "") {
    showMessage("Please enter a temperature value.");
    temperatureInput.focus();
    return;
  }

  const value = Number(rawValue);
  if (!Number.isFinite(value)) {
    showMessage("Please enter a valid numeric temperature.");
    temperatureInput.focus();
    return;
  }

  if (value < ABSOLUTE_ZERO[selectedUnit]) {
    const scale = selectedUnit === "celsius" ? "−273.15°C" : selectedUnit === "fahrenheit" ? "−459.67°F" : "0 K";
    showMessage(`That value is below absolute zero. The lowest possible temperature is ${scale}.`);
    temperatureInput.focus();
    return;
  }

  const celsius = toCelsius(value, selectedUnit);
  const results = fromCelsius(celsius);
  renderResults(results);
  showMessage("Conversion completed successfully.", "success");
}

function resetConverter() {
  temperatureInput.value = "";
  unitSelect.value = "celsius";
  showMessage("");
  outputElements.celsius.innerHTML = "—<span>°C</span>";
  outputElements.fahrenheit.innerHTML = "—<span>°F</span>";
  outputElements.kelvin.innerHTML = "—<span>K</span>";
  resultStatus.textContent = "Waiting for input";
  temperatureInput.focus();
}

form.addEventListener("submit", convertTemperature);
resetButton.addEventListener("click", resetConverter);

temperatureInput.addEventListener("input", () => {
  if (message.textContent) showMessage("");
});

unitSelect.addEventListener("change", () => {
  if (message.textContent) showMessage("");
});

// Show the default example on first load.
renderResults(fromCelsius(25));

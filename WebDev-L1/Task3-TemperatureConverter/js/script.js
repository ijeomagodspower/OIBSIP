const unitInputs = [...document.querySelectorAll("[data-unit]")];
const message = document.querySelector("#form-message");
const actionFeedback = document.querySelector("#action-feedback");
const resetButton = document.querySelector("#reset-button");
const copyButton = document.querySelector("#copy-button");
const downloadButton = document.querySelector("#download-button");
const infoButton = document.querySelector("#info-button");
const infoNote = document.querySelector("#info-note");

const UNIT_LABELS = {
  celsius: "Celsius (°C)",
  kelvin: "Kelvin (K)",
  fahrenheit: "Fahrenheit (°F)",
  rankine: "Rankine (°R)"
};

const ABSOLUTE_ZERO_K = 0;

function toKelvin(value, unit) {
  switch (unit) {
    case "celsius": return value + 273.15;
    case "fahrenheit": return (value + 459.67) * 5 / 9;
    case "rankine": return value * 5 / 9;
    case "kelvin":
    default: return value;
  }
}

function fromKelvin(kelvin) {
  return {
    celsius: kelvin - 273.15,
    kelvin,
    fahrenheit: kelvin * 9 / 5 - 459.67,
    rankine: kelvin * 9 / 5
  };
}

function formatValue(value) {
  const cleanValue = Math.abs(value) < 1e-10 ? 0 : value;
  return cleanValue.toFixed(2);
}

function showError(text) {
  message.textContent = text;
  message.classList.add("is-error");
}

function clearMessage() {
  message.textContent = "";
  message.classList.remove("is-error");
}

function clearOtherFields(activeInput) {
  unitInputs.forEach((input) => {
    if (input !== activeInput) input.value = "";
  });
}

function updateConversions(activeInput) {
  const rawValue = activeInput.value.trim();
  const sourceUnit = activeInput.dataset.unit;

  clearMessage();
  actionFeedback.textContent = "";

  if (rawValue === "") {
    clearOtherFields(activeInput);
    return;
  }

  // Permit a partially typed minus sign or decimal point without showing a false error.
  if (rawValue === "-" || rawValue === "." || rawValue === "-.") {
    clearOtherFields(activeInput);
    return;
  }

  const value = Number(rawValue);
  if (!Number.isFinite(value)) {
    clearOtherFields(activeInput);
    showError("Please enter a valid number.");
    return;
  }

  const kelvin = toKelvin(value, sourceUnit);
  if (kelvin < ABSOLUTE_ZERO_K - 1e-10) {
    clearOtherFields(activeInput);
    showError("This value is below absolute zero. Please enter a physically possible temperature.");
    return;
  }

  const safeKelvin = Math.max(0, kelvin);
  const converted = fromKelvin(safeKelvin);

  unitInputs.forEach((input) => {
    const unit = input.dataset.unit;
    if (input !== activeInput) input.value = formatValue(converted[unit]);
  });
}

function getCurrentResults() {
  const active = unitInputs.find((input) => input.value.trim() !== "");
  if (!active) return null;
  const value = Number(active.value);
  if (!Number.isFinite(value)) return null;
  const kelvin = toKelvin(value, active.dataset.unit);
  if (kelvin < ABSOLUTE_ZERO_K - 1e-10) return null;
  return fromKelvin(Math.max(0, kelvin));
}

function buildResultsText(results) {
  return Object.entries(UNIT_LABELS)
    .map(([unit, label]) => `${label}: ${formatValue(results[unit])}`)
    .join("\n");
}

unitInputs.forEach((input) => {
  input.addEventListener("input", () => updateConversions(input));
});

resetButton.addEventListener("click", () => {
  unitInputs.forEach((input) => { input.value = ""; });
  clearMessage();
  actionFeedback.textContent = "";
  unitInputs[0].focus();
});

copyButton.addEventListener("click", async () => {
  const results = getCurrentResults();
  if (!results) {
    showError("Enter a valid temperature before copying results.");
    return;
  }
  const text = buildResultsText(results);
  try {
    await navigator.clipboard.writeText(text);
    actionFeedback.textContent = "Conversions copied.";
  } catch {
    actionFeedback.textContent = "Copy is unavailable in this browser. You can select the values manually.";
  }
});

downloadButton.addEventListener("click", () => {
  const results = getCurrentResults();
  if (!results) {
    showError("Enter a valid temperature before downloading results.");
    return;
  }
  const file = new Blob([buildResultsText(results)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = "tempo-temperature-conversion.txt";
  link.click();
  URL.revokeObjectURL(url);
  actionFeedback.textContent = "Your conversion file is ready.";
});

infoButton.addEventListener("click", () => {
  infoNote.hidden = !infoNote.hidden;
  infoButton.setAttribute("aria-expanded", String(!infoNote.hidden));
});

if (window.lucide) lucide.createIcons();

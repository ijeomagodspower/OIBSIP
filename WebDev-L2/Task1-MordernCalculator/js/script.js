const resultDisplay = document.querySelector("#result");
const expressionDisplay = document.querySelector("#expression");
const errorDisplay = document.querySelector("#display-error");
const keypad = document.querySelector(".keypad");
const lightThemeButton = document.querySelector("#light-theme");
const darkThemeButton = document.querySelector("#dark-theme");

let expression = "";
let justEvaluated = false;

const operators = ["+", "-", "*", "/"];
const precedence = { "+": 1, "-": 1, "*": 2, "/": 2 };

function formatDisplay(value) {
  if (!Number.isFinite(value)) return "Error";
  const rounded = Number.parseFloat(value.toPrecision(12));
  return String(rounded);
}

function showError(message) {
  errorDisplay.textContent = message;
}

function render() {
  expressionDisplay.textContent = expression
    .replaceAll("*", " × ")
    .replaceAll("/", " ÷ ")
    .replaceAll("+", " + ")
    .replaceAll("-", " − ")
    .trim();
  resultDisplay.textContent = expression || "0";
}

function tokenize(input) {
  const tokens = [];
  let number = "";
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if ((char >= "0" && char <= "9") || char === ".") {
      number += char;
      continue;
    }
    if (operators.includes(char)) {
      if (number !== "") {
        tokens.push(Number(number));
        number = "";
      }
      // A leading minus or a minus after another operator is a unary sign.
      if (char === "-" && (tokens.length === 0 || typeof tokens[tokens.length - 1] === "string")) {
        number = "-";
      } else {
        tokens.push(char);
      }
    } else {
      throw new Error("Invalid character");
    }
  }
  if (number !== "" && number !== "-") tokens.push(Number(number));
  return tokens;
}

function calculate(input) {
  const tokens = tokenize(input);
  if (!tokens.length || typeof tokens[tokens.length - 1] === "string") {
    throw new Error("Complete the expression");
  }

  const values = [];
  const ops = [];
  for (const token of tokens) {
    if (typeof token === "number") {
      if (!Number.isFinite(token)) throw new Error("Invalid number");
      values.push(token);
      continue;
    }
    while (ops.length && precedence[ops[ops.length - 1]] >= precedence[token]) {
      applyOperator(values, ops.pop());
    }
    ops.push(token);
  }
  while (ops.length) applyOperator(values, ops.pop());
  if (values.length !== 1 || !Number.isFinite(values[0])) throw new Error("Invalid expression");
  return values[0];
}

function applyOperator(values, operator) {
  if (values.length < 2) throw new Error("Invalid expression");
  const right = values.pop();
  const left = values.pop();
  let answer;
  switch (operator) {
    case "+": answer = left + right; break;
    case "-": answer = left - right; break;
    case "*": answer = left * right; break;
    case "/":
      if (right === 0) throw new Error("Cannot divide by zero");
      answer = left / right;
      break;
    default: throw new Error("Unknown operation");
  }
  if (!Number.isFinite(answer)) throw new Error("Result is too large");
  values.push(answer);
}

function appendNumber(number) {
  showError("");
  if (justEvaluated) {
    expression = "";
    justEvaluated = false;
  }
  const currentNumber = expression.split(/[+*/-]/).pop();
  if (number === "." && currentNumber.includes(".")) return;
  if (number === "." && (currentNumber === "" || currentNumber === "-")) {
    expression += "0";
  }
  expression += number;
  render();
}

function appendOperator(operator) {
  showError("");
  if (!expression) {
    if (operator === "-") {
      expression = "-";
      render();
    }
    return;
  }
  if (operators.includes(expression.at(-1))) {
    if (operator === "-" && expression.at(-1) !== "-") {
      expression += operator;
    } else {
      expression = expression.slice(0, -1) + operator;
    }
  } else {
    expression += operator;
  }
  justEvaluated = false;
  render();
}

function clearAll() {
  expression = "";
  justEvaluated = false;
  showError("");
  render();
}

function backspace() {
  showError("");
  expression = expression.slice(0, -1);
  justEvaluated = false;
  render();
}

function toggleSign() {
  if (!expression) {
    expression = "-";
    render();
    return;
  }
  const match = expression.match(/(-?\d*\.?\d+)$/);
  if (!match) return;
  const start = match.index;
  const current = match[0];
  expression = expression.slice(0, start) + (current.startsWith("-") ? current.slice(1) : "-" + current);
  render();
}

function applyPercent() {
  showError("");
  const match = expression.match(/(-?\d*\.?\d+)$/);
  if (!match) return;
  const start = match.index;
  const percentage = Number(match[0]) / 100;
  expression = expression.slice(0, start) + formatDisplay(percentage);
  render();
}

function equals() {
  if (!expression) return;
  try {
    const answer = calculate(expression);
    expressionDisplay.textContent = expression.replaceAll("*", " × ").replaceAll("/", " ÷ ");
    resultDisplay.textContent = formatDisplay(answer);
    expression = formatDisplay(answer);
    justEvaluated = true;
    showError("");
  } catch (error) {
    showError(error.message === "Cannot divide by zero" ? error.message : "Check your expression");
  }
}

function handleAction(action) {
  switch (action) {
    case "clear": clearAll(); break;
    case "backspace": backspace(); break;
    case "decimal": appendNumber("."); break;
    case "sign": toggleSign(); break;
    case "percent": applyPercent(); break;
    case "equals": equals(); break;
    default: break;
  }
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.number !== undefined) appendNumber(button.dataset.number);
  else if (button.dataset.operator) appendOperator(button.dataset.operator);
  else if (button.dataset.action) handleAction(button.dataset.action);
});

function setTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark", isDark);
  lightThemeButton.classList.toggle("active", !isDark);
  darkThemeButton.classList.toggle("active", isDark);
  lightThemeButton.setAttribute("aria-pressed", String(!isDark));
  darkThemeButton.setAttribute("aria-pressed", String(isDark));
}

lightThemeButton.addEventListener("click", () => setTheme("light"));
darkThemeButton.addEventListener("click", () => setTheme("dark"));

document.addEventListener("keydown", (event) => {
  if (/^[0-9]$/.test(event.key)) appendNumber(event.key);
  else if (event.key === ".") appendNumber(".");
  else if (operators.includes(event.key)) appendOperator(event.key);
  else if (event.key === "Enter" || event.key === "=") { event.preventDefault(); equals(); }
  else if (event.key === "Backspace") backspace();
  else if (event.key === "Escape") clearAll();
  else if (event.key === "%") applyPercent();
});

render();

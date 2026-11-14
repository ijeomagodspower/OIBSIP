# OIBSIP — Web Development Level 1, Task 3

Tempo is a responsive, live temperature converter.

## Features
- Instantly converts while the user types; no Convert button required
- Four editable scales: Celsius, Kelvin, Fahrenheit and Rankine
- Editing any field updates the other three fields
- Numeric input validation and user-friendly error messages
- Absolute-zero validation for every scale
- Clear, copy and download actions
- Responsive mobile-first interface

## Conversion approach
All values are converted through Kelvin as the common base:
- Celsius to Kelvin: K = °C + 273.15
- Fahrenheit to Kelvin: K = (°F + 459.67) × 5/9
- Rankine to Kelvin: K = °R × 5/9
- Kelvin to Rankine: °R = K × 9/5

## Tech stack
- HTML5
- CSS3
- Vanilla JavaScript
- Sora headings and DM Sans supporting text
- Lucide icons

## Run locally
Open index.html in a browser.

## Submission path
OIBSIP/WebDev-L1/Task3-TemperatureConverter/

// Smooth anchor navigation is handled by CSS. Keep this file for small enhancements.
const yearLinks = document.querySelectorAll('a[href^="#"]');

yearLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
});

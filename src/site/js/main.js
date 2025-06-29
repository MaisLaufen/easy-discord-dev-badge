const form = document.getElementById("botForm");
const responseMessage = document.getElementById("responseMessage");
const loadingSpinner = document.getElementById("loadingSpinner");
const languageSwitcher = document.getElementById("language-switcher");
let translations = {};

async function loadLocale(lang) {
  const res = await fetch(`locales/${lang}.json`);
  translations = await res.json();
  applyTranslations();
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[key]) {
      el.textContent = translations[key];
    }
  });

  // Подстановка шагов инструкции
  const list = document.getElementById("instruction-list");
  if (translations.steps) {
    list.innerHTML = "";
    const prefix = translations.step_prefix || "Step";
    translations.steps.forEach((step, index) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${prefix} ${index + 1}:</strong><br>${step}`;
      list.appendChild(li);
    });
  }
}

languageSwitcher.addEventListener("change", () => {
  loadLocale(languageSwitcher.value);
});

window.addEventListener("DOMContentLoaded", () => {
  loadLocale(languageSwitcher.value);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const token = document.getElementById("token").value;
  loadingSpinner.style.display = "block";

  try {
    const response = await fetch("http://127.0.0.1:5000/start-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    if (data.message.startsWith("Success")) {
      const urlMatch = data.message.match(/https?:\/\/[^\s]+/);
      const inviteLink = urlMatch
        ? `<a href="${urlMatch[0]}" target="_blank" class="invite-link">${urlMatch[0]}</a>`
        : "";
      const messageBeforeLink = data.message.replace(urlMatch ? urlMatch[0] : "", "");
      responseMessage.innerHTML = `<span class="success">${messageBeforeLink}</span> ${inviteLink}`;
    } else {
      responseMessage.textContent = data.message;
      responseMessage.className = "error";
    }
  } catch (error) {
    responseMessage.textContent =
      "An error occurred: probably you not start the local_server.exe or Discord is banned in your country. If so, you can use VPN.";
    responseMessage.className = "error";
  } finally {
    loadingSpinner.style.display = "none";
  }
});
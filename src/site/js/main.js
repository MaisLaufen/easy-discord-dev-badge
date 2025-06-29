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

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (translations[key]) {
      el.setAttribute("placeholder", translations[key]);
    }
  });

  const list = document.getElementById("instruction-list");
  if (translations.steps) {
    list.innerHTML = "";
    translations.steps.forEach((step, index) => {
      const li = document.createElement("li");

      const stepLabel = translations["step_label"] || "Step"; // ключ step_label для перевода слова "Step"

      li.innerHTML = `<strong>${stepLabel} ${index + 1}:</strong><br>${step}`;
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

// Local server
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const token = document.getElementById("token").value.trim();

  if (!token) {
    responseMessage.textContent =
      translations.errors?.["empty_token"] || "Please enter a bot token.";
    responseMessage.className = "error";
    return;
  }

  loadingSpinner.style.display = "block";
  responseMessage.textContent = "";

  try {
    const response = await fetch("http://127.0.0.1:5000/start-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (response.ok && data.message?.startsWith("Success")) {
      const urlMatch = data.message.match(/https?:\/\/[^\s]+/);
      const inviteLink = urlMatch
        ? `<a href="${urlMatch[0]}" target="_blank" class="invite-link">${urlMatch[0]}</a>`
        : "";

      const messageBeforeLink = data.message.replace(urlMatch ? urlMatch[0] : "", "");
      responseMessage.innerHTML = `<span class="success">${messageBeforeLink}</span> ${inviteLink}`;
    } else {
      const errorCode = data.error_code || "unknown";
      const errorMessage =
        translations.errors?.[errorCode] || "Unknown error.";
      responseMessage.textContent = errorMessage;
      responseMessage.className = "error";
    }
  } catch (error) {
    responseMessage.textContent =
      translations.errors?.["network"] ||
      "Network error. Is the server running?";
    responseMessage.className = "error";
  } finally {
    loadingSpinner.style.display = "none";
  }
});
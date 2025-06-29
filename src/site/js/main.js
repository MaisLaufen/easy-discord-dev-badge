const form = document.getElementById("botForm");
const responseMessage = document.getElementById("responseMessage");
const loadingSpinner = document.getElementById("loadingSpinner");
let translations = {};

// Загружаем перевод из JSON
async function loadLocale(lang) {
  const res = await fetch(`locales/${lang}.json`);
  translations = await res.json();
  applyTranslations();
  // Сохраняем в localStorage
  localStorage.setItem("language", lang);
}

// Применяем переводы на страницу
function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[key]) {
      if (el.tagName === "BUTTON" && el.querySelector(".button-text")) {
        el.querySelector(".button-text").textContent = translations[key];
      } else {
        el.textContent = translations[key];
      }
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

      const stepLabel = translations["step_label"] || "Step";
      li.innerHTML = `<strong>${stepLabel} ${index + 1}:</strong><br>${step}`;
      list.appendChild(li);
    });
  }
}

// Инициализация кастомного селектора языка
function initLanguageSelector() {
  const languageSelector = document.getElementById("language-selector");
  const selected = languageSelector.querySelector(".selected");
  const options = languageSelector.querySelectorAll(".options div");

  selected.addEventListener("click", () => {
    languageSelector.classList.toggle("open");
  });

  options.forEach(option => {
    option.addEventListener("click", () => {
      const lang = option.dataset.lang;

      // Визуальное обновление выбранного элемента
      selected.innerHTML = option.innerHTML;
      languageSelector.classList.remove("open");

      // Загрузка локализации
      loadLocale(lang);
    });
  });

  // Закрытие селектора при клике вне
  document.addEventListener("click", e => {
    if (!languageSelector.contains(e.target)) {
      languageSelector.classList.remove("open");
    }
  });

  // Устанавливаем язык из localStorage (если был ранее выбран)
  const savedLang = localStorage.getItem("language") || "en";
  const selectedOption = [...options].find(o => o.dataset.lang === savedLang);
  if (selectedOption) {
    selected.innerHTML = selectedOption.innerHTML;
    loadLocale(savedLang);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  initLanguageSelector();
});

// Local server
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  
  const button = form.querySelector("button");
  const buttonText = button.querySelector(".button-text");
  const buttonSpinner = button.querySelector(".button-spinner");
  button.disabled = true;

  const token = document.getElementById("token").value.trim();
  
  buttonText.style.display = "none";
  buttonSpinner.style.display = "inline-block";

  if (!token) {
    responseMessage.textContent =
      translations.errors?.["empty_token"] || "Please enter a bot token.";
    responseMessage.className = "error";
    return;
  }

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
    buttonText.style.display = "inline";
    buttonSpinner.style.display = "none";
    button.disabled = false;
  }
});
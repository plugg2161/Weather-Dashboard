export const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
export const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
export let currentUnit = localStorage.getItem("weather_unit") || "C";
export const DEFAULT_CITIES = ["Москва", "Санкт-Петербург", "Лондон"];

export function getSavedCities() {
  return JSON.parse(localStorage.getItem("weather_saved")) || DEFAULT_CITIES;
}

export function saveCities(citiesArray) {
  localStorage.setItem("weather_saved", JSON.stringify(citiesArray));
}

export function getWeatherDescription(code) {
  const codes = {
    0: "Ясно",
    1: "Преимущественно ясно",
    2: "Переменная облачность",
    3: "Пасмурно",
    45: "Туман",
    48: "Иней",
    51: "Лёгкая морось",
    53: "Морось",
    55: "Сильная морось",
    61: "Небольшой дождь",
    63: "Дождь",
    65: "Сильный дождь",
    71: "Небольшой снег",
    73: "Снег",
    75: "Сильный снегопад",
    80: "Небольшой ливень",
    81: "Ливень",
    82: "Сильный ливень",
    95: "Гроза",
    96: "Гроза с градом",
    99: "Сильная гроза с градом",
  };
  return codes[code] || "Неизвестно";
}

export function setupUnitToggle(onUnitChange) {
  const unitBtn = document.querySelector(".toggle-unit-btn");
  if (!unitBtn) return;

  unitBtn.textContent = currentUnit === "C" ? "Показать в °F" : "Показать в °C";
  unitBtn.addEventListener("click", () => {
    currentUnit = currentUnit === "C" ? "F" : "C";
    localStorage.setItem("weather_unit", currentUnit);
    unitBtn.textContent =
      currentUnit === "C" ? "Показать в °F" : "Показать в °C";
    if (typeof onUnitChange === "function") {
      onUnitChange(currentUnit);
    }
  });
}

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';
const AQ_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const params = new URLSearchParams(window.location.search);
const cityName = params.get('city') || 'Москва';
let coordsCache = null;
let weatherDataCache = null;
const cityEl = document.querySelector('.weather__city');
const tempEl = document.querySelector('.weather__temper');
const wthrEl = document.querySelector('.weather__wthr');
const forecastGrid = document.querySelector('.six-days-grid');
const aqGrid = document.querySelector('.card-grid');
const unitBtn = document.querySelector('.toggle-unit-btn');
const buttons = document.querySelectorAll('.button-group button');
const backBtn = buttons[0];
const favBtn = buttons[1];

function getWeatherDescription(code) {
  const codes = {
    0: 'Ясно', 1: 'Преимущественно ясно', 2: 'Переменная облачность', 3: 'Пасмурно',
    45: 'Туман', 48: 'Иней', 51: 'Лёгкая морось', 53: 'Морось', 55: 'Сильная морось',
    61: 'Небольшой дождь', 63: 'Дождь', 65: 'Сильный дождь',
    71: 'Небольшой снег', 73: 'Снег', 75: 'Сильный снегопад',
    80: 'Небольшой ливень', 81: 'Ливень', 82: 'Сильный ливень',
    95: 'Гроза', 96: 'Гроза с градом', 99: 'Сильная гроза с градом'
  };
  return codes[code] || 'Неизвестно';
}
backBtn.addEventListener('click', () => {
  if (document.referrer && document.referrer.includes('index.html')) {
    history.back();
  } else {
    window.location.href = 'index.html';
  }
});
favBtn.addEventListener('click', () => {
  const saved = JSON.parse(localStorage.getItem('data')) || [];
  if (!saved.some(c => c.toLowerCase() === cityName.toLowerCase())) {
    saved.unshift(cityName);
    localStorage.setItem('data', JSON.stringify(saved));
    favBtn.textContent = 'В избранном ✓';
    favBtn.disabled = true;
    favBtn.style.opacity = '0.6';
    favBtn.style.cursor = 'default';
  } else {
    favBtn.textContent = 'Уже в избранном ✓';
    favBtn.disabled = true;
    favBtn.style.opacity = '0.6';
  }
});
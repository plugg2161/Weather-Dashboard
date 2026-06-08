const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';
const params = new URLSearchParams(window.location.search);
const cityName = params.get('city') || 'Москва';
let coordsCache = null;
let weatherDataCache = null;
const cityEl = document.querySelector('.weather__city');
const tempEl = document.querySelector('.weather__temper');
const wthrEl = document.querySelector('.weather__wthr');
const forecastGrid = document.querySelector('.six-days-grid');
const detailsGrid = document.querySelector('.card-grid');
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
function getWeatherEmoji(code) {
  if (code === 0) return '☀️';
  if (code >= 1 && code <= 3) return '⛅';
  if (code >= 45 && code <= 48) return '🌫';
  if (code >= 51 && code <= 67) return '🌧';
  if (code >= 71 && code <= 77) return '🌨';
  if (code >= 80 && code <= 82) return '🌦';
  if (code >= 95) return '⛈';
  return '🌤';
}

function formatTemp(celsius) {
  if (celsius === null || celsius === undefined) return '—';
  return `${Math.round(celsius)}°C`;
}

backBtn.addEventListener('click', () => {
  if (document.referrer && document.referrer.includes('index.html')) {
    history.back();
  } else {
    window.location.href = 'index.html';
  }
});

favBtn.addEventListener("click", () => {
  let saved = JSON.parse(localStorage.getItem("weather_saved")) || [
    "Москва",
    "Санкт-Петербург",
    "Лондон",
  ];
  saved = saved.filter((c) => c.toLowerCase() !== cityName.toLowerCase());
  localStorage.setItem("weather_saved", JSON.stringify(saved));
  favBtn.textContent = "Удалено";
  favBtn.disabled = true;
  favBtn.style.opacity = "0.6";
});

async function loadAllData(){
  try {
    const geoRes = await fetch(`${GEO_URL}?name=${encodeURIComponent(cityName)}&count=1&language=ru&format=json`);
    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) throw new Error('Город не найден');

    const { latitude, longitude, name } = geoData.results[0];
    coordsCache = { latitude, longitude };
    cityEl.textContent = name;
    document.title = `${name} / Панель погоды`;

    const weatherRes = await fetch(
      `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,precipitation_probability,apparent_temperature,surface_pressure` +
      `&hourly=temperature_2m,weather_code,precipitation_probability` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
      `&timezone=auto&forecast_days=6`
    );
    if (!weatherRes.ok) throw new Error('Ошибка загрузки погоды');

    weatherDataCache = await weatherRes.json();

    renderTemperatures(weatherDataCache.current);
    renderDetails(weatherDataCache.current);
    renderForecast(weatherDataCache.daily);
    renderHourlyForecast(weatherDataCache.hourly);

    const saved = JSON.parse(localStorage.getItem("weather_saved")) || [
      "Москва",
      "Санкт-Петербург",
      "Лондон",
    ];

    if (saved.some((c) => c.toLowerCase() === cityName.toLowerCase())) {
      favBtn.textContent = "Удалить из избранного";
      favBtn.disabled = false;
      favBtn.style.opacity = "1";
    } else {
      favBtn.textContent = "Не в избранном";
      favBtn.disabled = true;
      favBtn.style.opacity = "0.6";
    }
  } catch (err) {
    cityEl.textContent = "Ошибка";
    wthrEl.textContent = err.message;
    console.error(err);
    document.querySelector('.hourly-section')?.remove();
    if (detailsGrid) {
      detailsGrid.innerHTML = '<li class="card"><span class="card__context">Не удалось загрузить данные</span></li>';
    }
  }
}

function renderTemperatures(current){
  tempEl.textContent = formatTemp(current.temperature_2m);
  tempEl.value = current.temperature_2m;
  wthrEl.textContent = getWeatherDescription(current.weather_code);
}

function renderDetails(current){
  const cards = detailsGrid.querySelectorAll('.card');
  const metrics = [
    { label: '💧 Влажность', val: `${current.relative_humidity_2m ?? '—'}%` },
    { label: '💨 Скорость ветра', val: `${current.wind_speed_10m ?? '—'} км/ч` },
    { label: '🌧 Вероятность осадков', val: `${current.precipitation_probability ?? 0}%` },
    { label: '🌡 Ощущается как', val: formatTemp(current.apparent_temperature) },
    { label: '📉 Давление', val: `${Math.round(current.surface_pressure ?? 0)} гПа` }
  ];

  cards.forEach((card, i) =>{
    const label = card.querySelector('.card__label');
    const context = card.querySelector('.card__context');
    if (metrics[i]) {
      label.textContent = metrics[i].label;
      context.textContent = metrics[i].val;
    } else {
      card.style.display = 'none';
    }
  });
}

function renderForecast(daily){
  forecastGrid.innerHTML = '';
  const daysCount = Math.min(6, daily.time.length);

  for (let i = 0; i < daysCount; i++) {
    const date = new Date(daily.time[i]);
    const maxTemp = daily.temperature_2m_max[i];
    const minTemp = daily.temperature_2m_min[i];
    const code = daily.weather_code[i];

    const li = document.createElement('li');
    li.className = 'six-days';
    li.innerHTML = `
      <time datetime="${daily.time[i]}" class="six-days__date">
        ${date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })}
      </time>
      <span>${formatTemp(minTemp)} / ${formatTemp(maxTemp)} · ${getWeatherDescription(code)}</span>
    `;
    forecastGrid.appendChild(li);
  }
}

function renderHourlyForecast(hourly){
  document.querySelector('.hourly-section')?.remove();

  const now = new Date();
  const currentHourStr = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + 'T' +
    String(now.getHours()).padStart(2, '0');

  let startIndex = hourly.time.findIndex(t => t.startsWith(currentHourStr));
  if (startIndex === -1) startIndex = 0;

  const nextHoursCount = Math.min(12, hourly.time.length - startIndex);

  let hourlyHTML = `
    <div class="hourly-section">
      <h3 class="card__label">Погода в течение суток</h3>
      <div class="hourly-scroll">
  `;

  for (let i = 0; i < nextHoursCount; i++){
    const idx = startIndex + i;
    const date = new Date(hourly.time[idx]);
    const hour = date.getHours().toString().padStart(2, '0') + ':00';
    const temp = formatTemp(hourly.temperature_2m[idx]);
    const precip = hourly.precipitation_probability[idx] || 0;
    const code = hourly.weather_code[idx];

    hourlyHTML += `
      <div class="hourly-item">
        <span class="hourly-time">${hour}</span>
        <span class="hourly-icon">${getWeatherEmoji(code)}</span>
        <span class="hourly-temper">${temp}</span>
        ${precip > 0 ? `<span class="hourly-precip">💧${precip}%</span>` : ""}
      </div>
    `;
  }
  hourlyHTML += `</div></div>`;

  const container = document.querySelector(".container");
  const detailsGridEl = document.querySelector(".card");

  const wrapper = document.createElement('div');
  wrapper.innerHTML = hourlyHTML;
  container.insertBefore(wrapper.firstElementChild, detailsGridEl);
}

loadAllData();
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const REVERSE_GEO_URL = "https://nominatim.openstreetmap.org/reverse";
const form = document.querySelector(".form");
const input = document.querySelector("#city-input");
const grid = document.querySelector(".weather-card-grid");
let savedCities = JSON.parse(localStorage.getItem("weather_saved")) || [
  "Москва",
  "Санкт-Петербург",
  "Лондон",
];
const unitBtn = document.querySelector(".toggle-unit-btn");
let currentUnit = localStorage.getItem("weather_unit") || "C";

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

async function getCityWeather(cityName) {
  const geoRes = await fetch(`${GEO_URL}?name=${encodeURIComponent(cityName)}&count=1&language=ru&format=json`);
  const geoData = await geoRes.json();
  
  if (!geoData.results || geoData.results.length === 0) {
    throw new Error(`Город "${cityName}" не найден`);
  }
  
  const { latitude, longitude, name } = geoData.results[0];

  const weatherRes = await fetch(
    `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,weather_code` +
    `&timezone=auto`
  );
  const weatherData = await weatherRes.json();

  return { name: name, temp: weatherData.current.temperature_2m, code: weatherData.current.weather_code };
}

function renderCard(data) {
  const link = document.createElement("a");
  let displayTemp = Math.round(data.temp);
  if (currentUnit === "F") {
    displayTemp = Math.round(data.temp * 1.8 + 32);
  }
  link.href = `weather.html?city=${encodeURIComponent(data.name)}`;
  link.className = 'weather-card__link';
  link.innerHTML = `
    <article class="weather-card">
      <h2 class="weather-card__title">${data.name}</h2>
      <p class="weather-card__temper">${displayTemp}°${currentUnit}</p>
      <p class="no-select">${getWeatherDescription(data.code)}</p>
    </article>
  `;
  grid.prepend(link);
}

async function CurrentLocation() {
  if (!navigator.geolocation) {
    console.log('Геолокация не поддерживается браузером');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch(`${REVERSE_GEO_URL}?format=json&lat=${latitude}&lon=${longitude}&accept-language=ru`);
        const data = await res.json();
        
        const address = data.address || {};
        const cityName = address.city || address.town || address.village || address.state || 'Моё местоположение';

        if (!savedCities.some(c => c.toLowerCase() === cityName.toLowerCase())) {
          savedCities.unshift(cityName);
          localStorage.setItem('weather_saved', JSON.stringify(savedCities));
          
          const weatherData = await getCityWeather(cityName);
          renderCard(weatherData);
          console.log(`Добавлен город по геолокации: ${cityName}`);
        }
      } catch (err) {
        console.warn('Не удалось определить город по координатам:', err);
      }
    },
    (error) => {

      console.log('Доступ к геолокации запрещен или недоступен:', error.message);
    },
    { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 } 
  );
}

async function initGrid(){
  grid.innerHTML = ''; 
  
  await CurrentLocation();
  
  for (const city of savedCities){
    try {
      const data = await getCityWeather(city);
      renderCard(data);
    } catch (err) {
      console.warn(`Пропуск города ${city}:`, err.message);
    }
    await new Promise(r => setTimeout(r, 100)); 
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = input.value.trim();
  
  if (!city || savedCities.some(c => c.toLowerCase() === city.toLowerCase())){
    alert('Этот город уже в списке!');
    return;
  }

  try{
    const data = await getCityWeather(city);
    savedCities.unshift(data.name);
    localStorage.setItem('weather_saved', JSON.stringify(savedCities));
    renderCard(data);
    input.value = '';
  } catch (err){
    alert(err.message);
  }
});

if (currentUnit === "F") {
  unitBtn.textContent = "Показать в °C";
} else {
  unitBtn.textContent = "Показать в °F";
}
unitBtn.addEventListener("click", () => {
  currentUnit = currentUnit === "C" ? "F" : "C";
  localStorage.setItem("weather_unit", currentUnit);
  unitBtn.textContent = currentUnit === "C" ? "Показать в °F" : "Показать в °C";
  initGrid();
});

initGrid();

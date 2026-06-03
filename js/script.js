const API_KEY = 'b78de4b0571d03c82880ec1564d52376';
const BASE = 'https://api.openweathermap.org/data/2.5';

const form = document.querySelector('.form');
const input = document.querySelector('#city-input');
const grid = document.querySelector('.weather-card-grid');
let savedCities = JSON.parse(localStorage.getItem('weather_saved')) || ['Moscow', 'London', 'Tokyo'];
async function fetchCity(city){
  const res = await fetch(`${BASE}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=ru`);
  if (!res.ok) throw new Error('Город не найден');
  return res.json();
}

function renderCard(data) {
  const link = document.createElement('a');
  link.href = `weather.html?city=${encodeURIComponent(data.name)}`;
  link.className = 'weather-card__link';
  link.innerHTML = `
    <article class="weather-card">
      <h2 class="weather-card__title">${data.name}</h2>
      <p class="weather-card__temper">${Math.round(data.main.temp)}℃</p>
      <p class="no-select">${data.weather[0].description}</p>
    </article>
  `;
  grid.prepend(link);
}
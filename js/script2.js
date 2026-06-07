const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';
const AQ_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const params = new URLSearchParams(window.location.search);
const cityName = params.get('city');
const cityEl = document.querySelector('.weather__city');
const tempEl = document.querySelector('.weather__temper');
const wthrEl = document.querySelector('.weather__wthr');
const forecastGrid = document.querySelector('.six-days-grid');
const aqGrid = document.querySelector('.card-grid');
const unitBtn = document.querySelector('.toggle-unit-btn');
const buttons = document.querySelectorAll('.button-group button');

function getWeatherDescription(code) {
  const codes = {
    0: 'Ясно', 1: 'Преимущественно ясно', 2: 'Переменная облачность', 3: 'Пасмурно',
    45: 'Туман', 48: 'Иней', 51: 'Лёгкая морось', 61: 'Небольшой дождь', 63: 'Дождь',
    71: 'Небольшой снег', 73: 'Снег', 80: 'Небольшой ливень', 95: 'Гроза'
  };
  return codes[code] || 'Неизвестно';
}
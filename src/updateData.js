import { getTimeZone, getTime, getWeather } from './getData';
import { getForengeitScale } from './changeTempScale';

export const currentWeatherTemp = document.querySelector('.weather--temp');
export const feelsLikeTemp = document.querySelector('.feels--temp');
export const forecastTempText = document.querySelectorAll('.future--weather--temp');
const latitude = document.querySelector('.latitude');
const longitude = document.querySelector('.longitude');
const locationText = document.querySelector('.location--text');
const forecastWeatherImg = document.querySelectorAll('.future--weather--img img');
const forecastDayText = document.querySelectorAll('.future--weather--day--name');
const feelsLikeText = document.querySelector('.feels--text');
const windText = document.querySelector('.wind');
const humidityText = document.querySelector('.humidity');
const currentWeatherImg = document.querySelector('.weather--temp--img img');
const descriptionWeatherText = document.querySelector('.description');
const searchPlace = document.querySelector('.input--block');
const searchBtn = document.querySelector('.search--btn');
const milisecond = 1000;
let interval;

export const updateTime = async (placeData, language) => {
  clearInterval(interval);
  const { coordinates } = placeData;
  const timeZone = await getTimeZone(...coordinates);
  interval = setInterval(getTime.bind(null, timeZone, language), milisecond);
};

export const updateAppData = async (placeData, language) => {
  const latitudeText = language === 'ru' ? 'Широта' : 'latitude';
  const longitudeText = language === 'ru' ? 'Долгота' : 'longitude';
  const searchText = language === 'ru' ? 'Поиск' : 'Search';
  locationText.innerHTML = `${placeData.city ? placeData.city : ''} ${
    placeData.country
  }`;
  const [latitudeValue, longitudeValue] = placeData.coordinates;
  latitude.innerHTML = `${latitudeText}: ${String(
    latitudeValue.toFixed(2),
  ).replace(/[.]/g, '°')}'`;
  longitude.innerHTML = `${longitudeText}: ${String(
    longitudeValue.toFixed(2),
  ).replace(/[.]/g, '°')}'`;
  searchBtn.textContent = searchText;
  searchPlace.placeholder = searchText;
  return placeData.coordinates;
};

const updateForecastDate = (weather, language) => {
  let dayNameIndex = 0;
  const arrayDayDate = [
    weather.firstDayData.dt * milisecond,
    weather.secondDayData.dt * milisecond,
    weather.thirdDayData.dt * milisecond,
  ];
  forecastDayText.forEach((dayText) => {
    dayText.innerHTML = new Date(arrayDayDate[dayNameIndex]).toLocaleString(
      `${language}`,
      {
        weekday: 'long',
      },
    );
    dayNameIndex++;
  });
};

const updateForecastTemp = (weather) => {
  let dayTempIndex = 0;
  const arrayDayTemp = [
    weather.firstDayData.temp.day.toFixed(),
    weather.secondDayData.temp.day.toFixed(),
    weather.thirdDayData.temp.day.toFixed(),
  ];
  forecastTempText.forEach((tempText) => {
    if (localStorage.getItem('userTempScale') === 'F') {
      arrayDayTemp[dayTempIndex] = Math.round(
        getForengeitScale(arrayDayTemp[dayTempIndex]),
      );
    }
    tempText.innerHTML = `${arrayDayTemp[dayTempIndex]}°`;
    dayTempIndex++;
  });
};

const updateForecastIcons = (weather) => {
  let dayIconIndex = 0;
  const arrayDayIcon = [
    weather.firstDayData.weather[0].icon,
    weather.secondDayData.weather[0].icon,
    weather.thirdDayData.weather[0].icon,
  ];
  forecastWeatherImg.forEach((dayIcon) => {
    dayIcon.src = `http://openweathermap.org/img/wn/${arrayDayIcon[dayIconIndex]}@4x.png`;
    dayIconIndex++;
  });
};

export const updateForecastWeather = async (placeData, language) => {
  const { coordinates } = placeData;
  const weatherData = await getWeather(language, coordinates);
  const weather = weatherData.forecast;
  updateForecastIcons(weather);
  updateForecastTemp(weather);
  updateForecastDate(weather, language);
};

export const updateCurrentWeather = async (placeData, language) => {
  const { coordinates } = placeData;
  const humidity = language === 'ru' ? 'влажность' : 'humidity';
  const wind = language === 'ru' ? 'ветер' : 'wind';
  const units = language === 'ru' ? 'м/с' : 'm/s';
  const feelsLike = language === 'ru' ? 'ощущается как: ' : 'feels like: ';
  const weatherData = await getWeather(language, coordinates);
  const weather = weatherData.current;
  if (localStorage.getItem('userTempScale') === 'F') {
    weather.temp = Math.round(getForengeitScale(weather.temp));
    weather.feelsLike = Math.round(getForengeitScale(weather.feelsLike));
  }
  humidityText.innerHTML = `${humidity}: ${weather.humidity}%`;
  windText.innerHTML = `${wind}: ${weather.wind} ${units}`;
  descriptionWeatherText.innerHTML = weather.description;
  currentWeatherTemp.innerHTML = `${weather.temp}°`;
  feelsLikeText.innerHTML = `${feelsLike}`;
  feelsLikeTemp.innerHTML = `${weather.feelsLike}°`;
  currentWeatherImg.src = `http://openweathermap.org/img/wn/${weather.icon}@4x.png`;
};

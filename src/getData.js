import {
  GEOLOCATION_KEY,
  TIMEZONE_KEY,
  WEATHER_KEY,
} from './api.config';

const datePlace = document.querySelector('.date--text');
const searchPlace = document.querySelector('.input--block');
export const findGeolocation = async (momentCoordinates) => {
  const result = await fetch(`https://ipinfo.io/json?token=${GEOLOCATION_KEY}`);
  const data = await result.json();
  const coordinates = data.loc.split(',').map((i) => +i);
  return momentCoordinates || coordinates;
};

export const getData = async (coords, language, momentCoordinates) => {
  try {
    const locationValue = coords || await findGeolocation(momentCoordinates);
    const yandexData = await window[`ymaps_${language}`].geocode(locationValue);
    const geoObject = yandexData.geoObjects.get(0);
    const country = geoObject.getCountry();
    const city = geoObject.getLocalities().length > 1
      ? geoObject.getLocalities()[1]
      : geoObject.getLocalities()[0];
    const coordinates = typeof locationValue === 'string' ? geoObject.geometry.getCoordinates() : locationValue;
    return {
      country,
      city,
      coordinates,
    };
  } catch (error) {
    searchPlace.value = language === 'en' ? 'The request failed. Repeat please' : 'Ошибка запроса. Повторите пожалуйста';
    searchPlace.classList.add('incorrect');
    return null;
  }
};

export const getTimeZone = async (latitude, longitude) => {
  const result = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${TIMEZONE_KEY}&pretty=1`);
  const data = await result.json();
  return data.results[0].annotations.timezone.name;
};

export const getTime = (timeZone, language) => {
  const options = {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZone,
  };
  const date = new Date();
  datePlace.innerHTML = date.toLocaleString(`${language}`, options).replace(/,/g, '');
};

export const getWeather = async (language, coords) => {
  const result = await fetch(`https://api.openweathermap.org/data/2.5/onecall?units=metric&exclude=minutely,hourly,alerts&lang=${language}&lat=${coords[0]}&lon=${coords[1]}8&appid=${WEATHER_KEY}`);
  const weatherDataObject = await result.json();
  const forecastWeatherData = weatherDataObject.daily;
  const firstDayData = forecastWeatherData[1];
  const secondDayData = forecastWeatherData[2];
  const thirdDayData = forecastWeatherData[3];
  const currentWeatherData = weatherDataObject.current;
  const { description } = currentWeatherData.weather[0];
  const temp = currentWeatherData.temp.toFixed(0);
  const feelsLike = currentWeatherData.feels_like.toFixed(0);
  const wind = currentWeatherData.wind_speed;
  const { humidity } = currentWeatherData;
  const { icon } = currentWeatherData.weather[0];
  return {
    forecast: {
      firstDayData,
      secondDayData,
      thirdDayData,
    },
    current: {
      description,
      temp,
      feelsLike,
      wind,
      humidity,
      icon,
    },
  };
};

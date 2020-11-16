import {
  refreshImgBtn,
} from './updateImg';
import {
  usedefaultOptions,
} from './changeTempScale';
import {
  getData,
  findGeolocation,
} from './getData';
import {
  updateTime,
  updateAppData,
  updateForecastWeather,
  updateCurrentWeather,
} from './updateData';
import {
  YANDEXMAP_KEY,
} from './api.config';

const searchPlace = document.querySelector('.input--block');
const searchBtn = document.querySelector('.search--btn');
const microphone = document.querySelector('.voice--button');
const zoom = 12;
const container = 'map';
const mapDuration = 2000;
let searchPlaceInFocus = false;
let momentCoordinates;
let language;
let myMap;

const createMap = (coordinats, ymaps) => new ymaps.Map(container, {
  center: coordinats, // Your location
  zoom,
  controls: ['smallMapDefaultSet'],
  type: 'yandex#hybrid',
});

const updateAll = async (placeData) => {
  const coordinates = await updateAppData(placeData, language, searchBtn);
  momentCoordinates = coordinates;
  myMap.panTo(coordinates, {
    duration: mapDuration,
  });
  updateTime(placeData, language);
  updateCurrentWeather(placeData, language);
  updateForecastWeather(placeData, language);
};

const init = async (ymaps) => {
  const locationValue = await findGeolocation(momentCoordinates);
  const placeData = await getData(locationValue, language, momentCoordinates);
  myMap = createMap(locationValue, ymaps);
  myMap.controls.remove('smallMapDefaultSet');
  updateAll(placeData);
  usedefaultOptions();
};

window.onload = () => {
  const head = document.querySelector('head');
  const select = document.querySelector('.language--select');
  select.value = localStorage.getItem('userLang') ? localStorage.getItem('userLang') : 'en';
  const loadMap = () => {
    language = select.value;
    localStorage.setItem('userLang', language);
    if (myMap) myMap.destroy();
    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEXMAP_KEY}&onload=init_${language}&lang=${language}_RU&ns=ymaps_${language}`;
    head.appendChild(script);
    window[`init_${language}`] = () => {
      init(window[`ymaps_${language}`]);
    };
    refreshImgBtn.click();
  };
  select.addEventListener('change', loadMap);
  loadMap();
};

const findNewLocation = async () => {
  const locationValue = searchPlace.value;
  const placeData = await getData(locationValue, language, momentCoordinates);
  if (locationValue === '' || !placeData) return;
  updateAll(placeData);
  refreshImgBtn.click();
  searchPlace.value = '';
};

const startRecognizer = () => { // Voice search
  searchPlace.value = '';
  searchPlace.classList.remove('incorrect');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = `${language}`;
  recognition.onresult = (event) => {
    const result = event.results[event.resultIndex];
    searchPlace.value = result[0].transcript;
    findNewLocation();
  };
  recognition.start();
};

searchBtn.addEventListener('click', findNewLocation);

microphone.addEventListener('click', startRecognizer);

searchPlace.addEventListener('focus', () => {
  searchPlace.value = '';
  searchPlaceInFocus = !searchPlaceInFocus;
  searchPlace.classList.remove('incorrect');
});
searchPlace.addEventListener('blur', () => {
  searchPlaceInFocus = !searchPlaceInFocus;
});

window.addEventListener('keydown', (e) => {
  searchPlace.classList.remove('incorrect');
  if (e.key === 'Enter' && searchPlaceInFocus) {
    searchBtn.click();
  }
});

/////////////////refresh picture///////////////
const refreshImgBtn = document.querySelector('.refresh--image--btn');
const background = document.querySelector('.app--container');
const refreshImg = document.querySelector('.refresh--img');

const getBackgroundImage = async () => {
  try {
    const result = await fetch(`https://api.unsplash.com/photos/random?orientation=landscape&per_page=1&query=nature&client_id=Kb3VAsmyDsoRtVFNxYGDVeEHvoY1QLdStWEs1xe5MKU`)
    const data = await result.json();
    return data?.urls?.regular;
  } catch (e) {
    console.error(e)
    return './img/background.jpg'
  }
}

const refreshBackgroundImage = () => {
  getBackgroundImage().then(img => background.style.backgroundImage = `url(${img})`);
  refreshImg.classList.add('active--refresh');
}

refreshImgBtn.addEventListener('click', refreshBackgroundImage)
refreshImg.addEventListener('animationend', () => refreshImg.classList.remove('active--refresh'))
///////////////////refresh picture///////////////


////////map///////////
const searchPlace = document.querySelector('.input--block')
const searchBtn = document.querySelector('.search--btn')
const cityAndCountry = document.querySelector('.location--text')
const latitude = document.querySelector('.latitude')
const longitude = document.querySelector('.longitude')
const datePlace = document.querySelector('.date--text')
const currentWeatherTemp = document.querySelector('.weather--temp')
const descriptionWeatherText = document.querySelector('.description')
const feelsLikeTemp = document.querySelector('.feels--temp')
const feelsLikeText = document.querySelector('.feels--text')
const windText = document.querySelector('.wind')
const humidityText = document.querySelector('.humidity')
const currentWeatherImg = document.querySelector('.weather--temp--img img')
const forecastWeatherImg = document.querySelectorAll('.future--img img')
const forecastDayText = document.querySelectorAll('.future--day--name')
const forecastTempText = document.querySelectorAll('.future--temp')
const forecastImg = document.querySelectorAll('.future--img')
const cBtn = document.querySelector('.c--temperature')
const fBtn = document.querySelector('.f--temperature')
const getForengeitScale = (celsiusTemp) => (celsiusTemp * 9 / 5) + 32
const getCelsiusScale = (forengeitTemp) => (forengeitTemp - 32) * 5 / 9
const microphone = document.querySelector('.voice--button')
let searchPlaceInFocus = false;
let interval;
let cBtnActive = true
let fBtnActive = true
let momentCoordinates;

///////////////////Создаём карту/////////////////////////
const createMap = (container, coordinats, zoom, ymaps) => {
  return new ymaps.Map(container, {
    center: coordinats, // Your location
    zoom: zoom,
    controls: ['smallMapDefaultSet'],
    type: 'yandex#hybrid'
  });
}

let language;
let myMap;
const init = (ymaps) => {
  myMap = createMap('map', [1, 0], 12, ymaps)
  myMap.controls.remove('smallMapDefaultSet')
  updateAppData().then(coordinates => {
    myMap.panTo(coordinates)
    updateTime(coordinates)
    updateCurrentWeather(coordinates)
    updateForecastWeather(coordinates)
  })
  searchBtn.addEventListener('click', findNewLocation.bind(null, myMap))
  defaultOptions()
}

window.onload = () => {
  const head = document.querySelectorAll('head')[0];
  const select = document.querySelector('.language--select');
  select.value = localStorage.getItem('userLang') ? localStorage.getItem('userLang') : 'en'
  select.createMap = function () {
    language = this.value;
    localStorage.setItem('userLang', language)
    if (myMap) myMap.destroy();
    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=20054a94-ac2a-468d-87b5-27c40b85b89e&onload=init_${language}&lang=${language}_RU&ns=ymaps_${language}`;
    head.appendChild(script);
    window[`init_${language}`] = () => {
      init(window[`ymaps_${language}`]);
    }
    refreshImgBtn.click()
  };
  select.addEventListener("change", select.createMap);
  select.createMap();
};

////////Единицы измерения по умолчанию//////////////////
const defaultOptions = () => {
  if (localStorage.getItem('userTempScale') === 'F') {
    fBtn.classList.add('active--temp')
    fBtnActive = false
  } else {
    cBtn.classList.add('active--temp')
    cBtnActive = false
  }
}
///////////Обновление единиц измерения температуры///////////////////
const updateScale = (foo) => {
  currentWeatherTemp.textContent = `${Math.round(foo(parseInt(currentWeatherTemp.textContent)))}°`
  for (let tempText of forecastTempText) {
    tempText.textContent = `${Math.round(foo(parseInt(tempText.textContent)))}°`
  }
  feelsLikeTemp.textContent = `${Math.round(foo(parseInt(feelsLikeTemp.textContent)))}°`
}


/////////////Find my coordinates//////////////////////////
const findGeolocation = async () => {
  const result = await fetch('https://ipinfo.io/json?token=889c7e574eacbf')
  const data = await result.json();
  let coordinates = data.loc.split(',').map((i) => {
    return +i
  })
  coordinates = momentCoordinates ? momentCoordinates : coordinates;
  return coordinates
}

/////////////////////Ищем новую локацию///////////////////////
const findNewLocation = () => {
  const locationValue = searchPlace.value;
  if (locationValue === '') return
  updateAppData(locationValue).then(coordinates => {
    momentCoordinates = coordinates;
    myMap.panTo(coordinates, {
      duration: 2000
    })
  })
  updateTime(locationValue)
  searchPlace.value = ''
  updateCurrentWeather(locationValue)
  updateForecastWeather(locationValue)
  refreshImgBtn.click()
}

///////////////////Получение объекта данных из карты///////////////
const getYandexMethods = (locationValue) => {
  return window[`ymaps_${language}`].geocode(locationValue)
}
///////////////////Получение данных из карты//////////////////////////
const getData = async (coords) => {
  try {
    const locationValue = coords ? coords : await findGeolocation()
    const yandexData = await getYandexMethods(locationValue)
    const geoObject = yandexData.geoObjects.get(0)
    const country = geoObject.getCountry()
    const city = geoObject.getLocalities().length > 1 ? geoObject.getLocalities()[1] : geoObject.getLocalities()[0]
    const coordinates = typeof locationValue === 'string' ? geoObject.geometry.getCoordinates() : locationValue
    return {
      country,
      city,
      coordinates
    }
  } catch (error) {
    console.error(error)
    searchPlace.value = language === 'en' ? 'The request failed. Repeat please' : 'Ошибка запроса. Повторите пожалуйста'
    searchPlace.classList.add('incorrect')
    return
  }

}
//////////////// Обновление данных////////////////////
const updateAppData = async (coords) => {
  let latitudeText = language === 'ru' ? 'Широта' : 'latitude'
  let longitudeText = language === 'ru' ? 'Долгота' : 'longitude'
  const placeData = await getData(coords);
  cityAndCountry.innerHTML = `${placeData.city?placeData.city:''} ${placeData.country}`
  let [latitudeValue, longitudeValue] = placeData.coordinates;
  latitude.innerHTML = `${latitudeText}: ${String(latitudeValue.toFixed(2)).replace(/[.]/g, '°')}'`;
  longitude.innerHTML = `${longitudeText}: ${String(longitudeValue.toFixed(2)).replace(/[.]/g, '°')}'`;
  return placeData.coordinates
}

////////////// Обновляем время///////////////////////
const updateTime = async (coords) => {
  clearInterval(interval)
  const placeData = await getData(coords)
  const coordinates = placeData.coordinates
  const timeZone = await getTimeZone(...coordinates)
  interval = setInterval(getTime.bind(null, timeZone), 1000)
}

///////////Получаем время и выводим в приложении///////
const getTime = (timeZone) => {
  let options = {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZone: timeZone
  }
  const date = new Date()
  datePlace.innerHTML = date.toLocaleString(`${language}`, options).replace(/,/g, '')
}
//////////////////////////////////////////////////////////////

////////////////////////Находим временную зону////////////////////////////////
const getTimeZone = async (latitude, longitude) => {
  const result = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=c127895a61b649119859150903a3c8db&pretty=1`)
  const data = await result.json();
  const timeZone = data?.results[0]?.annotations?.timezone?.name;
  return timeZone
}
//////////////////Получаем ответ на запрос о погоде/////////////
const getWeather = async (latitude, longitude) => {
  const result = await fetch(`https://api.openweathermap.org/data/2.5/onecall?units=metric&exclude=minutely,hourly,alerts&lang=${language}&lat=${latitude}&lon=${longitude}8&appid=7cf40857722b732df763dfd8436e2835`)
  const data = await result.json();
  return data
}
/////////////////Получаем объект погоды///////////////////
const getWeatherData = async (coords) => {
  const placeData = await getData(coords);
  const coordinates = placeData.coordinates;
  const weatherDataObject = getWeather(...coordinates)
  return weatherDataObject
}

const getForecastWeather = async (coords) => {
  const weatherDataObject = await getWeatherData(coords)
  const forecastWeatherData = weatherDataObject.daily;
  const firstDayData = forecastWeatherData[1];
  const secondDayData = forecastWeatherData[2];
  const thirdDayData = forecastWeatherData[3];
  return {
    firstDayData,
    secondDayData,
    thirdDayData
  }
}

const updateForecastWeather = async (coords) => {
  let dayNameIndex = 0;
  let dayTempIndex = 0;
  let dayIconIndex = 0;
  const weather = await getForecastWeather(coords)
  const arrayDayDate = [weather.firstDayData.dt * 1000, weather.secondDayData.dt * 1000, weather.thirdDayData.dt * 1000]
  const arrayDayTemp = [weather.firstDayData.temp.day.toFixed(), weather.secondDayData.temp.day.toFixed(), weather.thirdDayData.temp.day.toFixed()]
  const arrayDayIcon = [weather.firstDayData.weather[0].icon, weather.secondDayData.weather[0].icon, weather.thirdDayData.weather[0].icon]
  forecastTempText.forEach((tempText) => {
    if (localStorage.getItem('userTempScale') === 'F') {
      arrayDayTemp[dayTempIndex] = Math.round(getForengeitScale(arrayDayTemp[dayTempIndex]))
    }
    tempText.innerHTML = `${arrayDayTemp[dayTempIndex]}°`
    dayTempIndex++
  })
  forecastDayText.forEach((dayText) => {
    dayText.innerHTML = (new Date(arrayDayDate[dayNameIndex])).toLocaleString(`${language}`, {
      weekday: 'long'
    })
    dayNameIndex++
  })
  forecastWeatherImg.forEach((dayIcon) => {
    dayIcon.src = `http://openweathermap.org/img/wn/${arrayDayIcon[dayIconIndex]}@4x.png`
    dayIconIndex++
  })

}

///////////////Получаем и обрабатываем данные о текущей погоде//////////////////////
const getCurrentWeather = async (coords) => {
  const weatherDataObject = await getWeatherData(coords)
  const currentWeatherData = weatherDataObject.current
  const description = currentWeatherData.weather[0].description
  const temp = currentWeatherData.temp.toFixed(0)
  const feelsLike = currentWeatherData.feels_like.toFixed(0)
  const wind = currentWeatherData.wind_speed
  const humidity = currentWeatherData.humidity
  const icon = currentWeatherData.weather[0].icon
  return {
    description,
    temp,
    feelsLike,
    wind,
    humidity,
    icon
  }
}
/////////////////Обновляем данные о текущей погоде///////////////
const updateCurrentWeather = async (coords) => {
  const humidity = language === 'ru' ? 'влажность' : 'humidity'
  const wind = language === 'ru' ? 'ветер' : 'wind'
  const units = language === 'ru' ? 'м/с' : 'm/s'
  const feelsLike = language === 'ru' ? 'ощущается как: ' : 'feels like: '
  const weather = await getCurrentWeather(coords)
  if (localStorage.getItem('userTempScale') === 'F') {
    weather.temp = Math.round(getForengeitScale(weather.temp))
    weather.feelsLike = Math.round(getForengeitScale(weather.feelsLike))
  }
  humidityText.innerHTML = `${humidity}: ${weather.humidity}%`
  windText.innerHTML = `${wind}: ${weather.wind} ${units}`
  descriptionWeatherText.innerHTML = weather.description
  currentWeatherTemp.innerHTML = `${weather.temp}°`
  feelsLikeText.innerHTML = `${feelsLike}`
  feelsLikeTemp.innerHTML = `${weather.feelsLike}°`;
  currentWeatherImg.src = `http://openweathermap.org/img/wn/${weather.icon}@4x.png`
}

///////////////////

/////////////голосовой поиск///////////////////
const startRecognizer = () => {
  searchPlace.value = ''
  searchPlace.classList.remove('incorrect')
    const recognition = new webkitSpeechRecognition()
    recognition.lang = `${language}`

    recognition.onresult = (event) => {
      const result = event.results[event.resultIndex]
      console.clear()
      searchPlace.value = result[0].transcript
      searchBtn.click()
    }
    recognition.start();
}

microphone.addEventListener('click', startRecognizer);

fBtn.addEventListener('click', () => {
  if (!fBtnActive) return
  fBtn.classList.add('active--temp')
  cBtn.classList.remove('active--temp')
  localStorage.setItem('userTempScale', 'F')
  updateScale(getForengeitScale)
  fBtnActive = false
  cBtnActive = true
})

cBtn.addEventListener('click', () => {
  if (!cBtnActive) return
  cBtn.classList.add('active--temp')
  fBtn.classList.remove('active--temp')
  localStorage.setItem('userTempScale', 'C')
  updateScale(getCelsiusScale)
  cBtnActive = false
  fBtnActive = true
})

searchPlace.addEventListener('focus', () => {
  searchPlace.value = '';
  searchPlaceInFocus = !searchPlaceInFocus;
  searchPlace.classList.remove('incorrect')
})
searchPlace.addEventListener('blur', () => {
  searchPlaceInFocus = !searchPlaceInFocus;
})

window.addEventListener('keydown', (e) => {
  searchPlace.classList.remove('incorrect')
  if (e.key === 'Enter' && searchPlaceInFocus) {
    searchBtn.click()
  }
})
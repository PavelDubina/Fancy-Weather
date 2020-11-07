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
    background.style.backgroundImage = "url('./img/background.jpg')"
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
const feelsLikeText = document.querySelector('.feels')
const windText = document.querySelector('.wind')
const humidityText = document.querySelector('.humidity')
const currentWeatherImg = document.querySelector('.weather--temp--img img')
const forecastDayText = document.querySelectorAll('.future--day--name')
const forecastTempText = document.querySelectorAll('.future--temp')
const forecastImg = document.querySelectorAll('.future--img')
let searchPlaceInFocus = false;
let interval;

console.log(currentWeatherImg.src)

/////////////Find my coordinates//////////////////////////
const findGeolocation = async () => {
  const result = await fetch('https://ipinfo.io/json?token=889c7e574eacbf')
  const data = await result.json();
  let coordinates = data.loc.split(',').map((i) => {
    return +i
  })
  console.log(coordinates)
   return coordinates
}
/////////////////////Создаём карту/////////////////////////
const createMap = (container, coordinats, zoom) => {
  return new ymaps.Map(container, {
    center: coordinats, // Your location
    zoom: zoom,
    controls: ['smallMapDefaultSet'],
    type: 'yandex#hybrid'
  }, {
    searchControlProvider: 'yandex#search'
  });
}

/////////////////////Ищем новую локацию///////////////////////
const findNewLocation = (map) => {
  const locationValue = searchPlace.value;
  if(locationValue === '') return
  updateAppData(locationValue).then(coordinates => map.panTo(coordinates))
  updateTime(locationValue)
  searchPlace.value = ''
  updateCurrentWeather(locationValue)
  updateForecastWeather(locationValue)
}

///////////////////Получение объекта данных из карты///////////////
const getYandexMethods = (locationValue) => {
  return ymaps.geocode(locationValue)
}
///////////////////Получение данных из карты//////////////////////////
const getData = async (coords) => {
  const locationValue = coords ? coords : await findGeolocation()
  const yandexData = await getYandexMethods(locationValue)
  const geoObject = yandexData.geoObjects.get(0)
  const country = geoObject.getCountry()
  const city = geoObject.getLocalities().length > 1 ? geoObject.getLocalities()[1] : geoObject.getLocalities()[0]
  const coordinates = typeof locationValue === 'string' ? geoObject.geometry.getCoordinates() : locationValue
  return {country, city, coordinates}
}
//////////////// Обновление данных////////////////////
const updateAppData = async (coords) => {
  const placeData = await getData(coords);
    cityAndCountry.innerHTML = `${placeData.city?placeData.city:''} ${placeData.country}`
    let [latitudeValue, longitudeValue] = placeData.coordinates;
        latitude.innerHTML = `Широта: ${String(latitudeValue.toFixed(2)).replace(/[.]/g, '°')}'`;
        longitude.innerHTML = `Долгота: ${String(longitudeValue.toFixed(2)).replace(/[.]/g, '°')}'`;
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
const getTime = (timeZone) =>{
  let options = {
    weekday : 'short',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZone : timeZone
  }
  const date = new Date()
  datePlace.innerHTML = date.toLocaleString('ru', options).replace(/,/g, '')
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
  const result = await fetch(`https://api.openweathermap.org/data/2.5/onecall?units=metric&exclude=minutely,hourly,alerts&lang=ru&lat=${latitude}&lon=${longitude}8&appid=7cf40857722b732df763dfd8436e2835`)
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
  return {firstDayData, secondDayData, thirdDayData}
}

const updateForecastWeather = async (coords) => {
  let dayNameIndex = 0;
  let dayTempIndex = 0;
  const weather = await getForecastWeather(coords)
  const arrayDayDate = [weather.firstDayData.dt * 1000, weather.secondDayData.dt * 1000, weather.thirdDayData.dt * 1000]
  const arrayDayTemp = [weather.firstDayData.temp.day.toFixed(), weather.secondDayData.temp.day.toFixed(), weather.thirdDayData.temp.day.toFixed()]
  forecastTempText.forEach((tempText) => {
    tempText.innerHTML = `${arrayDayTemp[dayTempIndex]}°`
    dayTempIndex++
  })
    forecastDayText.forEach((dayText) => {
      dayText.innerHTML = (new Date(arrayDayDate[dayNameIndex])).toLocaleString('ru', {weekday: 'long'})
      dayNameIndex++
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
  return {description, temp, feelsLike, wind, humidity, icon}
}
/////////////////Обновляем данные о текущей погоде///////////////
const updateCurrentWeather = async (coords) => {
  const weather = await getCurrentWeather(coords)
  humidityText.innerHTML = `влажность: ${weather.humidity}%`
  windText.innerHTML = `ветер: ${weather.wind} м/с`
  descriptionWeatherText.innerHTML = weather.description
  currentWeatherTemp.innerHTML = weather.temp < 0 ? `${weather.temp}°` : weather.temp > 0 ? `+${weather.temp}°` : 0;
  feelsLikeText.innerHTML = `ощущается как: ${weather.feelsLike}°`;
  currentWeatherImg.src = `http://openweathermap.org/img/wn/${weather.icon}@4x.png`
}

///////////////////
const init = () => {
  myMap = createMap('map', [45, 20], 12)
  updateAppData().then(coordinates => {
    myMap.panTo(coordinates)
    updateTime(coordinates)
    updateCurrentWeather(coordinates)
    updateForecastWeather(coordinates)
    getWeatherData(coordinates).then((data)=>{console.log(data.daily); console.log((new Date(1604829600000)).toLocaleString('ru', {weekday: 'long'}))})
  })
  searchBtn.addEventListener('click', findNewLocation.bind(null, myMap))
}

searchPlace.addEventListener('focus', () => {
  searchPlace.value = '';
  searchPlaceInFocus = !searchPlaceInFocus;
})
searchPlace.addEventListener('blur', () => {
  searchPlaceInFocus = !searchPlaceInFocus;
})

window.addEventListener('keydown', (e) => {
  if(e.key === 'Enter' && searchPlaceInFocus){
    searchBtn.click()
  }
})

ymaps.ready(init);




















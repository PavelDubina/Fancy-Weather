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
let searchPlaceInFocus = false;
let interval;



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
  return placeData = {
    country,
    city,
    coordinates
  }
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



const getWeather = async () => {
  const result = await fetch(`https://api.climacell.co/v3/weather/forecast/daily?lat=55.7522&lon=37.6156&unit_system=si&start_time=now&fields=feels_like%temp%humidity%wind_speed%weather_code&apikey=wec7hC5mQw2LqED55M0I8vdGHH0JoNAO`)
  const data = await result.json();
  console.log(data)
}
getWeather()


// wec7hC5mQw2LqED55M0I8vdGHH0JoNAO

const init = () => {
  myMap = createMap('map', [45, 20], 12)
  updateAppData().then(coordinates => {
    myMap.panTo(coordinates)
    updateTime(coordinates)
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




















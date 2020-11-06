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



/////////////Find my coordinates//////////////////////////
const findGeolocation = async () => {
  const result = await fetch('https://ipinfo.io/json?token=889c7e574eacbf')
  const data = await result.json();
  let coordinates = data.loc.split(',').map((i) => {
    return +i
  })
  console.log(coordinates = data.loc)
  return coordinates
}

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

const installMyGeolocation = (myMap) => {
  findGeolocation().then((locationValue) => {
  changeMap(locationValue, myMap)
  })
}

const findNewLocation = (myMap) => {
  const locationValue = searchPlace.value;
  if(locationValue === '') return
  changeMap(locationValue, myMap);
  searchPlace.value = ''
}

let id;
const changeMap = (locationValue, myMap) => {
     ymaps.geocode(locationValue)
    .then((result) => { 
      try{
        clearTimeout(id)
        const location = result.geoObjects.get(0)
        const country = location.getCountry()
        const city = location.getLocalities().length > 1 ? location.getLocalities()[1] : location.getLocalities()[0]
        const coordinates = typeof locationValue === 'string' ? location.geometry.getCoordinates() : locationValue
        let [latitudeValue, longitudeValue] = coordinates;
        latitude.innerHTML = `Широта: ${String(latitudeValue.toFixed(2)).replace(/[.]/g, '°')}'`;
        longitude.innerHTML = `Долгота: ${String(longitudeValue.toFixed(2)).replace(/[.]/g, '°')}'`;
        cityAndCountry.innerHTML = `${city?city:''} ${country}`
        myMap.panTo(coordinates)
        getTimeZone(...coordinates).then((timeZone) => {id = setInterval(getTime.bind(null, timeZone), 1000)})
      } catch(error){
        searchPlace.value = 'Ошибка запроса. Повторите пожалуйста.'
      } 
    })
}


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

const getTimeZone = async (latitude, longitude) => {
  const result = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=c127895a61b649119859150903a3c8db&pretty=1`)
  const data = await result.json();
  const timeZone = data?.results[0]?.annotations?.timezone?.name;
  return timeZone
}



const getWeather = async () => {
  const result = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=3750d126b7904952b98142542200611&q=Brest&days=4`)
  const data = await result.json();
  console.log(data)
}

 getWeather()


let myMap;
const init = () => {
  myMap = createMap('map', [45, 20], 12)
  installMyGeolocation(myMap);
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













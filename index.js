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
let searchPlaceInFocus = false;


/////////////Find my coordinates//////////////////////////
const findGeolocation = async () => {
  const result = await fetch('https://ipinfo.io/json?token=889c7e574eacbf')
  const data = await result.json();
  let coordinates = data.loc.split(',').map((i) => {
    return +i
  })
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
  findGeolocation().then((location) => {
  changeMap(location, myMap)
  })
}

const findLocation = (myMap) => {
  const locationValue = searchPlace.value;
  if(locationValue === '') return
  changeMap(locationValue, myMap);
  searchPlace.value = ''
}

const changeMap = (locationValue, myMap) => {
  return ymaps.geocode(locationValue)
    .then((result) => { 
      try{
        const location = result.geoObjects.get(0)
        const country = location.getCountry()
        const city = location.getLocalities().length > 1 ? location.getLocalities()[1] : location.getLocalities()[0]
        const coordinates = typeof locationValue === 'string' ? location.geometry.getCoordinates() : locationValue
        let [latitudeValue, longitudeValue] = coordinates;
        latitude.innerHTML = `Широта: ${String(latitudeValue.toFixed(2)).replace(/[.]/g, '°')}'`;
        longitude.innerHTML = `Долгота: ${String(longitudeValue.toFixed(2)).replace(/[.]/g, '°')}'`;
        cityAndCountry.innerHTML = `${city?city:''} ${country}`
        myMap.panTo(coordinates)
      } catch(error){
        searchPlace.value = 'Ошибка запроса. Повторите пожалуйста.'
      } 
    })
}

const init = () => {
  const myMap = createMap('map', [45, 20], 12)
  installMyGeolocation(myMap);
  searchBtn.addEventListener('click', findLocation.bind(null, myMap))
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


















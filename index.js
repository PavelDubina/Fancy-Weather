/////////////////refresh picture///////////////
const refreshImgBtn = document.querySelector('.refresh--image--btn');
const background = document.querySelector('.app--container');
const refreshImg = document.querySelector('.refresh--img');

const getBackgroundImage = async () => {
  try{
    const result = await fetch(`https://api.unsplash.com/photos/random?orientation=landscape&per_page=1&query=nature&client_id=Kb3VAsmyDsoRtVFNxYGDVeEHvoY1QLdStWEs1xe5MKU`)
    const data = await result.json();
    return data?.urls?.regular;
  } catch(e) {
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
// /////////////////refresh picture///////////////



const findGeolocation = async () => {
  const result = await fetch('https://ipinfo.io/json?token=889c7e574eacbf')
  const data = await result.json();
  console.log(data)
}

findGeolocation()
navigator.geolocation.getCurrentPosition(position => {
  console.log(position)
 })

//  const findCountry = async () => {
//   const result = await fetch('https://ipinfo.io/json?token=889c7e574eacbf')
//   const data = await result.json();
//   console.log(data)
// }

const findMap = async () => {
  const result = await fetch("https://api.mapbox.com/geocoding/v5/mapbox.places/23.737139199999998,52.0975.json?access_token=pk.eyJ1IjoicGF2ZWxla25hbWUiLCJhIjoiY2toM2llY2w3MGV1MTJ5bHNlcjhzMTFuaCJ9.Gvc2M_yIZPhIOWwgG5t4BA")
  const data = await result.json();
  console.log(data)
}

findMap()
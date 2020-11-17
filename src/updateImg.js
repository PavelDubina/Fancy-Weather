import {
  IMG_KEY,
} from './api.config';

const background = document.querySelector('.app--container');
const refreshImg = document.querySelector('.refresh--img');
const testImage = document.createElement('img');
export const refreshImgBtn = document.querySelector('.refresh--image--btn');
const getBackgroundImage = async () => {
  try {
    const result = await fetch(`https://api.unsplash.com/photos/random?orientation=landscape&per_page=1&query=nature&client_id=${IMG_KEY}`);
    const data = await result.json();
    return data?.urls?.regular;
  } catch (e) {
    return './assets/images/background.jpg';
  }
};

const changeBackground = (imgUrl) => {
  background.style.backgroundImage = `url(${imgUrl})`;
};

export const refreshBackgroundImage = async () => {
  const imgUrl = await getBackgroundImage();
  testImage.src = imgUrl;
  testImage.removeEventListener('load', changeBackground.bind(null, imgUrl));
  testImage.addEventListener('load', changeBackground.bind(null, imgUrl));
  refreshImg.classList.add('active--refresh');
};

refreshImgBtn.addEventListener('click', refreshBackgroundImage);
refreshImg.addEventListener('animationend', () => refreshImg.classList.remove('active--refresh'));

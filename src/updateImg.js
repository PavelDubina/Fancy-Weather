import {
  IMG_KEY,
} from './api.config';

const background = document.querySelector('.app--container');
const refreshImg = document.querySelector('.refresh--img');
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

export const refreshBackgroundImage = () => {
  getBackgroundImage().then((img) => {
    background.style.backgroundImage = `url(${img})`;
  });
  refreshImg.classList.add('active--refresh');
};

refreshImgBtn.addEventListener('click', refreshBackgroundImage);
refreshImg.addEventListener('animationend', () => refreshImg.classList.remove('active--refresh'));

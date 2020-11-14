import { currentWeatherTemp, feelsLikeTemp, forecastTempText } from './updateData';

const celsiusBtn = document.querySelector('.c--temperature');
const forengeitBtn = document.querySelector('.f--temperature');
let celsiusBtnActive = true;
let forengeitBtnActive = true;

export const getForengeitScale = (celsiusTemp) => ((celsiusTemp * 9) / 5) + 32;

const getCelsiusScale = (forengeitTemp) => ((forengeitTemp - 32) * 5) / 9;

const updateScale = (foo) => {
  currentWeatherTemp.textContent = `${Math.round(foo(parseInt(currentWeatherTemp.textContent, 10)))}°`;
  for (const tempText of forecastTempText) {
    tempText.textContent = `${Math.round(foo(parseInt(tempText.textContent, 10)))}°`;
  }
  feelsLikeTemp.textContent = `${Math.round(foo(parseInt(feelsLikeTemp.textContent, 10)))}°`;
};

export const usedefaultOptions = () => {
  if (localStorage.getItem('userTempScale') === 'F') {
    forengeitBtn.classList.add('active--temp');
    forengeitBtnActive = false;
  } else {
    celsiusBtn.classList.add('active--temp');
    celsiusBtnActive = false;
  }
};

forengeitBtn.addEventListener('click', () => {
  if (!forengeitBtnActive) return;
  forengeitBtn.classList.add('active--temp');
  celsiusBtn.classList.remove('active--temp');
  localStorage.setItem('userTempScale', 'F');
  updateScale(getForengeitScale);
  forengeitBtnActive = false;
  celsiusBtnActive = true;
});

celsiusBtn.addEventListener('click', () => {
  if (!celsiusBtnActive) return;
  celsiusBtn.classList.add('active--temp');
  forengeitBtn.classList.remove('active--temp');
  localStorage.setItem('userTempScale', 'C');
  updateScale(getCelsiusScale);
  celsiusBtnActive = false;
  forengeitBtnActive = true;
});

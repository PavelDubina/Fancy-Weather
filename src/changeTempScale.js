import {currentWeatherTemp, feelsLikeTemp, forecastTempText} from './updateData'

const cBtn = document.querySelector('.c--temperature')
const fBtn = document.querySelector('.f--temperature')
let cBtnActive = true
let fBtnActive = true

export const getForengeitScale = (celsiusTemp) => (celsiusTemp * 9 / 5) + 32

const getCelsiusScale = (forengeitTemp) => (forengeitTemp - 32) * 5 / 9

const updateScale = (foo) => {
    currentWeatherTemp.textContent = `${Math.round(foo(parseInt(currentWeatherTemp.textContent)))}°`
    for (let tempText of forecastTempText) {
      tempText.textContent = `${Math.round(foo(parseInt(tempText.textContent)))}°`
    }
    feelsLikeTemp.textContent = `${Math.round(foo(parseInt(feelsLikeTemp.textContent)))}°`
  }

export const defaultOptions = () => {
    if (localStorage.getItem('userTempScale') === 'F') {
      fBtn.classList.add('active--temp')
      fBtnActive = false
    } else {
      cBtn.classList.add('active--temp')
      cBtnActive = false
    }
  }

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

  
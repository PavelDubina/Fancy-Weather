// const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
// const recognition = new SpeechRecognition();
// recognition.lang = 'ru';
// const input = document.querySelector('.input--block')
// const microphone = document.querySelector('.voice--button')



// function startRecognizer(){
//     if ('webkitSpeechRecognition' in window) {
//       var recognition = new webkitSpeechRecognition();
//       recognition.lang = 'ru';

//       recognition.onresult = function (event) {
//         var result = event.results[event.resultIndex];
//           console.clear();
//           console.log(result[0].transcript);
//       };

//       recognition.onend = function() {
//         console.log('Распознавание завершилось.');
//       };

//       recognition.start();
//     } else alert('webkitSpeechRecognition не поддерживается :(')


//   }
//   microphone.addEventListener('click', startRecognizer) ;
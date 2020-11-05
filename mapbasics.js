var myMap;

// Дождёмся загрузки API и готовности DOM.
ymaps.ready(init);

function init () {
    // Создание экземпляра карты и его привязка к контейнеру с
    // заданным id ("map").
    myMap = new ymaps.Map('map', {
        // При инициализации карты обязательно нужно указать
        // её центр и коэффициент масштабирования.
        center: [52.0978432, 23.6878], // Москва
        zoom: 12,
        controls: ['smallMapDefaultSet'],
        type: 'yandex#hybrid'
    }, {
        searchControlProvider: 'yandex#search'
    });

}


myMap.PanTo()
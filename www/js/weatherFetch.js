const weatherMap = new Map();
weatherMap.set(4201, 'Heavy Rain');
weatherMap.set(1001, 'Cloudy');
weatherMap.set(4001, 'Rain');
weatherMap.set(4200, 'Light Rain');
weatherMap.set(6201, 'Heavy Freezing Rain');
weatherMap.set(6001, 'Freezing Rain');
weatherMap.set(6200, 'Light Freezing Rain');
weatherMap.set(6000, 'Freezing Drizzle');
weatherMap.set(4000, 'Drizzle');
weatherMap.set(7101, 'Heavy Ice Pellets');
weatherMap.set(7000, 'Ice Pellets');
weatherMap.set(7102, 'Light Ice Pellets');
weatherMap.set(5101, 'Heavy Snow');
weatherMap.set(5000, 'Snow');
weatherMap.set(5100, 'Light Snow');
weatherMap.set(5001, 'Flurries');
weatherMap.set(8000, 'Thunderstorm');
weatherMap.set(2100, 'Light Fog');
weatherMap.set(2000, 'Fog');
weatherMap.set(1102, 'Mostly Cloudy');
weatherMap.set(1101, 'Partly Cloudy');
weatherMap.set(1100, 'Mostly Clear');
weatherMap.set(1000, 'Clear, Sunny');

const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function onAutodetectToggle(isChecked) {
    let isDisabled = isChecked;
    const form = document.getElementById("searchForm");
    const elements = form.elements;
    for (let i = 0, len = elements.length; i < len; i++) {
        if ((elements[i].nodeName == 'INPUT' && elements[i].type == 'text') || elements[i].nodeName == 'SELECT') {
            elements[i].disabled = isDisabled;
            elements[i].value = "";
        }
    }
}

function onClear() {
    document.getElementById("searchForm").reset();
    clearDayData();
    onAutodetectToggle(false)
}

async function getWeather() {
    clearDayData();
    const checkboxElem = document.getElementById("autodetect");
    let location;
    let locationStr;

    if (checkboxElem.checked) {
        const ipRequest = await fetch("https://ipinfo.io/json?token=de7857647d098b");
        const ipInfo = await ipRequest.json();
        if (ipInfo.loc) {
            location = ipInfo.loc;
            const geoRequestLat = await fetch("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + location + "&key=&&");
            const geoData = await geoRequestLat.json();
            if (geoData.results && geoData.results[0]) {
                locationStr = geoData.results[0]?.formatted_address;
            }
        }
    } else {
        const street = document.getElementById("streetInput").value.trim()
        const city = document.getElementById("city").value.trim()
        const state = document.getElementById("state").value.trim()
        const address = encodeURIComponent(street + ", " + city + ", " + state)

        const geoRequest = await fetch("https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=&&");
        const geoData = await geoRequest.json();
        if (geoData.results && geoData.results[0]) {
            const gLoc = geoData.results[0]?.geometry?.location;
            location = gLoc?.lat + "," + gLoc?.lng;
            locationStr = geoData.results[0]?.formatted_address;
        }
    }
    if (location) {
        const weatherRequest = await fetch("https://csci571-hw6-327205.wl.r.appspot.com/currentWeather?location=" + location);
        //const weatherRequest = await fetch("https://csci571-hw6-327205.wl.r.appspot.com/currentWeather?location=" + location);
        const weatherData = await weatherRequest.json();
        console.log(weatherData);

        displayWeatherCard(weatherData, locationStr);
    }
}

function clearDayData() {
    const weatherCard = document.getElementById("todayWeatherCardId");
    if (weatherCard) {
        weatherCard.style.display = "none";
    }

    const grid = document.getElementById("futureStatsTable")
    if (grid) {
        grid.remove();
    }
}

function showFutureDetails(e, weatherDetails) {
    clearDayData();
    const dailyWeather = document.getElementById("dailyWeatherDetails");
    dailyWeather.style.display = "block";
    const date = new Date(weatherDetails.startTime);
    const dateStr = weekday[date.getDay()] + ", " + date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();
    const temp = weatherDetails?.values?.temperatureMax + "°F/" + weatherDetails?.values?.temperatureMin + "°F";
    document.getElementById("dailyWeatherDetailsDate").innerHTML = dateStr;
    document.getElementById("dailyWeatherDetailsStatus").innerHTML = weatherMap.get(weatherDetails?.values?.weatherCode);
    document.getElementById("dailyWeatherDetailsTemp").innerHTML = temp;
    document.getElementById("dailyWeatherDetailsImg").src = "images/" + weatherDetails?.values?.weatherCode + ".svg";
}

function displayWeatherCard(weatherData, locationStr) {
    const weatherCard = document.getElementById("todayWeatherCardId");
    weatherCard.style.display = "block";
    document.getElementById("resultLocation").innerHTML = locationStr;

    const todayData = weatherData?.current?.data?.timelines[0]?.intervals[0]?.values;
    document.getElementById("statusImage").src = "images/" + todayData?.weatherCode + ".svg";
    document.getElementById("statusText").innerHTML = weatherMap.get(todayData?.weatherCode)
    document.getElementById("statusTemp").innerHTML = parseInt(todayData?.temperature) + "°"
    document.getElementById("humidityValue").innerHTML = todayData?.humidity + "%"
    document.getElementById("pressureValue").innerHTML = todayData?.pressureSeaLevel + "inHg"
    document.getElementById("windValue").innerHTML = todayData?.windSpeed + "mph"

    document.getElementById("visibilityValue").innerHTML = todayData?.visibility + "mi"
    document.getElementById("cloudValue").innerHTML = todayData?.cloudCover + "%"
    document.getElementById("uvValue").innerHTML = todayData?.uvIndex

    const intervals = weatherData?.day?.data?.timelines[0]?.intervals;
    const gridClone = document.getElementById("futureStatsTableClone");
    const grid = gridClone.cloneNode(true);
    grid.id = "futureStatsTable";
    grid.style.display = "grid";
    document.body.appendChild(grid);

    for (let i = 0; i < intervals.length; i++) {
        let interval = intervals[i];
        let element1 = document.createElement("div")
        element1.innerHTML = new Date(interval.startTime).toDateString()
        element1.addEventListener('click', e => showFutureDetails(e, interval))
        grid.appendChild(element1)

        let element2 = document.createElement("div")
        let imageElement = document.createElement('img')
        imageElement.src = "images/" + interval.values.weatherCode + ".svg";
        imageElement.className = "smallImage"
        element2.appendChild(imageElement)
        element2.append(weatherMap.get(interval.values.weatherCode))
        element2.addEventListener('click', e => showFutureDetails(e, interval))
        grid.appendChild(element2)

        let element3 = document.createElement("div")
        element3.innerHTML = interval.values.temperatureMax
        element3.addEventListener('click', e => showFutureDetails(e, interval))
        grid.appendChild(element3)

        let element4 = document.createElement("div")
        element4.innerHTML = interval.values.temperatureMin
        element4.addEventListener('click', e => showFutureDetails(e, interval))
        grid.appendChild(element4)

        let element5 = document.createElement("div")
        element5.innerHTML = interval.values.windSpeed
        element5.addEventListener('click', e => showFutureDetails(e, interval))
        grid.appendChild(element5)
    }
}

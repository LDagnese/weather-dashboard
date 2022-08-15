// variable declarations
let searchHistory = [];
const citySearch = document.querySelector("#city-search-form");
const mainContent = document.querySelector(".content");
const searchHistoryUl = document.querySelector("#search-history");

// Add timezone plugins to day.js
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

function displaySearchHistory() {
  searchHistoryUl.innerHTML = "";

  for (let i = searchHistory.length - 1; i >= 0; i--) {
    let searchLi = document.createElement("li");
    searchLi.textContent = searchHistory[i];
    searchLi.setAttribute("class", "search-item");
    searchHistoryUl.append(searchLi);
  }
}

function appendSearchHistory(citySearch) {
  if (searchHistory.indexOf(citySearch) !== -1) {
    return;
  }
  searchHistory.push(citySearch);

  localStorage.setItem("search-history", JSON.stringify(searchHistory));
  displaySearchHistory();
}

function initializeSearchHistory() {
  let storedHistory = localStorage.getItem("search-history");
  if (storedHistory) {
    searchHistory = JSON.parse(storedHistory);
  }
  displaySearchHistory();
}

function displayCurrentWeather(city, weather, timezone) {
  let date = dayjs().tz(timezone).format("M/D/YYYY");

  let temp = weather.temp;
  let wind = weather.wind_speed;
  let humidity = weather.humidity;
  let uvi = weather.uvi;
  let icon = `http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;
  let iconAlt = weather.weather[0].description;

  let card = document.createElement("div");
  let cityNameEl = document.createElement("h1");
  let weatherIcon = document.createElement("img");
  let dateEl = document.createElement("h3");
  let tempEl = document.createElement("h4");
  let windEl = document.createElement("h4");
  let humidEl = document.createElement("h4");
  let uviEl = document.createElement("h4");

  card.setAttribute("class", "current-weather");

  cityNameEl.textContent = `${city}`;
  card.append(cityNameEl);
  weatherIcon.setAttribute("src", icon);
  weatherIcon.setAttribute("alt", iconAlt);
  card.append(weatherIcon);
  dateEl.textContent = `Date: ${date}`;
  tempEl.textContent = `Temp: ${temp}°F`;
  windEl.textContent = `Wind Speed: ${wind} MPH`;
  humidEl.textContent = `Humidity: ${humidity} %`;
  uviEl.textContent = `UVI Index: ${uvi}`;

  card.append(dateEl);
  card.append(tempEl);
  card.append(windEl);
  card.append(humidEl);
  card.append(uviEl);

  mainContent.innerHTML = "";
  mainContent.append(card);
}

function displayForecast(data, timezone) {
  const startDate = dayjs().tz(timezone).add(1, "day").startOf("day").unix();
  const endDate = dayjs().tz(timezone).add(6, "day").startOf("day").unix();

  let cardContainerEl = document.createElement("div");
  let cardContainerHeadEl = document.createElement("h3");
  let cardContainerRow = document.createElement("div");

  cardContainerEl.setAttribute("class", "card-container");
  cardContainerHeadEl.textContent = "5-Day Forecast:";
  cardContainerRow.setAttribute("class", "row");
  cardContainerEl.append(cardContainerHeadEl);

  mainContent.append(cardContainerEl);

  for (let i = 0; i < data.length; i++) {
    // check to make sure the forecast is within 5 days
    if (data[i].dt >= startDate && data[i].dt < endDate) {
      // render the card
      let unixTime = data[i].dt;
      let iconUrl = `http://openweathermap.org/img/wn/${data[i].weather[0].icon}.png`;
      let iconDescription = data[i].weather[0].description;
      let temp = data[i].temp.day;
      let { humidity } = data[i];
      let wind = data[i].wind_speed;

      let fcCardEl = document.createElement("div");
      let fcDateEl = document.createElement("h3");
      let fcImgEl = document.createElement("img");
      let fcTempEl = document.createElement("h4");
      let fcWindEl = document.createElement("h4");
      let fcHumidEl = document.createElement("h4");

      fcCardEl.setAttribute("class", "card");
      fcDateEl.textContent = dayjs
        .unix(unixTime)
        .tz(timezone)
        .format("M/D/YYYY");
      fcImgEl.setAttribute("src", iconUrl);
      fcImgEl.setAttribute("alt", iconDescription);
      fcTempEl.textContent = `Temp: ${temp}°F`;
      fcWindEl.textContent = `Wind: ${wind} MPH`;
      fcHumidEl.textContent = `Humidity: ${humidity} %`;

      fcCardEl.append(fcDateEl, fcImgEl, fcTempEl, fcWindEl, fcHumidEl);

      cardContainerRow.append(fcCardEl);
    }
  }

  cardContainerEl.append(cardContainerRow);
}

function citySearchHandler(e) {
  e.preventDefault();

  let city = document.querySelector("#city-search-city").value.trim();
  let state = document.querySelector("#city-search-state").value;

  if (!city) {
    return;
  }

  getCityLatLon(city, state);

  citySearch.reset();
}

// api call handlers
function getCityLatLon(city, state) {
  const apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},usa&limit=1&appid=${config.myKey}`;

  fetch(apiUrl)
    .then((res) => res.json())
    .then((data) => {
      if (!data[0]) {
        alert("Location was not found!");
      } else {
        appendSearchHistory(`${city}, ${state}`);
        getCurrentWeather(data[0]);
      }
    })
    .catch((err) => console.log(err));
}

function getCurrentWeather(location) {
  const { lat } = location;
  const { lon } = location;
  const cityState = `${location.name}, ${location.state}`;
  const apiUrl = `http://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${config.myKey}`;

  fetch(apiUrl)
    .then((res) => res.json())
    .then((data) => displayAllWeather(cityState, data))
    .catch((err) => console.log(err));
}

function displayAllWeather(city, data) {
  displayCurrentWeather(city, data.current, data.timezone);
  displayForecast(data.daily, data.timezone);
}

// handler for localStorage of past searches
function searchHistoryClickHandler(event) {
    if(!event.target.matches(".search-item")) {
        return;
    }

    let search = event.target.textContent;

    const searchArr = search.split(", ");

    getCityLatLon(searchArr[0],searchArr[1]);
}

// load localstorage
initializeSearchHistory();
// event listeners
searchHistoryUl.addEventListener("click", searchHistoryClickHandler);
citySearch.addEventListener("submit", citySearchHandler);

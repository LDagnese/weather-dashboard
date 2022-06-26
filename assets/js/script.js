// variable declarations

// api call handlers
function getCityLatLong(city, state) {
    var apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},usa&limit=1&appid=${config.myKey}`;

    fetch(apiUrl)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (result) {
                    console.log(result);
                })
            } else {
                console.log("Response was NOT ok");
            }
        })
        .catch(function (error) {
            console.log(error);
        });
};

// element creation handler for api data
    // needs error handling

// handler for localStorage of past searches

// load localStorage searches
    // after everysearch and on load

// load localstorage
// event listeners
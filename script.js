// START UP AND GETTING USER LOCATION //
const locationStatus = document.getElementById('locationStatus');
const serviceStatus = document.getElementById('serviceStatus');
const locationServiceButton = document.getElementById('hideLocationService');
let givenLocation = false; // boolean to check if the user's current location is given through GeoLocation API
let currentWeatherGradient = undefined; // tracks the current weather gradient class attached to the body background

// local latitude and longitude
var latitude = undefined;
var longitude = undefined;

// object to be passed into toLocaleString to set the timeZone and date/time format
let timeDateFormat = {
    dateStyle:'short',
    timeStyle: 'short',
    timeZone: '',
    hour12: false
};
let timeFormat = { // object for sunset and sunrise formatting
    timeStyle: 'short',
    timeZone: '',
    hour12: false
};
// object to be passed into toLocaleString to set the timeZone and date/time format (current location)
let timeDateFormatCurrent = {
    dateStyle:'short',
    timeStyle: 'short',
    hour12: false
};
let timeFormatCurrent = { // object for sunset and sunrise formatting
    timeStyle: 'short',
    hour12: false
};


let dateFormat = 'en-AU'; // variable to control the date format to be either DD/MM/YYYY (en-AU) or MM/DD/YYYY (en-US)

function onloadGeo() { // function to test if location services are turned on when the page is loaded
    var options = {
        timeout: 10000 // if Geolocation API can't detect user's location after 10 seconds then it will return as an error
    };

    function success(position) { // what happens when user's location is retrieved (data contained in position variable)
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

        serviceStatus.innerHTML = 'ENABLED';
        locationStatus.innerHTML = `<p>Your current location is <br>Latitude: ${latitude}°, Longitude: ${longitude}°<p>`;
        locationServiceButton.style.display = "inline";
        
        getWeather(latitude, longitude); // populate weather data based on the user's current location
    }

    function error() { // error message that's returned if API is unable to retrieve user's location
        serviceStatus.innerHTML = 'DISABLED';
        document.getElementById('find-me').style.display = "inline";
    }


    if (!navigator.geolocation) { // check if Geolocation API is available on user's browser
        locationStatus.innerHTML = 'Geolocation is not supported by your browser';
    } else {
        locationStatus.innerHTML = 'Locating…';
        navigator.geolocation.getCurrentPosition(success, error, options);
    }
}

function geoFindMe() { // function to return the user's current lattitude and longitude 
    var options = {
        timeout: 10000 // if Geolocation API can't detect user's location after 10 seconds then it will return as an error
    };

    function success(position) { // what happns when user's location is retrieved (data contained in position variable)
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

        serviceStatus.innerHTML = 'ENABLED';
        locationStatus.innerHTML = `Your current location is <br>Latitude: ${latitude}°, Longitude: ${longitude}°`;
        document.getElementById('find-me').style.display = "none";
        locationServiceButton.style.display = "inline";

        getWeather(latitude, longitude); // populate weather data based on the user's current location
    }

    function error() { // error message that's returned if API is unable to retrieve user's location
        locationStatus.innerHTML = 'Unable to retrieve your location <br>If you are on an Apple device please go to System Preferences -> Security & Privacy -> Location Services and ensure that Google Chrome is enabled.';
    }

    if (!navigator.geolocation) { // check if Geolocation API is available on user's browser
        locationStatus.innerHTML = 'Geolocation is not supported by your browser';
    } else {
        locationStatus.innerHTML = 'Locating…';
        navigator.geolocation.getCurrentPosition(success, error, options);
    }
}

window.onload = onloadGeo;
document.getElementById('find-me').addEventListener('click', geoFindMe);
locationServiceButton.addEventListener('click', function () { // hides the location services request div block because the webpage already got the user's location
    document.getElementById('requireLocationService').style.display = 'none';
    givenLocation = true;
    document.getElementById('currentLocationButton').innerHTML = `Return to ${currentWeather.city}, ${currentWeather.country}`;
});


// OpenWeather API //
const APIkey = '32e0027e75e0c81d69454f2631a2649f'; // API key to call OpenWeather API

// setting variables to reduce length of function name used to collect elements with the specified id name
const currentLocation = document.getElementById('location');
const tempValue = document.getElementById('temperatureValue');
const tempDescText = document.getElementById('temperatureDescText');
const sunriseTime = document.getElementById('sunriseTime');
const sunsetTime = document.getElementById('sunsetTime');
const currentDateTime = document.getElementById('dateTime');

const currentWeather = {
    temperature: {
        value: undefined,
        unit: undefined
    },
    tempDesc: undefined,
    tempDescText: undefined,
    city: undefined,
    country: undefined,
    timezone: undefined,
    sunrise: undefined,
    sunset: undefined,
    time: undefined
}; // create an object to store incoming weather data which comes from OpenWeather API

// used to update the HTML to present the current weather the user is requesting
function displayWeather() {
    currentLocation.innerHTML = `<h2>Welcome to ${currentWeather.city}, ${currentWeather.country}</h2>`;
    tempValue.innerHTML = `<p>Current Temperature: ${currentWeather.temperature.value} °${currentWeather.temperature.unit}</p>`;
    tempDescText.innerHTML = `<p>Current Weather: ${currentWeather.tempDescText}</p>`;
    if (currentLandmarkCode == undefined) { // for current location
        sunriseTime.innerHTML = `<p>Sunrise: ${currentWeather.sunrise.toLocaleString(dateFormat, timeFormatCurrent)}</p>`;
        sunsetTime.innerHTML = `<p>Sunset: ${currentWeather.sunset.toLocaleString(dateFormat, timeFormatCurrent)}</p>`;
        currentDateTime.innerHTML = `<p>Current Date: ${currentWeather.time.toLocaleString(dateFormat, timeDateFormatCurrent)}</p>`;
    }
    else { // for landmark location
        sunriseTime.innerHTML = `<p>Sunrise: ${currentWeather.sunrise.toLocaleString(dateFormat, timeFormat)}</p>`;
        sunsetTime.innerHTML = `<p>Sunset: ${currentWeather.sunset.toLocaleString(dateFormat, timeFormat)}</p>`;
        currentDateTime.innerHTML = `<p>Current Date: ${currentWeather.time.toLocaleString(dateFormat, timeDateFormat)}</p>`;
    }
}

// convert temperature from celsius to fahrenheit
function CtoF(temp) {
    return (temp * 9/5) + 32;
}
function FtoC(temp){
    return (temp - 32) * 5/9;
}

function getWeather(lat, long){
    let api = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${APIkey}`;
    fetch(api) // fetch request from the api link (to OpenWeather)
    .then(function(response){ // what to do with the response from the fetch request
        let data = response.json(); // the response is in the form of a JSON object, so it's converted/parsed into an object 
        return data;
    })
    .then(function(data){ // working with the converted response as an object (object values can be seen in the OpenWeather API docs)
        // TESTING: to check if data has been successfully parsed into a JS object and if I can retreive required data
        console.log('INDIVIDUAL VALUES');
        console.log("temp value: " + data.main.temp);
        console.log("temp desc: " + data.weather[0].icon);
        console.log("city: " + data.name);
        console.log("country: " + data.sys.country);
        console.log("timezone: " + data.timezone);
        console.log("sunrise: " + data.sys.sunrise);
        console.log("sunset: " + data.sys.sunset);

        // extracting essential data and storing it in the local currentWeather object
        currentWeather.temperature.value = Math.floor(data.main.temp - 273); // temperature is recieved in Kelvin so it's converted to celsius and rounded down to the closest integer
        if (currentWeather.temperature.unit === undefined){ // inital calculation 
            currentWeather.temperature.unit = 'C';
        }
        else if (currentWeather.temperature.unit === 'F') { // if current temp unit is in fahrenheit then it automatically calculates the temp to be in fahrenheit
            currentWeather.temperature.value = Math.floor(CtoF(currentWeather.temperature.value));
        }

        // collect current weather condition and set gradient background
        if (currentWeatherGradient) { // remove the current weather gradient for it to be updated below
            document.body.classList.remove(currentWeatherGradient);
        }
        currentWeather.tempDesc = data.weather[0].icon; // track the icons that the API uses to see the overall weather condition
        switch(currentWeather.tempDesc) {
            // 01 - clear sky
            case "01d":
                document.getElementById('locationData').style.color = 'black';
                currentWeather.tempDescText = 'Clear Sky (Day)';
                document.body.classList.add('clearSkyDay');
                currentWeatherGradient = 'clearSkyDay';
                break;
            case "01n":
                document.getElementById('locationData').style.color = 'white';
                currentWeather.tempDescText = 'Clear Sky (Night)';
                document.body.classList.add('clearSkyNight');
                currentWeatherGradient = 'clearSkyNight';
                break;

            // 02 - few clouds
            case "02d":
                document.getElementById('locationData').style.color = 'black';
                currentWeather.tempDescText = 'Few Clouds (Day)';
                document.body.classList.add('fewCloudsDay');
                currentWeatherGradient = 'fewCloudsDay';
                break;
            case "02n":
                document.getElementById('locationData').style.color = 'white';
                currentWeather.tempDescText = 'Few Clouds (Night)';
                document.body.classList.add('fewCloudsNight');
                currentWeatherGradient = 'fewCloudsNight';
                break;

            // 03 - scat clouds
            case "03d":
                document.getElementById('locationData').style.color = 'black';
                currentWeather.tempDescText = 'Scattered Clouds (Day)';
                document.body.classList.add('scatCloudsDay');
                currentWeatherGradient = 'scatCloudsDay';
                break;
            case "03n":
                document.getElementById('locationData').style.color = 'white';
                currentWeather.tempDescText = 'Scattered Clouds (Night)';
                document.body.classList.add('scatCloudsNight');
                currentWeatherGradient = 'scatCloudsNight';
                break;

            // 04 - broke clouds
            case "04d":
                document.getElementById('locationData').style.color = 'black';
                currentWeather.tempDescText = 'Broken Clouds (Day)';
                document.body.classList.add('brokeCloudsDay');
                currentWeatherGradient = 'brokeCloudsDay';
                break;
            case "04n":
                document.getElementById('locationData').style.color = 'white';
                currentWeather.tempDescText = 'Broken Clouds (Night)';
                document.body.classList.add('brokeCloudsNight');
                currentWeatherGradient = 'brokeCloudsNight';
                break;

            // 09 - shower rain
            case "09d":
                document.getElementById('locationData').style.color = 'black';
                currentWeather.tempDescText = 'Shower Rain (Day)';
                document.body.classList.add('showerRainDay');
                currentWeatherGradient = 'showerRainDay';
                break;
            case "09n":
                document.getElementById('locationData').style.color = 'white';
                currentWeather.tempDescText = 'Shower Rain (Night)';
                document.body.classList.add('showerRainNight');
                currentWeatherGradient = 'showerRainNight';
                break;  
                
            // 10 - rain
            case "10d":
                document.getElementById('locationData').style.color = 'black';
                currentWeather.tempDescText = 'Rain (Day)';
                document.body.classList.add('rainDay');
                currentWeatherGradient = 'rainDay';
                break;
            case "10n":
                document.getElementById('locationData').style.color = 'white';
                currentWeather.tempDescText = 'Rain (Night)';
                document.body.classList.add('rainNight');
                currentWeatherGradient = 'rainNight';
                break;  

            // 11 - thunder
            case "11d":
                document.getElementById('locationData').style.color = 'black';
                currentWeather.tempDescText = 'Thunder (Day)';
                document.body.classList.add('thunderDay');
                currentWeatherGradient = 'thunderDay';
                break;
            case "11n":
                document.getElementById('locationData').style.color = 'white';
                currentWeather.tempDescText = 'Thunder (Night)';
                document.body.classList.add('thunderNight');
                currentWeatherGradient = 'thunderNight';
                break;
                
            // 13 - snow
            case "13d":
                document.getElementById('locationData').style.color = 'black';
                currentWeather.tempDescText = 'Snow (Day)';
                document.body.classList.add('snowDay');
                currentWeatherGradient = 'snowDay';
                break;
            case "13n":
                document.getElementById('locationData').style.color = 'white';
                currentWeather.tempDescText = 'Snow (Night)';
                document.body.classList.add('snowNight');
                currentWeatherGradient = 'snowNight';
                break;  

            // 50 - mist
            case "50d":
                document.getElementById('locationData').style.color = 'black';
                currentWeather.tempDescText = 'Mist (Day)';
                document.body.classList.add('mistDay');
                currentWeatherGradient = 'mistDay';
                break;
            case "50n":
                document.getElementById('locationData').style.color = 'white';
                currentWeather.tempDescText = 'Mist (Night)';
                document.body.classList.add('mistNight');
                currentWeatherGradient = 'mistNight';
                break;  

            default:
                console.log("ERROR: temperature description is not accounted for " + currentWeather.tempDesc);
        }


        currentWeather.city = data.name;
        currentWeather.country = data.sys.country;
        currentWeather.timezone = data.timezone;

        // Convert time incoming time unix, UTC to locale time
        var sunriseDate = new Date(data.sys.sunrise * 1000);
        var sunsetDate = new Date(data.sys.sunset * 1000);
        currentWeather.sunrise = sunriseDate;
        currentWeather.sunset = sunsetDate;
        currentWeather.time = new Date(); // get current date and time  
    })
    .then(function() { // after populating the weather object, use displayWeather() to display the data on the HTML
        console.log("UPDATE HTML");
        displayWeather();
    });
}

document.getElementById("tempButton").addEventListener("click", function(){ // adds an eventlistener to the temperature value div, when clicked it will convert the temperature between celsius and fahrenheit
    if (currentWeather.temperature.value === undefined) return; // error prevention in the case where we have no data on the current weather
    if (currentWeather.temperature.unit === "C") {
        document.getElementById('tempButton').innerHTML = 'Change to °C';
        currentWeather.temperature.value = Math.floor(CtoF(currentWeather.temperature.value));
        currentWeather.temperature.unit = 'F';
    }
    else {
        document.getElementById('tempButton').innerHTML = 'Change to °F';
        currentWeather.temperature.value = Math.floor(FtoC(currentWeather.temperature.value));
        currentWeather.temperature.unit = 'C';
    }
    tempValue.innerHTML = `<p>Current Temperature: ${currentWeather.temperature.value} °${currentWeather.temperature.unit}</p>`; // using template literal to embed expressions
});

// setting variables to reduce length of function name used to collect elements with the specified id name (for landmarks)
const AU = document.getElementById('AU');
const CH = document.getElementById('CH');
const FR = document.getElementById('FR');
const MY = document.getElementById('MY');
const SG = document.getElementById('SG');
const UK = document.getElementById('UK');

let currentLandmark = undefined;
let currentLandmarkCode = undefined;

// eventlisteners for landmark icons to change the weather data on screen
AU.addEventListener('click', function(){
    if (currentLandmark) { // if there's a landmark chosen before the current landmark
        currentLandmark.src = `landmarks/default/${currentLandmarkCode}.svg`; // change the previously chosen landmark to it's default state
    }
    currentLandmark = AU; // document.getElementById('AU');
    currentLandmarkCode = 'AU';
    AU.src = "landmarks/chosen/AU.svg";
    timeFormat.timeZone = 'Australia/Sydney';
    timeDateFormat.timeZone = 'Australia/Sydney';

    getWeather(-33.867851, 151.207321);
    document.getElementById('requireLocationService').style.display = 'none';
});

CH.addEventListener('click', function(){
    if (currentLandmark) { // if there's a landmark chosen before the current landmark
        currentLandmark.src = `landmarks/default/${currentLandmarkCode}.svg`; // change the previously chosen landmark to it's default state
    }
    currentLandmark = CH;
    currentLandmarkCode = 'CH';
    CH.src = "landmarks/chosen/CH.svg";
    timeFormat.timeZone = 'Asia/Shanghai';
    timeDateFormat.timeZone = 'Asia/Shanghai';

    getWeather(39.907501, 116.397232);
    document.getElementById('requireLocationService').style.display = 'none';
});

FR.addEventListener('click', function(){
    if (currentLandmark) { // if there's a landmark chosen before the current landmark
        currentLandmark.src = `landmarks/default/${currentLandmarkCode}.svg`; // change the previously chosen landmark to it's default state
    }
    currentLandmark = FR;
    currentLandmarkCode = 'FR';
    FR.src = "landmarks/chosen/FR.svg";
    timeFormat.timeZone = 'Europe/Paris';
    timeDateFormat.timeZone = 'Europe/Paris';

    getWeather(48.853401, 2.3486);
    document.getElementById('requireLocationService').style.display = 'none';
});

MY.addEventListener('click', function(){
    if (currentLandmark) { // if there's a landmark chosen before the current landmark
        currentLandmark.src = `landmarks/default/${currentLandmarkCode}.svg`; // change the previously chosen landmark to it's default state
    }
    currentLandmark = MY;
    currentLandmarkCode = 'MY';
    MY.src = "landmarks/chosen/MY.svg";
    timeFormat.timeZone = 'Asia/Kuala_Lumpur';
    timeDateFormat.timeZone = 'Asia/Kuala_Lumpur';

    getWeather(3.14309, 101.686531);
    document.getElementById('requireLocationService').style.display = 'none';
});

SG.addEventListener('click', function(){
    if (currentLandmark) { // if there's a landmark chosen before the current landmark
        currentLandmark.src = `landmarks/default/${currentLandmarkCode}.svg`; // change the previously chosen landmark to it's default state
    }
    currentLandmark = SG;
    currentLandmarkCode = 'SG';
    SG.src = "landmarks/chosen/SG.svg";
    timeFormat.timeZone = 'Asia/Singapore';
    timeDateFormat.timeZone = 'Asia/Singapore';

    getWeather(1.28967, 103.850067);
    document.getElementById('requireLocationService').style.display = 'none';
});

UK.addEventListener('click', function(){
    if (currentLandmark) { // if there's a landmark chosen before the current landmark
        currentLandmark.src = `landmarks/default/${currentLandmarkCode}.svg`; // change the previously chosen landmark to it's default state
    }
    currentLandmark = UK;
    currentLandmarkCode = 'UK';
    UK.src = "landmarks/chosen/UK.svg";
    timeFormat.timeZone = 'Europe/London';
    timeDateFormat.timeZone = 'Europe/London';

    getWeather(51.50853, -0.12574);
    document.getElementById('requireLocationService').style.display = 'none';
});


// event listener for current location button in the navigation bar
document.getElementById("currentLocationButton").addEventListener('click', function(){

    if (currentLandmark) { // if there's a landmark chosen before the current landmark
        currentLandmark.src = `landmarks/default/${currentLandmarkCode}.svg`; // change the previously chosen landmark to it's default state
    }
    currentLandmark = undefined;
    currentLandmarkCode = undefined;

    if (currentWeatherGradient) { // if there's a current weather gradient set to the background
        document.body.classList.remove(currentWeatherGradient);
    }

    if (!givenLocation) { // if use hasn't given their location access
        document.getElementById('requireLocationService').style.display = '';
    }
    else {
        timeDateFormat.timeZone = '';
        getWeather(latitude, longitude); // populate weather data based on the user's current location
    }
});

// change time format between 24hrs and AM/PM
document.getElementById("timeButton").addEventListener('click', function(){
    if (timeDateFormat.hour12 == false) {
        timeDateFormat.hour12 = true;
        timeFormat.hour12 = true;
        timeDateFormatCurrent.hour12 = true;
        timeFormatCurrent.hour12 = true;
        document.getElementById("timeButton").innerHTML = 'Change to 24hrs';
    }
    else {
        timeDateFormat.hour12 = false;
        timeFormat.hour12 = false;
        timeDateFormatCurrent.hour12 = false;
        timeFormatCurrent.hour12 = false;
        document.getElementById("timeButton").innerHTML = 'Change to AM/PM';
    }
    displayWeather();
});

// change date format DD/MM/YYYY and MM/DD/YYYY
document.getElementById("dateButton").addEventListener('click', function(){
    if (dateFormat === 'en-AU') {
        dateFormat = 'en-US';
        document.getElementById("dateButton").innerHTML = 'Change to DD/MM/YYYY';
    }
    else {
        dateFormat = 'en-AU';
        document.getElementById("dateButton").innerHTML = 'Change to MM/DD/YYYY';
    }
    displayWeather();
});
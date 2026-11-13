// =============================
// DOM Elements
// =============================

const cityInput =
    document.getElementById("city-input");

const searchBtn =
    document.getElementById("search-btn");


const weatherCard =
    document.querySelector(".weather-card");

const forecastSection =
    document.querySelector(".forecast");


const cityName =
    document.getElementById("city-name");

const countryName =
    document.getElementById("country-name");

const countryFlag =
    document.getElementById("country-flag");


const temperature =
    document.getElementById("temperature");

const description =
    document.getElementById("description");

const humidity =
    document.getElementById("humidity");

const wind =
    document.getElementById("wind");

const feelsLike =
    document.getElementById("feels-like");


const weatherIcon =
    document.getElementById("weather-icon");


const forecastContainer =
    document.getElementById("forecast-container");


const errorMessage =
    document.getElementById("error-message");

const loadingMessage =
    document.getElementById("loading-message");


// =============================
// Loading
// =============================

function setLoading(isLoading) {

    if (isLoading) {

        loadingMessage.textContent =
            "Loading...";

        searchBtn.disabled = true;

    } else {

        loadingMessage.textContent =
            "";

        searchBtn.disabled = false;

    }
}


// =============================
// Search City
// =============================

async function searchCity() {

    const city =
        cityInput.value.trim();


    // deleting last error
    errorMessage.textContent = "";


    // input checking
    if (city === "") {

        errorMessage.textContent =
            "Please enter a city name.";

        return;
    }


    // start loading
    setLoading(true);


    try {

        // =============================
        // 1. Find City
        // =============================

        const geoResponse =
            await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
            );


        if (!geoResponse.ok) {

            throw new Error(
                "Could not connect to geocoding API."
            );
        }


        const geoData =
            await geoResponse.json();


        // city was not found
        if (
            !geoData.results ||
            geoData.results.length === 0
        ) {

            errorMessage.textContent =
                "City not found.";

            return;
        }


        // =============================
        // 2. Get Location
        // =============================

        const location =
            geoData.results[0];


        const latitude =
            location.latitude;

        const longitude =
            location.longitude;


        // =============================
        // 3. Get Weather
        // =============================

        await getWeather(
            latitude,
            longitude
        );


        // =============================
        // 4. Show Location
        // =============================

        cityName.textContent =
            location.name;


        countryName.textContent =
            location.country;


        countryFlag.src =
            `https://flagcdn.com/w40/${location.country_code.toLowerCase()}.png`;

        countryFlag.alt =
            `${location.country} flag`;


        // =============================
        // 5. Show Weather Sections
        // =============================

        weatherCard.classList.remove(
            "hidden"
        );

        forecastSection.classList.remove(
            "hidden"
        );


        // deleting input
        cityInput.value = "";


    } catch (error) {

        console.error(error);

        errorMessage.textContent =
            "Something went wrong. Please try again.";


    } finally {

        setLoading(false);

    }
}


// =============================
// Get Weather
// =============================

async function getWeather(
    latitude,
    longitude
) {

    const weatherResponse =
        await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`
        );


    if (!weatherResponse.ok) {

        throw new Error(
            "Could not get weather data."
        );
    }


    const weatherData =
        await weatherResponse.json();


    console.log(weatherData);


    const current =
        weatherData.current;


    const daily =
        weatherData.daily;


    // =============================
    // Current Temperature
    // =============================

    temperature.textContent =
        `${Math.round(
            current.temperature_2m
        )}°C`;


    // =============================
    // Humidity
    // =============================

    humidity.textContent =
        `${current.relative_humidity_2m}%`;


    // =============================
    // Feels Like
    // =============================

    feelsLike.textContent =
        `${Math.round(
            current.apparent_temperature
        )}°C`;


    // =============================
    // Wind
    // =============================

    wind.textContent =
        `${current.wind_speed_10m} km/h`;


    // =============================
    // Weather Info
    // =============================

    const weatherInfo =
        getWeatherInfo(
            current.weather_code
        );


    weatherIcon.textContent =
        weatherInfo.icon;


    description.textContent =
        weatherInfo.title;


    // =============================
    // Background
    // =============================

    document.body.classList.remove(
        "clear",
        "cloudy",
        "fog",
        "rain",
        "snow",
        "storm",
        "unknown"
    );


    document.body.classList.add(
        weatherInfo.className
    );


    // =============================
    // Forecast
    // =============================

    displayForecast(daily);
}


// =============================
// Display Forecast
// =============================

function displayForecast(daily) {

    //deleting last forecast
    forecastContainer.innerHTML = "";


    // making card for everyday
    for (
        let i = 0;
        i < daily.time.length;
        i++
    ) {

        const date =
            daily.time[i];


        const maxTemp =
            Math.round(
                daily.temperature_2m_max[i]
            );


        const minTemp =
            Math.round(
                daily.temperature_2m_min[i]
            );


        const weatherCode =
            daily.weather_code[i];


        const weatherInfo =
            getWeatherInfo(
                weatherCode
            );


        // =============================
        // Date
        // =============================

        const dateObject =
            new Date(date);


        let dayName;


        if (i === 0) {

            dayName = "Today";

        } else {

            dayName =
                dateObject.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "short"
                    }
                );

        }


        // =============================
        // Create Card
        // =============================

        const forecastCard =
            document.createElement(
                "div"
            );


        forecastCard.className =
            "forecast-card";


        forecastCard.innerHTML = `

            <p class="forecast-day">
                ${dayName}
            </p>

            <div class="forecast-icon">
                ${weatherInfo.icon}
            </div>

            <p class="forecast-temp">

                <span class="max-temp">
                    ${maxTemp}°
                </span>

                <span class="min-temp">
                    ${minTemp}°
                </span>

            </p>

        `;


        forecastContainer.appendChild(
            forecastCard
        );

    }
}


// =============================
// Weather Information
// =============================

function getWeatherInfo(code) {

    // Clear Sky
    if (code === 0) {

        return {
            icon: "☀️",
            title: "Clear Sky",
            className: "clear"
        };

    }


    // Mainly Clear / Partly Cloudy
    if (
        code === 1 ||
        code === 2
    ) {

        return {
            icon: "🌤️",
            title: "Partly Cloudy",
            className: "cloudy"
        };

    }


    // Overcast
    if (code === 3) {

        return {
            icon: "☁️",
            title: "Overcast",
            className: "cloudy"
        };

    }


    // Fog
    if (
        code === 45 ||
        code === 48
    ) {

        return {
            icon: "🌫️",
            title: "Fog",
            className: "fog"
        };

    }


    // Drizzle
    if (
        code >= 51 &&
        code <= 57
    ) {

        return {
            icon: "🌦️",
            title: "Drizzle",
            className: "rain"
        };

    }


    // Rain
    if (
        code >= 61 &&
        code <= 67
    ) {

        return {
            icon: "🌧️",
            title: "Rain",
            className: "rain"
        };

    }


    // Snow
    if (
        code >= 71 &&
        code <= 77
    ) {

        return {
            icon: "❄️",
            title: "Snow",
            className: "snow"
        };

    }


    // Rain Showers
    if (
        code >= 80 &&
        code <= 82
    ) {

        return {
            icon: "🌦️",
            title: "Rain Showers",
            className: "rain"
        };

    }


    // Thunderstorm
    if (code >= 95) {

        return {
            icon: "⛈️",
            title: "Thunderstorm",
            className: "storm"
        };

    }


    // Unknown
    return {
        icon: "🌡️",
        title: "Unknown",
        className: "unknown"
    };
}



// =============================
// Search Button
// =============================

searchBtn.addEventListener(
    "click",
    searchCity
);


// =============================
// Enter Key
// =============================

cityInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            searchCity();

        }

    }
);
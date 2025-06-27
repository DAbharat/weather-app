document.addEventListener("DOMContentLoaded", function () {
  const apiKey = "ADD YOUR API KEY HERE"; // ⚠️ Replace 'ADD YOUR API KEY HERE' with your actual WeatherAPI key before running.

  // Search on button click
  document.getElementById("searchBtn").addEventListener("click", () => {
    const city = document.getElementById("cityInput").value.trim();
    if (city) getWeatherData(city);
  });

  // Clicking Enter
  document.getElementById("cityInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const city = e.target.value.trim();
      if (city) getWeatherData(city);
    }
  });

  const cityInput = document.getElementById("cityInput");
  const suggestionsBox = document.getElementById("suggestions");

  // Handle user typing
  cityInput.addEventListener("input", () => {
    const query = cityInput.value.trim().toLowerCase();
    suggestionsBox.innerHTML = "";

    if (query.length === 0) {
      suggestionsBox.classList.add("hidden");
      return;
    }

    const matched = cityList.filter(city =>
      city.toLowerCase().startsWith(query)
    );

    if (matched.length === 0) {
      suggestionsBox.classList.add("hidden");
      return;
    }

    matched.forEach(city => {
      const li = document.createElement("li");
      li.textContent = city;
      li.className = "cursor-pointer hover:bg-gray-200 px-3 py-1";
      li.addEventListener("click", () => {
        cityInput.value = city;
        suggestionsBox.classList.add("hidden");
        getWeatherData(city);
      });
      suggestionsBox.appendChild(li);
    });

    suggestionsBox.classList.remove("hidden");
  });

  // Hide suggestions when clicking outside
  document.addEventListener("click", (e) => {
    if (!suggestionsBox.contains(e.target) && e.target !== cityInput) {
      suggestionsBox.classList.add("hidden");
    }
  });

  // Battery Status
  navigator.getBattery().then(function (battery) {
    function updateBatteryStatus() {
      const level = Math.round(battery.level * 100);
      const icon = document.getElementById("battery-icon");
      const text = document.getElementById("battery-percentage");

      text.textContent = `${level}%`;

      if (level >= 80) {
        icon.className = "fa-solid fa-battery-full text-white text-[12px]";
      } else if (level >= 60) {
        icon.className = "fa-solid fa-battery-three-quarters text-white text-[12px]";
      } else if (level >= 40) {
        icon.className = "fa-solid fa-battery-half text-white text-[12px]";
      } else if (level >= 20) {
        icon.className = "fa-solid fa-battery-quarter text-white text-[12px]";
      } else {
        icon.className = "fa-solid fa-battery-empty text-red-500 text-[12px]";
      }

      icon.title = battery.charging ? "Charging" : "Not Charging";
    }

    updateBatteryStatus();
    battery.addEventListener("levelchange", updateBatteryStatus);
  });

  // Update Time
  function updateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const formattedTime = `${hours % 12 || 12}:${minutes
      .toString()
      .padStart(2, "0")}${hours >= 12 ? " PM" : " AM"}`;
    document.getElementById("time").textContent = formattedTime;
  }

  updateTime();
  setInterval(updateTime, 60000);

  // Theme toggle (dark/light)
  const toggleBtn = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");

  function updateThemeIcon(isDark) {
    if (isDark) {
      themeIcon.className = "fa-solid fa-moon text-blue-300";
    } else {
      themeIcon.className = "fa-solid fa-sun text-yellow-300";
    }
  }

  toggleBtn.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateThemeIcon(isDark);
  });

  const savedTheme = localStorage.getItem("theme");
  const isDarkMode = savedTheme === "dark";
  if (isDarkMode) {
    document.documentElement.classList.add("dark");
  }
  updateThemeIcon(isDarkMode);

  // Fetch and update weather
  async function getWeatherData(city) {
    try {
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=1&aqi=no&alerts=no`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) throw new Error(data.error.message);

      document.getElementById("location").textContent = data.location.name;
      document.getElementById("temperature").textContent = `${data.current.temp_c}°C`;
      document.getElementById("description").textContent = data.current.condition.text;
      document.getElementById("humidity").textContent = `${data.current.humidity}%`;
      document.getElementById("wind").textContent = `${data.current.wind_kph} km/h`;
      document.getElementById("pressure").textContent = `${data.current.pressure_mb} hPa`;
      document.getElementById("sunrise").textContent = data.forecast.forecastday[0].astro.sunrise;

      const icon = document.getElementById("weatherIcon");
      const isDay = data.current.is_day;
      icon.className = "text-4xl";
      icon.innerHTML = `<img src="https:${data.current.condition.icon}" class="inline w-10 h-10" title="${isDay ? "Day" : "Night"}" />`;

      const hourlyContainer = document.getElementById("hourly-forecast");
      hourlyContainer.innerHTML = "";

      const hoursToShow = [12, 15, 18, 21];
      const forecast = data.forecast.forecastday[0].hour;

      hoursToShow.forEach((h) => {
        const hourData = forecast.find((hr) => new Date(hr.time).getHours() === h);
        if (hourData) {
          const timeLabel = (h % 12 || 12) + (h >= 12 ? "PM" : "AM");
          const div = document.createElement("div");
          div.className = "flex flex-col items-center text-white text-sm";
          div.innerHTML = `
            <div>${timeLabel}</div>
            <img src="https:${hourData.condition.icon}" class="w-6 h-6" />
            <div>${Math.round(hourData.temp_c)}°C</div>
          `;
          hourlyContainer.appendChild(div);
        }
      });
    } catch (err) {
      alert("Error: " + err.message);
      console.error(err);
    }
  }
});

World Weather App

A clean, single-page web application that provides real-time weather information for any city in the world. This app features a responsive, bright yellow theme and connects to the OpenWeatherMap API for live data, all from a single index.html file.

Features

Global Weather Search: Get the current weather for any city or country.

Real-time Data: Fetches live data directly from the OpenWeatherMap API.

Dynamic Weather Card: Displays key information in a clean, readable format:

Temperature (°C) and "Feels Like"

Weather conditions (e.g., "Clear sky", "light rain")

Humidity, Wind Speed, and Atmospheric Pressure

Dynamic weather icon based on conditions.

API Key Management: Securely prompts the user to enter their own API key. The key is stored in-memory for the session and is required for all API requests.

Error Handling: Provides clear user feedback for invalid API keys or "City not found" errors.

Fully Responsive: The clean, single-column layout is designed to work perfectly on both mobile and desktop devices.

Zero Installation: Runs directly in the browser with no build steps or dependencies.

Tech Stack

HTML5

Tailwind CSS (loaded via CDN)

Vanilla JavaScript (ES6+)

OpenWeatherMap API (for weather data)

Setup & Installation

This project is a single index.html file and requires no build step or installation.

Download: Save the index.html file to your local machine.

Open: Open the index.html file in any modern web browser (e.g., Chrome, Firefox, Safari).

How to Use:

Search Location: Enter the name of a city (e.g., "Tokyo", "New York") or country in the main search bar.

Get Weather: Click the "Search" button or press Enter.

View Results: The app will display a loading indicator, followed by the complete weather card for your selected location.

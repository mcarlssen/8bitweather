import Head from 'next/head';
import { useState } from 'react';
import LocationInput from '../components/LocationInput';
import { GlobeHemisphereWest } from 'phosphor-react';
import { OpenMeteoApi } from '../services/openMeteoApi';

export default function Home() {
  // State to store the geocoding suggestions (may be more than one result)
  const [suggestions, setSuggestions] = useState<any[]>([]);
  // State for the current location text (controlled by LocationInput)
  const [location, setLocation] = useState("Enter location");
  // State for weather data from Open-Meteo
  const [weatherData, setWeatherData] = useState<any>(null);

  // This handler now uses the Open-Meteo Geocoding API to get coordinates from the location string.
  const handleLocationChange = async (newLocation: string, isEditing?: boolean) => {
    console.log("New location:", newLocation);
    // Update parent's location state so that the field reflects the latest text.
    setLocation(newLocation);
    // Only fetch suggestions if we're actively editing
    if (!isEditing) {
      setSuggestions([]);
      return;
    }
    const results = await OpenMeteoApi.searchLocations(newLocation);
    setSuggestions(results);
  };

  // Handler when the user clicks on a suggestion.
  const handleSuggestionClick = async (result: any, e: React.MouseEvent) => {
    // Prevent any pending blur events
    e.preventDefault();
    e.stopPropagation();

    console.log(`User selected: ${result.name} (lat: ${result.latitude}, lon: ${result.longitude})`);
    // Clear suggestions after selection.
    setSuggestions([]);
    // Create a full location string to reflect additional data.
    const fullLocation = OpenMeteoApi.formatLocationString(result);
    // Update the parent's location state.
    setLocation(fullLocation);
    // Fetch weather data using the selected location's coordinates.
    const weather = await OpenMeteoApi.getCurrentWeather(result.latitude, result.longitude);
    if (weather) {
      setWeatherData(weather);
    }
  };

  return (
    <>
      <Head>
        <title>Retro Weather Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Retro 8-bit font */}
        <link
          href="https://fonts.googleapis.com/css?family=Press+Start+2P"
          rel="stylesheet"
        />
        {/* Phosphor Icons CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/phosphor-icons@1.4.1/src/css/phosphor.css"
        />
      </Head>
      <div id="app">
        <div id="header">
          <div className="header-title">
            <GlobeHemisphereWest size={32} weight="fill" />
            <h1 className="header-title-text">Check the weather!</h1>
          </div>
          <LocationInput value={location} onLocationChange={handleLocationChange} />
        </div>
        {suggestions.length > 0 && (
          <div id="suggestions">
            <h4>Select a location:</h4>
            {suggestions.map((result, idx) => (
              <div
                key={idx}
                onClick={(e) => handleSuggestionClick(result, e)}
                className="suggestion-item"
              >
                {result.name}{result.admin1 ? `, ${result.admin1}` : ''}{result.country ? `, ${result.country}` : ''}
              </div>
            ))}
          </div>
        )}
        {weatherData && (
          <>
            <div id="weather-display">
              <h2>Current Conditions</h2>
              <div className="current-conditions">
                <p>Temperature: {weatherData.current.temperature_2m}°F</p>
                <p>Wind Speed: {weatherData.current.wind_speed_10m} mph</p>
                <p>Cloud Cover: {weatherData.current.cloud_cover}%</p>
                <p>Precipitation: {weatherData.current.precipitation}" </p>
                <p>As of: {OpenMeteoApi.formatTime(weatherData.current.time)}</p>
              </div>
            </div>

            <div id="weather-grid">
              {/* Show next 4 hours of forecast */}
              {weatherData.hourly.time.slice(0, 4).map((time, index) => (
                <div key={time} className="weather-box">
                  <h4>{OpenMeteoApi.formatTime(time)}</h4>
                  <div className="weather-box-content">
                    <p>{weatherData.hourly.temperature_2m[index]}°F</p>
                    <p>{weatherData.hourly.precipitation_probability[index]}% chance of rain</p>
                    <p>{weatherData.hourly.precipitation[index]}" precipitation</p>
                    <p>{weatherData.hourly.cloud_cover[index]}% clouds</p>
                    <p>{weatherData.hourly.wind_speed_10m[index]} mph wind</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
} 
import Head from 'next/head';
import { useState } from 'react';
import LocationInput from '../components/LocationInput';
import { GlobeHemisphereWest, Thermometer, Wind, CloudSun, Ruler, Percent } from 'phosphor-react';
import { OpenMeteoApi } from '../services/openMeteoApi';
import { WeatherDescriptions } from '../services/weatherDescriptions';

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
            <div className="weather-grid-header">
              <div>Now</div>
              <div>Later</div>
            </div>
            <div id="weather-grid">
              {/* Temperature Card */}
              <div className="weather-box weather-box-temp">
                <div className="weather-box-icon-layer">
                  <Thermometer size={30} weight="fill" className="weather-box-icon" />
                </div>
                <div className="weather-box-content">
                  {(() => {
                    const current = weatherData.current.temperature_2m;
                    const { value: dramatic, description: dramaticDesc, hourOffset } = OpenMeteoApi.findMostDramaticChange(
                      current,
                      weatherData.hourly.temperature_2m,
                      'temperature'
                    );
                    return (
                      <>
                        <div className="weather-value">
                          <p className="description">{WeatherDescriptions.describe('temperature', current)}</p>
                          <p className="numerical">{WeatherDescriptions.formatRawValue('temperature', current)}</p>
                        </div>
                        <div className="later-value">
                          <div className="weather-value">
                            <p className="description">{WeatherDescriptions.describe('temperature', dramatic)}</p>
                            <p className="numerical">{WeatherDescriptions.formatRawValue('temperature', dramatic)}</p>
                          </div>
                          <span className="hour-note">in {hourOffset}h</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
              
              {/* Precipitation Chance Card */}
              <div className="weather-box weather-box-precip">
                <div className="weather-box-icon-layer">
                  <Percent size={30} weight="fill" className="weather-box-icon" />
                </div>
                <div className="weather-box-content">
                  {(() => {
                    const current = weatherData.current.precipitation_probability;
                    const { value: dramatic, description: dramaticDesc, hourOffset } = OpenMeteoApi.findMostDramaticChange(
                      current,
                      weatherData.hourly.precipitation_probability,
                      'precipitationChance'
                    );
                    return (
                      <>
                        <div className="weather-value">
                          <p className="description">{WeatherDescriptions.describe('precipitationChance', current)}</p>
                          <p className="numerical">{WeatherDescriptions.formatRawValue('precipitationChance', current)}</p>
                        </div>
                        <div className="later-value">
                          <div className="weather-value">
                            <p className="description">{WeatherDescriptions.describe('precipitationChance', dramatic)}</p>
                            <p className="numerical">{WeatherDescriptions.formatRawValue('precipitationChance', dramatic)}</p>
                          </div>
                          <span className="hour-note">in {hourOffset}h</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
              
              {/* Total Precipitation Card */}
              <div className="weather-box weather-box-rain">
                <div className="weather-box-icon-layer">
                  <Ruler size={30} weight="fill" className="weather-box-icon" />
                </div>
                <div className="weather-box-content">
                  {(() => {
                    const current = weatherData.current.precipitation;
                    const { value: dramatic, description: dramaticDesc, hourOffset } = OpenMeteoApi.findMostDramaticChange(
                      current,
                      weatherData.hourly.precipitation,
                      'precipitation'
                    );
                    return (
                      <>
                        <div className="weather-value">
                          <p className="description">{WeatherDescriptions.describe('precipitation', current)}</p>
                          <p className="numerical">{WeatherDescriptions.formatRawValue('precipitation', current)}</p>
                        </div>
                        <div className="later-value">
                          <div className="weather-value">
                            <p className="description">{WeatherDescriptions.describe('precipitation', dramatic)}</p>
                            <p className="numerical">{WeatherDescriptions.formatRawValue('precipitation', dramatic)}</p>
                          </div>
                          <span className="hour-note">in {hourOffset}h</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
              
              {/* Cloud Cover Card */}
              <div className="weather-box weather-box-cloud">
                <div className="weather-box-icon-layer">
                  <CloudSun size={30} weight="fill" className="weather-box-icon" />
                </div>
                <div className="weather-box-content">
                  {(() => {
                    const current = weatherData.current.cloud_cover;
                    const { value: dramatic, description: dramaticDesc, hourOffset } = OpenMeteoApi.findMostDramaticChange(
                      current,
                      weatherData.hourly.cloud_cover,
                      'cloudCover'
                    );
                    return (
                      <>
                        <div className="weather-value">
                          <p className="description">{WeatherDescriptions.describe('cloudCover', current)}</p>
                          <p className="numerical">{WeatherDescriptions.formatRawValue('cloudCover', current)}</p>
                        </div>
                        <div className="later-value">
                          <div className="weather-value">
                            <p className="description">{WeatherDescriptions.describe('cloudCover', dramatic)}</p>
                            <p className="numerical">{WeatherDescriptions.formatRawValue('cloudCover', dramatic)}</p>
                          </div>
                          <span className="hour-note">in {hourOffset}h</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
              
              {/* Wind Speed Card */}
              <div className="weather-box weather-box-wind">
                <div className="weather-box-icon-layer">
                  <Wind size={30} weight="fill" className="weather-box-icon" />
                </div>
                <div className="weather-box-content">
                  {(() => {
                    const current = weatherData.current.wind_speed_10m;
                    const { value: dramatic, description: dramaticDesc, hourOffset } = OpenMeteoApi.findMostDramaticChange(
                      current,
                      weatherData.hourly.wind_speed_10m,
                      'windSpeed'
                    );
                    return (
                      <>
                        <div className="weather-value">
                          <p className="description">{WeatherDescriptions.describe('windSpeed', current)}</p>
                          <p className="numerical">{WeatherDescriptions.formatRawValue('windSpeed', current)}</p>
                        </div>
                        <div className="later-value">
                          <div className="weather-value">
                            <p className="description">{WeatherDescriptions.describe('windSpeed', dramatic)}</p>
                            <p className="numerical">{WeatherDescriptions.formatRawValue('windSpeed', dramatic)}</p>
                          </div>
                          <span className="hour-note">in {hourOffset}h</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
} 
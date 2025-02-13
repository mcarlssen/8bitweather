import Head from 'next/head';
import { useState } from 'react';
import LocationInput from '../components/LocationInput';
import HourlyGraph from '../components/HourlyGraph';
import { OpenMeteoApi } from '../services/openMeteoApi';
import { WeatherData } from '../services/openMeteoApi';
import { WeatherDescriptions } from '../services/weatherDescriptions';
import { Analytics } from "@vercel/analytics/react"

interface Suggestion {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
}

export default function Home() {
  // State to store the geocoding suggestions (may be more than one result)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  // State for the current location text (controlled by LocationInput)
  const [location, setLocation] = useState("Enter location");
  // State for weather data from Open-Meteo
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  // This handler now uses the Open-Meteo Geocoding API to get coordinates from the location string.
  const handleLocationChange = async (newLocation: string, isEditing?: boolean) => {
    console.log("New location:", newLocation);
    setLocation(newLocation);
    
    if (!isEditing) {
      setSuggestions([]);
      return;
    }
    const results = await OpenMeteoApi.searchLocations(newLocation);
    setSuggestions(results);
  };

  // Handler when the user clicks on a suggestion.
  const handleSuggestionClick = async (result: Suggestion, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log(`User selected: ${result.name} (lat: ${result.latitude}, lon: ${result.longitude})`);
    setSuggestions([]);
    const fullLocation = OpenMeteoApi.formatLocationString(result);
    setLocation(fullLocation);
    // Force blur the input to prevent further edits
    (document.activeElement as HTMLElement)?.blur();
    
    const weather = await OpenMeteoApi.getCurrentWeather(result.latitude, result.longitude);
    if (weather) {
      setWeatherData(weather);
    }
  };

  const handleCardFlip = (cardId: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  return (
    <>
      <Head>
        <title>8-Bit Weather</title>
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
      <Analytics />
      <div id="app">
        <div id="header">
          <div className="header-title">
            <div className="header-globe"></div>
            <h1 className="header-title-text">8-Bit Weather!</h1>
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
              <div>Next 12 hours</div>
            </div>
            <div id="weather-grid">
              {/* Temperature Card */}
              <div 
                className={`weather-box weather-box-temp ${flippedCards['temp'] ? 'flipped' : ''}`}
                onClick={() => handleCardFlip('temp')}
              >
                <div className="weather-box-inner">
                  <div className="weather-box-front">
                    <div className="weather-box-icon-layer">
                      <img src="https://unpkg.com/pixelarticons@1.8.1/svg/ac.svg" className="weather-box-icon" alt="temperature"/>
                    </div>
                    <div className="weather-box-content">
                      {(() => {
                        const current = weatherData.current.temperature_2m;
                        const { value: dramatic, hourOffset } = OpenMeteoApi.findMostDramaticChange(
                          current,
                          weatherData.hourly.temperature_2m,
                          12,
                          'temperature'
                        );
                        return (
                          <>
                            <div className="weather-value">
                              <p className="numerical">{WeatherDescriptions.formatRawValue('temperature', current)}</p>
                              <p className="description">{WeatherDescriptions.describe('temperature', current)}</p>
                            </div>
                            <div className="later-value">
                              <div className="weather-value">
                                <p className="numerical">
                                  {WeatherDescriptions.formatRawValue('temperature', dramatic)}
                                  <span className="hour-note">in {hourOffset}h</span>
                                </p>
                                <p className="description">{WeatherDescriptions.describe('temperature', dramatic)}</p>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="weather-box-back">
                    <HourlyGraph
                      currentValue={weatherData.current.temperature_2m}
                      hourlyValues={weatherData.hourly.temperature_2m.slice(0, 12)}
                      hourlyTimes={weatherData.hourly.time.slice(0, 12)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Precipitation Chance Card */}
              <div 
                className={`weather-box weather-box-precip ${flippedCards['precip'] ? 'flipped' : ''}`}
                onClick={() => handleCardFlip('precip')}
              >
                <div className="weather-box-inner">
                  <div className="weather-box-front">
                    <div className="weather-box-icon-layer">
                      <img src="https://unpkg.com/pixelarticons@1.8.1/svg/percent.svg" className="weather-box-icon" alt="precipitation chance"/>
                    </div>
                    <div className="weather-box-content">
                      {(() => {
                        const current = weatherData.current.precipitation_probability;
                        const { value: dramatic, hourOffset } = OpenMeteoApi.findMostDramaticChange(
                          current,
                          weatherData.hourly.precipitation_probability,
                          12,
                          'precipitationChance'
                        );
                        return (
                          <>
                            <div className="weather-value">
                              <p className="numerical">{WeatherDescriptions.formatRawValue('precipitationChance', current)}</p>
                              <p className="description">{WeatherDescriptions.describe('precipitationChance', current)}</p>
                            </div>
                            <div className="later-value">
                              <div className="weather-value">
                                <p className="numerical">
                                  {WeatherDescriptions.formatRawValue('precipitationChance', dramatic)}
                                  <span className="hour-note">in {hourOffset}h</span>
                                </p>
                                <p className="description">{WeatherDescriptions.describe('precipitationChance', dramatic)}</p>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="weather-box-back">
                    <HourlyGraph
                      currentValue={weatherData.current.precipitation_probability}
                      hourlyValues={weatherData.hourly.precipitation_probability.slice(0, 12)}
                      hourlyTimes={weatherData.hourly.time.slice(0, 12)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Total Precipitation Card */}
              <div 
                className={`weather-box weather-box-rain ${flippedCards['rain'] ? 'flipped' : ''}`}
                onClick={() => handleCardFlip('rain')}
              >
                <div className="weather-box-inner">
                  <div className="weather-box-front">
                    <div className="weather-box-icon-layer">
                      <img src="https://unpkg.com/pixelarticons@1.8.1/svg/drop-half.svg" className="weather-box-icon" alt="precipitation"/>
                    </div>
                    <div className="weather-box-content">
                      {(() => {
                        const current = weatherData.current.precipitation;
                        const { value: dramatic, hourOffset } = OpenMeteoApi.findMostDramaticChange(
                          current,
                          weatherData.hourly.precipitation,
                          12,
                          'precipitation'
                        );
                        return (
                          <>
                            <div className="weather-value">
                              <p className="numerical">{WeatherDescriptions.formatRawValue('precipitation', current)}</p>
                              <p className="description">{WeatherDescriptions.describe('precipitation', current)}</p>
                            </div>
                            <div className="later-value">
                              <div className="weather-value">
                                <p className="numerical">
                                  {WeatherDescriptions.formatRawValue('precipitation', dramatic)}
                                  <span className="hour-note">in {hourOffset}h</span>
                                </p>
                                <p className="description">{WeatherDescriptions.describe('precipitation', dramatic)}</p>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="weather-box-back">
                    <HourlyGraph
                      currentValue={weatherData.current.precipitation}
                      hourlyValues={weatherData.hourly.precipitation.slice(0, 12)}
                      hourlyTimes={weatherData.hourly.time.slice(0, 12)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Cloud Cover Card */}
              <div 
                className={`weather-box weather-box-cloud ${flippedCards['cloud'] ? 'flipped' : ''}`}
                onClick={() => handleCardFlip('cloud')}
              >
                <div className="weather-box-inner">
                  <div className="weather-box-front">
                    <div className="weather-box-icon-layer">
                      <img src="https://unpkg.com/pixelarticons@1.8.1/svg/cloud-sun.svg" className="weather-box-icon" alt="cloud cover"/>
                    </div>
                    <div className="weather-box-content">
                      {(() => {
                        const current = weatherData.current.cloud_cover;
                        const { value: dramatic, hourOffset } = OpenMeteoApi.findMostDramaticChange(
                          current,
                          weatherData.hourly.cloud_cover,
                          12,
                          'cloudCover'
                        );
                        return (
                          <>
                            <div className="weather-value">
                              <p className="numerical">{WeatherDescriptions.formatRawValue('cloudCover', current)}</p>
                              <p className="description">{WeatherDescriptions.describe('cloudCover', current)}</p>
                            </div>
                            <div className="later-value">
                              <div className="weather-value">
                                <p className="numerical">
                                  {WeatherDescriptions.formatRawValue('cloudCover', dramatic)}
                                  <span className="hour-note">in {hourOffset}h</span>
                                </p>
                                <p className="description">{WeatherDescriptions.describe('cloudCover', dramatic)}</p>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="weather-box-back">
                    <HourlyGraph
                      currentValue={weatherData.current.cloud_cover}
                      hourlyValues={weatherData.hourly.cloud_cover.slice(0, 12)}
                      hourlyTimes={weatherData.hourly.time.slice(0, 12)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Wind Speed Card */}
              <div 
                className={`weather-box weather-box-wind ${flippedCards['wind'] ? 'flipped' : ''}`}
                onClick={() => handleCardFlip('wind')}
              >
                <div className="weather-box-inner">
                  <div className="weather-box-front">
                    <div className="weather-box-icon-layer">
                      <img src="https://unpkg.com/pixelarticons@1.8.1/svg/wind.svg" className="weather-box-icon" alt="wind speed"/>
                    </div>
                    <div className="weather-box-content">
                      {(() => {
                        const current = weatherData.current.wind_speed_10m;
                        const { value: dramatic, hourOffset } = OpenMeteoApi.findMostDramaticChange(
                          current,
                          weatherData.hourly.wind_speed_10m,
                          12,
                          'windSpeed'
                        );
                        return (
                          <>
                            <div className="weather-value">
                              <p className="numerical">{WeatherDescriptions.formatRawValue('windSpeed', current)}</p>
                              <p className="description">{WeatherDescriptions.describe('windSpeed', current)}</p>
                            </div>
                            <div className="later-value">
                              <div className="weather-value">
                                <p className="numerical">
                                  {WeatherDescriptions.formatRawValue('windSpeed', dramatic)}
                                  <span className="hour-note">in {hourOffset}h</span>
                                </p>
                                <p className="description">{WeatherDescriptions.describe('windSpeed', dramatic)}</p>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="weather-box-back">
                    <HourlyGraph
                      currentValue={weatherData.current.wind_speed_10m}
                      hourlyValues={weatherData.hourly.wind_speed_10m.slice(0, 12)}
                      hourlyTimes={weatherData.hourly.time.slice(0, 12)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {weatherData && (
        <div className="debug-controls">
          <div
            className="debug-api-button" 
            onClick={() => {
              const url = OpenMeteoApi.getLastRequestUrl();
              console.log('API URL:', url);
              navigator.clipboard.writeText(url);
            }}
            title="Copy API URL"
          >
            <img src="https://unpkg.com/pixelarticons@1.8.1/svg/sync.svg" className="debug-icon" alt="copy API URL"/>
          </div>
          <div
            className="debug-api-button"
            onClick={async () => {
              const weather = await OpenMeteoApi.refreshWeather();
              if (weather) {
                setWeatherData(weather);
              }
            }}
            title="Refresh Weather Data"
          >
            <img src="https://unpkg.com/pixelarticons@1.8.1/svg/loader.svg" className="debug-icon" alt="refresh weather"/>
          </div>
        </div>
      )}
    </>
  );
} 
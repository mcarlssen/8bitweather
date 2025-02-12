import { WeatherDescriptions } from './weatherDescriptions';
import { WeatherMetric } from '../types/weather';

interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
}

interface CurrentWeather {
  time: string;
  temperature_2m: number;
  precipitation: number;
  cloud_cover: number;
  wind_speed_10m: number;
  precipitation_probability: number;
}

interface HourlyWeather {
  time: string[];
  temperature_2m: number[];
  precipitation_probability: number[];
  precipitation: number[];
  cloud_cover: number[];
  wind_speed_10m: number[];
  temperature_80m: number[];
}

interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyWeather;
  timezone: string;
  timezone_abbreviation: string;
  latitude: number;
  longitude: number;
}

interface WeatherDescription {
  raw: string;
  description: string;
}

export class OpenMeteoApi {
  private static readonly GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1';
  private static readonly WEATHER_BASE_URL = 'https://api.open-meteo.com/v1';

  /**
   * Search for locations matching the given search term
   */
  static async searchLocations(searchTerm: string): Promise<GeocodingResult[]> {
    try {
      const response = await fetch(
        `${this.GEOCODING_BASE_URL}/search?name=${encodeURIComponent(searchTerm)}`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding API request failed');
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error searching locations:', error);
      return [];
    }
  }

  /**
   * Get current weather data for the specified coordinates
   */
  static async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData | null> {
    try {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        current: ['temperature_2m', 'precipitation', 'cloud_cover', 'wind_speed_10m', 'precipitation_probability'].join(','),
        hourly: [
          'temperature_2m',
          'precipitation_probability',
          'precipitation',
          'cloud_cover',
          'wind_speed_10m',
          'temperature_80m'
        ].join(','),
        temperature_unit: 'fahrenheit',
        wind_speed_unit: 'mph',
        precipitation_unit: 'inch',
        timezone: 'auto',
        forecast_days: '1',
        forecast_hours: '12'
      });

      const response = await fetch(
        `${this.WEATHER_BASE_URL}/forecast?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Weather API request failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  }

  /**
   * Format a location result into a display string
   */
  static formatLocationString(result: GeocodingResult): string {
    return `${result.name}${result.admin1 ? `, ${result.admin1}` : ''}${result.country ? `, ${result.country}` : ''}`;
  }

  /**
   * Helper function to format a timestamp into a readable time string
   */
  static formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Find the most dramatic change in a weather metric over the next 12 hours
   */
  static findMostDramaticChange(
    currentValue: number,
    hourlyValues: number[],
    firstNHours: number = 12,
    metric: WeatherMetric
  ): { value: number; hourOffset: number } {
    const relevantValues = hourlyValues.slice(0, firstNHours);
    let maxDelta = 0;
    let mostDramaticValue = currentValue;
    let hourOffset = 0;
    
    relevantValues.forEach((value, index) => {
      const delta = Math.abs(value - currentValue);
      if (delta > maxDelta) {
        maxDelta = delta;
        mostDramaticValue = value;
        hourOffset = index + 1;
      }
    });
    
    return {
      value: mostDramaticValue,
      hourOffset,
    };
  }
} 
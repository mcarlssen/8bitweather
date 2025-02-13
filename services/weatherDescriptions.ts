import { WeatherDescriptor, WeatherMetric, WeatherRange } from '../types/weather';

export class WeatherDescriptions {
  private static descriptors: Record<WeatherMetric, WeatherDescriptor> = {
    temperature: {
      unit: '°F',
      defaultDescription: 'moderate temperature',
      ranges: [
        { min: -100, max: 0, descriptions: ['Stay inside!', 'Ice cold, stay warm!'] },
        { min: 0, max: 32, descriptions: ['Wear a winter coat!', 'Bundle up, it\'s freezing!'] },
        { min: 32, max: 50, descriptions: ['Chilly, wear a jacket!', 'Cold, wear a coat!'] },
        { min: 50, max: 60, descriptions: ['Cool, wear a sweater!', 'Cool, grab a hoodie!'] },
        { min: 60, max: 70, descriptions: ['Nice and comfy!', 'Pleasant, enjoy the day!'] },
        { min: 70, max: 80, descriptions: ['Perfect for playing!', 'Warm, perfect for fun!'] },
        { min: 80, max: 90, descriptions: ['Hot, drink water!', 'Hot, stay hydrated!'] },
        { min: 90, max: 150, descriptions: ['Too hot, stay cool!', 'Scorching, find shade!'] }
      ]
    },
    windSpeed: {
      unit: 'mph',
      defaultDescription: 'calm air',
      ranges: [
        { min: 0, max: 5, descriptions: ['Gentle breeze', 'Barely a breeze'] },
        { min: 5, max: 15, descriptions: ['Windy, hold your hat!', 'Windy, hold tight!'] },
        { min: 15, max: 30, descriptions: ['Loud wind', 'Strong wind, be cautious!'] },
        { min: 30, max: 45, descriptions: ['Very windy, be careful!', 'Very windy, stay safe!'] },
        { min: 45, max: 100, descriptions: ['Go to the basement!', 'Stormy, stay indoors!'] }
      ]
    },
    precipitationChance: {
      unit: '%',
      defaultDescription: 'no chance of rain',
      ranges: [
        { min: 0, max: 10, descriptions: ['No rain, play outside!', 'No rain, have fun!'] },
        { min: 10, max: 30, descriptions: ['Maybe rain, check sky!', 'Might rain, keep an eye!'] },
        { min: 30, max: 50, descriptions: ['Possible rain, watch out!', 'Rain possible, be ready!'] },
        { min: 50, max: 70, descriptions: ['Better take an umbrella!', 'Rain likely, take cover!'] },
        { min: 70, max: 90, descriptions: ['Rain likely, stay dry!', 'Rain expected, stay dry!'] },
        { min: 90, max: 100, descriptions: ['Rain for sure, stay inside!', 'Rain certain, stay inside!'] }
      ]
    },
    precipitation: {
      unit: '"',
      defaultDescription: 'no rain',
      ranges: [
        { min: 0, max: 0.1, descriptions: ['Just a drip', 'Tiny drizzle'] },
        { min: 0.1, max: 0.3, descriptions: ['Light rain, wear boots!', 'Light rain, wear boots!'] },
        { min: 0.3, max: 0.5, descriptions: ['Rainy, wear a raincoat!', 'Rainy, need a coat!'] },
        { min: 0.5, max: 1, descriptions: ['Heavy rain, stay dry!', 'Heavy rain, stay dry!'] },
        { min: 1, max: 10, descriptions: ['Flooding, stay safe!', 'Flooding, stay safe!'] }
      ]
    },
    cloudCover: {
      unit: '%',
      defaultDescription: 'bleh',
      ranges: [
        { min: 0, max: 10, descriptions: ['Very sunny!', 'You\'ll need sunglasses!'] },
        { min: 10, max: 30, descriptions: ['A few clouds, still sunny!', 'Mostly sunny, few clouds!'] },
        { min: 30, max: 50, descriptions: ['Partly cloudy, nice day!', 'Partly cloudy, nice day!'] },
        { min: 50, max: 70, descriptions: ['Mostly cloudy, less sun!', 'Mostly cloudy, less sun!'] },
        { min: 70, max: 90, descriptions: ['Cloudy, no sun!', 'Just a peek of sun'] },
        { min: 90, max: 100, descriptions: ['Overcast, gray sky!', 'A real London Souper', 'Completely cloudy'] }
      ]
    }
  };

  /**
   * Get a description for a weather value
   */
  static describe(metric: WeatherMetric, value: number): string {
    const descriptor = this.descriptors[metric];
    if (!descriptor) return `${value}`;

    // Find all matching ranges
    const matchingRanges = descriptor.ranges.filter(r => value >= r.min && value <= r.max);
    
    if (matchingRanges.length === 0) return descriptor.defaultDescription;
    
    // If we have multiple matching ranges, weight them by their weight property (default 1)
    const totalWeight = matchingRanges.reduce((sum, r) => sum + (r.weight || 1), 0);
    const randomValue = Math.random() * totalWeight;
    
    let currentWeight = 0;
    const selectedRange = matchingRanges.find(r => {
      currentWeight += r.weight || 1;
      return randomValue <= currentWeight;
    }) || matchingRanges[0];
    
    // Randomly select one of the descriptions from the chosen range
    const descriptions = selectedRange.descriptions;
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  /**
   * Add a new range to a weather metric
   */
  static addRange(metric: WeatherMetric, range: WeatherRange): void {
    if (!this.descriptors[metric]) {
      throw new Error(`Unknown weather metric: ${metric}`);
    }
    this.descriptors[metric].ranges.push(range);
    // Sort ranges by min value to ensure proper matching
    this.descriptors[metric].ranges.sort((a, b) => a.min - b.min);
  }

  /**
   * Get the raw value with its unit
   */
  static formatRawValue(metric: WeatherMetric, value: number): string {
    const descriptor = this.descriptors[metric];
    return descriptor ? `${value}${descriptor.unit}` : `${value}`;
  }
} 
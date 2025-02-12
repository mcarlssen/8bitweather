export interface WeatherRange {
  min: number;
  max: number;
  descriptions: string[];
  weight?: number;
}

export interface WeatherDescriptor {
  ranges: WeatherRange[];
  unit: string;
  defaultDescription: string;
}

export type WeatherMetric = 'temperature' | 'windSpeed' | 'precipitation' | 'cloudCover' | 'precipitationChance'; 
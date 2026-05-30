export interface StylePassportLandmark {
  name: string;
  country: string;
  lat: number;
  lon: number;
  aliases?: readonly string[];
  featured?: boolean;
}

export const STYLE_PASSPORT_LANDMARKS: readonly StylePassportLandmark[] = [
  // Original fashion-capital labels stay featured so the world map does not
  // become unreadable after adding the larger landmark catalog.
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, featured: true },
  { name: 'Milan', country: 'Italy', lat: 45.4654, lon: 9.1859, featured: true },
  { name: 'New York', country: 'US', lat: 40.7128, lon: -74.0060, aliases: ['New York City', 'NYC'], featured: true },
  { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278, featured: true },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, featured: true },

  // North America
  { name: 'Los Angeles', country: 'US', lat: 34.0522, lon: -118.2437, aliases: ['LA'] },
  { name: 'San Francisco', country: 'US', lat: 37.7749, lon: -122.4194, aliases: ['SF'] },
  { name: 'Seattle', country: 'US', lat: 47.6062, lon: -122.3321 },
  { name: 'Portland', country: 'US', lat: 45.5152, lon: -122.6784 },
  { name: 'Chicago', country: 'US', lat: 41.8781, lon: -87.6298 },
  { name: 'Miami', country: 'US', lat: 25.7617, lon: -80.1918 },
  { name: 'Atlanta', country: 'US', lat: 33.7490, lon: -84.3880 },
  { name: 'Dallas', country: 'US', lat: 32.7767, lon: -96.7970 },
  { name: 'Austin', country: 'US', lat: 30.2672, lon: -97.7431 },
  { name: 'Houston', country: 'US', lat: 29.7604, lon: -95.3698 },
  { name: 'Washington, DC', country: 'US', lat: 38.9072, lon: -77.0369, aliases: ['Washington', 'Washington DC'] },
  { name: 'Boston', country: 'US', lat: 42.3601, lon: -71.0589 },
  { name: 'Philadelphia', country: 'US', lat: 39.9526, lon: -75.1652 },
  { name: 'Nashville', country: 'US', lat: 36.1627, lon: -86.7816 },
  { name: 'New Orleans', country: 'US', lat: 29.9511, lon: -90.0715 },
  { name: 'Las Vegas', country: 'US', lat: 36.1699, lon: -115.1398 },
  { name: 'Phoenix', country: 'US', lat: 33.4484, lon: -112.0740 },
  { name: 'Denver', country: 'US', lat: 39.7392, lon: -104.9903 },
  { name: 'Minneapolis', country: 'US', lat: 44.9778, lon: -93.2650 },
  { name: 'Detroit', country: 'US', lat: 42.3314, lon: -83.0458 },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832 },
  { name: 'Montreal', country: 'Canada', lat: 45.5017, lon: -73.5673 },
  { name: 'Vancouver', country: 'Canada', lat: 49.2827, lon: -123.1207 },
  { name: 'Calgary', country: 'Canada', lat: 51.0447, lon: -114.0719 },
  { name: 'Ottawa', country: 'Canada', lat: 45.4215, lon: -75.6972 },
  { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lon: -99.1332, aliases: ['CDMX'] },
  { name: 'Guadalajara', country: 'Mexico', lat: 20.6597, lon: -103.3496 },
  { name: 'Monterrey', country: 'Mexico', lat: 25.6866, lon: -100.3161 },
  { name: 'San Juan', country: 'Puerto Rico', lat: 18.4655, lon: -66.1057 },
  { name: 'Havana', country: 'Cuba', lat: 23.1136, lon: -82.3666 },
  { name: 'Panama City', country: 'Panama', lat: 8.9824, lon: -79.5199 },
  { name: 'San Jose', country: 'Costa Rica', lat: 9.9281, lon: -84.0907 },
  { name: 'Santo Domingo', country: 'Dominican Republic', lat: 18.4861, lon: -69.9312 },

  // South America
  { name: 'Sao Paulo', country: 'Brazil', lat: -23.5558, lon: -46.6396 },
  { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lon: -43.1729, aliases: ['Rio'] },
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lon: -58.3816 },
  { name: 'Santiago', country: 'Chile', lat: -33.4489, lon: -70.6693 },
  { name: 'Lima', country: 'Peru', lat: -12.0464, lon: -77.0428 },
  { name: 'Bogota', country: 'Colombia', lat: 4.7110, lon: -74.0721 },
  { name: 'Medellin', country: 'Colombia', lat: 6.2442, lon: -75.5812 },
  { name: 'Quito', country: 'Ecuador', lat: -0.1807, lon: -78.4678 },
  { name: 'Guayaquil', country: 'Ecuador', lat: -2.1894, lon: -79.8891 },
  { name: 'Montevideo', country: 'Uruguay', lat: -34.9011, lon: -56.1645 },
  { name: 'Asuncion', country: 'Paraguay', lat: -25.2637, lon: -57.5759 },
  { name: 'La Paz', country: 'Bolivia', lat: -16.4897, lon: -68.1193 },

  // Europe
  { name: 'Madrid', country: 'Spain', lat: 40.4168, lon: -3.7038 },
  { name: 'Barcelona', country: 'Spain', lat: 41.3874, lon: 2.1686 },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964 },
  { name: 'Florence', country: 'Italy', lat: 43.7696, lon: 11.2558 },
  { name: 'Venice', country: 'Italy', lat: 45.4408, lon: 12.3155 },
  { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lon: 4.9041 },
  { name: 'Copenhagen', country: 'Denmark', lat: 55.6761, lon: 12.5683 },
  { name: 'Stockholm', country: 'Sweden', lat: 59.3293, lon: 18.0686 },
  { name: 'Oslo', country: 'Norway', lat: 59.9139, lon: 10.7522 },
  { name: 'Helsinki', country: 'Finland', lat: 60.1699, lon: 24.9384 },
  { name: 'Reykjavik', country: 'Iceland', lat: 64.1466, lon: -21.9426 },
  { name: 'Lisbon', country: 'Portugal', lat: 38.7223, lon: -9.1393 },
  { name: 'Porto', country: 'Portugal', lat: 41.1579, lon: -8.6291 },
  { name: 'Brussels', country: 'Belgium', lat: 50.8503, lon: 4.3517 },
  { name: 'Antwerp', country: 'Belgium', lat: 51.2194, lon: 4.4025 },
  { name: 'Zurich', country: 'Switzerland', lat: 47.3769, lon: 8.5417, aliases: ['Zuerich'] },
  { name: 'Geneva', country: 'Switzerland', lat: 46.2044, lon: 6.1432 },
  { name: 'Vienna', country: 'Austria', lat: 48.2082, lon: 16.3738 },
  { name: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050 },
  { name: 'Munich', country: 'Germany', lat: 48.1351, lon: 11.5820, aliases: ['Muenchen'] },
  { name: 'Hamburg', country: 'Germany', lat: 53.5511, lon: 9.9937 },
  { name: 'Prague', country: 'Czechia', lat: 50.0755, lon: 14.4378 },
  { name: 'Warsaw', country: 'Poland', lat: 52.2297, lon: 21.0122 },
  { name: 'Budapest', country: 'Hungary', lat: 47.4979, lon: 19.0402 },
  { name: 'Athens', country: 'Greece', lat: 37.9838, lon: 23.7275 },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784 },
  { name: 'Dublin', country: 'Ireland', lat: 53.3498, lon: -6.2603 },
  { name: 'Edinburgh', country: 'UK', lat: 55.9533, lon: -3.1883 },
  { name: 'Manchester', country: 'UK', lat: 53.4808, lon: -2.2426 },
  { name: 'Glasgow', country: 'UK', lat: 55.8642, lon: -4.2518 },
  { name: 'Lyon', country: 'France', lat: 45.7640, lon: 4.8357 },
  { name: 'Marseille', country: 'France', lat: 43.2965, lon: 5.3698 },

  // Africa
  { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lon: 3.3792 },
  { name: 'Accra', country: 'Ghana', lat: 5.6037, lon: -0.1870 },
  { name: 'Dakar', country: 'Senegal', lat: 14.7167, lon: -17.4677 },
  { name: 'Abidjan', country: 'Cote d Ivoire', lat: 5.3600, lon: -4.0083 },
  { name: 'Nairobi', country: 'Kenya', lat: -1.2921, lon: 36.8219 },
  { name: 'Addis Ababa', country: 'Ethiopia', lat: 8.9806, lon: 38.7578 },
  { name: 'Kigali', country: 'Rwanda', lat: -1.9441, lon: 30.0619 },
  { name: 'Cape Town', country: 'South Africa', lat: -33.9249, lon: 18.4241 },
  { name: 'Johannesburg', country: 'South Africa', lat: -26.2041, lon: 28.0473 },
  { name: 'Durban', country: 'South Africa', lat: -29.8587, lon: 31.0218 },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357 },
  { name: 'Casablanca', country: 'Morocco', lat: 33.5731, lon: -7.5898 },
  { name: 'Marrakech', country: 'Morocco', lat: 31.6295, lon: -7.9811 },
  { name: 'Tunis', country: 'Tunisia', lat: 36.8065, lon: 10.1815 },
  { name: 'Algiers', country: 'Algeria', lat: 36.7538, lon: 3.0588 },

  // Middle East
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708 },
  { name: 'Abu Dhabi', country: 'UAE', lat: 24.4539, lon: 54.3773 },
  { name: 'Doha', country: 'Qatar', lat: 25.2854, lon: 51.5310 },
  { name: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lon: 46.6753 },
  { name: 'Jeddah', country: 'Saudi Arabia', lat: 21.4858, lon: 39.1925 },
  { name: 'Tel Aviv', country: 'Israel', lat: 32.0853, lon: 34.7818 },
  { name: 'Jerusalem', country: 'Israel', lat: 31.7683, lon: 35.2137 },
  { name: 'Beirut', country: 'Lebanon', lat: 33.8938, lon: 35.5018 },
  { name: 'Amman', country: 'Jordan', lat: 31.9539, lon: 35.9106 },
  { name: 'Kuwait City', country: 'Kuwait', lat: 29.3759, lon: 47.9774 },

  // Asia
  { name: 'Osaka', country: 'Japan', lat: 34.6937, lon: 135.5023 },
  { name: 'Kyoto', country: 'Japan', lat: 35.0116, lon: 135.7681 },
  { name: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.9780 },
  { name: 'Busan', country: 'South Korea', lat: 35.1796, lon: 129.0756 },
  { name: 'Shanghai', country: 'China', lat: 31.2304, lon: 121.4737 },
  { name: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074 },
  { name: 'Shenzhen', country: 'China', lat: 22.5431, lon: 114.0579 },
  { name: 'Guangzhou', country: 'China', lat: 23.1291, lon: 113.2644 },
  { name: 'Hong Kong', country: 'Hong Kong', lat: 22.3193, lon: 114.1694, aliases: ['HK'] },
  { name: 'Taipei', country: 'Taiwan', lat: 25.0330, lon: 121.5654 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018 },
  { name: 'Manila', country: 'Philippines', lat: 14.5995, lon: 120.9842 },
  { name: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.8231, lon: 106.6297, aliases: ['Saigon'] },
  { name: 'Hanoi', country: 'Vietnam', lat: 21.0278, lon: 105.8342 },
  { name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.1390, lon: 101.6869, aliases: ['KL'] },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lon: 106.8456 },
  { name: 'Denpasar', country: 'Indonesia', lat: -8.6705, lon: 115.2126, aliases: ['Bali'] },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777, aliases: ['Bombay'] },
  { name: 'Delhi', country: 'India', lat: 28.7041, lon: 77.1025, aliases: ['New Delhi'] },
  { name: 'Bengaluru', country: 'India', lat: 12.9716, lon: 77.5946, aliases: ['Bangalore'] },
  { name: 'Chennai', country: 'India', lat: 13.0827, lon: 80.2707, aliases: ['Madras'] },
  { name: 'Kolkata', country: 'India', lat: 22.5726, lon: 88.3639, aliases: ['Calcutta'] },
  { name: 'Hyderabad', country: 'India', lat: 17.3850, lon: 78.4867 },
  { name: 'Karachi', country: 'Pakistan', lat: 24.8607, lon: 67.0011 },
  { name: 'Lahore', country: 'Pakistan', lat: 31.5204, lon: 74.3587 },
  { name: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lon: 90.4125 },
  { name: 'Colombo', country: 'Sri Lanka', lat: 6.9271, lon: 79.8612 },
  { name: 'Kathmandu', country: 'Nepal', lat: 27.7172, lon: 85.3240 },

  // Oceania and Pacific
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
  { name: 'Melbourne', country: 'Australia', lat: -37.8136, lon: 144.9631 },
  { name: 'Brisbane', country: 'Australia', lat: -27.4698, lon: 153.0251 },
  { name: 'Perth', country: 'Australia', lat: -31.9505, lon: 115.8605 },
  { name: 'Auckland', country: 'New Zealand', lat: -36.8509, lon: 174.7645 },
  { name: 'Wellington', country: 'New Zealand', lat: -41.2865, lon: 174.7762 },
  { name: 'Christchurch', country: 'New Zealand', lat: -43.5321, lon: 172.6362 },
  { name: 'Honolulu', country: 'US', lat: 21.3099, lon: -157.8581 },
] as const;

export const FASHION_CAPITALS = STYLE_PASSPORT_LANDMARKS;

function normalizeCityName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function namesForLandmark(landmark: StylePassportLandmark): string[] {
  return [landmark.name, ...(landmark.aliases ?? [])].map(normalizeCityName);
}

function cityMatchesLandmark(city: string, landmark: StylePassportLandmark): boolean {
  const normalizedCity = normalizeCityName(city);
  if (!normalizedCity) return false;

  return namesForLandmark(landmark).some(name => {
    if (name.length < 4) return normalizedCity === name;
    return normalizedCity === name || normalizedCity.includes(name);
  });
}

export const FASHION_CAPITAL_NAMES: string[] = STYLE_PASSPORT_LANDMARKS
  .flatMap(landmark => [landmark.name, ...(landmark.aliases ?? [])])
  .map(normalizeCityName);

export function getStylePassportLandmark(city: string): StylePassportLandmark | null {
  return STYLE_PASSPORT_LANDMARKS.find(landmark => cityMatchesLandmark(city, landmark)) ?? null;
}

export function isStylePassportLandmark(city: string): boolean {
  return getStylePassportLandmark(city) != null;
}

export function getFashionCapitalMatch(city: string): StylePassportLandmark | null {
  return getStylePassportLandmark(city);
}

export function isFashionCapital(city: string): boolean {
  return isStylePassportLandmark(city);
}

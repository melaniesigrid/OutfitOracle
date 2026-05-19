export interface ClimatePersonality {
  label: string;
}

export function getClimatePersonality(humidity: number, windSpeed: number): string {
  if (humidity > 75 && windSpeed > 25) return 'Tempestuous. Dress for the drama.';
  if (humidity > 75 && windSpeed <= 25) return 'Humid and still. Breathable fabrics only.';
  if (humidity <= 40 && windSpeed > 25) return 'Dry and gusty. Layers anchor everything.';
  if (humidity <= 40 && windSpeed <= 25) return 'Crisp and arid. The desert-editorial sweet spot.';
  if (windSpeed > 30) return 'Notoriously blustery. The Oracle advises anchoring.';
  return 'Notoriously unpredictable. Consult before every outing.';
}

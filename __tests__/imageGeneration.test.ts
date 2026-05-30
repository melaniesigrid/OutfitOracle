import { buildImagePrompt, buildSketchPrompt } from '../src/services/imageGeneration';
import { OracleVerdict } from '../src/services/oracle';
import { WeatherData } from '../src/services/weather';

const WEATHER: WeatherData = {
  city: 'Toronto',
  country: 'CA',
  temp: 24,
  feelsLike: 26,
  humidity: 58,
  windSpeed: 12,
  conditionCode: 0,
  conditionLabel: 'Clear',
  conditionIcon: 'weather-sunny',
  description: 'Crystal clear skies',
  uvIndex: 7,
};

const VERDICT: OracleVerdict = {
  verdict: 'Warm, clear, and socially dangerous.',
  vibe: 'Rooftop Gallery Errand',
  rating: 3,
  outfits: [
    {
      category: 'Top',
      item: 'ivory ribbed tank with an asymmetric neckline',
      detail: 'Breathable, sharp, and light enough for the afternoon heat.',
      accentColor: 'mint',
    },
    {
      category: 'Bottom',
      item: 'olive wide-leg linen trousers',
      detail: 'Loose movement keeps the silhouette relaxed without looking unfinished.',
      accentColor: 'lavender',
    },
    {
      category: 'Outer Layer',
      item: 'None needed — 24°C is the look',
      detail: 'A jacket would fight the weather.',
      accentColor: 'coral',
    },
    {
      category: 'Footwear',
      item: 'woven leather flat sandals',
      detail: 'Polished enough for the city, breathable enough for warm pavement.',
      accentColor: 'lemon',
    },
    {
      category: 'Accessories',
      item: 'slim tortoiseshell sunglasses and a raffia shoulder bag',
      detail: 'Sun protection and texture without adding heat.',
      accentColor: 'iris',
    },
  ],
  outfitsAlt: [
    {
      category: 'Top',
      item: 'black silk halter top',
      detail: 'After-dark shape with a cooler handfeel.',
      accentColor: 'mint',
    },
  ],
  avoid: ['heavy jackets'],
};

describe('image generation prompts', () => {
  it('anchors photo prompts to the generated outfit manifest', () => {
    const prompt = buildImagePrompt(VERDICT, WEATHER, 'day', 'Women', 'Weekend');

    expect(prompt).toContain('VERDICT OUTFIT');
    expect(prompt).toContain('render ONLY these garments');
    expect(prompt).toContain('1. Top: ivory ribbed tank with an asymmetric neckline.');
    expect(prompt).toContain('3. Outer Layer: None needed — 24°C is the look.');
    expect(prompt).toContain('outer layer says "None needed"');
    expect(prompt).toContain('Do not add, swap, or omit');
    // Outfit manifest must appear in the first 300 chars (early-token anchoring)
    expect(prompt.indexOf('VERDICT OUTFIT')).toBeLessThan(30);
    expect(prompt.length).toBeLessThanOrEqual(4800);
  });

  it('uses the generated night outfit for night photos', () => {
    const prompt = buildImagePrompt(VERDICT, WEATHER, 'night', 'Women', 'Date');

    expect(prompt).toContain('This is the NIGHT image');
    expect(prompt).toContain('1. Top: black silk halter top.');
    expect(prompt).not.toContain('ivory ribbed tank');
  });

  it('anchors sketch prompts to the generated outfit manifest', () => {
    const prompt = buildSketchPrompt(VERDICT, WEATHER, 'day', 'Women', 'Weekend');

    expect(prompt).toContain('VERDICT OUTFIT');
    expect(prompt).toContain('Do not substitute, simplify, add, or omit any listed piece');
    expect(prompt).toContain('1. Top: ivory ribbed tank with an asymmetric neckline.');
    expect(prompt).toContain('3. Outer Layer: None needed — 24°C is the look.');
    expect(prompt).toContain('If the outer layer says "None needed"');
    expect(prompt).toContain('Hand-drawn editorial fashion illustration');
    expect(prompt.length).toBeLessThanOrEqual(5000);
  });

  it('uses the generated night outfit for night sketches', () => {
    const prompt = buildSketchPrompt(VERDICT, WEATHER, 'night', 'Women', 'Date');

    expect(prompt).toContain('NIGHT SKETCH');
    expect(prompt).toContain('1. Top: black silk halter top.');
    expect(prompt).not.toContain('ivory ribbed tank');
  });

  it('keeps sketch prompts under the proxy limit for verbose generated outfits', () => {
    const verboseVerdict: OracleVerdict = {
      ...VERDICT,
      outfits: VERDICT.outfits.map(item => ({
        ...item,
        item: `${item.item} with layered construction, specific finishing, unusual proportion, weather-aware styling, and a long editorial aside about why it works for the city without becoming generic`,
        detail: `${item.detail} This extra detail repeats the sort of verbose rationale the text model can produce when it explains silhouette, fabric, temperature, occasion, texture, and styling context at length.`,
      })),
    };

    const prompt = buildSketchPrompt(verboseVerdict, WEATHER, 'day', 'Women', 'Weekend');

    expect(prompt.length).toBeLessThanOrEqual(4800);
    expect(prompt).toContain('VERDICT OUTFIT');
    expect(prompt).toContain('1. Top: ivory ribbed tank with an asymmetric neckline');
    expect(prompt).toContain('Do not substitute, simplify, add, or omit any listed piece');
  });
});

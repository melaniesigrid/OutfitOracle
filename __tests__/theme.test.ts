import { THEME_OPTIONS, THEMES } from '../src/theme';

describe('theme registry', () => {
  it('exposes every registered theme in settings, including both weather themes', () => {
    const registeredIds = Object.keys(THEMES).sort();
    const optionIds = THEME_OPTIONS.map(option => option.id).sort();

    expect(optionIds).toEqual(registeredIds);
    expect(THEME_OPTIONS).toHaveLength(registeredIds.length);
    expect(THEMES['weather-glance']).toBeDefined();
    expect(THEMES['weather-editorial']).toBeDefined();
    expect(THEME_OPTIONS[0]).toEqual({ id: 'weather-glance', label: 'Weather Glance' });
    expect(THEME_OPTIONS[1]).toEqual({ id: 'weather-editorial', label: 'Weather Editorial' });
  });
});

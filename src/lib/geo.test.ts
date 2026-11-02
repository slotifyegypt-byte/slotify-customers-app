import { distanceKm } from './geo';

const cairo = { latitude: 30.0444, longitude: 31.2357 };
// The Giza pyramids plateau, the usual "Giza" a customer would search from.
const giza = { latitude: 29.9753, longitude: 31.1376 };

describe('distanceKm', () => {
  it('is about 12-14 km from Cairo to Giza', () => {
    const km = distanceKm(cairo, giza);
    expect(km).toBeGreaterThan(12);
    expect(km).toBeLessThan(14);
  });

  it('is zero for the same point and symmetric', () => {
    expect(distanceKm(cairo, cairo)).toBe(0);
    expect(distanceKm(cairo, giza)).toBeCloseTo(distanceKm(giza, cairo), 10);
  });
});

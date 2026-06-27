import { describe, expect, it } from 'vitest';
import manifest from '@/app/manifest';

describe('PWA manifest', () => {
  it('uses farmer start URL and Field Journal colours', () => {
    const data = manifest();
    expect(data.name).toBe('FarmLink Farmer');
    expect(data.start_url).toBe('/farmer');
    expect(data.background_color).toBe('#F4EEDD');
    expect(data.theme_color).toBe('#356B45');
    expect(data.display).toBe('standalone');
  });

  it('includes maskable icons', () => {
    const data = manifest();
    expect(data.icons?.some((icon) => icon.purpose === 'maskable')).toBe(true);
  });
});

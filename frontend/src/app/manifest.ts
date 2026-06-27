import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FarmLink Farmer',
    short_name: 'FarmLink',
    description: 'List produce, find buyers and manage agricultural offers.',
    start_url: '/farmer',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#F4EEDD',
    theme_color: '#356B45',
    categories: ['business', 'food', 'productivity'],
    icons: [
      {
        src: '/icons/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}

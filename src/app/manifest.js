export default function manifest() {
  return {
    name: 'MacroForge • Calorie & Macro Counter',
    short_name: 'CalorieAI',
    description: 'AI-powered calorie counter and macro tracker.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0e0d0c',
    theme_color: '#0e0d0c',
    icons: [
      {
        src: '/favicon.svg',
        sizes: '48x48 72x72 96x96',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
    ],
  };
}

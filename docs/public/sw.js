// Placeholder service worker to prevent 404 errors from cached requests
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', () => self.clients.claim())

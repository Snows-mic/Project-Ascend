/**
 * Service Worker — Project Ascend PWA
 *
 * - Cache-first for static assets (Vite build output)
 * - Network-first for Supabase API calls (always fresh data)
 * - Push notification support (reminders, streak-at-risk alerts)
 */

const CACHE_NAME = 'ascend-v2';
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json'];

/* ------------------------------------------------------------------ */
/*  Install — pre-cache shell                                         */
/* ------------------------------------------------------------------ */

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return (self as any).skipWaiting();
    })
  );
});

/* ------------------------------------------------------------------ */
/*  Activate — clean old caches                                       */
/* ------------------------------------------------------------------ */

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => (self as any).clients.claim())
  );
});

/* ------------------------------------------------------------------ */
/*  Fetch — cache-first static, network-first API                     */
/* ------------------------------------------------------------------ */

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Supabase API / Auth / Realtime WebSocket — pass through
  if (
    url.hostname.includes('supabase.co') ||
    url.pathname.startsWith('/rest/v1/') ||
    url.pathname.startsWith('/auth/v1/')
  ) {
    event.respondWith(
      fetch(request).catch(() => {
        if (request.headers.get('Accept')?.includes('application/json')) {
          return new Response(JSON.stringify({ offline: true }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return caches.match('/index.html') as Promise<Response>;
      })
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((response) => {
        if (response.ok && request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
        }
        return response;
      });
      return cached || fetchPromise;
    })
  );
});

/* ------------------------------------------------------------------ */
/*  Push notifications                                                */
/* ------------------------------------------------------------------ */

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const { title, body, icon, tag, data } = payload;

    const options = {
      body: body ?? '',
      icon: icon ?? '/icon.svg',
      badge: '/icon.svg',
      tag: tag ?? 'ascend-reminder',
      data: data ?? {},
      requireInteraction: true,
      vibrate: [200, 100, 200],
      actions: [
        { action: 'open', title: 'Open Ascend' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    };

    event.waitUntil(
      (self as any).registration.showNotification(
        title ?? 'Project Ascend',
        options
      )
    );
  } catch {
    event.waitUntil(
      (self as any).registration.showNotification('Project Ascend', {
        body: event.data.text(),
        icon: '/icon.svg',
        requireInteraction: true,
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if ((event as any).action === 'dismiss') return;

  event.waitUntil(
    (self as any).clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        return (self as any).clients.openWindow('/');
      })
  );
});

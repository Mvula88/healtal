// Service Worker for Push Notifications
self.addEventListener('push', function(event) {
  if (!event.data) {
    return
  }

  const data = event.data.json()
  const options = {
    body: data.message,
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.id,
      actionUrl: data.actionUrl || '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/xmark.png'
      }
    ]
  }

  // Show notification
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  const actionUrl = event.notification.data?.actionUrl || '/'

  event.waitUntil(
    clients.openWindow(actionUrl)
  )
})

// Background sync for offline notifications
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications())
  }
})

async function syncNotifications() {
  try {
    const response = await fetch('/api/notifications/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Sync failed')
    }
    
    const notifications = await response.json()
    
    // Process any pending notifications
    for (const notification of notifications) {
      await self.registration.showNotification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png'
      })
    }
  } catch (error) {
    console.error('Notification sync failed:', error)
  }
}

// Cache strategies for offline support
const CACHE_NAME = 'beneathy-v1'
const urlsToCache = [
  '/',
  '/dashboard',
  '/patterns',
  '/community',
  '/offline.html'
]

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache)
      })
  )
})

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response
        }
        return fetch(event.request)
      })
      .catch(function() {
        return caches.match('/offline.html')
      })
  )
})
// Listen for the incoming Push Notification
self.addEventListener('push', function (event) {
  if (event.data) {
    // We expect the server to send a JSON package with title, body, and url
    const data = event.data.json();
    
    const options = {
      body: data.body,
      // You can change these paths if your logo is named differently in your public folder!
      icon: '/icon512_maskable.png', 
      badge: '/icon512_rounded.png', 
      vibrate: [100, 50, 100], // A custom vibration pattern
      data: {
        url: data.url || '/dashboard', // Where should they go when they click the notification?
      },
    };

    // Tell the phone to physically display the banner
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Listen for the user clicking the notification
self.addEventListener('notificationclick', function (event) {
  event.notification.close(); // Clear the notification from the phone's tray
  
  // Open the app to the specific URL sent in the notification
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
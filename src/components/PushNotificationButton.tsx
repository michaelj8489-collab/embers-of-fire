'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

// This is a standard math utility required by browsers to securely 
// convert your VAPID string into a cryptographic array
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export default function PushNotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      // 1. Register the listener in the background
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
        
        // 2. Check if they already allowed notifications
        registration.pushManager.getSubscription().then((subscription) => {
          if (subscription) {
            setIsSubscribed(true);
          }
        });
      }).catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    }
  }, []);

  const subscribeToPush = async () => {
    setLoading(true);
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert('Push notifications are not supported by your current browser.');
        setLoading(false);
        return;
      }

      // 1. Pop the browser's "Allow Notifications" prompt
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Notification permission denied.');
        setLoading(false);
        return;
      }

      // 2. Verify who is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('You must be logged in to the Sanctuary to enable notifications.');
        setLoading(false);
        return;
      }

      // 3. Register the device with your Public Key
      const registration = await navigator.serviceWorker.ready;
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!publicVapidKey) {
        throw new Error('VAPID public key is missing!');
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      // 4. Save the device's address securely to Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .insert([
          { 
            user_id: user.id, 
            subscription: subscription.toJSON() 
          }
        ]);

      if (error) {
          // If it fails because they already saved this device, just show success
          if (error.code === '23505') { 
              setIsSubscribed(true);
              return;
          }
          throw error;
      }

      setIsSubscribed(true);

    } catch (error: any) {
      console.error('Error subscribing to push:', error);
      alert('Failed to enable notifications. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // If they already opted in, show a quiet confirmation text instead of a button
  if (isSubscribed) {
    return <div className="text-orange-500 font-cinzel text-sm">✅ Alerts Active</div>;
  }

  return (
    <button 
      onClick={subscribeToPush}
      disabled={loading}
      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-cinzel transition-colors shadow-md disabled:opacity-50"
    >
      {loading ? 'Consulting Archives...' : 'Enable Notifications'}
    </button>
  );
}
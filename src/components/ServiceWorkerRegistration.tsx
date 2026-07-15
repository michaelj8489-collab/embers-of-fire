'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    let cancelled = false;

    const registerServiceWorker = async () => {
      try {
        const existingRegistration = await navigator.serviceWorker.getRegistration('/');

        if (cancelled) {
          return;
        }

        if (existingRegistration?.active || existingRegistration?.installing || existingRegistration?.waiting) {
          return;
        }

        await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });
      } catch (error) {
        console.error('Service worker registration failed.', error);
      }
    };

    void registerServiceWorker();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

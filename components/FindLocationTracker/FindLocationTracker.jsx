'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/trackEvent';

export default function FindLocationTracker() {
  useEffect(() => {
    trackEvent('find_location', {});
  }, []);

  return null;
}

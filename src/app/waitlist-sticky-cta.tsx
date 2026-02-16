'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { detectPlatform, APP_STORE_URL } from '@/lib/device';

export function WaitlistStickyCta() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'unknown'>('unknown');

  useEffect(() => {
    // Detect platform once on mount
    setPlatform(detectPlatform());

    const onScroll = () => {
      const pastHero = window.scrollY > 220;
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 240;
      const waitlistEl = document.getElementById('waitlist');
      const waitlistInView = waitlistEl
        ? waitlistEl.getBoundingClientRect().top < window.innerHeight * 0.9
        : false;

      setVisible(pastHero && !nearBottom && !waitlistInView);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  // iOS users get direct App Store link
  if (platform === 'ios') {
    return (
      <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="fixed bottom-4 right-4 z-50">
        <Button className="rounded-full px-5 py-3 text-sm font-semibold shadow-lg">Download for iPhone</Button>
      </a>
    );
  }

  // Android users get waitlist link
  if (platform === 'android') {
    return (
      <a href="#waitlist" className="fixed bottom-4 right-4 z-50">
        <Button className="rounded-full px-5 py-3 text-sm font-semibold shadow-lg">Join Android Waitlist</Button>
      </a>
    );
  }

  // Unknown platform - show generic CTA
  return (
    <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="fixed bottom-4 right-4 z-50">
      <Button className="rounded-full px-5 py-3 text-sm font-semibold shadow-lg">Get Leet</Button>
    </a>
  );
}

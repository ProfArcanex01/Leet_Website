'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function WaitlistStickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
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

  return (
    <a href="#waitlist" className="fixed bottom-4 right-4 z-50">
      <Button className="rounded-full px-5 py-3 text-sm font-semibold shadow-lg">Join waitlist</Button>
    </a>
  );
}

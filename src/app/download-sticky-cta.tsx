'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { detectPlatform, APP_STORE_URL, GOOGLE_PLAY_URL } from '@/lib/device';

export function DownloadStickyCta() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'unknown'>('unknown');

  useEffect(() => {
    // Detect platform once on mount
    setPlatform(detectPlatform());

    const onScroll = () => {
      const pastHero = window.scrollY > 220;
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 240;
      const newsletterEl = document.getElementById('newsletter');
      const newsletterInView = newsletterEl
        ? newsletterEl.getBoundingClientRect().top < window.innerHeight * 0.9
        : false;

      setVisible(pastHero && !nearBottom && !newsletterInView);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  const href =
    platform === 'ios' ? APP_STORE_URL :
    platform === 'android' ? GOOGLE_PLAY_URL :
    '#download';

  const label =
    platform === 'ios' ? 'Download for iPhone' :
    platform === 'android' ? 'Download for Android' :
    'Get Leet (search Leet.Carpooling)';

  const isExternal = platform !== 'unknown';

  return (
    <>
      {/* Desktop: floating pill button */}
      <a
        href={href}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="fixed bottom-4 right-4 z-50 hidden md:block"
      >
        <Button className="rounded-full px-5 py-3 text-sm font-semibold shadow-lg">{label}</Button>
      </a>
      {/* Mobile: full-width bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[color:var(--stroke)] bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm md:hidden">
        <a
          href={href}
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          <Button className="w-full rounded-full py-3 text-sm font-semibold shadow-lg">{label}</Button>
        </a>
      </div>
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { detectPlatform, APP_STORE_URL, GOOGLE_PLAY_URL } from '@/lib/device';

export function DownloadStickyCta() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'unknown'>('unknown');

  useEffect(() => {
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
    'Get Leet';

  const isExternal = platform !== 'unknown';

  const buttonClass =
    'inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#E06C2C] px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_28px_rgba(224,108,44,0.45)] transition-all duration-200 hover:bg-[#c95d24] hover:shadow-[0_12px_36px_rgba(224,108,44,0.5)] active:scale-[0.98]';

  return (
    <>
      {/* Desktop: floating pill */}
      <a
        href={href}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="fixed bottom-6 right-6 z-50 hidden md:inline-flex"
      >
        <span className={buttonClass}>
          <Download className="h-4 w-4" />
          {label}
        </span>
      </a>
      {/* Mobile: bottom bar — dark, premium */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0A0907]/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:hidden">
        <a
          href={href}
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          <span className={buttonClass}>
            <Download className="h-4 w-4" />
            {label}
          </span>
        </a>
      </div>
    </>
  );
}

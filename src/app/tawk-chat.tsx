'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const TAWK_SCRIPT_ID = 'tawk-chat-script';
const TAWK_SRC = 'https://embed.tawk.to/69a35816f376451c37352509/1jij106o4';

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget?: () => void;
      showWidget?: () => void;
      onLoad?: () => void;
    };
    Tawk_LoadStart?: Date;
  }
}

export function TawkChat() {
  const pathname = usePathname();
  const isSafetySharePage = pathname?.startsWith('/safety-share/');
  const isAdminPage = pathname?.startsWith('/admin') || pathname?.startsWith('/ops-9xk3');
  const shouldHideWidget = isSafetySharePage || isAdminPage;

  useEffect(() => {
    if (shouldHideWidget) {
      // Defense-in-depth: hide the chat widget on internal/admin flows even if the script
      // was already loaded during a previous public-page navigation.
      window.Tawk_API?.hideWidget?.();
      return;
    }

    if (document.getElementById(TAWK_SCRIPT_ID)) {
      window.Tawk_API?.showWidget?.();
      return;
    }

    const script = document.createElement('script');
    script.id = TAWK_SCRIPT_ID;
    script.async = true;
    script.src = TAWK_SRC;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    document.body.appendChild(script);
  }, [shouldHideWidget]);

  return null;
}

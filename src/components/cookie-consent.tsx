"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "leet-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="mx-auto max-w-xl rounded-2xl border border-[var(--stroke)] bg-[var(--card)] p-4 sm:p-6 shadow-lg">
        <p className="text-sm text-[var(--ink)]">
          We use cookies to improve your experience and analyse site traffic. By
          continuing to use our site, you consent to our use of cookies.{" "}
          <Link
            href="/privacy"
            className="underline text-[var(--accent-2)] hover:text-[var(--accent)]"
          >
            Privacy Policy
          </Link>
        </p>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={accept}
            className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 cursor-pointer"
          >
            Accept
          </button>
          <button
            onClick={decline}
            className="rounded-full border border-[var(--stroke)] bg-transparent px-5 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--muted)] cursor-pointer"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}

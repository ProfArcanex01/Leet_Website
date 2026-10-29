"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "leet-cookie-consent";
const CONSENT_CHANGED = "leet-consent-changed";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CONSENT_CHANGED, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CONSENT_CHANGED, onChange);
  };
}

function needsConsent() {
  try {
    return !localStorage.getItem(COOKIE_CONSENT_KEY);
  } catch {
    return true;
  }
}

const serverSnapshot = () => false;

export function CookieConsent() {
  const [dismissed, setDismissed] = useState(false);
  const visible = useSyncExternalStore(subscribe, needsConsent, serverSnapshot) && !dismissed;

  function saveConsent(value: "accepted" | "declined") {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, value);
      window.dispatchEvent(new Event(CONSENT_CHANGED));
    } catch {
      // Storage may be blocked; still dismiss the banner for this page visit.
    }
    setDismissed(true);
  }

  function accept() {
    saveConsent("accepted");
  }

  function decline() {
    saveConsent("declined");
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

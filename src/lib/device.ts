/**
 * Device detection utilities for client-side platform detection
 */

export type DevicePlatform = 'ios' | 'android' | 'unknown';

/**
 * Detects the user's device platform based on user agent
 * @returns 'ios', 'android', or 'unknown'
 */
export function detectPlatform(): DevicePlatform {
  if (typeof window === 'undefined') return 'unknown';

  const userAgent = window.navigator.userAgent.toLowerCase();

  // iOS detection
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  }

  // Android detection
  if (/android/.test(userAgent)) {
    return 'android';
  }

  return 'unknown';
}

/**
 * Checks if the user is on an iOS device
 */
export function isIOS(): boolean {
  return detectPlatform() === 'ios';
}

/**
 * Checks if the user is on an Android device
 */
export function isAndroid(): boolean {
  return detectPlatform() === 'android';
}

/**
 * App Store URLs
 */
export const APP_STORE_URL = 'https://apps.apple.com/app/leet-carpooling/id6758221255';
export const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.leetgh.app';

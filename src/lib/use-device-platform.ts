'use client';

import { useSyncExternalStore } from 'react';
import { detectPlatform, type DevicePlatform } from './device';

const subscribe = () => () => {};
const serverSnapshot = (): DevicePlatform => 'unknown';

export function useDevicePlatform() {
  return useSyncExternalStore(subscribe, detectPlatform, serverSnapshot);
}

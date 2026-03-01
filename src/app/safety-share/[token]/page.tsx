import type { Metadata } from 'next';

import { SafetyShareViewer } from './safety-share-viewer';

type Params = { token: string };

type SafetySharePageProps = {
  params: Promise<Params> | Params;
};

export const metadata: Metadata = {
  title: 'Live Trip Tracking',
  description: 'Trusted-contact live trip tracking view.',
  referrer: 'no-referrer',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SafetySharePage({ params }: SafetySharePageProps) {
  const resolved = 'then' in params ? await params : params;
  return <SafetyShareViewer token={resolved.token} />;
}

import { Metadata } from 'next';
import PrivacyPolicyContent from './PrivacyPolicyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy - Jukebox Duo',
  description: 'Your privacy is important to us. Learn how Jukebox Duo protects and handles your information.',
  alternates: {
    canonical: 'https://jukeboxduo.com/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />;
}

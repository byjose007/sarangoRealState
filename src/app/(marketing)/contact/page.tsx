import { buildMetadata } from '@/lib/seo';
import { ContactView } from '@/components/contact/contact-view';

export const metadata = buildMetadata({
  title: 'Contact',
  description:
    'Three offices, one desk. Call, write or book a viewing with the Sarango Real Estate team.',
  path: '/contact',
});

export default function ContactPage() {
  return <ContactView />;
}

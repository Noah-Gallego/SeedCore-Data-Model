import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ | Beyond Measure',
  description: 'Frequently asked questions about Beyond Measure, helping teachers at Christian schools with resources.',
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
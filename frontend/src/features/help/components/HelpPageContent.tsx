'use client';

import { PageHeader } from '@/components/layout/PageHeader';

const topics = [
  {
    title: 'Farm Advisor (AI)',
    body: 'Open Farm Advisor from Home or More. Describe crop symptoms in your own words — e.g. plantain leaves turning black. The advisor asks follow-up questions, then suggests likely causes and practical next steps. It does not replace your extension officer.',
  },
  {
    title: 'How to list produce',
    body: 'Tap List Produce, then speak, type or fill the form. Review every detail before publishing.',
  },
  {
    title: 'How AI extraction works',
    body: 'FarmLink reads your description and suggests fields. It is not guaranteed correct — always check before publishing.',
  },
  {
    title: 'How buyer matching works',
    body: 'After you publish, FarmLink finds buyers whose needs fit your produce, quantity and timing.',
  },
  {
    title: 'How offers work',
    body: 'Buyers send offers with quantity, price and pickup date. You choose to accept or reject each one.',
  },
  {
    title: 'After accepting an offer',
    body: 'An accepted offer becomes a confirmed transaction. Plan your pickup from the Pickups screen.',
  },
  {
    title: 'Offline drafts',
    body: 'You can save listing drafts on this device without internet. Publishing and extraction need a connection.',
  },
  {
    title: 'Install the PWA',
    body: 'Use Settings → Install application, or your browser menu → Add to Home screen on Android.',
  },
  {
    title: 'Payments (MVP)',
    body: 'Payment settlement happens outside FarmLink for now. FarmLink does not process MoMo or bank payments yet.',
  },
];

export function HelpPageContent() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-5 pb-8">
      <PageHeader title="Help & guidance" subtitle="Plain answers for common questions" />

      <div className="mt-6 space-y-4">
        {topics.map((topic) => (
          <section
            key={topic.title}
            className="rounded-2xl border border-morning-mist bg-warm-paper p-5"
          >
            <h2 className="font-heading text-lg font-semibold text-field-ink">
              {topic.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-text">{topic.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

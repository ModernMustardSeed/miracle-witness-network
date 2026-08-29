import type { Metadata } from 'next';
import Link from 'next/link';

import { SubmitForm } from '@/components/SubmitForm';

export const metadata: Metadata = {
  title: 'Send a story',
  description:
    'The wire cannot reach a hospital corridor or a village church. Send the Miracle Witness Network newsroom something good that actually happened.',
  alternates: { canonical: '/submit' },
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-broadsheet px-4 py-10 sm:px-6">
      <div className="rule-double pt-3">
        <p className="kicker text-ember">The reader’s desk</p>
        <h1 className="mt-2 max-w-3xl font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">
          The wire misses most of the good in the world.
        </h1>
        <p className="mt-5 max-w-column text-lg leading-relaxed text-ink-soft">
          A scanner can read every newspaper on earth and still never learn what
          happened in a hospital corridor in Missoula, or a church in Jos, or the
          house three doors down from you. That reporting only ever arrives one
          way.
        </p>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <SubmitForm />
        </div>

        <aside className="lg:col-span-5 lg:col-rule lg:pl-8">
          <h2 className="kicker border-b-2 border-ink pb-2 text-ink">What happens next</h2>
          <ol className="mt-5 space-y-5 text-[15px] leading-relaxed text-ink-soft">
            <li>
              <span className="font-display text-lg font-semibold text-ink">A person reads it.</span>{' '}
              Testimonies do not go through the scanner. Someone in the newsroom
              opens every one.
            </li>
            <li>
              <span className="font-display text-lg font-semibold text-ink">
                We try to find a second thread.
              </span>{' '}
              A local paper, a hospital statement, a photograph with a date on
              it. Not to doubt you, but because a story that can be checked
              travels further than one that cannot.
            </li>
            <li>
              <span className="font-display text-lg font-semibold text-ink">We ask before we print.</span>{' '}
              Your name never appears without you saying yes to it, and we will
              run it without your name if that is what you need.
            </li>
          </ol>

          <div className="mt-8 border-t border-rule pt-6">
            <h2 className="kicker text-ink">What we cannot use</h2>
            <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-ink-soft">
              <li>Prayer requests, which belong to your church, not to a wire.</li>
              <li>Appeals for money, however good the cause.</li>
              <li>Anything you were told secondhand and cannot point us toward.</li>
            </ul>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
              Our standard for all of it is on{' '}
              <Link href="/how-we-verify" className="link-underline font-semibold text-ink">
                the How We Verify page
              </Link>
              .
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

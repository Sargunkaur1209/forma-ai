import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const featureCards = [
  {
    title: 'Understands plain language',
    description:
      'Write it the way you would tell a friend. We pick out the incident, date, place, vehicle and damage.',
    icon: 'sparkle',
  },
  {
    title: 'Asks only what matters',
    description: 'Follow-up questions appear only when your answers make them necessary.',
    icon: 'search',
  },
  {
    title: 'You confirm everything',
    description:
      'Anything we missed or guessed is highlighted. Nothing is sent until you approve it.',
    icon: 'check',
  },
];

const stepCards = [
  {
    step: 'STEP 01',
    title: 'Describe',
    description: 'Type what happened in your own words.',
  },
  {
    step: 'STEP 02',
    title: 'Review',
    description: 'Check the filled answers and fix anything highlighted.',
  },
  {
    step: 'STEP 03',
    title: 'Follow-ups',
    description: 'Answer the few questions that still apply.',
  },
  {
    step: 'STEP 04',
    title: 'Submit',
    description: 'Confirm and send. Every answer is checked again.',
  },
];

const claimFields = [
  { label: 'Type of incident', status: 'AI filled', tone: 'blue' },
  { label: 'Which animal?', status: 'AI filled', tone: 'blue' },
  { label: 'Date', status: 'Please check', tone: 'amber' },
  { label: 'Vehicle', status: 'AI filled', tone: 'blue' },
  { label: 'Vehicle model', status: 'Missing', tone: 'red' },
];

function LogoMark() {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-cyan-400 shadow-[0_0_18px_rgba(59,130,246,0.8)]">
      <svg viewBox="0 0 32 32" className="h-4 w-4 text-white" fill="none" aria-hidden="true">
        <path
          d="M9 16.8C9 12.9 12.1 10 16 10c4.1 0 7 2.9 7 6.8v1.7c0 3.9-2.9 6.8-7 6.8-4.1 0-7-2.9-7-6.8v-1.7Z"
          stroke="currentColor"
          strokeWidth="2.1"
        />
        <path d="M12.5 16.5h7" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M4.2 10h11.6m0 0-4.2-4.2M15.8 10l-4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
      <path d="M8 1.5 9.2 5l3.3 1.2-3.3 1.2L8 10.5l-1.2-3.1L3.5 6.2 6.8 5 8 1.5Zm4.5 8.2 0.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8ZM2.5 9.2l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5.5-1.2Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 4.8v3.2l2.2 1.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
      <path
        d="M8 2.8 13.2 12a1.1 1.1 0 0 1-.96 1.6H3.76A1.1 1.1 0 0 1 2.8 12L8 2.8Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M8 5.8v3.4M8 11.2h.01"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FeatureIcon({ type }) {
  const shared =
    'flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef2f7] text-[#0f172a]';

  if (type === 'search') {
    return (
      <div className={shared} aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <circle cx="11" cy="11" r="5.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (type === 'check') {
    return (
      <div className={shared} aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M5 12.8 9.2 17 19 7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={shared} aria-hidden="true">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path d="M9.5 17.5 5 13l1.5-1.5L9.5 14.5 17.5 6.5 19 8l-9.5 9.5Z" fill="currentColor" />
        <path
          d="M12 3.5c2.7 0 5 2.3 5 5v2.2l1.7 1.4c.7.6.5 1.8-.4 2l-1.6.6-1.7 4.8h-5l-1.7-4.8-1.6-.6c-.9-.2-1.1-1.4-.4-2l1.7-1.4V8.5c0-2.7 2.3-5 5-5Z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

FeatureIcon.propTypes = {
  type: PropTypes.string.isRequired,
};

function StatusBadge({ tone, label }) {
  const labelText = label.toLowerCase();
  const toneStyles = {
    blue: 'bg-[#eff6ff] text-[#1d4ed8]',
    amber: 'bg-[#fff7db] text-[#b45309]',
    red: 'bg-[#fee2e2] text-[#b91c1c]',
  };

  const icon = labelText.includes('please') ? (
    <ClockIcon />
  ) : labelText.includes('missing') ? (
    <AlertIcon />
  ) : (
    <SparkleIcon />
  );

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold ${toneStyles[tone]}`}
    >
      {icon}
      {label}
    </span>
  );
}

StatusBadge.propTypes = {
  tone: PropTypes.oneOf(['blue', 'amber', 'red']).isRequired,
  label: PropTypes.string.isRequired,
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f4f1ec] text-slate-900">
      <header className="bg-[#071421] px-4 pb-6 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <nav className="flex items-center justify-between rounded-full border border-slate-700/80 bg-slate-900/20 px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <LogoMark />
              <span className="text-lg font-semibold tracking-tight text-white">Forma AI</span>
            </div>

            <div className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
              <Link to="/drafts" className="transition hover:text-white">
                My drafts
              </Link>
              <Link to="/for-insurers" className="transition hover:text-white">
                For insurers
              </Link>
            </div>

            <Link
              to="/claim"
              className="rounded-full bg-[#2f6cff] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(47,108,255,0.5)] transition hover:bg-[#245ef0]"
            >
              Start a claim
            </Link>
          </nav>

          <div className="mx-auto max-w-5xl pb-12 pt-10 sm:pt-12 lg:pt-16">
            <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="w-full max-w-xl lg:max-w-[540px]">
                <div className="inline-flex items-center overflow-hidden rounded-full border border-slate-600 bg-slate-800/70 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.15)]">
                  <span className="bg-[#1b2430] px-3 py-1.5 text-[11px] font-semibold text-white">
                    New
                  </span>
                  <span className="px-3 py-1.5 text-[11px] text-slate-300">
                    Auto, health and home claims
                  </span>
                </div>

                <h1 className="mt-6 text-5xl font-black leading-[0.94] tracking-[-0.06em] text-white sm:text-6xl lg:text-[4.2rem]">
                  Claims that
                  <span className="mt-2 block text-[#f5c96d]">fill themselves.</span>
                </h1>

                <p className="mt-5 max-w-md text-base leading-7 text-slate-400 sm:text-lg">
                  Tell us what happened in a sentence. Forma AI fills in the form, flags what it
                  isn&apos;t sure about, and only asks the questions your claim actually needs.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/claim"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2f6cff] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(47,108,255,0.42)] transition hover:bg-[#245ef0]"
                  >
                    Start a claim
                    <ArrowIcon />
                  </Link>

                  <Link
                    to="/claim"
                    className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-transparent px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800/60"
                  >
                    {/* Temporary route: real draft resume state will be added in a later task. */}
                    Resume a draft
                  </Link>
                </div>
              </div>

              <div className="relative w-full max-w-[430px] self-end">
                <div className="relative rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_30px_60px_rgba(15,23,42,0.35)]">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-bold tracking-[0.24em] text-slate-500">
                      AUTO CLAIM
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf6ff] px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                      <SparkleIcon />7 answers filled
                    </span>
                  </div>

                  <div className="rounded-2xl bg-[#f3f4f6] p-4">
                    <p className="text-sm leading-7 text-slate-700">
                      I hit a <span className="story-highlight story-highlight-blue">deer</span> on{' '}
                      <span className="story-highlight story-highlight-purple">I-95</span>{' '}
                      <span className="story-highlight story-highlight-amber">yesterday</span> in my{' '}
                      <span className="story-highlight story-highlight-blue">Honda</span> and the{' '}
                      <span className="story-highlight story-highlight-blue">windshield</span>{' '}
                      shattered.
                    </p>
                  </div>

                  <div className="mt-5 space-y-3">
                    {claimFields.map((field) => (
                      <div key={field.label} className="flex items-center justify-between gap-3">
                        <span className="text-sm text-slate-600">{field.label}</span>
                        <StatusBadge
                          tone={
                            field.tone === 'blue'
                              ? 'blue'
                              : field.tone === 'amber'
                                ? 'amber'
                                : 'red'
                          }
                          label={field.status}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="absolute -bottom-4 right-4 flex max-w-[240px] items-start gap-2 rounded-full border border-[#f3c46b] bg-[#fff1be] px-3 py-2 text-left text-[11px] font-semibold text-[#7a4a08] shadow-[0_10px_18px_rgba(252,211,77,0.25)]">
                    <span className="mt-0.5 text-[#b45309]">
                      <SparkleIcon />
                    </span>
                    <span>Only 3 follow-up questions left</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-[#f4f1ec] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-3">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-[#f8f7f4] p-5 text-left"
              >
                <div className="mb-4 flex items-center justify-start">
                  <FeatureIcon type={feature.icon} />
                </div>
                <h2 className="text-xl font-bold tracking-[-0.03em] text-slate-900">
                  {feature.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4f1ec] px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-black tracking-[-0.05em] text-slate-900 sm:text-4xl">
            From story to submitted claim
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stepCards.map((step) => (
              <div
                key={step.step}
                className="rounded-2xl border border-slate-200 bg-[#f8f7f4] p-5 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.02)]"
              >
                <div className="mb-4 text-[10px] font-bold tracking-[0.18em] text-[#54657a]">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold tracking-[-0.04em] text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

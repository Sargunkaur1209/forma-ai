import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/* ---------- icons (inline SVG, same approach as the rest of the repo) ---------- */

function Svg({ className = 'h-4 w-4', children, fill = 'none' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={fill}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

Svg.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  fill: PropTypes.string,
};

const Icons = {
  list: (c) => (
    <Svg className={c}>
      <path d="M4 6h12M4 12h8M4 18h6M17 14v6M14 17h6" />
    </Svg>
  ),
  arrow: (c) => (
    <Svg className={c}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  ),
  sparkle: (c) => (
    <Svg className={c}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" />
    </Svg>
  ),
  branch: (c) => (
    <Svg className={c}>
      <circle cx="6" cy="5" r="2" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="8" r="2" />
      <path d="M6 7v10M18 10c0 4-6 3-12 7" />
    </Svg>
  ),
  shield: (c) => (
    <Svg className={c}>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />
      <path d="M8.5 12l2.5 2.5L15.5 10" />
    </Svg>
  ),
  warning: (c) => (
    <Svg className={c}>
      <path d="M12 4l9 16H3L12 4ZM12 10v4M12 17h.01" />
    </Svg>
  ),
  alert: (c) => (
    <Svg className={c}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </Svg>
  ),
  car: (c) => (
    <Svg className={c}>
      <path d="M5 16V11l2-5h10l2 5v5M3 16h18M7 16v3M17 16v3M7.5 13h.01M16.5 13h.01" />
    </Svg>
  ),
  health: (c) => (
    <Svg className={c}>
      <path d="M12 21c-5-3-8-6-8-10V6l8-3 8 3v5c0 4-3 7-8 10Z" />
      <path d="M12 9v6M9 12h6" />
    </Svg>
  ),
  home: (c) => (
    <Svg className={c}>
      <path d="M4 11l8-7 8 7v9H4v-9ZM10 20v-6h4v6" />
    </Svg>
  ),
};

/* ---------- content (presentation only) ---------- */

const previewRows = [
  { label: 'Type of incident', kind: 'ai' },
  { label: 'Which animal?', kind: 'ai' },
  { label: 'Date', kind: 'check' },
  { label: 'Vehicle', kind: 'ai' },
  { label: 'Vehicle model', kind: 'missing' },
];

const features = [
  {
    title: 'Understands plain language',
    description:
      'Write it the way you would tell a friend. We pick out the incident, date, place, vehicle and damage.',
    icon: 'sparkle',
    tint: 'bg-indigo-50 text-indigo-600',
  },
  {
    title: 'Asks only what matters',
    description: 'Follow-up questions appear only when your answers make them necessary.',
    icon: 'branch',
    tint: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'You confirm everything',
    description:
      'Anything we missed or guessed is highlighted. Nothing is sent until you approve it.',
    icon: 'shield',
    tint: 'bg-emerald-50 text-emerald-600',
  },
];

const steps = [
  { title: 'Describe', description: 'Type what happened in your own words.' },
  { title: 'Review', description: 'Check the filled answers and fix anything highlighted.' },
  { title: 'Follow-ups', description: 'Answer the few questions that still apply.' },
  { title: 'Submit', description: 'Confirm and send. Every answer is checked again.' },
];

// Only the auto form is seeded so far; the other two stay disabled until they exist.
const claimTypes = [
  { title: 'Auto', subtitle: 'Accidents, animals, theft', icon: 'car', to: '/claim' },
  { title: 'Health', subtitle: 'Visits, treatment, costs', icon: 'health', to: null },
  { title: 'Home', subtitle: 'Water, fire, break-ins', icon: 'home', to: null },
];

/* ---------- small components ---------- */

const badgeStyles = {
  ai: {
    label: 'AI filled',
    icon: 'sparkle',
    cls: 'border-indigo-200 bg-indigo-50 text-indigo-600',
  },
  check: {
    label: 'Please check',
    icon: 'warning',
    cls: 'border-amber-300 bg-amber-50 text-amber-700',
  },
  missing: { label: 'Missing', icon: 'alert', cls: 'border-red-200 bg-red-50 text-red-600' },
};

function StatusBadge({ kind }) {
  const { label, icon, cls } = badgeStyles[kind];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {Icons[icon]('h-3 w-3')}
      {label}
    </span>
  );
}

StatusBadge.propTypes = { kind: PropTypes.oneOf(['ai', 'check', 'missing']).isRequired };

function Highlight({ tone = 'indigo', children }) {
  const tones = {
    indigo: 'bg-indigo-100 text-indigo-600',
    amber: 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`rounded-md px-1.5 py-0.5 font-semibold ${tones[tone]}`}>{children}</span>
  );
}

Highlight.propTypes = {
  tone: PropTypes.oneOf(['indigo', 'amber']),
  children: PropTypes.node.isRequired,
};

/* ---------- page ---------- */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f7f6f2] text-slate-900">
      <section className="bg-[#080b14] text-white">
        <div className="mx-auto max-w-[1120px] px-6">
          <header className="flex items-center justify-between py-5">
            <Link to="/" className="flex items-center gap-2.5 text-lg font-semibold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600">
                {Icons.list('h-4 w-4')}
              </span>
              Forma AI
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium text-slate-300 sm:gap-8">
              <Link to="/drafts" className="hover:text-white">
                My drafts
              </Link>
              <Link to="/for-insurers" className="hidden hover:text-white sm:inline">
                For insurers
              </Link>
              <Link
                to="/claim"
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-white transition hover:bg-blue-500"
              >
                Start a claim
              </Link>
            </nav>
          </header>

          <div className="grid items-center gap-14 pb-24 pt-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 py-1 pl-1 pr-3 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-600">
                  {Icons.sparkle('h-3 w-3')} New
                </span>
                Auto, health and home claims
              </div>

              <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
                Claims that
                <span className="block text-indigo-300">fill themselves.</span>
              </h1>

              <p className="mt-8 max-w-[34rem] text-lg leading-relaxed text-slate-400">
                Tell us what happened in a sentence. Forma AI fills in the form, flags what it
                isn&apos;t sure about, and only asks the questions your claim actually needs.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/claim"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 font-semibold transition hover:bg-blue-500"
                >
                  Start a claim {Icons.arrow('h-4 w-4')}
                </Link>
                <Link
                  to="/drafts"
                  className="rounded-lg border border-white/20 px-6 py-3.5 font-semibold transition hover:bg-white/5"
                >
                  Resume a draft
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl bg-white p-6 text-slate-900 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Auto claim
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600">
                    {Icons.sparkle('h-3 w-3')} 7 answers filled
                  </span>
                </div>

                <p className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4 leading-8 text-slate-600">
                  I hit a <Highlight>deer</Highlight> on <Highlight>I-95</Highlight>{' '}
                  <Highlight tone="amber">yesterday</Highlight> in my <Highlight>Honda</Highlight>{' '}
                  and the <Highlight>windshield</Highlight> shattered.
                </p>

                <ul className="mt-2">
                  {previewRows.map((row) => (
                    <li
                      key={row.label}
                      className="flex items-center justify-between border-b border-stone-100 py-3 text-sm text-slate-600 last:border-0"
                    >
                      {row.label}
                      <StatusBadge kind={row.kind} />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="absolute -bottom-5 right-0 flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg lg:-right-4">
                {Icons.branch('h-4 w-4 text-blue-600')}
                Only 3 follow-up questions left
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1120px] px-6">
        <section className="grid gap-10 py-16 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title}>
              <span className={`grid h-12 w-12 place-items-center rounded-xl ${f.tint}`}>
                {Icons[f.icon]('h-5 w-5')}
              </span>
              <h2 className="mt-6 text-xl font-bold">{f.title}</h2>
              <p className="mt-3 leading-relaxed text-slate-500">{f.description}</p>
            </div>
          ))}
        </section>

        <section className="pb-16">
          <h2 className="text-4xl font-bold tracking-tight">From story to submitted claim</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className={`rounded-xl border border-stone-200 bg-white p-6 ${i === 3 ? 'md:col-span-3' : ''}`}
              >
                <span className="font-mono text-xs tracking-widest text-indigo-600">
                  STEP {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
                <p className="mt-1.5 text-slate-500">{s.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-24 rounded-2xl bg-[#080b14] p-8 text-white sm:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-bold tracking-tight">What do you need to claim for?</h2>
            <Link
              to="/claim"
              className="text-sm font-medium text-indigo-300 underline hover:text-indigo-200"
            >
              See all claim types
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {claimTypes.map((t) => {
              const body = (
                <>
                  <span className="grid h-12 w-12 place-items-center rounded-lg bg-white/5 text-indigo-300">
                    {Icons[t.icon]('h-5 w-5')}
                  </span>
                  <span>
                    <span className="block font-semibold">{t.title}</span>
                    <span className="block text-sm text-slate-400">{t.subtitle}</span>
                  </span>
                </>
              );
              const base =
                'flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5';
              return t.to ? (
                <Link
                  key={t.title}
                  to={t.to}
                  className={`${base} transition hover:bg-white/[0.07]`}
                >
                  {body}
                </Link>
              ) : (
                <div key={t.title} aria-disabled="true" className={`${base} opacity-60`}>
                  {body}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
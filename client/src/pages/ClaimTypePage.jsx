import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClaimWorkspace from '../components/ClaimWorkspace';

const claimTypes = [
  {
    id: 'auto',
    title: 'Auto',
    description: 'Collisions, animal hits, theft, or damage to your vehicle.',
    topics: ['Incident', 'Vehicle', 'Damage', 'Injuries'],
    icon: (
      <>
        <path d="M5 16v-5l2-5h10l2 5v5M3 16h18M7 16v3M17 16v3" />
        <path d="M7.5 12h.01M16.5 12h.01" />
      </>
    ),
    available: true,
  },
  {
    id: 'health',
    title: 'Health',
    description: 'Doctor visits, hospital stays, treatment, and prescriptions.',
    topics: ['Treatment', 'Provider', 'Costs'],
    icon: (
      <>
        <path d="M12 21c-5-3-8-6-8-10V6l8-3 8 3v5c0 4-3 7-8 10Z" />
        <path d="M12 8v8M8 12h8" />
      </>
    ),
    available: false,
  },
  {
    id: 'home',
    title: 'Home',
    description: 'Water damage, fire, break-ins, and storm damage at home.',
    topics: ['Damage', 'Rooms', 'Repairs'],
    icon: (
      <>
        <path d="m4 11 8-7 8 7v9H4z" />
        <path d="M10 20v-6h4v6" />
      </>
    ),
    available: false,
  },
];

function ClaimTypePage() {
  const [selectedType, setSelectedType] = useState('auto');
  const navigate = useNavigate();

  return (
    <ClaimWorkspace breadcrumb="New claim">
      <div className="mx-auto max-w-4xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-indigo-600">
          New claim
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          What kind of claim is this?
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Choose one to get the right form. You&apos;ll describe what happened next.
        </p>

        <fieldset className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <legend className="sr-only">Claim type</legend>
          {claimTypes.map((type) => {
            const isSelected = selectedType === type.id;

            return (
              <label
                key={type.id}
                className={`relative flex min-h-52 flex-col rounded-xl border bg-white p-4 transition ${
                  type.available
                    ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md'
                    : 'cursor-not-allowed opacity-75'
                } ${
                  isSelected
                    ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md shadow-indigo-100/60'
                    : 'border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="claimType"
                  value={type.id}
                  checked={isSelected}
                  disabled={!type.available}
                  onChange={() => setSelectedType(type.id)}
                  className="sr-only"
                />
                <span className="flex items-start justify-between">
                  <span
                    className={`grid size-9 place-items-center rounded-lg ${
                      isSelected ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="size-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {type.icon}
                    </svg>
                  </span>
                  <span
                    className={`grid size-4 place-items-center rounded-full border ${
                      isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <svg viewBox="0 0 12 12" className="size-3" fill="none">
                        <path
                          d="m2.5 6 2.2 2.2 4.8-4.8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                </span>
                <span className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  {type.title}
                  {!type.available && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-medium text-slate-500">
                      Coming soon
                    </span>
                  )}
                </span>
                <span className="mt-1.5 text-xs leading-5 text-slate-500">{type.description}</span>
                <span className="mt-3 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  We&apos;ll ask about
                </span>
                <span className="mt-1.5 flex flex-wrap gap-1.5">
                  {type.topics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] text-slate-600"
                    >
                      {topic}
                    </span>
                  ))}
                </span>
              </label>
            );
          })}
        </fieldset>

        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Selected: <span className="font-semibold text-slate-800">Auto claim</span>
          </p>
          <button
            type="button"
            disabled={selectedType !== 'auto'}
            onClick={() => navigate('/claim/auto')}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Continue
            <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
              <path
                d="M4 10h12m-5-5 5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </ClaimWorkspace>
  );
}

export default ClaimTypePage;

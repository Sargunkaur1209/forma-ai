import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const claimNavigation = [
  { label: 'Current claim', to: '/claim/auto', icon: 'document', activeKey: 'claim' },
  { label: 'My drafts', to: '/drafts', icon: 'drafts' },
  { label: 'Submitted', to: '/submitted', icon: 'check' },
];

function NavigationIcon({ name }) {
  const paths = {
    document: (
      <>
        <path d="M7 3.75h7l4 4v12.5H7z" />
        <path d="M14 3.75v4h4M10 12h5M10 15.5h5" />
      </>
    ),
    drafts: (
      <>
        <path d="M5 4.75h10l4 4v10.5H5z" />
        <path d="M15 4.75v4h4M8 12h7M8 15.5h5" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="m8.5 12 2.25 2.25 4.75-5" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

NavigationIcon.propTypes = {
  name: PropTypes.oneOf(['document', 'drafts', 'check']).isRequired,
};

function ClaimWorkspace({ active = '', breadcrumb, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f4f0] text-slate-900 lg:flex-row">
      <aside className="flex w-full shrink-0 flex-col bg-[#10131d] text-slate-300 lg:min-h-screen lg:w-56">
        <div className="flex items-center justify-between px-4 py-4 lg:px-5 lg:pb-5">
          <Link to="/" className="flex items-center gap-2.5 text-sm font-semibold text-white">
            <span className="grid size-7 place-items-center rounded-lg bg-indigo-600 text-xs font-bold">
              F
            </span>
            Forma <span className="text-indigo-300">AI</span>
          </Link>
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
            beta
          </span>
        </div>

        <Link
          to="/claim"
          className="mx-3 mb-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
        >
          <span aria-hidden="true">+</span> New claim
        </Link>

        <nav aria-label="Claims" className="px-3">
          <p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Claims
          </p>
          <div className="flex gap-1 overflow-x-auto lg:flex-col">
            {claimNavigation.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                aria-current={active === item.activeKey ? 'page' : undefined}
                className={`inline-flex min-h-9 shrink-0 items-center gap-2.5 rounded-lg px-2.5 text-xs transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300 ${
                  active === item.activeKey
                    ? 'bg-white/10 font-medium text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <NavigationIcon name={item.icon} />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="mt-auto hidden p-3 lg:block">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[11px] font-semibold text-white">You&apos;re in control</p>
            <p className="mt-1 text-[10px] leading-4 text-slate-400">
              Review every answer before your claim is sent.
            </p>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex min-h-11 items-center border-b border-slate-200/80 px-4 sm:px-7">
          <p className="text-[11px] text-slate-500">
            Claims <span className="mx-1.5 text-slate-300">/</span>
            <span className="font-medium text-slate-700">{breadcrumb}</span>
          </p>
        </header>
        <main className="px-4 py-7 sm:px-7 sm:py-9">{children}</main>
      </div>
    </div>
  );
}

ClaimWorkspace.propTypes = {
  active: PropTypes.string,
  breadcrumb: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default ClaimWorkspace;

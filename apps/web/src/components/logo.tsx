import Link from 'next/link';
import { clsx } from 'clsx';

type LogoProps = {
  className?: string;
  href?: string;
  /** Show subtle ".ai" suffix */
  showDomain?: boolean;
  size?: 'sm' | 'md';
};

/** Premium wordmark: Estate + gradient X + optional .ai; geometric mark (grid / building). */
export function Logo({ className, href = '/', showDomain = true, size = 'md' }: LogoProps) {
  const text = size === 'sm' ? 'text-base' : 'text-lg md:text-xl';
  const iconBox = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  const iconInner = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <Link
      href={href}
      className={clsx(
        'group inline-flex items-center gap-2 font-bold tracking-tight transition-transform duration-200 hover:scale-[1.02]',
        text,
        className,
      )}
    >
      <span
        className={clsx(
          'relative flex shrink-0 items-center justify-center rounded-lg border border-cyan-400/35 bg-gradient-to-br from-cyan-400/15 to-blue-600/25 shadow-[0_0_20px_rgba(34,211,238,0.15)]',
          iconBox,
        )}
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className={clsx('text-cyan-300', iconInner)} fill="currentColor">
          <path d="M4 21V4h9v17H4zm2-2h5v-3H6v3zm0-5h5V9H6v7zm0-9h5V6H6v1zm11 16V10h4v11h-4zm2-2h1v-2h-1v2zm0-4h1v-2h-1v2zm0-4h1V6h-1v2z" />
        </svg>
      </span>
      <span className="flex items-baseline gap-0">
        <span className="text-white">Estate</span>
        <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(34,211,238,0.35)]">
          X
        </span>
        {showDomain && <span className="text-slate-500 font-semibold">.ai</span>}
      </span>
    </Link>
  );
}

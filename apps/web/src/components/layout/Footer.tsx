import Link from 'next/link';
import { Logo } from '@/components/logo';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-brand-bg/80 mt-24 shadow-brand">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <Logo href="/" showDomain />
            <p className="mt-3 text-sm text-slate-500 max-w-md">
              EstateX.ai — Global property intelligence for modern investors
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <h4 className="font-semibold text-white text-sm">Product</h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/properties" className="text-slate-500 hover:text-cyan-400 text-sm transition-colors">
                    Properties
                  </Link>
                </li>
                <li>
                  <Link href="/calculator" className="text-slate-500 hover:text-cyan-400 text-sm transition-colors">
                    Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/compare" className="text-slate-500 hover:text-cyan-400 text-sm transition-colors">
                    Compare
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Company</h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/login" className="text-slate-500 hover:text-cyan-400 text-sm transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-slate-500 hover:text-cyan-400 text-sm transition-colors">
                    Register
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/5 text-center text-sm text-slate-600">
          © {new Date().getFullYear()} EstateX.ai. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

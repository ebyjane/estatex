import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/50 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Investify
            </span>
            <p className="mt-2 text-sm text-slate-500 max-w-xs">
              Global property intelligence for NRI, GCC & US investors.
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <h4 className="font-semibold text-white text-sm">Product</h4>
              <ul className="mt-3 space-y-2">
                <li><Link href="/properties" className="text-slate-500 hover:text-cyan-400 text-sm">Properties</Link></li>
                <li><Link href="/calculator" className="text-slate-500 hover:text-cyan-400 text-sm">Calculator</Link></li>
                <li><Link href="/compare" className="text-slate-500 hover:text-cyan-400 text-sm">Compare</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Company</h4>
              <ul className="mt-3 space-y-2">
                <li><Link href="/login" className="text-slate-500 hover:text-cyan-400 text-sm">Sign In</Link></li>
                <li><Link href="/register" className="text-slate-500 hover:text-cyan-400 text-sm">Register</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/5 text-center text-sm text-slate-600">
          © {new Date().getFullYear()} Investify. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

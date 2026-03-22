import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Check, Globe2, TrendingUp, Shield, BarChart3 } from 'lucide-react';

const GlobalMap = dynamic(() => import('@/components/GlobalMap'), { ssr: false });

export default function LandingPage() {
  return (
    <div className="relative">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/25 via-brand-bg to-brand-bg" />
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-600/10 animate-gradient bg-[length:200%_200%]" />

      <section className="relative pt-12 pb-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400/90 mb-4">
              AI-Powered Global Property Intelligence
            </p>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white text-balance">
              Discover Global Real Estate Opportunities with AI
            </h1>
            <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto text-balance">
              Analyze properties across India, UAE, and the US with AI-powered insights, yield projections, and risk
              scoring.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/properties" className="btn-primary px-8 py-4 text-base">
                Explore Properties
              </Link>
              <Link href="/calculator" className="btn-primary-outline px-8 py-4 text-base">
                Get AI Investment Report
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <div className="card-premium overflow-hidden">
          <div className="h-[400px]">
            <GlobalMap />
          </div>
          <div className="p-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-sm text-slate-500">Live heat layers: Yield | Growth | Undervalued | Risk</span>
            <Link href="/properties?view=map" className="text-cyan-400 text-sm font-medium hover:underline">
              Open Map View →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-balance">
            Global Property Intelligence for Smart Investors
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Stop guessing. Start investing with AI-powered insights across India, Dubai, and the US.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-xl font-semibold text-slate-300 mb-4">Struggling with...</h3>
            <ul className="space-y-3 text-slate-400">
              <li>• Confused by currency fluctuations?</li>
              <li>• Unsure if property is overpriced?</li>
              <li>• Worried about hidden risks?</li>
              <li>• Don&apos;t know which country offers best yield?</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-cyan-400 mb-4">EstateX provides:</h3>
            <ul className="space-y-3">
              {[
                'EstateX Score & yield outlook',
                '5-Year Growth Projection',
                'Currency Risk Simulator',
                'Rental Yield Heatmap',
                'Hidden Cost Transparency',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-300">
                  <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Top Undervalued Markets</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'India', yield: 4.2, growth: 8.1, label: 'High Growth' },
            { name: 'UAE', yield: 5.1, growth: 6.2, label: 'High Yield' },
            { name: 'US', yield: 3.8, growth: 4.5, label: 'Stable' },
          ].map((m) => (
            <div
              key={m.name}
              className="rounded-xl border border-white/10 bg-brand-card/90 backdrop-blur-lg p-6 hover:border-cyan-400/35 transition-all shadow-brand hover:shadow-brand-lg"
            >
              <h4 className="font-semibold text-white">{m.name}</h4>
              <p className="text-xs text-cyan-400 mt-1">{m.label}</p>
              <div className="mt-4 flex gap-4 text-sm">
                <span className="text-slate-500">
                  Yield <span className="text-cyan-400">{m.yield}%</span>
                </span>
                <span className="text-slate-500">
                  5Y <span className="text-emerald-400">{m.growth}%</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Built for Serious Investors</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: TrendingUp, title: 'EstateX Score', desc: '0–100 score, market comparison & 5Y CAGR' },
            { icon: BarChart3, title: 'Multi-Currency', desc: 'INR, USD, AED live FX & ROI impact' },
            { icon: Shield, title: 'Risk Analysis', desc: 'Rental yield, tax & hidden cost estimator' },
            { icon: Globe2, title: 'Cross-Border', desc: 'NRI, GCC, US investor workflows' },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="card-premium p-6 transition-all hover:border-cyan-400/40 hover:scale-[1.02]"
            >
              <Icon className="h-10 w-10 text-cyan-400" />
              <h3 className="mt-4 font-semibold text-white">{title}</h3>
              <p className="mt-2 text-slate-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 backdrop-blur-xl p-12 text-center shadow-brand-lg">
          <h2 className="text-2xl font-bold text-white">NRI Investment Simplified</h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Compare Indian properties in your currency. Understand tax implications. Get AI-rated recommendations.
          </p>
          <Link
            href="/properties?country=IND"
            className="inline-block mt-6 rounded-xl bg-cyan-400 px-6 py-3 font-medium text-slate-950 hover:bg-cyan-300 transition shadow-brand"
          >
            Explore India Properties
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-2xl border border-cyan-400/25 bg-brand-card/80 p-12 text-center shadow-brand-lg">
          <h2 className="text-2xl font-bold text-white">Join Early Investors Before Premium Pricing Begins</h2>
          <p className="mt-4 text-slate-400">Create your free account and start analyzing properties today.</p>
          <Link href="/register" className="inline-block mt-6 btn-primary px-8 py-4">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}

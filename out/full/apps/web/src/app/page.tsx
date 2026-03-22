import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Check, Globe2, TrendingUp, Shield, BarChart3 } from 'lucide-react';

const GlobalMap = dynamic(() => import('@/components/GlobalMap'), { ssr: false });

export default function LandingPage() {
  return (
    <div className="relative">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/30 via-slate-950 to-slate-950" />
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 animate-gradient bg-[length:200%_200%]" />

      {/* Hero */}
      <section className="relative pt-12 pb-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
              Invest Smarter Across Borders.
            </h1>
            <p className="mt-6 text-lg text-slate-400">
              AI-Scored | Currency Optimized | Risk Rated | Global Ready
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/properties"
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-4 font-semibold text-white hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20"
              >
                Explore Global Properties
              </Link>
              <Link
                href="/calculator"
                className="rounded-xl border border-white/20 bg-white/5 px-8 py-4 font-semibold text-white hover:bg-white/10 transition-all"
              >
                Get AI Investment Report
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Global Heatmap Preview */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl">
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

      {/* Pain Points + Solution */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Global Property Intelligence for Smart Investors.
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
            <h3 className="text-xl font-semibold text-cyan-400 mb-4">Investify provides:</h3>
            <ul className="space-y-3">
              {[
                'AI Value Score',
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

      {/* Top Undervalued Markets */}
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
              className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-lg p-6 hover:border-cyan-500/30 transition-all"
            >
              <h4 className="font-semibold text-white">{m.name}</h4>
              <p className="text-xs text-cyan-400 mt-1">{m.label}</p>
              <div className="mt-4 flex gap-4 text-sm">
                <span className="text-slate-500">Yield <span className="text-cyan-400">{m.yield}%</span></span>
                <span className="text-slate-500">5Y <span className="text-emerald-400">{m.growth}%</span></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Built for Serious Investors</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: TrendingUp, title: 'AI Value Score', desc: '0–100 score, market comparison & 5Y CAGR' },
            { icon: BarChart3, title: 'Multi-Currency', desc: 'INR, USD, AED live FX & ROI impact' },
            { icon: Shield, title: 'Risk Analysis', desc: 'Rental yield, tax & hidden cost estimator' },
            { icon: Globe2, title: 'Cross-Border', desc: 'NRI, GCC, US investor workflows' },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-lg p-6 transition-all hover:border-cyan-500/30 hover:scale-[1.02]"
            >
              <Icon className="h-10 w-10 text-cyan-400" />
              <h3 className="mt-4 font-semibold text-white">{title}</h3>
              <p className="mt-2 text-slate-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NRI Simplified */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl p-12 text-center">
          <h2 className="text-2xl font-bold text-white">NRI Investment Simplified</h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Compare Indian properties in your currency. Understand tax implications. Get AI-rated recommendations.
          </p>
          <Link
            href="/properties?country=IND"
            className="inline-block mt-6 rounded-xl bg-cyan-500 px-6 py-3 font-medium text-white hover:bg-cyan-400 transition"
          >
            Explore India Properties
          </Link>
        </div>
      </section>

      {/* Urgency CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-12 text-center">
          <h2 className="text-2xl font-bold text-white">
            Join Early Investors Before Premium Pricing Begins.
          </h2>
          <p className="mt-4 text-slate-400">Create your free account and start analyzing properties today.</p>
          <Link
            href="/register"
            className="inline-block mt-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-4 font-semibold text-white hover:opacity-90 transition"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}

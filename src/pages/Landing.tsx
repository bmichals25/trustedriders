import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Rocket, Zap, TrendingUp, Brain, ArrowRight, Check } from 'lucide-react'

const FEATURES = [
  {
    icon: Rocket,
    title: 'Describe it. We build it.',
    description: 'Tell us your business idea in one sentence. Our AI agents research the market, plan the build, and deploy a live product — in hours, not months.',
  },
  {
    icon: TrendingUp,
    title: 'Autonomous optimization',
    description: 'Your business improves every day. AI agents test changes, measure results, keep what works, roll back what doesn\'t. Conversion compounds while you sleep.',
  },
  {
    icon: Brain,
    title: 'Cross-venture intelligence',
    description: 'Learnings from thousands of ventures feed into yours. The platform gets smarter with every optimization cycle across every business.',
  },
  {
    icon: Zap,
    title: 'Revenue on autopilot',
    description: 'Stripe payments, SEO content, landing page optimization — all handled by your AI agent team. You check the dashboard when you feel like it.',
  },
]

const PRICING = [
  {
    name: 'Starter',
    price: '$29',
    period: '/mo',
    description: 'Launch your first autonomous business',
    features: [
      '1 venture',
      'AI build + deploy',
      'Daily optimization cycles',
      'Plausible analytics',
      'Stripe payments',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '$79',
    period: '/mo',
    description: 'Scale your portfolio',
    features: [
      '5 ventures',
      'Priority agent compute',
      'Hourly optimization cycles',
      'Cross-venture intelligence',
      'Custom domains',
      'Revenue analytics',
    ],
    cta: 'Start Growing',
    highlighted: true,
  },
  {
    name: 'Scale',
    price: '$199',
    period: '/mo',
    description: 'Unlimited autonomous businesses',
    features: [
      'Unlimited ventures',
      'Dedicated agent pool',
      'Real-time optimization',
      'Full knowledge graph access',
      'API access',
      'White-label option',
    ],
    cta: 'Go Unlimited',
    highlighted: false,
  },
]

const STEPS = [
  { num: '01', title: 'Describe your idea', desc: '"I want to sell AI prompt packs for real estate agents"' },
  { num: '02', title: 'AI researches & builds', desc: 'Agents validate the market, build the site, deploy to Netlify, wire up Stripe' },
  { num: '03', title: 'Optimization begins', desc: 'Daily cycles test headlines, CTAs, pricing — keeping what improves conversion' },
  { num: '04', title: 'Revenue flows', desc: 'Organic traffic grows from SEO content. Conversion compounds from optimization. Money arrives.' },
]

export default function Landing() {
  const navigate = useNavigate()

  const handleCTA = () => {
    // Link to Stripe checkout or signup
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-[#09090B]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold text-white">
              E
            </div>
            <span className="text-lg font-bold tracking-tight">Evolute</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-zinc-400 hover:text-white transition"
            >
              Sign in
            </button>
            <button
              onClick={handleCTA}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition"
            >
              Get Early Access
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
              <Zap className="h-3.5 w-3.5" />
              Now in early access
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Describe a business.
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                We build and run it.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed">
              Evolute is an autonomous business factory. AI agents build your product, deploy it,
              optimize conversion daily, and generate revenue — while you sleep.
              You describe it. We do everything else.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                onClick={handleCTA}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-violet-500 transition active:scale-95"
              >
                Launch Your First Business
                <ArrowRight className="h-4 w-4" />
              </button>
              <span className="text-sm text-zinc-500">Starts at $29/mo</span>
            </div>
          </motion.div>
        </div>

        {/* Gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
          <div className="absolute -top-20 right-1/4 h-[400px] w-[400px] rounded-full bg-fuchsia-600/8 blur-[100px]" />
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-zinc-800/50 py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold">How it works</h2>
          <p className="mt-3 text-center text-zinc-400">From idea to revenue in four steps</p>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <span className="text-4xl font-bold text-zinc-800">{step.num}</span>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-800/50 py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold">Built for the autonomous economy</h2>
          <p className="mt-3 text-center text-zinc-400">
            Every feature is designed for businesses that run themselves
          </p>

          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
              >
                <f.icon className="h-8 w-8 text-violet-400" />
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-zinc-800/50 py-24 px-6" id="pricing">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold">Simple pricing</h2>
          <p className="mt-3 text-center text-zinc-400">
            Pay for the platform. Keep your revenue. Evolute takes a 12% fee on transactions.
          </p>

          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {PRICING.map((plan) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`rounded-xl border p-6 ${
                  plan.highlighted
                    ? 'border-violet-500/50 bg-violet-500/5 ring-1 ring-violet-500/20'
                    : 'border-zinc-800 bg-zinc-900/50'
                }`}
              >
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-zinc-400">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-zinc-400">{plan.description}</p>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-violet-400 shrink-0" />
                      <span className="text-zinc-300">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleCTA}
                  className={`mt-8 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                    plan.highlighted
                      ? 'bg-violet-600 text-white hover:bg-violet-500'
                      : 'bg-zinc-800 text-white hover:bg-zinc-700'
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-zinc-500">
            + 12% platform fee on venture revenue. Your Stripe payouts go directly to your bank.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-800/50 py-24 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">Your first business is one sentence away</h2>
          <p className="mt-4 text-zinc-400">
            Stop planning. Start launching. Let AI agents do the building, optimizing, and growing.
          </p>
          <button
            onClick={handleCTA}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-violet-500 transition active:scale-95"
          >
            Get Early Access
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-8 px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-sm text-zinc-500">
          <span>Evolute {new Date().getFullYear()}</span>
          <span>Built by AI agents, for AI-native businesses</span>
        </div>
      </footer>
    </div>
  )
}

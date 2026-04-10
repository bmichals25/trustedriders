import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, ArrowRight, ArrowLeft, Rocket, Sparkles,
  Loader2, CheckCircle, AlertTriangle,
  ShoppingBag, Code, CalendarCheck, FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCreateVenture } from '@/lib/hooks/use-ventures'
import { VENTURE_PALETTES } from '@/lib/constants'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BusinessResearch {
  summary: string
  product_type: 'digital_product' | 'micro_saas' | 'service' | 'content'
  recommended_pricing: string
  competitors: string[]
  go_no_go: 'go' | 'no_go' | 'maybe'
  reasoning: string
  suggested_name: string
  suggested_description: string
}

type WizardStep = 'describe' | 'research' | 'customize' | 'launching'

const PRODUCT_TYPE_LABELS: Record<string, { label: string; icon: typeof ShoppingBag; description: string }> = {
  digital_product: {
    label: 'Digital Product',
    icon: ShoppingBag,
    description: 'Landing page + Stripe checkout + instant delivery',
  },
  micro_saas: {
    label: 'Micro-SaaS',
    icon: Code,
    description: 'Web app + auth + subscription billing',
  },
  service: {
    label: 'Service Business',
    icon: CalendarCheck,
    description: 'Booking page + intake form + payments',
  },
  content: {
    label: 'Content / Affiliate',
    icon: FileText,
    description: 'Blog + SEO + affiliate links or ads',
  },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface VentureLaunchWizardProps {
  open: boolean
  onClose: () => void
}

export default function VentureLaunchWizard({ open, onClose }: VentureLaunchWizardProps) {
  const navigate = useNavigate()
  const createVenture = useCreateVenture()

  const [step, setStep] = useState<WizardStep>('describe')
  const [businessIdea, setBusinessIdea] = useState('')
  const [research, setResearch] = useState<BusinessResearch | null>(null)
  const [researching, setResearching] = useState(false)
  const [ventureName, setVentureName] = useState('')
  const [ventureDescription, setVentureDescription] = useState('')
  const [selectedPalette, setSelectedPalette] = useState(0)
  const [launching, setLaunching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setStep('describe')
    setBusinessIdea('')
    setResearch(null)
    setResearching(false)
    setVentureName('')
    setVentureDescription('')
    setSelectedPalette(0)
    setLaunching(false)
    setError(null)
  }

  const handleClose = () => {
    onClose()
    setTimeout(reset, 300)
  }

  // Step 1 → 2: Research the idea
  async function handleResearch() {
    if (!businessIdea.trim()) return
    setResearching(true)
    setError(null)

    try {
      // For now, generate a structured research response locally.
      // In production, this calls an AI agent via Supabase Edge Function.
      const mockResearch: BusinessResearch = {
        summary: `Analysis of "${businessIdea}": This is a viable digital business opportunity with moderate competition and clear monetization potential.`,
        product_type: 'digital_product',
        recommended_pricing: '$19-49 one-time or $9-29/mo subscription',
        competitors: ['Similar Product A', 'Alternative B', 'Competitor C'],
        go_no_go: 'go',
        reasoning: 'Low barrier to entry, clear target audience, proven demand for similar products.',
        suggested_name: businessIdea.split(' ').slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(''),
        suggested_description: `AI-powered platform for ${businessIdea.toLowerCase()}`,
      }

      // Simulate research delay
      await new Promise(r => setTimeout(r, 2000))

      setResearch(mockResearch)
      setVentureName(mockResearch.suggested_name)
      setVentureDescription(mockResearch.suggested_description)
      setStep('research')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Research failed')
    } finally {
      setResearching(false)
    }
  }

  // Step 3: Create venture and launch autonomous pipeline
  async function handleLaunch() {
    if (!ventureName.trim()) return
    setLaunching(true)
    setError(null)
    setStep('launching')

    try {
      const palette = VENTURE_PALETTES[selectedPalette] ?? VENTURE_PALETTES[0]

      const venture = await createVenture.mutateAsync({
        name: ventureName,
        description: ventureDescription,
        stage: 'building',
        primary_color: palette.primary,
        secondary_color: palette.secondary,
        logo_emoji: null,
        logo_url: null,
      })

      // TODO: In next sprint, auto-create missions + team + start orchestration here
      // For now, navigate to the venture detail where user can set up manually

      handleClose()
      navigate(`/venture/${venture.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Launch failed')
      setStep('customize')
      setLaunching(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-[#0F0F11] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Launch a Business</h2>
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1 px-6 pt-4">
          {(['describe', 'research', 'customize', 'launching'] as WizardStep[]).map((s, i) => (
            <div
              key={s}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                i <= ['describe', 'research', 'customize', 'launching'].indexOf(step)
                  ? 'bg-primary'
                  : 'bg-border',
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[320px] px-6 py-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Describe */}
            {step === 'describe' && (
              <motion.div
                key="describe"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-base font-medium text-foreground">What business do you want to build?</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Describe your idea in a sentence or two. Our AI will research the market and plan the build.
                  </p>
                </div>

                <textarea
                  value={businessIdea}
                  onChange={(e) => setBusinessIdea(e.target.value)}
                  placeholder='e.g. "A marketplace for freelance music producers to sell beat packs"'
                  className="h-28 w-full resize-none rounded-lg border border-border bg-[#18181B] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />

                {error && <p className="text-sm text-red-400">{error}</p>}
              </motion.div>
            )}

            {/* Step 2: Research results */}
            {step === 'research' && research && (
              <motion.div
                key="research"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  {research.go_no_go === 'go' ? (
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                  )}
                  <h3 className="text-base font-medium text-foreground">
                    {research.go_no_go === 'go' ? 'Looks viable!' : 'Proceed with caution'}
                  </h3>
                </div>

                <p className="text-sm text-muted-foreground">{research.summary}</p>

                <div className="grid grid-cols-2 gap-3">
                  {/* Product type */}
                  <div className="rounded-lg border border-border bg-[#18181B] p-3">
                    <p className="text-xs text-muted-foreground">Recommended Type</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {PRODUCT_TYPE_LABELS[research.product_type]?.label ?? research.product_type}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="rounded-lg border border-border bg-[#18181B] p-3">
                    <p className="text-xs text-muted-foreground">Suggested Pricing</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{research.recommended_pricing}</p>
                  </div>
                </div>

                {/* Competitors */}
                <div className="rounded-lg border border-border bg-[#18181B] p-3">
                  <p className="text-xs text-muted-foreground">Competitors Found</p>
                  <p className="mt-1 text-sm text-foreground">{research.competitors.join(', ')}</p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Customize */}
            {step === 'customize' && (
              <motion.div
                key="customize"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-base font-medium text-foreground">Customize your venture</h3>

                <div>
                  <label className="mb-1.5 block text-sm text-muted-foreground">Name</label>
                  <input
                    value={ventureName}
                    onChange={(e) => setVentureName(e.target.value)}
                    className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-muted-foreground">Description</label>
                  <textarea
                    value={ventureDescription}
                    onChange={(e) => setVentureDescription(e.target.value)}
                    rows={2}
                    className="w-full resize-none rounded-md border border-border bg-[#18181B] px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-muted-foreground">Color Theme</label>
                  <div className="flex flex-wrap gap-2">
                    {VENTURE_PALETTES.slice(0, 12).map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedPalette(i)}
                        className={cn(
                          'h-8 w-8 rounded-full border-2 transition',
                          selectedPalette === i ? 'border-white scale-110' : 'border-transparent',
                        )}
                        style={{ background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})` }}
                      />
                    ))}
                  </div>
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}
              </motion.div>
            )}

            {/* Step 4: Launching */}
            {step === 'launching' && (
              <motion.div
                key="launching"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-4 text-lg font-medium text-foreground">Launching your business...</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Creating venture, assembling agent team, planning build...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {step !== 'launching' && (
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <button
              onClick={step === 'describe' ? handleClose : () => {
                const steps: WizardStep[] = ['describe', 'research', 'customize']
                const idx = steps.indexOf(step)
                if (idx > 0) setStep(steps[idx - 1])
              }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {step === 'describe' ? 'Cancel' : 'Back'}
            </button>

            {step === 'describe' && (
              <button
                onClick={handleResearch}
                disabled={!businessIdea.trim() || researching}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
              >
                {researching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Researching...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Research This Idea
                  </>
                )}
              </button>
            )}

            {step === 'research' && (
              <button
                onClick={() => setStep('customize')}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Customize & Launch
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {step === 'customize' && (
              <button
                onClick={handleLaunch}
                disabled={!ventureName.trim() || launching}
                className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
              >
                <Rocket className="h-4 w-4" />
                Launch Business
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

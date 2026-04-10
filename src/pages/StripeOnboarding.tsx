import { useUserProfile } from '@/lib/hooks/use-stripe-connect'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { CheckCircle, ExternalLink, CreditCard, AlertCircle } from 'lucide-react'

export default function StripeOnboarding() {
  const { user } = useAuthContext()
  const { data: profile, isLoading } = useUserProfile()

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
      </div>
    )
  }

  const isConnected = profile?.stripe_onboarded && profile?.stripe_charges_enabled

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-foreground">Payment Setup</h1>
      <p className="mt-2 text-muted-foreground">
        Connect your Stripe account to receive revenue from your ventures.
        Evolute takes a small platform fee — the rest goes directly to you.
      </p>

      <div className="mt-8 space-y-6">
        {/* Status card */}
        <div className="rounded-lg border border-border bg-[#18181B] p-6">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                <CheckCircle className="h-6 w-6 text-emerald-400" />
                <div>
                  <p className="font-medium text-foreground">Stripe Connected</p>
                  <p className="text-sm text-muted-foreground">
                    Account {profile?.stripe_account_id} — charges and payouts enabled
                  </p>
                </div>
              </>
            ) : profile?.stripe_account_id ? (
              <>
                <AlertCircle className="h-6 w-6 text-amber-400" />
                <div>
                  <p className="font-medium text-foreground">Setup Incomplete</p>
                  <p className="text-sm text-muted-foreground">
                    Your Stripe account needs additional verification to accept payments.
                  </p>
                </div>
              </>
            ) : (
              <>
                <CreditCard className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">No Stripe Account</p>
                  <p className="text-sm text-muted-foreground">
                    Connect or create a Stripe account to start earning.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Connect button */}
        {!isConnected && (
          <button
            onClick={() => {
              // In production: call Supabase Edge Function that creates a Stripe Connect
              // account link and redirects the user. For now, show instructions.
              const stripeUrl = `https://connect.stripe.com/express/oauth/authorize?client_id=${
                import.meta.env.VITE_STRIPE_CLIENT_ID || 'YOUR_CLIENT_ID'
              }&state=${user?.id}&redirect_uri=${window.location.origin}/stripe/callback`
              window.open(stripeUrl, '_blank')
            }}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-[#635BFF] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#5851DB]"
          >
            <ExternalLink className="h-4 w-4" />
            Connect with Stripe
          </button>
        )}

        {/* How it works */}
        <div className="rounded-lg border border-border bg-[#18181B] p-6">
          <h3 className="text-sm font-medium text-foreground">How revenue sharing works</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">1.</span>
              Your ventures generate sales through Stripe Checkout
            </li>
            <li className="flex gap-2">
              <span className="text-primary">2.</span>
              Stripe automatically splits each payment
            </li>
            <li className="flex gap-2">
              <span className="text-primary">3.</span>
              You receive 88% — Evolute keeps 12% as a platform fee
            </li>
            <li className="flex gap-2">
              <span className="text-primary">4.</span>
              Payouts go directly to your bank on Stripe's standard schedule
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

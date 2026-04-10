// ---------------------------------------------------------------------------
// Real metric fetching for optimization cycles
// Fetches from Plausible Analytics and Stripe APIs before each cycle
// ---------------------------------------------------------------------------

/**
 * Fetch real metrics from configured sources for a venture/mission.
 * Returns a map of metric_name → current_value to update KPIs.
 *
 * @param {object} supabase - Supabase client
 * @param {string} ventureId - Venture ID
 * @param {string} missionId - Mission ID
 * @returns {Promise<Record<string, number>>} metric values
 */
export async function fetchRealMetrics(supabase, ventureId, missionId) {
  const metrics = {}

  // Fetch venture env vars for API keys
  const { data: envVars } = await supabase
    .from('venture_env_vars')
    .select('key, value')
    .eq('venture_id', ventureId)

  const env = {}
  for (const row of (envVars ?? [])) {
    env[row.key] = row.value
  }

  // --- Plausible Analytics ---
  if (env.PLAUSIBLE_SITE_ID && env.PLAUSIBLE_API_KEY) {
    try {
      const plausibleMetrics = await fetchPlausibleMetrics(
        env.PLAUSIBLE_SITE_ID,
        env.PLAUSIBLE_API_KEY,
        env.PLAUSIBLE_HOST || 'https://plausible.io',
      )
      Object.assign(metrics, plausibleMetrics)
    } catch (err) {
      console.error(`   ⚠️  Plausible fetch failed: ${err.message}`)
    }
  }

  // --- Stripe Revenue ---
  if (env.STRIPE_SECRET_KEY) {
    try {
      const stripeMetrics = await fetchStripeMetrics(env.STRIPE_SECRET_KEY)
      Object.assign(metrics, stripeMetrics)
    } catch (err) {
      console.error(`   ⚠️  Stripe fetch failed: ${err.message}`)
    }
  }

  // --- Uptime Check ---
  const { data: links } = await supabase
    .from('venture_links')
    .select('url, label')
    .eq('venture_id', ventureId)
    .eq('label', 'live_url')
    .limit(1)

  if (links?.[0]?.url) {
    try {
      const start = Date.now()
      const res = await fetch(links[0].url, { method: 'HEAD', signal: AbortSignal.timeout(10000) })
      const latency = Date.now() - start
      metrics.site_up = res.ok ? 1 : 0
      metrics.response_time_ms = latency
    } catch {
      metrics.site_up = 0
    }
  }

  return metrics
}

/**
 * Update mission KPIs with real metric values.
 */
export async function updateKPIsFromMetrics(supabase, missionId, metrics) {
  const { data: kpis } = await supabase
    .from('mission_kpis')
    .select('id, label, current_val')
    .eq('mission_id', missionId)

  let updated = 0
  for (const kpi of (kpis ?? [])) {
    // Match KPI label to metric key (fuzzy: "visitors" matches "visitors_7d")
    const normalizedLabel = kpi.label.toLowerCase().replace(/[\s_-]+/g, '_')
    const matchingKey = Object.keys(metrics).find(k =>
      normalizedLabel.includes(k) || k.includes(normalizedLabel)
    )

    if (matchingKey && metrics[matchingKey] !== undefined) {
      const newVal = metrics[matchingKey]
      if (newVal !== kpi.current_val) {
        await supabase
          .from('mission_kpis')
          .update({ current_val: newVal })
          .eq('id', kpi.id)
        updated++
        console.log(`   📊 KPI "${kpi.label}": ${kpi.current_val} → ${newVal}`)
      }
    }
  }

  return updated
}

// ---------------------------------------------------------------------------
// Plausible Analytics
// ---------------------------------------------------------------------------

async function fetchPlausibleMetrics(siteId, apiKey, host) {
  const baseUrl = `${host}/api/v1/stats`

  // Last 7 days aggregate
  const params = new URLSearchParams({
    site_id: siteId,
    period: '7d',
    metrics: 'visitors,pageviews,bounce_rate,visit_duration,events',
  })

  const res = await fetch(`${baseUrl}/aggregate?${params}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) throw new Error(`Plausible API ${res.status}: ${await res.text()}`)
  const data = await res.json()
  const r = data.results || {}

  return {
    visitors_7d: r.visitors?.value ?? 0,
    pageviews_7d: r.pageviews?.value ?? 0,
    bounce_rate: r.bounce_rate?.value ?? 0,
    avg_visit_duration: r.visit_duration?.value ?? 0,
  }
}

// ---------------------------------------------------------------------------
// Stripe Revenue
// ---------------------------------------------------------------------------

async function fetchStripeMetrics(secretKey) {
  // Revenue last 7 days
  const sevenDaysAgo = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000)

  const params = new URLSearchParams({
    'created[gte]': String(sevenDaysAgo),
    type: 'charge',
    limit: '100',
  })

  const res = await fetch(`https://api.stripe.com/v1/balance_transactions?${params}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) throw new Error(`Stripe API ${res.status}: ${await res.text()}`)
  const data = await res.json()

  const transactions = data.data ?? []
  const successful = transactions.filter(t => t.status === 'available')
  const totalRevenue = successful.reduce((sum, t) => sum + t.amount, 0) // in cents
  const totalFees = successful.reduce((sum, t) => sum + t.fee, 0)

  return {
    revenue_7d_cents: totalRevenue,
    revenue_7d: Math.round(totalRevenue / 100), // dollars
    payment_count_7d: successful.length,
    stripe_fees_7d: Math.round(totalFees / 100),
  }
}

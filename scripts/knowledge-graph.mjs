// ---------------------------------------------------------------------------
// Knowledge Graph — Extract learnings from optimization cycles
//
// After each cycle completes, extract tactics/patterns as graph nodes.
// Before each cycle starts, query the graph for relevant prior intelligence.
// ---------------------------------------------------------------------------

/**
 * Extract learnings from a completed optimization cycle into the knowledge graph.
 * Creates/updates nodes and edges based on what was tested and whether it worked.
 *
 * @param {object} supabase - Supabase client
 * @param {object} cycle - Completed optimization_cycles row
 * @param {string} ventureId - Venture ID
 * @param {string} missionId - Mission ID
 */
export async function extractCycleLearnings(supabase, cycle, ventureId, missionId) {
  if (!cycle.hypothesis || cycle.kept === null) return

  // Normalize the hypothesis into a tactic label
  const tacticLabel = normalizeTactic(cycle.hypothesis)
  if (!tacticLabel) return

  // Fetch mission context for tagging
  const { data: mission } = await supabase
    .from('missions')
    .select('type, goal_metric')
    .eq('id', missionId)
    .single()

  // Upsert the tactic node
  const { data: existingNodes } = await supabase
    .from('knowledge_nodes')
    .select('id, times_tested, times_kept, avg_impact')
    .eq('label', tacticLabel)
    .limit(1)

  let nodeId
  const goalMetricBefore = cycle.kpi_before?.[mission?.goal_metric] ?? null
  const goalMetricAfter = cycle.kpi_after?.[mission?.goal_metric] ?? null
  const impact = goalMetricBefore != null && goalMetricAfter != null
    ? goalMetricAfter - goalMetricBefore
    : null

  if (existingNodes?.length > 0) {
    // Update existing node with new evidence
    const node = existingNodes[0]
    const newTimesTested = node.times_tested + 1
    const newTimesKept = node.times_kept + (cycle.kept ? 1 : 0)
    const newAvgImpact = impact != null
      ? ((node.avg_impact ?? 0) * node.times_tested + impact) / newTimesTested
      : node.avg_impact

    await supabase
      .from('knowledge_nodes')
      .update({
        times_tested: newTimesTested,
        times_kept: newTimesKept,
        avg_impact: newAvgImpact,
        confidence: newTimesKept / newTimesTested,
        venture_types: addUnique([], mission?.type),
        metric_types: addUnique([], mission?.goal_metric),
      })
      .eq('id', node.id)

    nodeId = node.id
  } else {
    // Create new node
    const { data: newNode } = await supabase
      .from('knowledge_nodes')
      .insert({
        label: tacticLabel,
        node_type: 'tactic',
        description: cycle.change_description,
        source_type: 'extracted',
        confidence: cycle.kept ? 1.0 : 0.0,
        times_tested: 1,
        times_kept: cycle.kept ? 1 : 0,
        avg_impact: impact,
        venture_types: mission?.type ? [mission.type] : [],
        metric_types: mission?.goal_metric ? [mission.goal_metric] : [],
      })
      .select('id')
      .single()

    nodeId = newNode?.id
  }

  if (!nodeId) return

  // Create provenance record
  await supabase.from('knowledge_provenance').insert({
    node_id: nodeId,
    cycle_id: cycle.id,
    venture_id: ventureId,
    mission_id: missionId,
    metric_before: goalMetricBefore,
    metric_after: goalMetricAfter,
    was_kept: cycle.kept,
  }).onConflict('node_id,cycle_id').ignore()

  // Create edge: tactic → metric relationship
  if (mission?.goal_metric) {
    // Ensure metric node exists
    const metricLabel = mission.goal_metric
    const { data: metricNodes } = await supabase
      .from('knowledge_nodes')
      .select('id')
      .eq('label', metricLabel)
      .eq('node_type', 'metric')
      .limit(1)

    let metricNodeId
    if (metricNodes?.length > 0) {
      metricNodeId = metricNodes[0].id
    } else {
      const { data: newMetric } = await supabase
        .from('knowledge_nodes')
        .insert({
          label: metricLabel,
          node_type: 'metric',
          source_type: 'extracted',
          confidence: 1.0,
        })
        .select('id')
        .single()
      metricNodeId = newMetric?.id
    }

    if (metricNodeId) {
      const edgeType = cycle.kept ? 'improves' : 'hurts'
      // Upsert edge
      const { data: existingEdge } = await supabase
        .from('knowledge_edges')
        .select('id, evidence_count, weight')
        .eq('source_id', nodeId)
        .eq('target_id', metricNodeId)
        .eq('edge_type', edgeType)
        .limit(1)

      if (existingEdge?.length > 0) {
        await supabase
          .from('knowledge_edges')
          .update({
            evidence_count: existingEdge[0].evidence_count + 1,
            weight: (existingEdge[0].weight * existingEdge[0].evidence_count + (impact ?? 0))
              / (existingEdge[0].evidence_count + 1),
          })
          .eq('id', existingEdge[0].id)
      } else {
        await supabase.from('knowledge_edges').insert({
          source_id: nodeId,
          target_id: metricNodeId,
          edge_type: edgeType,
          weight: impact ?? 0,
          source_type: 'extracted',
          confidence: 1.0,
          evidence_count: 1,
          description: `${tacticLabel} ${edgeType} ${metricLabel}`,
        }).onConflict('source_id,target_id,edge_type').ignore()
      }
    }
  }

  console.log(`   🧠 Knowledge graph: "${tacticLabel}" → ${cycle.kept ? 'KEPT' : 'HURT'} (${mission?.goal_metric})`)
}

/**
 * Query the knowledge graph for relevant prior intelligence before a cycle.
 * Returns a formatted string to inject into the orchestrator prompt.
 *
 * @param {object} supabase - Supabase client
 * @param {string} goalMetric - The metric being optimized
 * @param {string} ventureType - The type of venture/mission
 * @param {number} limit - Max learnings to return
 * @returns {Promise<string>} Formatted intelligence section for prompt
 */
export async function queryGraphIntelligence(supabase, goalMetric, ventureType, limit = 10) {
  // Find tactics that have been tested for this metric
  const { data: edges } = await supabase
    .from('knowledge_edges')
    .select(`
      edge_type, weight, evidence_count, confidence,
      source:knowledge_nodes!source_id(label, times_tested, times_kept, avg_impact, confidence)
    `)
    .eq('target_id', await getMetricNodeId(supabase, goalMetric))
    .order('evidence_count', { ascending: false })
    .limit(limit)

  if (!edges?.length) return ''

  const lines = edges.map(e => {
    const node = e.source
    if (!node) return null
    const successRate = node.times_tested > 0
      ? Math.round((node.times_kept / node.times_tested) * 100)
      : 0
    const impact = node.avg_impact != null
      ? (node.avg_impact > 0 ? `+${node.avg_impact.toFixed(1)}` : node.avg_impact.toFixed(1))
      : '?'
    const verdict = e.edge_type === 'improves' ? '✅' : '❌'
    return `  ${verdict} "${node.label}" — tested ${node.times_tested}x, kept ${successRate}%, avg impact: ${impact}`
  }).filter(Boolean)

  if (lines.length === 0) return ''

  return `\nPlatform Intelligence (learnings from all ventures optimizing ${goalMetric}):\n${lines.join('\n')}\n\nUse these insights: prefer tactics with high success rates, avoid those that consistently hurt the metric.\n`
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getMetricNodeId(supabase, metricLabel) {
  if (!metricLabel) return null
  const { data } = await supabase
    .from('knowledge_nodes')
    .select('id')
    .eq('label', metricLabel)
    .eq('node_type', 'metric')
    .limit(1)
  return data?.[0]?.id ?? null
}

function normalizeTactic(hypothesis) {
  if (!hypothesis) return null
  // Extract the core tactic from a hypothesis string
  // e.g. "Add trust badges above the fold to increase credibility" → "trust badges"
  const cleaned = hypothesis
    .toLowerCase()
    .replace(/^(add|implement|create|change|update|modify|remove|test|try)\s+/i, '')
    .replace(/\s+(to|for|that|which|in order to|so that|because|above|below|on|in|at).*$/i, '')
    .trim()
  return cleaned.length > 2 && cleaned.length < 100 ? cleaned : hypothesis.slice(0, 80)
}

function addUnique(arr, val) {
  if (!val) return arr
  return arr.includes(val) ? arr : [...arr, val]
}

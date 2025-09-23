import { createClient } from 'npm:@supabase/supabase-js@2'

type BusinessPitch = {
  category: string
  currentRevenue: number
  projectedRevenue: number
  marketSize: number
  teamExperience: number
  fundingRequest: number
  equityOffered: number
}

type Shark = {
  id: string
  name: string
  preferredCategories: string[]
  revenueRequirement: number
  equityPreference: number // 0..1
  riskTolerance: number // 0..1
}

type SharkDecision = {
  sharkId: string
  isOut: boolean
  offer?: { amount: number; equity: number; conditions?: string }
  reasoning: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function getRandomCondition(): string | undefined {
  const conditions = [
    'I want to be involved in key strategic decisions',
    'Monthly board meetings are required',
    'I need right of first refusal on future funding rounds',
    "Let's include a performance milestone",
    undefined,
  ]
  return Math.random() < 0.7
    ? conditions[Math.floor(Math.random() * conditions.length)]
    : undefined
}

function calculateSharkDecision(shark: Shark, pitch: BusinessPitch): SharkDecision {
  let score = 0
  let reasoning = ''

  const categoryBonus = shark.preferredCategories.includes(pitch.category) ? 30 : -10
  score += categoryBonus
  reasoning += categoryBonus > 0
    ? `${shark.name} loves the ${pitch.category} space. `
    : `${shark.name} is less familiar with ${pitch.category}. `

  const revenueScore =
    pitch.currentRevenue >= shark.revenueRequirement
      ? 25
      : (pitch.currentRevenue / Math.max(1, shark.revenueRequirement)) * 25 - 15
  score += revenueScore
  reasoning += revenueScore > 15
    ? 'Strong revenue traction is impressive. '
    : 'Revenue numbers are concerning. '

  const impliedValuation = pitch.fundingRequest / Math.max(0.01, pitch.equityOffered / 100)
  const revenueMultiple = impliedValuation / Math.max(pitch.currentRevenue, 1)
  const valuationScore = revenueMultiple <= 10 ? 20 : revenueMultiple <= 20 ? 10 : -10
  score += valuationScore
  reasoning += valuationScore > 10
    ? 'Valuation seems reasonable. '
    : 'Valuation appears too high. '

  const marketScore = pitch.marketSize >= 100000000 ? 15 : pitch.marketSize >= 10000000 ? 10 : 5
  score += marketScore

  const teamScore = (pitch.teamExperience / 10) * 10
  score += teamScore

  const randomFactor = (Math.random() - 0.5) * 20 * Math.max(0, Math.min(1, shark.riskTolerance))
  score += randomFactor

  const isOut = score < 50
  if (isOut) {
    return { sharkId: shark.id, isOut: true, reasoning: reasoning + "Unfortunately, I'm out." }
  }

  const offerAmount = pitch.fundingRequest
  let equityAsked = Math.max(pitch.equityOffered * 1.2, shark.equityPreference * 100)
  equityAsked = Math.min(equityAsked, 50)

  return {
    sharkId: shark.id,
    isOut: false,
    offer: { amount: offerAmount, equity: Math.round(equityAsked), conditions: getRandomCondition() },
    reasoning: reasoning + `I'll offer $${offerAmount.toLocaleString()} for ${Math.round(equityAsked)}% equity.`,
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )
    // not used now, but ready for future auth/lookup
    void supabaseClient

    const { sharks, pitch } = await req.json()

    if (!Array.isArray(sharks) || !pitch) {
      return new Response(
        JSON.stringify({ error: 'INVALID_REQUEST', message: 'Expected sharks[] and pitch' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
      )
    }

    const decisions: SharkDecision[] = sharks.map((s: Shark) => calculateSharkDecision(s, pitch))

    console.log('[shark-decision-maker] decisions generated', { count: decisions.length })

    return new Response(JSON.stringify({ decisions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('[shark-decision-maker] Error', { error: String((error as any)?.message || error) })
    return new Response(
      JSON.stringify({ error: 'UNEXPECTED_ERROR', message: (error as any)?.message || String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})


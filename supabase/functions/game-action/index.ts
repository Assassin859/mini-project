import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? 'https://hgjcwjybhfhhlukglliq.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnamN3anliaGZoaGx1a2dsbGlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODM2ODQ2NSwiZXhwIjoyMDczOTQ0NDY1fQ.vPiMGn_OoAK7j8FWJElx3gNCj_gPYMik89qqHFQaDUc',
    )

    const { roomId, action } = await req.json()

    if (!roomId || !action || !action.type) {
      return new Response(
        JSON.stringify({ error: 'INVALID_REQUEST', message: 'Missing roomId or action.type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
      )
    }

    // Get current room state
    const { data: room, error: roomError } = await supabaseClient
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (roomError) {
      throw roomError
    }

    let updatedGameState = { ...room.game_state }

    const safeArray = (arr: any) => (Array.isArray(arr) ? arr : [])
    const safeNumber = (n: any, d = 0) => (typeof n === 'number' && !isNaN(n) ? n : d)
    const safeBoolean = (b: any) => (typeof b === 'boolean' ? b : false)

    const phase: string | undefined = updatedGameState?.phase
    const players: any[] = safeArray(updatedGameState?.players)
    const currentPlayerTurn: string | undefined = updatedGameState?.currentPlayerTurn
    const roundNumber: number = safeNumber(updatedGameState?.roundNumber, 0)

    const logContext = { roomId, actionType: action.type, phase, currentPlayerTurn, roundNumber }
    console.log('[game-action] Incoming action', logContext)

    // Process the action
    switch (action.type) {
      case 'SUBMIT_PITCH':
        if (phase && phase !== 'pitch_builder') {
          return new Response(
            JSON.stringify({ error: 'INVALID_PHASE', message: `Cannot SUBMIT_PITCH during ${phase}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 },
          )
        }
        if (!action.payload || typeof action.payload !== 'object') {
          return new Response(
            JSON.stringify({ error: 'INVALID_PAYLOAD', message: 'SUBMIT_PITCH requires payload' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
          )
        }
        updatedGameState.currentPitch = action.payload
        updatedGameState.phase = 'presentation'
        break

      case 'MAKE_DECISION':
        if (phase && phase !== 'presentation') {
          return new Response(
            JSON.stringify({ error: 'INVALID_PHASE', message: `Cannot MAKE_DECISION during ${phase}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 },
          )
        }
        if (!Array.isArray(action.payload)) {
          return new Response(
            JSON.stringify({ error: 'INVALID_PAYLOAD', message: 'MAKE_DECISION requires array payload' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
          )
        }
        updatedGameState.sharkDecisions = action.payload
        updatedGameState.phase = 'negotiation'
        break

      case 'NEGOTIATE':
        if (phase && phase !== 'negotiation') {
          return new Response(
            JSON.stringify({ error: 'INVALID_PHASE', message: `Cannot NEGOTIATE during ${phase}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 },
          )
        }
        if (!action.payload || typeof action.payload !== 'object') {
          return new Response(
            JSON.stringify({ error: 'INVALID_PAYLOAD', message: 'NEGOTIATE requires payload' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
          )
        }

        updatedGameState.deals = [...(updatedGameState.deals || []), action.payload]
        updatedGameState.phase = 'results'

        // Update player stats
        try {
          const playerId: string = action.playerId
          const finalTerms = action.payload?.finalTerms || action.payload?.offer || {}
          const amount: number = safeNumber(finalTerms?.amount)
          const equity: number = safeNumber(finalTerms?.equity)
          const accepted: boolean = safeBoolean(action.payload?.accepted)

          const playerIndex = players.findIndex((p: any) => p?.id === playerId)
          if (playerIndex !== -1) {
            const stats = players[playerIndex].stats || {}
            const prevSuccessful = safeNumber(stats.successfulDeals)
            const prevTotalDeals = safeNumber(stats.totalDeals)
            const prevTotalMoney = safeNumber(stats.totalMoneyRaised)
            const prevAvgEquity = safeNumber(stats.averageEquity)

            const nextTotalDeals = prevTotalDeals + 1
            let nextSuccessful = prevSuccessful
            let nextTotalMoney = prevTotalMoney
            let nextAvgEquity = prevAvgEquity
            let nextEntrepreneurScore = safeNumber(stats.entrepreneurScore)

            if (accepted) {
              nextSuccessful += 1
              nextTotalMoney += amount
              // Recompute running average equity over successful deals
              const numerator = prevAvgEquity * prevSuccessful + equity
              const denominator = Math.max(1, prevSuccessful + 1)
              nextAvgEquity = Number((numerator / denominator).toFixed(2))
              nextEntrepreneurScore += 10
            } else {
              // Slight penalty or neutral effect
              nextEntrepreneurScore += 0
            }

            players[playerIndex].stats = {
              ...stats,
              totalDeals: nextTotalDeals,
              successfulDeals: nextSuccessful,
              totalMoneyRaised: nextTotalMoney,
              averageEquity: nextAvgEquity,
              entrepreneurScore: nextEntrepreneurScore,
            }
          }
        } catch (e) {
          console.error('[game-action] Failed to update player stats', { error: String(e) })
        }
        break

      case 'NEXT_TURN':
        if (!action.payload || typeof action.payload?.nextPlayerId !== 'string') {
          return new Response(
            JSON.stringify({ error: 'INVALID_PAYLOAD', message: 'NEXT_TURN requires payload.nextPlayerId' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
          )
        }
        updatedGameState.currentPlayerTurn = action.payload.nextPlayerId
        updatedGameState.phase = 'pitch_builder'
        updatedGameState.roundNumber = safeNumber(updatedGameState.roundNumber || 1) + 1
        break

      case 'READY_UP':
        if (!action.playerId) {
          return new Response(
            JSON.stringify({ error: 'INVALID_PAYLOAD', message: 'READY_UP requires playerId' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
          )
        }
        const readyPlayerIndex = players.findIndex(p => p.id === action.playerId)
        if (readyPlayerIndex !== -1) {
          players[readyPlayerIndex].isReady = true
        }
        break

      case 'START_GAME':
        if (!Array.isArray(players) || players.length === 0) {
          return new Response(
            JSON.stringify({ error: 'INVALID_STATE', message: 'No players in room to start game' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 },
          )
        }
        // Initialize all players readiness if missing
        updatedGameState.players = players.map((p: any) => ({
          ...p,
          isReady: p?.isReady ?? true,
          stats: {
            totalDeals: safeNumber(p?.stats?.totalDeals),
            successfulDeals: safeNumber(p?.stats?.successfulDeals),
            totalMoneyRaised: safeNumber(p?.stats?.totalMoneyRaised),
            averageEquity: safeNumber(p?.stats?.averageEquity),
            entrepreneurScore: safeNumber(p?.stats?.entrepreneurScore),
          }
        }))
        updatedGameState.status = 'in_progress'
        updatedGameState.phase = 'pitch_builder'
        updatedGameState.currentPlayerTurn = players[0].id
        updatedGameState.roundNumber = 1
        break
      default:
        return new Response(
          JSON.stringify({ error: 'UNKNOWN_ACTION', message: `Unsupported action ${action.type}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
        )
    }

    // Update room in database
    const { error: updateError } = await supabaseClient
      .from('rooms')
      .update({
        game_state: updatedGameState,
        status: updatedGameState.status || room.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roomId)

    if (updateError) {
      throw updateError
    }

    console.log('[game-action] Updated game_state successfully', { roomId, actionType: action.type })
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('[game-action] Error', { error: String((error as any)?.message || error) })
    return new Response(JSON.stringify({ error: 'UNEXPECTED_ERROR', message: (error as any)?.message || String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
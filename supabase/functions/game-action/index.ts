import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { roomId, action } = await req.json()

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

    // Process the action
    switch (action.type) {
      case 'SUBMIT_PITCH':
        updatedGameState.currentPitch = action.payload
        updatedGameState.phase = 'presentation'
        break

      case 'MAKE_DECISION':
        updatedGameState.sharkDecisions = action.payload
        updatedGameState.phase = 'negotiation'
        break

      case 'NEGOTIATE':
        updatedGameState.deals = [...(updatedGameState.deals || []), action.payload]
        updatedGameState.phase = 'results'
        
        // Update player stats
        const playerIndex = updatedGameState.players.findIndex(p => p.id === action.playerId)
        if (playerIndex !== -1 && action.payload.accepted) {
          updatedGameState.players[playerIndex].stats.successfulDeals += 1
          updatedGameState.players[playerIndex].stats.totalMoneyRaised += action.payload.finalTerms.amount
          updatedGameState.players[playerIndex].stats.entrepreneurScore += 10
        }
        break

      case 'NEXT_TURN':
        updatedGameState.currentPlayerTurn = action.payload.nextPlayerId
        updatedGameState.phase = 'pitch_builder'
        updatedGameState.roundNumber = (updatedGameState.roundNumber || 1) + 1
        break

      case 'READY_UP':
        const readyPlayerIndex = updatedGameState.players.findIndex(p => p.id === action.playerId)
        if (readyPlayerIndex !== -1) {
          updatedGameState.players[readyPlayerIndex].isReady = true
        }
        break

      case 'START_GAME':
        updatedGameState.status = 'in_progress'
        updatedGameState.phase = 'pitch_builder'
        updatedGameState.currentPlayerTurn = updatedGameState.players[0].id
        updatedGameState.roundNumber = 1
        break
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

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
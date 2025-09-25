import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
}

type GameState = {
  players: Array<{ id: string; isReady?: boolean; isActive?: boolean }>
  currentPlayerTurn?: string
  phase?: string
  roundNumber?: number
}

function findNextActivePlayer(players: GameState['players'], afterPlayerId?: string): string | undefined {
  if (!Array.isArray(players) || players.length === 0) return undefined
  const activePlayers = players.filter(p => p.isActive !== false)
  if (activePlayers.length === 0) return undefined
  if (!afterPlayerId) return activePlayers[0].id
  const order = players.map(p => p.id)
  const startIdx = Math.max(0, order.indexOf(afterPlayerId))
  for (let i = 1; i <= players.length; i++) {
    const idx = (startIdx + i) % players.length
    const candidate = players[idx]
    if (candidate && candidate.isActive !== false) return candidate.id
  }
  return activePlayers[0].id
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
    const { roomId, playerId } = await req.json()
    if (!roomId || !playerId) {
      return new Response(
        JSON.stringify({ error: 'INVALID_REQUEST', message: 'roomId and playerId are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
      )
    }

    const { data: room, error: roomError } = await supabaseClient
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()
    if (roomError) throw roomError

    const gameState: GameState = { ...(room.game_state || {}) }
    const players = Array.isArray(gameState.players) ? [...gameState.players] : []
    const idx = players.findIndex(p => p.id === playerId)
    if (idx !== -1) {
      players[idx] = { ...players[idx], isActive: false, isReady: false }
    }
    gameState.players = players

    if (gameState.currentPlayerTurn === playerId) {
      const next = findNextActivePlayer(players, playerId)
      if (next) gameState.currentPlayerTurn = next
    }

    const { error: updateError } = await supabaseClient
      .from('rooms')
      .update({
        current_players: Math.max(0, (room.current_players || players.length) - 1),
        game_state: gameState,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roomId)
    if (updateError) throw updateError

    console.log('[player-disconnect] updated room for disconnect', { roomId, playerId })
    return new Response(JSON.stringify({ success: true, nextTurn: gameState.currentPlayerTurn }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('[player-disconnect] Error', { error: String((error as any)?.message || error) })
    return new Response(
      JSON.stringify({ error: 'UNEXPECTED_ERROR', message: (error as any)?.message || String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})
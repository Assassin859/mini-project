"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { GamePhase } from '@/types/game';
import { 
  ArrowLeft, 
  Users, 
  Crown,
  Clock,
  Play,
  CheckCircle,
  XCircle,
  Settings,
  LogOut
} from 'lucide-react';

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  isActive?: boolean;
  stats?: {
    totalDeals: number;
    successfulDeals: number;
    totalMoneyRaised: number;
    averageEquity: number;
    entrepreneurScore: number;
  };
}

interface Room {
  id: string;
  name: string;
  host_id: string;
  max_players: number;
  current_players: number;
  status: 'waiting' | 'in_progress' | 'completed';
  game_state: {
    phase?: string;
    players?: Player[];
    currentPlayerTurn?: string;
    roundNumber?: number;
  };
}

interface InRoomLobbyProps {
  roomId: string;
  playerId: string;
  playerName: string;
  onPhaseChange: (phase: GamePhase, data?: any) => void;
  onUpdateGameState: (updates: any) => void;
}

export default function InRoomLobby({ 
  roomId, 
  playerId, 
  playerName, 
  onPhaseChange, 
  onUpdateGameState 
}: InRoomLobbyProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch initial room data
  const fetchRoom = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) throw error;
      setRoom(data);
      
      // Check if current player is ready
      const currentPlayer = data.game_state?.players?.find((p: Player) => p.id === playerId);
      if (currentPlayer) {
        setIsReady(currentPlayer.isReady || false);
      }
    } catch (err) {
      console.error('Error fetching room:', err);
      setError('Failed to load room data');
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchRoom();

    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          console.log('Room update received:', payload);
          if (payload.new) {
            const updatedRoom = payload.new as Room;
            setRoom(updatedRoom);
            
            // Check if game has started
            if (updatedRoom.game_state?.phase === 'pitch_builder') {
              onPhaseChange(GamePhase.PITCH_BUILDER);
            }
            
            // Update ready status for current player
            const currentPlayer = updatedRoom.game_state?.players?.find((p: Player) => p.id === playerId);
            if (currentPlayer) {
              setIsReady(currentPlayer.isReady || false);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, playerId, onPhaseChange]);

  // Handle ready up
  const handleReadyUp = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/game-action`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          action: {
            type: 'READY_UP',
            playerId
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to ready up');
      }

      setIsReady(true);
    } catch (err) {
      console.error('Error readying up:', err);
      setError('Failed to ready up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle start game (host only)
  const handleStartGame = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/game-action`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          action: {
            type: 'START_GAME'
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start game');
      }

      // The game will start via real-time update
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to start game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle leave room
  const handleLeaveRoom = async () => {
    try {
      // Remove player from room_players table
      await supabase
        .from('room_players')
        .delete()
        .eq('room_id', roomId)
        .eq('player_id', playerId);

      // Navigate back to multiplayer lobby
      onPhaseChange(GamePhase.MULTIPLAYER_LOBBY);
    } catch (err) {
      console.error('Error leaving room:', err);
      setError('Failed to leave room');
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🦈</div>
          <h1 className="text-2xl font-bold text-white mb-4">Loading Room...</h1>
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-slate-600 rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const players = room.game_state?.players || [];
  const isHost = room.host_id === playerId;
  const allPlayersReady = players.length > 1 && players.every(p => p.isReady);
  const canStartGame = isHost && allPlayersReady;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">🦈 {room.name}</h1>
            <p className="text-slate-300">
              Room Code: <span className="font-mono text-blue-400">{roomId.slice(0, 8).toUpperCase()}</span>
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLeaveRoom}
            className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Leave Room
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 bg-red-600/20 border-red-400">
            <CardContent className="p-4">
              <p className="text-red-300">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Room Info */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Room Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Max Players:</span>
                <Badge className="bg-blue-600 text-white">
                  {room.max_players}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Current Players:</span>
                <Badge className="bg-green-600 text-white">
                  {room.current_players}/{room.max_players}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-300">Status:</span>
                <Badge className="bg-yellow-600 text-white">
                  <Clock className="w-3 h-3 mr-1" />
                  Waiting
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-300">Host:</span>
                <div className="flex items-center space-x-1">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-white text-sm">
                    {players.find(p => p.isHost)?.name || 'Unknown'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Players List */}
          <Card className="lg:col-span-2 bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Players ({players.length}/{room.max_players})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {players.map((player) => (
                  <div 
                    key={player.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      player.id === playerId 
                        ? 'bg-blue-600/20 border-blue-400/50' 
                        : 'bg-slate-700/50 border-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {player.isHost && <Crown className="w-4 h-4 text-yellow-400" />}
                        <span className="text-white font-semibold">
                          {player.name}
                          {player.id === playerId && ' (You)'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {player.isReady ? (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ready
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-600 text-white">
                          <XCircle className="w-3 h-3 mr-1" />
                          Not Ready
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: room.max_players - players.length }).map((_, index) => (
                  <div 
                    key={`empty-${index}`}
                    className="flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-slate-600 opacity-50"
                  >
                    <span className="text-slate-400">Waiting for player...</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {isHost ? (
            <Button 
              onClick={handleStartGame}
              disabled={!canStartGame || isLoading}
              className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
            >
              <Play className="w-5 h-5 mr-2" />
              {isLoading ? 'Starting...' : 'Start Game'}
            </Button>
          ) : (
            <Button 
              onClick={handleReadyUp}
              disabled={isReady || isLoading}
              className={`text-lg px-8 py-3 ${
                isReady 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isReady ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Ready!
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 mr-2" />
                  {isLoading ? 'Readying...' : 'Ready Up'}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Game Start Requirements */}
        {isHost && !canStartGame && (
          <Card className="mt-6 bg-yellow-600/20 border-yellow-400/50">
            <CardContent className="p-4 text-center">
              <h3 className="text-yellow-300 font-semibold mb-2">Game Start Requirements</h3>
              <div className="space-y-1 text-sm text-yellow-200">
                {players.length < 2 && (
                  <p>• Need at least 2 players to start</p>
                )}
                {players.length >= 2 && !allPlayersReady && (
                  <p>• All players must be ready</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6 bg-slate-800/30 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white">How to Play</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-3xl mb-2">1️⃣</div>
                <h4 className="text-white font-semibold mb-2">Wait for Players</h4>
                <p className="text-slate-300">
                  Share the room code with friends and wait for them to join
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">2️⃣</div>
                <h4 className="text-white font-semibold mb-2">Ready Up</h4>
                <p className="text-slate-300">
                  All players must click "Ready Up" before the game can start
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">3️⃣</div>
                <h4 className="text-white font-semibold mb-2">Start Playing</h4>
                <p className="text-slate-300">
                  The host starts the game and players take turns pitching
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
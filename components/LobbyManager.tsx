"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { supabase } from '@/lib/supabase';
import { Users, Plus, RefreshCw, Crown, Clock, Play } from 'lucide-react';

interface LobbyManagerProps {
  onGameStart: () => void;
}

export default function LobbyManager({ onGameStart }: LobbyManagerProps) {
  const { gameState, playerName, updatePlayerName, createRoom, joinRoom, playerId, isInitialized } = useMultiplayer();
  const [availableRooms, setAvailableRooms] = useState([] as { id: string; name: string; current_players: number; max_players: number }[]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      loadAvailableRooms();
    }
  }, [isInitialized]);

  const loadAvailableRooms = async () => {
    try {
      const { data: rooms, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAvailableRooms(rooms || []);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !playerName.trim() || !playerId) return;
    
    setIsLoading(true);
    const roomId = await createRoom(roomName, maxPlayers);
    setIsLoading(false);
    
    if (roomId) {
      setShowCreateForm(false);
      setRoomName('');
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    if (!playerName.trim() || !playerId) return;
    
    setIsLoading(true);
    const success = await joinRoom(roomId);
    setIsLoading(false);
    
    if (success) {
      setShowJoinForm(false);
      setRoomCode('');
    }
  };

  const handleJoinByCode = async () => {
    if (!roomCode.trim() || !playerId) return;
    await handleJoinRoom(roomCode);
  };

  const handleReadyUp = async () => {
    // Implementation for ready up functionality
  };

  const handleStartGame = async () => {
    // Implementation for starting the game
    onGameStart();
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Initializing...</div>
      </div>
    );
  }

  // If player is in a room, show lobby
  if (gameState.currentRoom) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-white flex items-center">
                    <Users className="w-6 h-6 mr-2" />
                    {gameState.currentRoom.name}
                  </CardTitle>
                  <p className="text-slate-300 mt-1">
                    Room Code: <span className="font-mono bg-slate-700 px-2 py-1 rounded">
                      {gameState.currentRoom.id.slice(0, 8).toUpperCase()}
                    </span>
                  </p>
                </div>
                <Badge variant="outline" className="border-blue-400 text-blue-400">
                  {gameState.currentRoom.players.length}/{gameState.currentRoom.maxPlayers} Players
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Players List */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Players</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gameState.currentRoom.players.map((player: { id: string; name: string; stats: { entrepreneurScore: number }; isHost: boolean; isReady: boolean }) => (
                    <Card key={player.id} className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">
                                {player.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-semibold">{player.name}</p>
                              <p className="text-slate-400 text-sm">
                                Score: {player.stats.entrepreneurScore}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {player.isHost && (
                              <Crown className="w-4 h-4 text-yellow-400" />
                            )}
                            {player.isReady ? (
                              <Badge className="bg-green-600 text-white">Ready</Badge>
                            ) : (
                              <Badge variant="outline" className="border-slate-500 text-slate-400"><Clock className="w-3 h-3 mr-1" />Waiting</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Game Controls */}
              <div className="flex justify-center space-x-4">
                {gameState.currentPlayer?.isHost ? (
                  <Button 
                    onClick={handleStartGame}
                    disabled={gameState.currentRoom.players.length < 2 || !gameState.currentRoom.players.every((p: { isReady: boolean }) => p.isReady)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Game
                  </Button>
                ) : (
                  <Button 
                    onClick={handleReadyUp}
                    disabled={gameState.currentPlayer?.isReady}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {gameState.currentPlayer?.isReady ? 'Ready!' : 'Ready Up'}
                  </Button>
                )}
              </div>

              {/* Game Rules */}
              <Card className="bg-slate-700/30 border-slate-600">
                <CardContent className="p-4">
                  <h4 className="text-white font-semibold mb-2">Multiplayer Rules</h4>
                  <ul className="text-slate-300 text-sm space-y-1">
                    <li>• Players take turns pitching their businesses</li>
                    <li>• All players see the same sharks and their decisions</li>
                    <li>• Negotiate deals in real-time</li>
                    <li>• Compare your performance with other entrepreneurs</li>
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show lobby browser
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🦈 Multiplayer Lobby</h1>
          <p className="text-xl text-slate-300">
            Create or join a room to play with other entrepreneurs
          </p>
        </div>

        {/* Player Name Input */}
        {!playerName && (
          <Card className="mb-8 bg-slate-800/50 border-slate-600">
            <CardContent className="p-6">
              <div className="max-w-md mx-auto">
                <Label htmlFor="playerName" className="text-slate-300">Enter Your Name</Label>
                <Input
                  id="playerName"
                  value={playerName}
                  onChange={(e: { target: { value: string } }) => updatePlayerName(e.target.value)}
                  placeholder="Your entrepreneur name"
                  className="bg-slate-700 border-slate-600 text-white mt-2"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {playerName && (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 h-20 text-lg"
                disabled={isLoading || !playerId || !playerName.trim()}
              >
                <Plus className="w-6 h-6 mr-2" />
                Create Room
              </Button>
              
              <Button
                onClick={() => setShowJoinForm(true)}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 h-20 text-lg"
                disabled={isLoading || !playerId || !playerName.trim()}
              >
                <Users className="w-6 h-6 mr-2" />
                Join by Code
              </Button>
              
              <Button
                onClick={loadAvailableRooms}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 h-20 text-lg"
                disabled={isLoading || !playerId}
              >
                <RefreshCw className="w-6 h-6 mr-2" />
                Refresh Rooms
              </Button>
            </div>

            {/* Create Room Form */}
            {showCreateForm && (
              <Card className="mb-8 bg-slate-800/50 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Create New Room</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="roomName" className="text-slate-300">Room Name</Label>
                    <Input
                      id="roomName"
                      value={roomName}
                      onChange={(e: { target: { value: string } }) => setRoomName(e.target.value)}
                      placeholder="Enter room name"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxPlayers" className="text-slate-300">Max Players</Label>
                    <Input
                      id="maxPlayers"
                      type="number"
                      min="2"
                      max="6"
                      value={maxPlayers}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const raw = e.target.value;
                        const next = e.target.valueAsNumber;
                        if (Number.isNaN(next)) {
                          if (raw === "") return;
                          return;
                        }
                        const clamped = Math.max(2, Math.min(6, Math.round(next)));
                        setMaxPlayers(clamped);
                      }}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <Button 
                      onClick={handleCreateRoom}
                      disabled={!roomName.trim() || isLoading || !playerId || !playerName.trim()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Create Room
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                      className="border-slate-600 text-slate-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Join Room Form */}
            {showJoinForm && (
              <Card className="mb-8 bg-slate-800/50 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white">Join Room by Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="roomCode" className="text-slate-300">Room Code</Label>
                    <Input
                      id="roomCode"
                      value={roomCode}
                      onChange={(e: { target: { value: string } }) => setRoomCode(e.target.value)}
                      placeholder="Enter room code"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <Button 
                      onClick={handleJoinByCode}
                      disabled={!roomCode.trim() || isLoading || !playerId || !playerName.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Join Room
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowJoinForm(false)}
                      className="border-slate-600 text-slate-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Available Rooms */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Available Rooms</CardTitle>
              </CardHeader>
              <CardContent>
                {availableRooms.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">No rooms available. Create one to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableRooms.map((room: { id: string; name: string; current_players: number; max_players: number }) => (
                      <Card key={room.id} className="bg-slate-700/50 border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-white font-semibold">{room.name}</h3>
                              <p className="text-slate-400 text-sm">
                                {room.current_players}/{room.max_players} players
                              </p>
                            </div>
                            <Button
                              onClick={() => handleJoinRoom(room.id)}
                              disabled={room.current_players >= room.max_players || isLoading || !playerId || !playerName.trim()}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Join
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Error Display */}
        {gameState.error && (
          <Card className="mt-4 bg-red-600/20 border-red-400">
            <CardContent className="p-4">
              <p className="text-red-300">{gameState.error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
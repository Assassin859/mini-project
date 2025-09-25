"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  RefreshCw, 
  Crown,
  Clock,
  Play
} from 'lucide-react';

interface Room {
  id: string;
  name: string;
  host_id: string;
  max_players: number;
  current_players: number;
  status: 'waiting' | 'in_progress' | 'completed';
  created_at: string;
}

interface MultiplayerLobbyProps {
  onBack: () => void;
  onJoinRoom: (roomId: string, playerId: string, playerName: string) => void;
}

export default function MultiplayerLobby({ onBack, onJoinRoom }: MultiplayerLobbyProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Generate a unique player ID
  const generatePlayerId = () => {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Fetch available rooms
  const fetchRooms = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRooms(data || []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load rooms. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new room
  const createRoom = async () => {
    if (!playerName.trim() || !roomName.trim()) {
      setError('Please enter both your name and room name');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const playerId = generatePlayerId();
      
      // Create the room
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .insert({
          name: roomName.trim(),
          host_id: playerId,
          max_players: 4,
          current_players: 1,
          status: 'waiting',
          game_state: {
            phase: 'waiting',
            players: [{
              id: playerId,
              name: playerName.trim(),
              isHost: true,
              isReady: false,
              stats: {
                totalDeals: 0,
                successfulDeals: 0,
                totalMoneyRaised: 0,
                averageEquity: 0,
                entrepreneurScore: 100
              }
            }],
            currentPlayerTurn: null,
            roundNumber: 0
          }
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add player to room_players table
      const { error: playerError } = await supabase
        .from('room_players')
        .insert({
          room_id: roomData.id,
          player_id: playerId,
          player_name: playerName.trim(),
          is_host: true
        });

      if (playerError) throw playerError;

      // Join the room
      onJoinRoom(roomData.id, playerId, playerName.trim());
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  // Join an existing room
  const joinRoom = async (room: Room) => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (room.current_players >= room.max_players) {
      setError('Room is full');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const playerId = generatePlayerId();

      // Add player to room_players table
      const { error: playerError } = await supabase
        .from('room_players')
        .insert({
          room_id: room.id,
          player_id: playerId,
          player_name: playerName.trim(),
          is_host: false
        });

      if (playerError) throw playerError;

      // Update room's game state to include the new player
      const { data: roomData, error: roomFetchError } = await supabase
        .from('rooms')
        .select('game_state')
        .eq('id', room.id)
        .single();

      if (roomFetchError) throw roomFetchError;

      const updatedGameState = {
        ...roomData.game_state,
        players: [
          ...(roomData.game_state.players || []),
          {
            id: playerId,
            name: playerName.trim(),
            isHost: false,
            isReady: false,
            stats: {
              totalDeals: 0,
              successfulDeals: 0,
              totalMoneyRaised: 0,
              averageEquity: 0,
              entrepreneurScore: 100
            }
          }
        ]
      };

      const { error: updateError } = await supabase
        .from('rooms')
        .update({
          game_state: updatedGameState,
          current_players: room.current_players + 1
        })
        .eq('id', room.id);

      if (updateError) throw updateError;

      // Join the room
      onJoinRoom(room.id, playerId, playerName.trim());
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-green-600';
      case 'in_progress': return 'bg-yellow-600';
      case 'completed': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">🦈 Multiplayer Lobby</h1>
            <p className="text-slate-300">
              Create or join a room to play with friends
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={onBack}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Room */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Create New Room
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="playerName" className="text-slate-300">Your Name</Label>
                <Input
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-slate-800 border-slate-600 text-white"
                  maxLength={20}
                />
              </div>

              <div>
                <Label htmlFor="roomName" className="text-slate-300">Room Name</Label>
                <Input
                  id="roomName"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter room name"
                  className="bg-slate-800 border-slate-600 text-white"
                  maxLength={30}
                />
              </div>

              <Button 
                onClick={createRoom}
                disabled={isCreating || !playerName.trim() || !roomName.trim()}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Room
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Join Room */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Available Rooms
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchRooms}
                  disabled={isLoading}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!playerName.trim() && (
                <div className="mb-4">
                  <Label htmlFor="joinPlayerName" className="text-slate-300">Your Name</Label>
                  <Input
                    id="joinPlayerName"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name to join"
                    className="bg-slate-800 border-slate-600 text-white"
                    maxLength={20}
                  />
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-spin" />
                    <p className="text-slate-400">Loading rooms...</p>
                  </div>
                ) : rooms.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-400">No rooms available</p>
                    <p className="text-slate-500 text-sm">Create a new room to get started!</p>
                  </div>
                ) : (
                  rooms.map((room) => (
                    <Card key={room.id} className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-white font-semibold">{room.name}</h3>
                              <Badge className={`${getStatusColor(room.status)} text-white text-xs`}>
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(room.status)}
                                  <span>{room.status}</span>
                                </div>
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-slate-400">
                              <span className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {room.current_players}/{room.max_players}
                              </span>
                              <span className="flex items-center">
                                <Crown className="w-4 h-4 mr-1" />
                                Host
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={() => joinRoom(room)}
                            disabled={
                              !playerName.trim() || 
                              room.current_players >= room.max_players ||
                              room.status !== 'waiting' ||
                              isLoading
                            }
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Join
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8 bg-slate-800/30 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white">How to Play Multiplayer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-3xl mb-2">1️⃣</div>
                <h4 className="text-white font-semibold mb-2">Create or Join</h4>
                <p className="text-slate-300">
                  Create a new room or join an existing one with your friends
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">2️⃣</div>
                <h4 className="text-white font-semibold mb-2">Take Turns</h4>
                <p className="text-slate-300">
                  Players take turns pitching their businesses to the sharks
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">3️⃣</div>
                <h4 className="text-white font-semibold mb-2">Compete</h4>
                <p className="text-slate-300">
                  See who can get the best deals and highest entrepreneur score!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
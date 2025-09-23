"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { RoomState, Player, GameAction, MultiplayerGameState } from '@/types/multiplayer';
import { GamePhase } from '@/types/game';

export function useMultiplayer() {
  const [gameState, setGameState] = useState({
    currentRoom: null,
    currentPlayer: null,
    isConnected: false,
    isLoading: false,
    error: null,
  } as MultiplayerGameState);

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize player data on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('shark-tank-player-id');
      if (!id) {
        id = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('shark-tank-player-id', id);
      }
      setPlayerId(id);
      
      const name = localStorage.getItem('shark-tank-player-name') || '';
      setPlayerName(name);
      
      setIsInitialized(true);
    }
  }, []);

  // Helper to map Supabase row -> RoomState shape used by UI
  const mapRoomRowToState = useCallback((row: any): RoomState => {
    const gameState = (row?.game_state ?? {}) as any;
    const players = Array.isArray(gameState.players) ? gameState.players : [];
    return {
      id: row.id,
      name: row.name,
      hostId: row.host_id,
      maxPlayers: row.max_players,
      players,
      status: row.status,
      gamePhase: gameState.gamePhase ?? gameState.phase ?? GamePhase.MENU,
      currentPlayerTurn: gameState.currentPlayerTurn,
      currentPitch: gameState.currentPitch,
      sharkDecisions: Array.isArray(gameState.sharkDecisions) ? gameState.sharkDecisions : undefined,
      deals: Array.isArray(gameState.deals) ? gameState.deals : [],
      roundNumber: typeof gameState.roundNumber === 'number' ? gameState.roundNumber : 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    } as RoomState;
  }, []);

  // Subscribe to room updates
  const subscribeToRoom = useCallback((roomId: string) => {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      }, (payload: any) => {
        const row = payload?.new;
        if (!row) return;
        const mapped = mapRoomRowToState(row);
        setGameState((prev: MultiplayerGameState) => ({
          ...prev,
          currentRoom: mapped,
          currentPlayer: prev.currentPlayer
            ? mapped.players.find(p => p.id === prev.currentPlayer!.id) || prev.currentPlayer
            : prev.currentPlayer,
        }));
      })
      .on('broadcast', { event: 'game_action' }, (payload: { payload: GameAction }) => {
        handleGameAction(payload.payload as GameAction);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleGameAction = useCallback((action: GameAction) => {
    // Handle real-time game actions
    console.log('Received game action:', action);
    
    setGameState((prev: MultiplayerGameState) => {
      if (!prev.currentRoom) return prev;
      
      const updatedRoom: RoomState = {
        ...prev.currentRoom,
        players: Array.isArray(prev.currentRoom.players) ? [...prev.currentRoom.players] : [],
        deals: Array.isArray(prev.currentRoom.deals) ? [...prev.currentRoom.deals] : [],
      };
      
      switch (action.type) {
        case 'READY_UP':
          const playerIndex = updatedRoom.players.findIndex(p => p.id === action.playerId);
          if (playerIndex !== -1) {
            updatedRoom.players[playerIndex].isReady = true;
          }
          break;
        case 'START_GAME':
          updatedRoom.status = 'in_progress';
          updatedRoom.gamePhase = GamePhase.PITCH_BUILDER;
          break;
        case 'SUBMIT_PITCH':
          updatedRoom.currentPitch = action.payload;
          updatedRoom.gamePhase = GamePhase.PRESENTATION;
          break;
        case 'MAKE_DECISION':
          updatedRoom.sharkDecisions = action.payload;
          updatedRoom.gamePhase = GamePhase.NEGOTIATION;
          break;
        case 'NEGOTIATE':
          updatedRoom.deals = [...(updatedRoom.deals || []), action.payload];
          updatedRoom.gamePhase = GamePhase.RESULTS;
          break;
        case 'NEXT_TURN':
          updatedRoom.currentPlayerTurn = action.payload.nextPlayerId;
          updatedRoom.gamePhase = GamePhase.PITCH_BUILDER;
          updatedRoom.roundNumber = (updatedRoom.roundNumber || 1) + 1;
          break;
      }
      
      return {
        ...prev,
        currentRoom: updatedRoom,
      };
    });
  }, []);

  const createRoom = useCallback(async (roomName: string, maxPlayers: number = 4) => {
<<<<<<< HEAD
    if (!playerId || !playerName.trim()) {
      setGameState((prev: MultiplayerGameState) => ({ ...prev, error: 'Player ID or name is required' }));
      return null;
    }

    if (!playerName.trim()) {
      setGameState((prev: MultiplayerGameState) => ({ ...prev, error: 'Player name is required' }));
      return null;
    }

=======
    if (!playerName.trim()) {
      setGameState((prev: MultiplayerGameState) => ({ ...prev, error: 'Player name is required' }));
      return null;
    }

>>>>>>> cursor/refine-shark-tank-simulator-backend-logic-193e
    setGameState((prev: MultiplayerGameState) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Create room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          name: roomName,
          host_id: playerId,
          max_players: maxPlayers,
          current_players: 1,
          status: 'waiting',
          game_state: {
            phase: GamePhase.MENU,
            roundNumber: 1,
            players: [{
              id: playerId,
              name: playerName,
              isHost: true,
              isReady: false,
              stats: {
                totalDeals: 0,
                successfulDeals: 0,
                totalMoneyRaised: 0,
                averageEquity: 0,
                entrepreneurScore: 100
              }
            }]
          }
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add player to room
      const { error: playerError } = await supabase
        .from('room_players')
        .insert({
          room_id: room.id,
          player_id: playerId,
          player_name: playerName,
          is_host: true,
        });

      if (playerError) throw playerError;

      const roomState: RoomState = {
        id: room.id,
        name: room.name,
        hostId: room.host_id,
        maxPlayers: room.max_players,
        players: room.game_state.players,
        status: room.status as 'waiting',
        gamePhase: GamePhase.MENU,
        deals: [],
        roundNumber: 1,
        createdAt: room.created_at,
        updatedAt: room.updated_at,
      };

      setGameState((prev: MultiplayerGameState) => ({
        ...prev,
        currentRoom: roomState,
        currentPlayer: roomState.players[0],
        isConnected: true,
        isLoading: false,
      }));

      subscribeToRoom(room.id);
      return room.id;
    } catch (error) {
      console.error('Error creating room:', error);
      setGameState((prev: MultiplayerGameState) => ({
        ...prev,
        error: 'Failed to create room',
        isLoading: false,
      }));
      return null;
    }
  }, [playerId, playerName, subscribeToRoom]);

  const joinRoom = useCallback(async (roomId: string) => {
<<<<<<< HEAD
    if (!playerId || !playerName.trim()) {
      setGameState((prev: MultiplayerGameState) => ({ ...prev, error: 'Player ID or name is required' }));
      return false;
    }

    if (!playerName.trim()) {
      setGameState((prev: MultiplayerGameState) => ({ ...prev, error: 'Player name is required' }));
      return false;
    }

=======
    if (!playerName.trim()) {
      setGameState((prev: MultiplayerGameState) => ({ ...prev, error: 'Player name is required' }));
      return false;
    }

>>>>>>> cursor/refine-shark-tank-simulator-backend-logic-193e
    setGameState((prev: MultiplayerGameState) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get room info
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError) throw roomError;

      if (room.current_players >= room.max_players) {
        throw new Error('Room is full');
      }

      if (room.status !== 'waiting') {
        throw new Error('Game already in progress');
      }

      // Add player to room
      const { error: playerError } = await supabase
        .from('room_players')
        .insert({
          room_id: roomId,
          player_id: playerId,
          player_name: playerName,
          is_host: false,
        });

      if (playerError) throw playerError;

      // Update room player count
      const { error: updateError } = await supabase
        .from('rooms')
        .update({ 
          current_players: room.current_players + 1,
          game_state: {
            ...room.game_state,
            players: [
              ...room.game_state.players,
              {
                id: playerId,
                name: playerName,
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
          }
        })
        .eq('id', roomId);

      if (updateError) throw updateError;

      const roomState: RoomState = {
        id: room.id,
        name: room.name,
        hostId: room.host_id,
        maxPlayers: room.max_players,
        players: [
          ...room.game_state.players,
          {
            id: playerId,
            name: playerName,
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
        ],
        status: room.status as 'waiting',
        gamePhase: GamePhase.MENU,
        deals: [],
        roundNumber: 1,
        createdAt: room.created_at,
        updatedAt: room.updated_at,
      };

      const currentPlayer = roomState.players.find(p => p.id === playerId)!;

      setGameState((prev: MultiplayerGameState) => ({
        ...prev,
        currentRoom: roomState,
        currentPlayer,
        isConnected: true,
        isLoading: false,
      }));

      subscribeToRoom(roomId);
      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      setGameState((prev: MultiplayerGameState) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to join room',
        isLoading: false,
      }));
      return false;
    }
  }, [playerId, playerName, subscribeToRoom]);

  const leaveRoom = useCallback(async () => {
    if (!gameState.currentRoom || !playerId) return;

    try {
      // Inform backend about disconnect to handle turn/active flags
      try {
        await supabase.functions.invoke('player-disconnect', {
          body: { roomId: gameState.currentRoom.id, playerId },
        });
      } catch (e) {
        console.error('player-disconnect edge failed', e);
      }

      // Remove player from room
      await supabase
        .from('room_players')
        .delete()
        .eq('room_id', gameState.currentRoom.id)
        .eq('player_id', playerId);

      // Update room player count
      await supabase
        .from('rooms')
        .update({ 
          current_players: gameState.currentRoom.players.length - 1 
        })
        .eq('id', gameState.currentRoom.id);

      setGameState((prev: MultiplayerGameState) => ({
        ...prev,
        currentRoom: null,
        currentPlayer: null,
        isConnected: false,
      }));
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }, [gameState.currentRoom, playerId]);

  const sendGameAction = useCallback(async (action: Omit<GameAction, 'playerId'>) => {
    if (!gameState.currentRoom || !playerId) return;

    const fullAction: GameAction = {
      ...action,
      playerId,
    };

    try {
      // Send action via Edge Function
      const { error } = await supabase.functions.invoke('game-action', {
        body: {
          roomId: gameState.currentRoom.id,
          action: fullAction,
        },
      });

      if (error) throw error;

      // Also broadcast to other players
      const channel = supabase.channel(`room:${gameState.currentRoom.id}`);
      await channel.send({
        type: 'broadcast',
        event: 'game_action',
        payload: fullAction,
      });
    } catch (error) {
      console.error('Error sending game action:', error);
      setGameState((prev: MultiplayerGameState) => ({
        ...prev,
        error: 'Failed to send action',
      }));
    }
  }, [gameState.currentRoom, playerId]);

  const updatePlayerName = useCallback((name: string) => {
    setPlayerName(name);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shark-tank-player-name', name);
    }
  }, []);

  return {
    gameState,
    playerId,
    playerName,
    isInitialized,
    updatePlayerName,
    createRoom,
    joinRoom,
    leaveRoom,
    sendGameAction,
  };
}
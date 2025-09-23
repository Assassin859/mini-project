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
    error: 'Multiplayer has been removed',
  } as MultiplayerGameState);

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [isInitialized, setIsInitialized] = useState(true);

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
  const subscribeToRoom = useCallback((_roomId: string) => {
    return () => {};
  }, []);

  const handleGameAction = useCallback((_action: GameAction) => {
    // Handle real-time game actions
    return;
    
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

  const createRoom = useCallback(async (_roomName: string, _maxPlayers: number = 4) => {
    setGameState((prev: MultiplayerGameState) => ({ ...prev, error: 'Multiplayer is disabled' }));
    return null;
  }, []);

  const joinRoom = useCallback(async (_roomId: string) => {
    setGameState((prev: MultiplayerGameState) => ({ ...prev, error: 'Multiplayer is disabled' }));
    return false;
  }, []);

  const leaveRoom = useCallback(async () => {
    setGameState((prev: MultiplayerGameState) => ({
      ...prev,
      currentRoom: null,
      currentPlayer: null,
      isConnected: false,
    }));
  }, []);

  const sendGameAction = useCallback(async (_action: Omit<GameAction, 'playerId'>) => {
    setGameState((prev: MultiplayerGameState) => ({ ...prev, error: 'Multiplayer has been removed' }));
  }, []);

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
"use client";

import { useState, useEffect } from 'react';
import { GameState, GamePhase, PlayerStats, Deal } from '@/types/game';
import { loadGameData, saveGameData } from '@/lib/storage';
import MainMenu from '@/components/MainMenu';
import GameScreen from '@/components/GameScreen';
import MultiplayerLobby from '@/components/MultiplayerLobby';

const initialPlayerStats: PlayerStats = {
  totalDeals: 0,
  successfulDeals: 0,
  totalMoneyRaised: 0,
  averageEquity: 0,
  entrepreneurScore: 100
};

const initialGameState: GameState = {
  phase: GamePhase.MENU,
  currentPitch: null,
  sharks: [],
  sharkDecisions: null,
  gameHistory: [],
  playerStats: initialPlayerStats
};

export default function Home() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);

  // Load game data from localStorage on mount
  useEffect(() => {
    const savedData = loadGameData();
    if (savedData) {
      setGameState(prev => ({
        ...prev,
        gameHistory: savedData.gameHistory,
        playerStats: savedData.playerStats
      }));
    }
    setIsLoaded(true);
  }, []);

  // Save game data to localStorage whenever gameState changes
  useEffect(() => {
    if (isLoaded) {
      saveGameData({
        gameHistory: gameState.gameHistory,
        playerStats: gameState.playerStats
      });
    }
  }, [gameState.gameHistory, gameState.playerStats, isLoaded]);

  const handleStartGame = () => {
    setGameState(prev => ({
      ...prev,
      phase: GamePhase.PITCH_BUILDER,
      currentPitch: null,
      sharkDecisions: null
    }));
  };

  const handleViewHistory = () => {
    setGameState(prev => ({
      ...prev,
      phase: GamePhase.HISTORY
    }));
  };

  const handleViewSharks = () => {
    setGameState(prev => ({
      ...prev,
      phase: GamePhase.SHARK_PROFILES
    }));
  };

  const handleViewMultiplayerLobby = () => {
    setGameState(prev => ({
      ...prev,
      phase: GamePhase.MULTIPLAYER_LOBBY
    }));
  };

  const handleJoinRoom = (roomId: string, playerId: string, playerName: string) => {
    setRoomId(roomId);
    setPlayerId(playerId);
    setPlayerName(playerName);
    setGameState(prev => ({
      ...prev,
      phase: GamePhase.PITCH_BUILDER
    }));
  };
  const handlePhaseChange = (phase: GamePhase, data?: any) => {
    setGameState(prev => ({
      ...prev,
      phase,
      ...(data && { currentPitch: data })
    }));
  };

  const handleUpdateGameState = (updates: Partial<GameState>) => {
    setGameState(prev => ({
      ...prev,
      ...updates
    }));
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-corporate-blue-900 via-corporate-blue-800 to-corporate-gold-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-corporate-blue-900 via-corporate-blue-800 to-corporate-gold-900">
      {gameState.phase === GamePhase.MENU ? (
        <MainMenu
          gameState={gameState}
          onStartGame={handleStartGame}
          onViewHistory={handleViewHistory}
          onViewSharks={handleViewSharks}
          onViewMultiplayerLobby={handleViewMultiplayerLobby}
        />
      ) : gameState.phase === GamePhase.MULTIPLAYER_LOBBY ? (
        <MultiplayerLobby
          onBack={() => setGameState(prev => ({ ...prev, phase: GamePhase.MENU }))}
          onJoinRoom={handleJoinRoom}
        />
      ) : (
        <GameScreen
          gameState={gameState}
          onPhaseChange={handlePhaseChange}
          onUpdateGameState={handleUpdateGameState}
          roomId={roomId}
          playerId={playerId}
          playerName={playerName}
        />
      )}
    </div>
  );
}
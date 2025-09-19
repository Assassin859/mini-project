"use client";

import { useState, useEffect } from 'react';
import MainMenu from '@/components/MainMenu';
import GameScreen from '@/components/GameScreen';
import { GameState, GamePhase } from '@/types/game';
import { loadGameData, saveGameData } from '@/lib/storage';

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    phase: GamePhase.MENU,
    currentPitch: null,
    gameHistory: [],
    playerStats: {
      totalDeals: 0,
      successfulDeals: 0,
      totalMoneyRaised: 0,
      averageEquity: 0,
      entrepreneurScore: 100
    },
    sharks: []
  });

  useEffect(() => {
    const savedData = loadGameData();
    if (savedData) {
      setGameState(prev => ({
        ...prev,
        gameHistory: savedData.gameHistory,
        playerStats: savedData.playerStats
      }));
    }
  }, []);

  useEffect(() => {
    if (gameState.gameHistory.length > 0 || gameState.playerStats.totalDeals > 0) {
      saveGameData({
        gameHistory: gameState.gameHistory,
        playerStats: gameState.playerStats
      });
    }
  }, [gameState.gameHistory, gameState.playerStats]);

  const handlePhaseChange = (newPhase: GamePhase, data?: any) => {
    setGameState(prev => ({
      ...prev,
      phase: newPhase,
      ...(data && { currentPitch: data })
    }));
  };

  const updateGameState = (updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {gameState.phase === GamePhase.MENU ? (
        <MainMenu 
          gameState={gameState}
          onStartGame={() => handlePhaseChange(GamePhase.PITCH_BUILDER)}
          onViewHistory={() => handlePhaseChange(GamePhase.HISTORY)}
          onViewSharks={() => handlePhaseChange(GamePhase.SHARK_PROFILES)}
        />
      ) : (
        <GameScreen
          gameState={gameState}
          onPhaseChange={handlePhaseChange}
          onUpdateGameState={updateGameState}
        />
      )}
    </div>
  );
}
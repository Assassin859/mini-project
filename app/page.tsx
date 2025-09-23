"use client";

import { useState, useEffect } from 'react';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import LobbyManager from '@/components/LobbyManager';
import MultiplayerGameScreen from '@/components/MultiplayerGameScreen';

export default function Home() {
  const { gameState } = useMultiplayer();
  const [showGame, setShowGame] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {!gameState.currentRoom || !showGame ? (
        <LobbyManager onGameStart={() => setShowGame(true)} />
      ) : (
        <MultiplayerGameScreen
          onBackToLobby={() => setShowGame(false)}
        />
      )}
    </div>
  );
}
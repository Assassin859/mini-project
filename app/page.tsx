"use client";

import { useState, useEffect } from 'react';
import { testSupabaseConnection } from '@/lib/supabase';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import LobbyManager from '@/components/LobbyManager';
import MultiplayerGameScreen from '@/components/MultiplayerGameScreen';
import { GamePhase } from '@/types/game';

export default function Home() {
  const { gameState } = useMultiplayer();
  const [showGame, setShowGame] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState(false);

  useEffect(() => {
    // Test Supabase connection on app load
    testSupabaseConnection().then(setSupabaseReady);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {!supabaseReady && (
        <div className="fixed top-4 right-4 bg-yellow-600 text-white px-4 py-2 rounded-lg">
          Connecting to Supabase...
        </div>
      )}
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
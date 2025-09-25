"use client";

import { useCallback } from 'react';
import { GameState, GamePhase } from '@/types/game';
import PitchBuilder from './PitchBuilder';
import PitchPresentation from './PitchPresentation';
import SharkDecisions from './SharkDecisions';
import PostSharkDecisions from './PostSharkDecisions';
import Negotiation from './Negotiation';
import Results from './Results';
import History from './History';
import SharkProfiles from './SharkProfiles';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface GameScreenProps {
  gameState: GameState;
  onPhaseChange: (phase: GamePhase, data?: any) => void;
  onUpdateGameState: (updates: Partial<GameState>) => void;
  roomId?: string | null;
  playerId?: string | null;
  playerName?: string | null;
}

export default function GameScreen({ 
  gameState, 
  onPhaseChange, 
  onUpdateGameState, 
  roomId, 
  playerId, 
  playerName 
}: GameScreenProps) {
  const handleBackToMenu = () => {
    onPhaseChange(GamePhase.MENU);
  };

  // Memoize callbacks to prevent unnecessary re-renders
  const handlePitchComplete = useCallback((pitch: any) => {
    onPhaseChange(GamePhase.PRESENTATION, pitch);
  }, [onPhaseChange]);

  const handlePresentationComplete = useCallback(() => {
    onPhaseChange(GamePhase.SHARK_DECISIONS);
  }, [onPhaseChange]);

  const handleSharkDecisionsComplete = useCallback((decisions: any) => {
    onUpdateGameState({ sharkDecisions: decisions });
    onPhaseChange(GamePhase.POST_SHARK_DECISIONS);
  }, [onUpdateGameState, onPhaseChange]);

  const handleNegotiationComplete = useCallback((deal: any) => {
    // Update game history and stats
    const newHistory = [...gameState.gameHistory, deal];
    const newStats = {
      totalDeals: gameState.playerStats.totalDeals + 1,
      successfulDeals: gameState.playerStats.successfulDeals + (deal.accepted ? 1 : 0),
      totalMoneyRaised: gameState.playerStats.totalMoneyRaised + (deal.accepted ? deal.finalTerms.amount : 0),
      averageEquity: newHistory.filter(d => d.accepted).length > 0 
        ? newHistory.filter(d => d.accepted).reduce((sum, d) => sum + d.finalTerms.equity, 0) / newHistory.filter(d => d.accepted).length 
        : gameState.playerStats.averageEquity,
      entrepreneurScore: Math.min(1000, gameState.playerStats.entrepreneurScore + (deal.accepted ? 10 : -5))
    };
    
    onUpdateGameState({
      gameHistory: newHistory,
      playerStats: newStats
    });
    
    onPhaseChange(GamePhase.RESULTS, deal);
  }, [gameState.gameHistory, gameState.playerStats, onUpdateGameState, onPhaseChange]);

  const handleNewGame = useCallback(() => {
    onPhaseChange(GamePhase.PITCH_BUILDER);
  }, [onPhaseChange]);

  const renderPhaseComponent = () => {
    switch (gameState.phase) {
      case GamePhase.PITCH_BUILDER:
        return (
          <PitchBuilder 
            onComplete={handlePitchComplete}
            onBack={handleBackToMenu}
            entrepreneurScore={gameState.playerStats.entrepreneurScore}
          />
        );
      
      case GamePhase.PRESENTATION:
        return (
          <PitchPresentation 
            pitch={gameState.currentPitch!}
            onComplete={handlePresentationComplete}
          />
        );
      
      case GamePhase.SHARK_DECISIONS:
        return (
          <SharkDecisions 
            pitch={gameState.currentPitch!}
            onComplete={handleSharkDecisionsComplete}
          />
        );

      case GamePhase.POST_SHARK_DECISIONS:
        return (
          <PostSharkDecisions 
            gameState={gameState}
            onPhaseChange={onPhaseChange}
            onUpdateGameState={onUpdateGameState}
          />
        );

      case GamePhase.NEGOTIATION:
        return (
          <Negotiation 
            pitch={gameState.currentPitch!}
            decisions={gameState.sharkDecisions!}
            onComplete={handleNegotiationComplete}
          />
        );
      
      case GamePhase.RESULTS:
        return (
          <Results 
            deal={gameState.gameHistory[gameState.gameHistory.length - 1]}
            playerStats={gameState.playerStats}
            onNewGame={handleNewGame}
            onBackToMenu={handleBackToMenu}
          />
        );
      
      case GamePhase.HISTORY:
        return (
          <History 
            gameHistory={gameState.gameHistory}
            onBack={handleBackToMenu}
          />
        );
      
      case GamePhase.SHARK_PROFILES:
        return (
          <SharkProfiles onBack={handleBackToMenu} />
        );
      
      default:
        return <div>Unknown game phase</div>;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-600 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={handleBackToMenu}
              className="text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
            <div className="text-2xl">🦈</div>
            <h1 className="text-xl font-bold text-white">Shark Tank Simulator</h1>
            {roomId && (
              <div className="text-sm text-slate-400">
                Room: {roomId.slice(0, 8)}...
              </div>
            )}
          </div>
          
          <div className="text-right text-slate-300">
            {playerName && (
              <div className="text-sm">Player: {playerName}</div>
            )}
            <div className="text-sm">Entrepreneur Score</div>
            <div className="text-lg font-bold text-white">{gameState.playerStats.entrepreneurScore}</div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1">
        {renderPhaseComponent()}
      </div>
    </div>
  );
}
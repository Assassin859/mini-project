"use client";

import { useMultiplayer } from '@/hooks/useMultiplayer';
import { GamePhase } from '@/types/game';
import PitchBuilder from './PitchBuilder';
import PitchPresentation from './PitchPresentation';
import SharkDecisions from './SharkDecisions';
import Negotiation from './Negotiation';
import Results from './Results';
import History from './History';
import SharkProfiles from './SharkProfiles';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Users, Crown, Clock } from 'lucide-react';

interface MultiplayerGameScreenProps {
  onBackToLobby: () => void;
}

export default function MultiplayerGameScreen({ onBackToLobby }: MultiplayerGameScreenProps) {
  const { gameState, sendGameAction, playerId } = useMultiplayer();

  if (!gameState.currentRoom || !gameState.currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  const { currentRoom, currentPlayer } = gameState;
  const isMyTurn = currentRoom.currentPlayerTurn === playerId;
  const currentTurnPlayer = currentRoom.players.find(p => p.id === currentRoom.currentPlayerTurn);

  const handlePhaseComplete = async (data?: any) => {
    switch (currentRoom.gamePhase) {
      case GamePhase.PITCH_BUILDER:
        await sendGameAction({
          type: 'SUBMIT_PITCH',
          payload: data,
        });
        break;
      case GamePhase.SHARK_DECISIONS:
        await sendGameAction({
          type: 'MAKE_DECISION',
          payload: data,
        });
        break;
      case GamePhase.NEGOTIATION:
        await sendGameAction({
          type: 'NEGOTIATE',
          payload: data,
        });
        break;
      case GamePhase.RESULTS:
        // Move to next player's turn
        const currentIndex = currentRoom.players.findIndex(p => p.id === currentRoom.currentPlayerTurn);
        const nextIndex = (currentIndex + 1) % currentRoom.players.length;
        const nextPlayerId = currentRoom.players[nextIndex].id;
        
        await sendGameAction({
          type: 'NEXT_TURN',
          payload: { nextPlayerId },
        });
        break;
    }
  };

  const renderPhaseComponent = () => {
    switch (currentRoom.gamePhase) {
      case GamePhase.PITCH_BUILDER:
        if (!isMyTurn) {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <Card className="bg-slate-800/50 border-slate-600 max-w-md">
                <CardContent className="p-8 text-center">
                  <Clock className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-4">Waiting for Turn</h2>
                  <p className="text-slate-300 mb-4">
                    {currentTurnPlayer?.name} is building their pitch...
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-slate-400">
                    <Users className="w-4 h-4" />
                    <span>Round {currentRoom.roundNumber}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        }
        return (
          <PitchBuilder 
            onComplete={handlePhaseComplete}
            onBack={onBackToLobby}
          />
        );
      
      case GamePhase.PRESENTATION:
        return (
          <PitchPresentation 
            pitch={currentRoom.currentPitch!}
            onComplete={handlePhaseComplete}
          />
        );
      
      case GamePhase.SHARK_DECISIONS:
        return (
          <SharkDecisions 
            pitch={currentRoom.currentPitch!}
            onComplete={handlePhaseComplete}
          />
        );
      
      case GamePhase.NEGOTIATION:
        return (
          <Negotiation 
            pitch={currentRoom.currentPitch!}
            decisions={currentRoom.sharkDecisions || []}
            onComplete={handlePhaseComplete}
          />
        );
      
      case GamePhase.RESULTS:
        if (!Array.isArray(currentRoom.deals) || currentRoom.deals.length === 0) {
          return (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-white text-xl">No results available yet.</div>
            </div>
          );
        }
        const latestDeal = currentRoom.deals[currentRoom.deals.length - 1];
        return (
          <Results 
            deal={latestDeal}
            playerStats={currentPlayer.stats}
            onNewGame={() => handlePhaseComplete()}
            onBackToMenu={onBackToLobby}
          />
        );
      
      case GamePhase.HISTORY:
        return (
          <History 
            gameHistory={currentRoom.deals}
            onBack={onBackToLobby}
          />
        );
      
      case GamePhase.SHARK_PROFILES:
        return (
          <SharkProfiles onBack={onBackToLobby} />
        );
      
      default:
        return <div className="text-white">Unknown game phase</div>;
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
              onClick={onBackToLobby}
              className="text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lobby
            </Button>
            <div className="text-2xl">🦈</div>
            <h1 className="text-xl font-bold text-white">
              {currentRoom.name} - Round {currentRoom.roundNumber}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Current Turn Indicator */}
            {currentTurnPlayer && (
              <div className="flex items-center space-x-2 bg-blue-600/20 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-blue-300 text-sm">
                  {currentTurnPlayer.name}'s turn
                </span>
              </div>
            )}
            
            {/* Player Score */}
            <div className="text-right text-slate-300">
              <div className="text-sm">Your Score</div>
              <div className="text-lg font-bold text-white">{currentPlayer.stats.entrepreneurScore}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Players Bar */}
      <div className="bg-slate-700/30 border-b border-slate-600 p-2">
        <div className="max-w-6xl mx-auto flex items-center justify-center space-x-4">
          {currentRoom.players.map((player) => (
            <div 
              key={player.id}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                player.id === currentRoom.currentPlayerTurn 
                  ? 'bg-blue-600/30 border border-blue-400' 
                  : 'bg-slate-600/30'
              }`}
            >
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {player.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-white font-medium">{player.name}</span>
              {player.isHost && <Crown className="w-3 h-3 text-yellow-400" />}
              <span className="text-slate-300">{player.stats.entrepreneurScore}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1">
        {renderPhaseComponent()}
      </div>
    </div>
  );
}
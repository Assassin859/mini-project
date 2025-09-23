"use client";

import React, { useState } from 'react';
import { GamePhase, BusinessPitch, SharkDecision } from '@/types/game';
import PitchBuilder from './PitchBuilder';
import PitchPresentation from './PitchPresentation';
import SharkDecisions from './SharkDecisions';
import Negotiation from './Negotiation';
import Results from './Results';

export default function SinglePlayerGame() {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.PITCH_BUILDER);
  const [pitch, setPitch] = useState<BusinessPitch | null>(null);
  const [decisions, setDecisions] = useState<SharkDecision[] | null>(null);
  const [deals, setDeals] = useState<any[]>([]);

  const handlePitchBuilt = (p: BusinessPitch) => {
    setPitch(p);
    setPhase(GamePhase.PRESENTATION);
  };

  const handlePresentationDone = () => {
    setPhase(GamePhase.SHARK_DECISIONS);
  };

  const handleSharkDecisionsDone = (d: SharkDecision[]) => {
    setDecisions(d);
    setPhase(GamePhase.NEGOTIATION);
  };

  const handleNegotiationDone = (deal: any) => {
    setDeals(prev => [...prev, deal]);
    setPhase(GamePhase.RESULTS);
  };

  const handleNewGame = () => {
    setPhase(GamePhase.PITCH_BUILDER);
    setPitch(null);
    setDecisions(null);
    setDeals([]);
  };

  switch (phase) {
    case GamePhase.PITCH_BUILDER:
      return <PitchBuilder onComplete={handlePitchBuilt} onBack={() => {}} />;
    case GamePhase.PRESENTATION:
      return <PitchPresentation pitch={pitch!} onComplete={handlePresentationDone} />;
    case GamePhase.SHARK_DECISIONS:
      return <SharkDecisions pitch={pitch!} onComplete={handleSharkDecisionsDone} />;
    case GamePhase.NEGOTIATION:
      return <Negotiation pitch={pitch!} decisions={decisions || []} onComplete={handleNegotiationDone} />;
    case GamePhase.RESULTS:
      return <Results deal={deals[deals.length - 1]} playerStats={{ entrepreneurScore: 100 }} onNewGame={handleNewGame} onBackToMenu={handleNewGame} />;
    default:
      return null;
  }
}


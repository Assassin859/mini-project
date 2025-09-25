"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BusinessPitch, SharkDecision } from '@/types/game';
import { SHARKS } from '@/lib/sharks';
import { calculateSharkDecision } from '@/lib/ai-logic';

interface SharkDecisionsProps {
  pitch: BusinessPitch;
  onComplete: (decisions: SharkDecision[]) => void;
}

export default function SharkDecisions({ pitch, onComplete }: SharkDecisionsProps) {
  const [currentSharkIndex, setCurrentSharkIndex] = useState(0);
  const [allDecisions, setAllDecisions] = useState([] as SharkDecision[]);
  const [isRevealing, setIsRevealing] = useState(false);
  const [showDecisionContent, setShowDecisionContent] = useState(false);

  // Generate all shark decisions initially
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const generated = SHARKS.map(shark => calculateSharkDecision(shark, pitch));
        setAllDecisions(generated);
      } catch (e) {
        console.error('Failed to generate decisions', e);
        const fallback = SHARKS.map(shark => ({
          sharkId: shark.id,
          isOut: true,
          reasoning: "I'm out.",
        })) as SharkDecision[];
        setAllDecisions(fallback);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [pitch]);

  // Handle sequential display of shark decisions
  useEffect(() => {
    if (allDecisions.length === 0) return;
    if (currentSharkIndex >= SHARKS.length) {
      // All sharks have decided, complete after a delay
      const timer = setTimeout(() => {
        onComplete(allDecisions);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // Start revealing current shark's decision
    setIsRevealing(true);
    setShowDecisionContent(false);

    // Show thinking animation, then reveal decision
    const thinkingTimer = setTimeout(() => {
      setShowDecisionContent(true);
      
      // After showing decision, move to next shark
      const nextTimer = setTimeout(() => {
        if (currentSharkIndex < SHARKS.length - 1) {
          setCurrentSharkIndex(currentSharkIndex + 1);
          setIsRevealing(false);
          setShowDecisionContent(false);
        }
      }, 3000);
      
      return () => clearTimeout(nextTimer);
    }, 2000);

    return () => clearTimeout(thinkingTimer);
  }, [allDecisions, currentSharkIndex, onComplete]);

  const currentDecision = allDecisions[currentSharkIndex];
  const shark = SHARKS[currentSharkIndex];

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🦈 Shark Decisions
          </h1>
          <p className="text-xl text-slate-300">
            The sharks are evaluating your pitch...
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-center items-center space-x-4 mb-4">
            <span className="text-slate-300">
              Shark {currentSharkIndex + 1} of {SHARKS.length}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${((currentSharkIndex + (showDecisionContent ? 1 : 0)) / SHARKS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Shark */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shark Info */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-6 text-center">
              <div className="text-6xl mb-4">{shark.avatar}</div>
              <h3 className="text-xl font-bold text-white mb-2">{shark.name}</h3>
              <p className="text-slate-300 text-sm mb-4">{shark.background}</p>
              
              <div className="space-y-2 text-sm">
                <div className="bg-slate-700 p-2 rounded">
                  <span className="text-slate-400">Net Worth: </span>
                  <span className="text-white font-semibold">
                    ${(shark.netWorth / 1000000000).toFixed(1)}B
                  </span>
                </div>
                <div className="bg-slate-700 p-2 rounded">
                  <span className="text-slate-400">Specialties: </span>
                  <span className="text-white text-xs">
                    {shark.preferredCategories.slice(0, 2).join(', ')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Decision Area */}
          <Card className="lg:col-span-2 bg-slate-800/50 border-slate-600">
            <CardContent className="p-8">
              {!isRevealing ? (
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Waiting for {shark.name}...
                  </h3>
                  <div className="animate-pulse">
                    <div className="w-16 h-16 bg-slate-600 rounded-full mx-auto"></div>
                  </div>
                </div>
              ) : !showDecisionContent ? (
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {shark.name} is thinking...
                  </h3>
                  <div className="flex justify-center space-x-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              ) : (
                <div className={`text-center transition-all duration-1000 ${showDecisionContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                  {currentDecision?.isOut ? (
                    <div>
                      {/* TODO: Add sound effect for shark going out */}
                      {/* useEffect(() => { const outSound = new Audio('/sounds/shark-out.mp3'); outSound.play(); }, []); */}
                      <div className="text-6xl mb-4">❌</div>
                      <h3 className="text-2xl font-bold text-red-400 mb-4">I'm Out!</h3>
                    </div>
                  ) : (
                    <div>
                      {/* TODO: Add sound effect for shark making offer */}
                      {/* useEffect(() => { const offerSound = new Audio('/sounds/shark-offer.mp3'); offerSound.play(); }, []); */}
                      <div className="text-6xl mb-4">💰</div>
                      <h3 className="text-2xl font-bold text-green-400 mb-4">I'll Make an Offer!</h3>
                      {currentDecision?.offer && (
                        <div className="bg-green-600/20 p-4 rounded-lg mb-4">
                          <p className="text-xl text-white font-semibold">
                            ${currentDecision.offer.amount.toLocaleString()} for {currentDecision.offer.equity}% equity
                          </p>
                          {currentDecision.offer.conditions && (
                            <p className="text-green-300 text-sm mt-2">
                              Condition: {currentDecision.offer.conditions}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <p className="text-slate-300 italic">"{currentDecision?.reasoning}"</p>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-blue-400 font-semibold">"{shark.catchphrase}"</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Previous Decisions */}
        {allDecisions.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-4">Previous Decisions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allDecisions.slice(0, currentSharkIndex).map((decision: SharkDecision, index: number) => {
                const sharkInfo = SHARKS[index];
                return (
                  <Card key={index} className={`bg-slate-800/30 border-slate-600 ${decision.isOut ? 'opacity-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{sharkInfo.avatar}</span>
                        <span className="text-white font-semibold">{sharkInfo.name}</span>
                        {decision.isOut ? (
                          <span className="text-red-400 text-sm">OUT</span>
                        ) : (
                          <span className="text-green-400 text-sm">OFFER</span>
                        )}
                      </div>
                      {decision.offer && (
                        <p className="text-slate-300 text-sm">
                          ${decision.offer.amount.toLocaleString()} for {decision.offer.equity}%
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
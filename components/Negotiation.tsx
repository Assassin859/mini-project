"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BusinessPitch, SharkDecision, Deal } from '@/types/game';
import { SHARKS } from '@/lib/sharks';
import { Handshake, X, DollarSign, Percent, AlertCircle } from 'lucide-react';

interface NegotiationProps {
  pitch: BusinessPitch;
  decisions: SharkDecision[];
  onComplete: (deal: Deal) => void;
}

export default function Negotiation({ pitch, decisions, onComplete }: NegotiationProps) {
  const [selectedOffer, setSelectedOffer] = useState(null as SharkDecision | null);
  const [counterOffer, setCounterOffer] = useState(null as { amount: number; equity: number } | null);
  const [isCountering, setIsCountering] = useState(false);
  const [negotiationPhase, setNegotiationPhase] = useState('selecting' as 'selecting' | 'countering' | 'final');

  const activeOffers = decisions.filter(d => !d.isOut && d.offer);

  // Note: activeOffers.length === 0 case is now handled by PostSharkDecisions component

  const handleSelectOffer = (decision: SharkDecision) => {
    setSelectedOffer(decision);
    setNegotiationPhase('countering');
  };

  const handleAcceptOffer = () => {
    if (!selectedOffer || !selectedOffer.offer) return;

    // TODO: Add sound effect for deal acceptance
    // const acceptSound = new Audio('/sounds/deal-accepted.mp3');
    // acceptSound.play().catch(console.error);

    const shark = SHARKS.find(s => s.id === selectedOffer.sharkId)!;
    const deal: Deal = {
      id: Date.now().toString(),
      pitch,
      finalOffer: {
        sharkId: selectedOffer.sharkId,
        amount: selectedOffer.offer.amount,
        equity: selectedOffer.offer.equity,
        conditions: selectedOffer.offer.conditions,
      },
      accepted: true,
      finalTerms: {
        amount: selectedOffer.offer.amount,
        equity: selectedOffer.offer.equity,
        valuation: (selectedOffer.offer.amount / selectedOffer.offer.equity) * 100
      },
      completedAt: new Date()
    };

    onComplete(deal);
  };

  const handleCounterOffer = () => {
    if (!selectedOffer || !selectedOffer.offer) return;

    setCounterOffer({
      amount: selectedOffer.offer.amount,
      equity: Math.max(5, selectedOffer.offer.equity - 5)
    });
    setIsCountering(true);
  };

  const handleSubmitCounter = () => {
    if (!selectedOffer || !selectedOffer.offer || !counterOffer) return;

    // TODO: Add sound effect for counter offer
    // const counterSound = new Audio('/sounds/counter-offer.mp3');
    // counterSound.play().catch(console.error);

    // AI decides whether to accept the counter offer
    const shark = SHARKS.find(s => s.id === selectedOffer.sharkId)!;
    const originalEquity = selectedOffer.offer.equity;
    const counterEquity = counterOffer.equity;
    
    // Shark is more likely to accept if the counter isn't too far from their original offer
    const equityDifference = originalEquity - counterEquity;
    const acceptanceProbability = Math.max(0.1, 0.8 - (equityDifference / 20));
    const accepts = Math.random() < acceptanceProbability;

    if (accepts) {
      const deal: Deal = {
        id: Date.now().toString(),
        pitch,
        finalOffer: {
          sharkId: selectedOffer.sharkId,
          amount: counterOffer.amount,
          equity: counterOffer.equity
        },
        accepted: true,
        playerCounterOffer: counterOffer,
        finalTerms: {
          amount: counterOffer.amount,
          equity: counterOffer.equity,
          valuation: (counterOffer.amount / counterOffer.equity) * 100
        },
        completedAt: new Date()
      };
      onComplete(deal);
    } else {
      // Shark rejects counter offer
      const deal: Deal = {
        id: Date.now().toString(),
        pitch,
        finalOffer: {
          sharkId: selectedOffer.sharkId,
          amount: selectedOffer.offer.amount,
          equity: selectedOffer.offer.equity,
          conditions: selectedOffer.offer.conditions,
        },
        accepted: false,
        playerCounterOffer: counterOffer,
        finalTerms: {
          amount: 0,
          equity: 0,
          valuation: 0
        },
        completedAt: new Date()
      };
      onComplete(deal);
    }
  };

  const handleWalkAway = () => {
    // TODO: Add sound effect for walking away
    // const walkAwaySound = new Audio('/sounds/walk-away.mp3');
    // walkAwaySound.play().catch(console.error);

    const deal: Deal = {
      id: Date.now().toString(),
      pitch,
      finalOffer: activeOffers[0]
        ? {
            sharkId: activeOffers[0].sharkId,
            amount: activeOffers[0].offer?.amount ?? pitch.fundingRequest,
            equity: activeOffers[0].offer?.equity ?? pitch.equityOffered,
            conditions: activeOffers[0].offer?.conditions,
          }
        : {
            sharkId: undefined as any, // fallback if no active offer
            amount: pitch.fundingRequest,
            equity: pitch.equityOffered,
          },
      accepted: false,
      finalTerms: {
        amount: 0,
        equity: 0,
        valuation: 0
      },
      completedAt: new Date()
    };
    onComplete(deal);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🤝 Negotiation Time
          </h1>
          <p className="text-xl text-slate-300">
            {negotiationPhase === 'selecting' && 'Choose an offer to negotiate'}
            {negotiationPhase === 'countering' && 'Make your decision'}
          </p>
        </div>

        {negotiationPhase === 'selecting' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeOffers.map((decision) => {
                const shark = SHARKS.find(s => s.id === decision.sharkId)!;
                const offer = decision.offer!;
                const valuation = (offer.amount / offer.equity) * 100;
                
                return (
                  <Card 
                    key={decision.sharkId} 
                    className="bg-slate-800/50 border-slate-600 hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => handleSelectOffer(decision)}
                  >
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <span className="text-4xl">{shark.avatar}</span>
                        <div>
                          <CardTitle className="text-white">{shark.name}</CardTitle>
                          <p className="text-slate-400 text-sm">{shark.catchphrase}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-green-600/20 p-4 rounded-lg">
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                              <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-1" />
                              <p className="text-2xl font-bold text-white">
                                ${offer.amount.toLocaleString()}
                              </p>
                              <p className="text-green-300 text-sm">Investment</p>
                            </div>
                            <div>
                              <Percent className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                              <p className="text-2xl font-bold text-white">
                                {offer.equity}%
                              </p>
                              <p className="text-orange-300 text-sm">Equity</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-slate-700 p-3 rounded">
                          <p className="text-slate-300 text-sm">
                            <strong>Valuation:</strong> ${valuation.toLocaleString()}
                          </p>
                          {offer.conditions && (
                            <p className="text-slate-400 text-xs mt-1">
                              <strong>Conditions:</strong> {offer.conditions}
                            </p>
                          )}
                        </div>

                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Select This Offer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={handleWalkAway}
                className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
              >
                Walk Away (No Deal)
              </Button>
            </div>
          </div>
        )}

        {negotiationPhase === 'countering' && selectedOffer && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-4xl">{SHARKS.find(s => s.id === selectedOffer.sharkId)!.avatar}</span>
                  <div>
                    <CardTitle className="text-white">
                      {SHARKS.find(s => s.id === selectedOffer.sharkId)!.name}'s Offer
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Offer */}
                <div className="bg-blue-600/20 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-white mb-4">Current Offer</h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold text-white">
                        ${selectedOffer.offer!.amount.toLocaleString()}
                      </p>
                      <p className="text-blue-300">Investment Amount</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">
                        {selectedOffer.offer!.equity}%
                      </p>
                      <p className="text-blue-300">Equity Asked</p>
                    </div>
                  </div>
                </div>

                {/* Counter Offer Form */}
                {isCountering && (
                  <div className="bg-slate-700/50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-white mb-4">Your Counter Offer</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Investment Amount ($)</Label>
                        <Input
                          type="number"
                          value={counterOffer?.amount || ''}
                          onChange={(e: any) => setCounterOffer((prev: any) => ({
                            ...prev,
                            amount: Number(e.target.value)
                          }))}
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Equity Offered (%)</Label>
                        <Input
                          type="number"
                          value={counterOffer?.equity || ''}
                          onChange={(e: any) => setCounterOffer((prev: any) => ({
                            ...prev,
                            equity: Number(e.target.value)
                          }))}
                          min="5"
                          max="50"
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                      </div>
                    </div>

                    {counterOffer && (
                      <div className="mt-4 bg-slate-800 p-4 rounded">
                        <p className="text-slate-300">
                          New Valuation: <span className="text-white font-bold">
                            ${((counterOffer.amount / counterOffer.equity) * 100).toLocaleString()}
                          </span>
                        </p>
                      </div>
                    )}

                    <div className="flex space-x-4 mt-6">
                      <Button 
                        onClick={handleSubmitCounter}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={!counterOffer}
                      >
                        Submit Counter Offer
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setIsCountering(false)}
                        className="border-slate-600 text-slate-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {!isCountering && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      onClick={handleAcceptOffer}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      <Handshake className="w-4 h-4 mr-2" />
                      Accept Offer
                    </Button>
                    <Button 
                      onClick={handleCounterOffer}
                      className="bg-yellow-600 hover:bg-yellow-700 flex-1"
                    >
                      💰 Counter Offer
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleWalkAway}
                      className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Walk Away
                    </Button>
                  </div>
                )}

                {/* Warning */}
                <div className="bg-yellow-600/20 p-4 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-yellow-300 text-sm">
                      <strong>Remember:</strong> Counter offers carry risk. The shark might reject your counter 
                      and withdraw their original offer entirely!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
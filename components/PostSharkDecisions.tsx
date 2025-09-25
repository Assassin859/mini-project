"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameState, GamePhase, Deal } from '@/types/game';
import { SHARKS } from '@/lib/sharks';
import { 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Target, 
  TrendingUp, 
  Trophy,
  ArrowRight,
  Home
} from 'lucide-react';

interface PostSharkDecisionsProps {
  gameState: GameState;
  onPhaseChange: (phase: GamePhase, data?: any) => void;
  onUpdateGameState: (updates: Partial<GameState>) => void;
}

export default function PostSharkDecisions({ 
  gameState, 
  onPhaseChange, 
  onUpdateGameState 
}: PostSharkDecisionsProps) {
  const { currentPitch, sharkDecisions, playerStats } = gameState;
  
  if (!currentPitch || !sharkDecisions) {
    return <div>Error: Missing pitch or shark decisions</div>;
  }

  const activeOffers = sharkDecisions.filter(d => !d.isOut && d.offer);
  const sharksOut = sharkDecisions.filter(d => d.isOut);

  const handleProceedToNegotiation = () => {
    onPhaseChange(GamePhase.NEGOTIATION);
  };

  const handleWalkAway = () => {
    // Create a "no deal" result
    const deal: Deal = {
      id: Date.now().toString(),
      pitch: currentPitch,
      finalOffer: {
        sharkId: undefined as any, // No shark made the final offer
        amount: currentPitch.fundingRequest,
        equity: currentPitch.equityOffered,
      },
      accepted: false,
      finalTerms: {
        amount: 0,
        equity: 0,
        valuation: 0
      },
      completedAt: new Date()
    };

    // Update game history and stats
    const newHistory = [...gameState.gameHistory, deal];
    const newStats = {
      totalDeals: playerStats.totalDeals + 1,
      successfulDeals: playerStats.successfulDeals, // No change for walking away
      totalMoneyRaised: playerStats.totalMoneyRaised, // No change
      averageEquity: playerStats.averageEquity, // No change
      entrepreneurScore: Math.max(0, playerStats.entrepreneurScore - 5) // Penalty for walking away
    };
    
    onUpdateGameState({
      gameHistory: newHistory,
      playerStats: newStats
    });
    
    onPhaseChange(GamePhase.RESULTS, deal);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🦈 Shark Tank Results
          </h1>
          <p className="text-xl text-slate-300">
            Here's how the sharks responded to your pitch for <span className="text-blue-400 font-bold">{currentPitch.businessName}</span>
          </p>
        </div>

        {/* Current Score Display */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-400/50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-4">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <div>
                <h3 className="text-2xl font-bold text-white">Current Entrepreneur Score</h3>
                <p className="text-4xl font-bold text-blue-400">{playerStats.entrepreneurScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-green-600/20 border-green-400/50">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{activeOffers.length}</p>
              <p className="text-green-300 text-sm">Offers Received</p>
            </CardContent>
          </Card>

          <Card className="bg-red-600/20 border-red-400/50">
            <CardContent className="p-4 text-center">
              <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{sharksOut.length}</p>
              <p className="text-red-300 text-sm">Sharks Out</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-600/20 border-blue-400/50">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {activeOffers.length > 0 ? 
                  `$${Math.max(...activeOffers.map(o => o.offer!.amount)).toLocaleString()}` : 
                  '$0'
                }
              </p>
              <p className="text-blue-300 text-sm">Highest Offer</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Active Offers */}
          {activeOffers.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                  Offers on the Table ({activeOffers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeOffers.map((decision) => {
                  const shark = SHARKS.find(s => s.id === decision.sharkId)!;
                  const offer = decision.offer!;
                  const valuation = (offer.amount / offer.equity) * 100;
                  
                  return (
                    <div 
                      key={decision.sharkId} 
                      className="bg-green-600/10 border border-green-400/30 p-4 rounded-lg"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-3xl">{shark.avatar}</span>
                        <div>
                          <h4 className="text-white font-bold">{shark.name}</h4>
                          <Badge className="bg-green-600 text-white text-xs">
                            OFFER
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="text-center">
                          <DollarSign className="w-4 h-4 text-green-400 mx-auto mb-1" />
                          <p className="text-lg font-bold text-white">
                            ${offer.amount.toLocaleString()}
                          </p>
                          <p className="text-green-300 text-xs">Investment</p>
                        </div>
                        <div className="text-center">
                          <Target className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                          <p className="text-lg font-bold text-white">
                            {offer.equity}%
                          </p>
                          <p className="text-orange-300 text-xs">Equity</p>
                        </div>
                      </div>
                      
                      <div className="text-center mb-2">
                        <p className="text-slate-300 text-sm">
                          Valuation: <span className="text-white font-semibold">
                            ${valuation.toLocaleString()}
                          </span>
                        </p>
                      </div>
                      
                      {offer.conditions && (
                        <div className="bg-yellow-600/20 p-2 rounded text-xs">
                          <p className="text-yellow-300">
                            <strong>Conditions:</strong> {offer.conditions}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Sharks Out */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <XCircle className="w-5 h-5 mr-2 text-red-400" />
                Sharks Out ({sharksOut.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sharksOut.map((decision) => {
                const shark = SHARKS.find(s => s.id === decision.sharkId)!;
                
                return (
                  <div 
                    key={decision.sharkId} 
                    className="bg-red-600/10 border border-red-400/30 p-3 rounded-lg opacity-75"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl grayscale">{shark.avatar}</span>
                      <div>
                        <h4 className="text-white font-semibold">{shark.name}</h4>
                        <Badge className="bg-red-600 text-white text-xs">
                          OUT
                        </Badge>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm italic">
                      "{decision.reasoning}"
                    </p>
                  </div>
                );
              })}
              
              {sharksOut.length === 0 && (
                <p className="text-slate-400 text-center py-4">
                  All sharks are still in the game!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Your Original Ask */}
        <Card className="mb-8 bg-slate-800/30 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white">Your Original Ask</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <DollarSign className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-white">
                  ${currentPitch.fundingRequest.toLocaleString()}
                </p>
                <p className="text-slate-300 text-sm">Requested</p>
              </div>
              <div>
                <Target className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-white">
                  {currentPitch.equityOffered}%
                </p>
                <p className="text-slate-300 text-sm">Equity Offered</p>
              </div>
              <div>
                <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-xl font-bold text-white">
                  ${((currentPitch.fundingRequest / currentPitch.equityOffered) * 100).toLocaleString()}
                </p>
                <p className="text-slate-300 text-sm">Your Valuation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {activeOffers.length > 0 ? (
            <>
              <Button 
                onClick={handleProceedToNegotiation}
                className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Proceed to Negotiation
              </Button>
              <Button 
                variant="outline"
                onClick={handleWalkAway}
                className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white text-lg px-8 py-3"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Walk Away (No Deal)
              </Button>
            </>
          ) : (
            <Button 
              onClick={handleWalkAway}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
            >
              <Home className="w-5 h-5 mr-2" />
              Continue to Results
            </Button>
          )}
        </div>

        {/* Motivational Message */}
        <Card className="mt-8 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-400/30">
          <CardContent className="p-6 text-center">
            {activeOffers.length > 0 ? (
              <div>
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Congratulations! You have {activeOffers.length} offer{activeOffers.length > 1 ? 's' : ''} to consider!
                </h3>
                <p className="text-slate-300">
                  Now it's time to negotiate. You can accept an offer, make a counter-offer, or walk away. 
                  Choose wisely - this decision will impact your entrepreneur score and future opportunities.
                </p>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-3">💪</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Don't Give Up!
                </h3>
                <p className="text-slate-300">
                  While no sharks made offers this time, every entrepreneur faces rejection. 
                  Learn from this experience, refine your pitch, and come back stronger!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
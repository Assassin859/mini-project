"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Deal, PlayerStats } from '@/types/game';
import { SHARKS } from '@/lib/sharks';
import { Trophy, TrendingUp, DollarSign, Target, ArrowRight, Home } from 'lucide-react';

interface ResultsProps {
  deal: Deal;
  playerStats: PlayerStats;
  onNewGame: () => void;
  onBackToMenu: () => void;
}

export default function Results({ deal, playerStats, onNewGame, onBackToMenu }: ResultsProps) {
  const shark = SHARKS.find(s => s.id === deal.finalOffer.sharkId);
  const wasSuccessful = deal.accepted;

  // TODO: Add sound effects for results
  // useEffect(() => {
  //   const resultSound = new Audio(wasSuccessful ? '/sounds/success.mp3' : '/sounds/no-deal.mp3');
  //   resultSound.play().catch(console.error);
  // }, [wasSuccessful]);

  const getScoreChange = () => {
    return wasSuccessful ? '+10' : '-5';
  };

  const getSuccessMessage = () => {
    if (!wasSuccessful) {
      return {
        title: "No Deal Reached",
        message: "Don't let this discourage you! Every entrepreneur faces rejection. Learn from this experience and come back stronger.",
        emoji: "💪"
      };
    }

    if (deal.playerCounterOffer) {
      return {
        title: "Deal Negotiated Successfully!",
        message: "Excellent negotiation skills! You successfully countered the shark's offer and reached a mutually beneficial agreement.",
        emoji: "🤝"
      };
    }

    return {
      title: "Congratulations! You Got a Deal!",
      message: "The shark loved your business and you've successfully secured funding. Now it's time to grow your company!",
      emoji: "🎉"
    };
  };

  const successInfo = getSuccessMessage();

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-4">{successInfo.emoji}</div>
          <h1 className="text-4xl font-bold text-white mb-4">{successInfo.title}</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            {successInfo.message}
          </p>
        </div>

        {/* Deal Summary */}
        <Card className={`mb-8 ${wasSuccessful ? 'bg-green-600/20 border-green-400' : 'bg-red-600/20 border-red-400'}`}>
          <CardHeader>
            <CardTitle className="text-white text-center text-2xl">
              {deal.pitch.businessName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {wasSuccessful && shark ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-6">
                  <div className="text-center">
                    <span className="text-6xl">{shark.avatar}</span>
                    <p className="text-white font-bold mt-2">{shark.name}</p>
                  </div>
                  <ArrowRight className="w-8 h-8 text-white" />
                  <div className="text-center">
                    <span className="text-6xl">🏢</span>
                    <p className="text-white font-bold mt-2">Your Business</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                    <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      ${deal.finalTerms.amount.toLocaleString()}
                    </p>
                    <p className="text-slate-300">Investment Received</p>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                    <Target className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {deal.finalTerms.equity}%
                    </p>
                    <p className="text-slate-300">Equity Given</p>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                    <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      ${deal.finalTerms.valuation.toLocaleString()}
                    </p>
                    <p className="text-slate-300">Company Valuation</p>
                  </div>
                </div>

                {deal.playerCounterOffer && (
                  <div className="bg-blue-600/20 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-white mb-2">Negotiation Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-300">Original Offer:</p>
                        <p className="text-white">
                          ${deal.finalOffer.amount.toLocaleString()} for {deal.finalOffer.equity}%
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-300">Final Terms:</p>
                        <p className="text-white">
                          ${deal.finalTerms.amount.toLocaleString()} for {deal.finalTerms.equity}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {deal.finalOffer.conditions && (
                  <div className="bg-yellow-600/20 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-white mb-2">Deal Conditions</h3>
                    <p className="text-yellow-200">{deal.finalOffer.conditions}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-6xl mb-4">📈</div>
                <p className="text-slate-300">
                  Your pitch: <span className="text-white font-bold">{deal.pitch.businessName}</span>
                </p>
                <p className="text-slate-300">
                  You asked for: <span className="text-white font-bold">
                    ${deal.pitch.fundingRequest.toLocaleString()} for {deal.pitch.equityOffered}%
                  </span>
                </p>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-slate-300 text-sm">
                    Don't give up! Analyze what went wrong and come back with a stronger pitch. 
                    Maybe adjust your valuation, improve your financials, or target a different market.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Player Stats Update */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">{playerStats.entrepreneurScore}</p>
              <p className="text-xs text-slate-300">Score ({getScoreChange()})</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">
                ${playerStats.totalMoneyRaised.toLocaleString()}
              </p>
              <p className="text-xs text-slate-300">Total Raised</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">{playerStats.totalDeals}</p>
              <p className="text-xs text-slate-300">Total Pitches</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">
                {playerStats.totalDeals > 0 ? 
                  Math.round((playerStats.successfulDeals / playerStats.totalDeals) * 100) : 0}%
              </p>
              <p className="text-xs text-slate-300">Success Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onNewGame}
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
          >
            <Trophy className="w-5 h-5 mr-2" />
            Pitch Another Business
          </Button>
          <Button 
            variant="outline"
            onClick={onBackToMenu}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 text-lg px-8 py-3"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Main Menu
          </Button>
        </div>

        {/* Achievement Unlocks */}
        {wasSuccessful && playerStats.successfulDeals >= 3 && (
          <Card className="mt-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-400">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">🏆</div>
              <h3 className="text-xl font-bold text-white mb-2">Achievement Unlocked!</h3>
              <p className="text-purple-200">
                Serial Entrepreneur: Successfully closed 3+ deals!
              </p>
            </CardContent>
          </Card>
        )}

        {wasSuccessful && deal.finalTerms.amount >= 500000 && (
          <Card className="mt-4 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-400">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">💰</div>
              <h3 className="text-xl font-bold text-white mb-2">Big Deal!</h3>
              <p className="text-yellow-200">
                You secured a deal worth $500K or more!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
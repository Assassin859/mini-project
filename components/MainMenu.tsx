"use client";

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { GameState } from '@/types/game';
import { Trophy, Users, History, PlayCircle, DollarSign, TrendingUp } from 'lucide-react';

interface MainMenuProps {
  gameState: GameState;
  onStartGame: () => void;
  onViewHistory: () => void;
  onViewSharks: () => void;
}

export default function MainMenu({ gameState, onStartGame, onViewHistory, onViewSharks }: MainMenuProps) {
  const { playerStats } = gameState;
  const successRate = playerStats.totalDeals > 0 ? 
    Math.round((playerStats.successfulDeals / playerStats.totalDeals) * 100) : 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🦈</div>
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
            Shark Tank Simulator
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Pitch your business to AI sharks and negotiate million-dollar deals. 
            Do you have what it takes to swim with the sharks?
          </p>
        </div>

        {/* Player Stats */}
        {playerStats.totalDeals > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-800/50 border-slate-600">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  ${playerStats.totalMoneyRaised.toLocaleString()}
                </div>
                <div className="text-sm text-slate-300">Total Raised</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-600">
              <CardContent className="p-4 text-center">
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{successRate}%</div>
                <div className="text-sm text-slate-300">Success Rate</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-600">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{playerStats.totalDeals}</div>
                <div className="text-sm text-slate-300">Total Pitches</div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/50 border-slate-600">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {Math.round(playerStats.averageEquity)}%
                </div>
                <div className="text-sm text-slate-300">Avg. Equity</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Menu Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-blue-400 hover:scale-105 transition-transform cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <PlayCircle className="w-8 h-8 text-white" />
                <h3 className="text-2xl font-bold text-white">Start New Pitch</h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-blue-100 mb-4">
                Create your business pitch and face the sharks. Build your presentation, 
                set your terms, and see if you can make a deal.
              </p>
              <Button 
                onClick={onStartGame}
                className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                size="lg"
              >
                Enter the Tank
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-800 border-purple-400 hover:scale-105 transition-transform cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-white" />
                <h3 className="text-2xl font-bold text-white">Meet the Sharks</h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-purple-100 mb-4">
                Learn about each shark's background, investment preferences, 
                and what they're looking for in a business.
              </p>
              <Button 
                onClick={onViewSharks}
                className="w-full bg-white text-purple-600 hover:bg-purple-50 font-semibold"
                size="lg"
              >
                View Shark Profiles
              </Button>
            </CardContent>
          </Card>

          {playerStats.totalDeals > 0 && (
            <Card className="bg-gradient-to-br from-green-600 to-green-800 border-green-400 hover:scale-105 transition-transform cursor-pointer md:col-span-2">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <History className="w-8 h-8 text-white" />
                  <h3 className="text-2xl font-bold text-white">Deal History</h3>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-green-100 mb-4">
                  Review your past pitches, successful deals, and learn from your experience. 
                  See which sharks you've worked with and track your progress.
                </p>
                <Button 
                  onClick={onViewHistory}
                  className="w-full bg-white text-green-600 hover:bg-green-50 font-semibold"
                  size="lg"
                >
                  View Past Deals
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Game Rules */}
        <Card className="bg-slate-800/30 border-slate-600">
          <CardHeader>
            <h3 className="text-xl font-bold text-white">How to Play</h3>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-2">
            <p>• Create compelling business pitches with detailed financials and projections</p>
            <p>• Present to 5 AI sharks with unique personalities and investment preferences</p>
            <p>• Negotiate deals, counter offers, and try to get the best terms possible</p>
            <p>• Build your entrepreneur score through successful deals and smart negotiations</p>
            <p>• Unlock higher funding rounds as you prove your business acumen</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
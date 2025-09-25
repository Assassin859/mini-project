"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameState } from '@/types/game';
import { 
  Play, 
  History, 
  Users, 
  Trophy, 
  DollarSign, 
  Target, 
  TrendingUp,
  Star,
  Briefcase,
  Award
} from 'lucide-react';

interface MainMenuProps {
  gameState: GameState;
  onStartGame: () => void;
  onViewHistory: () => void;
  onViewSharks: () => void;
  onViewMultiplayerLobby: () => void;
}

export default function MainMenu({ gameState, onStartGame, onViewHistory, onViewSharks, onViewMultiplayerLobby }: MainMenuProps) {
  const { playerStats, gameHistory } = gameState;
  
  const getScoreLevel = (score: number) => {
    if (score >= 500) return { level: 'Shark', color: 'bg-purple-600', icon: '🦈' };
    if (score >= 300) return { level: 'Mogul', color: 'bg-blue-600', icon: '👑' };
    if (score >= 200) return { level: 'Executive', color: 'bg-green-600', icon: '💼' };
    if (score >= 150) return { level: 'Entrepreneur', color: 'bg-yellow-600', icon: '🚀' };
    return { level: 'Rookie', color: 'bg-gray-600', icon: '🌱' };
  };

  const scoreInfo = getScoreLevel(playerStats.entrepreneurScore);
  const successRate = playerStats.totalDeals > 0 
    ? Math.round((playerStats.successfulDeals / playerStats.totalDeals) * 100) 
    : 0;

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="text-8xl">🦈</div>
            <div>
              <h1 className="text-6xl font-bold text-white mb-2">
                Shark Tank Simulator
              </h1>
              <p className="text-xl text-slate-300">
                Pitch your business ideas to AI sharks and negotiate deals
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Actions */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center">
                  <Briefcase className="w-6 h-6 mr-3" />
                  Ready to Pitch?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-slate-300 text-lg">
                  Create your business pitch, present to the sharks, and negotiate the deal of a lifetime!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-600/20 p-4 rounded-lg text-center">
                    <div className="text-3xl mb-2">📊</div>
                    <h3 className="text-white font-semibold mb-1">Build Your Pitch</h3>
                    <p className="text-blue-300 text-sm">Create a compelling business presentation</p>
                  </div>
                  
                  <div className="bg-green-600/20 p-4 rounded-lg text-center">
                    <div className="text-3xl mb-2">🎯</div>
                    <h3 className="text-white font-semibold mb-1">Face the Sharks</h3>
                    <p className="text-green-300 text-sm">Present to 5 unique AI shark personalities</p>
                  </div>
                  
                  <div className="bg-purple-600/20 p-4 rounded-lg text-center">
                    <div className="text-3xl mb-2">🤝</div>
                    <h3 className="text-white font-semibold mb-1">Negotiate</h3>
                    <p className="text-purple-300 text-sm">Accept offers or counter-negotiate</p>
                  </div>
                </div>

                <Button 
                  onClick={onStartGame}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-xl py-6"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Start New Pitch
                </Button>

                <Button 
                  onClick={onViewMultiplayerLobby}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-xl py-6"
                >
                  <Users className="w-6 h-6 mr-3" />
                  Play Multiplayer
                </Button>
              </CardContent>
            </Card>

            {/* Secondary Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-600 hover:border-blue-400 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <History className="w-8 h-8 text-blue-400" />
                    <div>
                      <h3 className="text-xl font-bold text-white">Deal History</h3>
                      <p className="text-slate-400">Review your past pitches</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Pitches:</span>
                      <span className="text-white font-semibold">{playerStats.totalDeals}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Success Rate:</span>
                      <span className="text-green-400 font-semibold">{successRate}%</span>
                    </div>
                  </div>

                  <Button 
                    onClick={onViewHistory}
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                    disabled={gameHistory.length === 0}
                  >
                    View History
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-600 hover:border-purple-400 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Users className="w-8 h-8 text-purple-400" />
                    <div>
                      <h3 className="text-xl font-bold text-white">Meet the Sharks</h3>
                      <p className="text-slate-400">Learn about the investors</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Total Sharks:</span>
                      <span className="text-white font-semibold">5</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Industries:</span>
                      <span className="text-purple-400 font-semibold">8+</span>
                    </div>
                  </div>

                  <Button 
                    onClick={onViewSharks}
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    View Sharks
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Player Stats Sidebar */}
          <div className="space-y-6">
            {/* Player Level */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Your Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">{scoreInfo.icon}</div>
                  <Badge className={`${scoreInfo.color} text-white text-lg px-4 py-2`}>
                    {scoreInfo.level}
                  </Badge>
                  <div className="mt-3">
                    <div className="text-3xl font-bold text-white">
                      {playerStats.entrepreneurScore}
                    </div>
                    <div className="text-slate-400 text-sm">Entrepreneur Score</div>
                  </div>
                </div>

                {/* Progress to next level */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Next Level:</span>
                    <span className="text-white">
                      {playerStats.entrepreneurScore >= 500 ? 'Max Level!' : 
                       playerStats.entrepreneurScore >= 300 ? 'Shark (500)' :
                       playerStats.entrepreneurScore >= 200 ? 'Mogul (300)' :
                       playerStats.entrepreneurScore >= 150 ? 'Executive (200)' :
                       'Entrepreneur (150)'}
                    </span>
                  </div>
                  {playerStats.entrepreneurScore < 500 && (
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(100, ((playerStats.entrepreneurScore % 100) / 100) * 100)}%` 
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-slate-800/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-white">
                      ${(playerStats.totalMoneyRaised / 1000).toFixed(0)}K
                    </div>
                    <div className="text-xs text-slate-400">Total Raised</div>
                  </div>

                  <div className="text-center">
                    <Target className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-white">
                      {Math.round(playerStats.averageEquity)}%
                    </div>
                    <div className="text-xs text-slate-400">Avg Equity</div>
                  </div>

                  <div className="text-center">
                    <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-white">
                      {successRate}%
                    </div>
                    <div className="text-xs text-slate-400">Success Rate</div>
                  </div>

                  <div className="text-center">
                    <Award className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-white">
                      {playerStats.successfulDeals}
                    </div>
                    <div className="text-xs text-slate-400">Deals Closed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-400/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  💡 Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span className="text-slate-300">
                      Research shark preferences before pitching
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span className="text-slate-300">
                      Reasonable valuations get better offers
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span className="text-slate-300">
                      Strong revenue attracts more sharks
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span className="text-slate-300">
                      Counter-offers can be risky but rewarding
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-400">
          <p className="text-sm">
            🦈 Ready to swim with the sharks? Your entrepreneurial journey awaits!
          </p>
        </div>
      </div>
    </div>
  );
}
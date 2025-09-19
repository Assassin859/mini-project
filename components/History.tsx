"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Deal } from '@/types/game';
import { SHARKS } from '@/lib/sharks';
import { format } from 'date-fns';
import { ArrowLeft, DollarSign, Target, TrendingUp, Calendar, Building, CheckCircle, XCircle } from 'lucide-react';

interface HistoryProps {
  gameHistory: Deal[];
  onBack: () => void;
}

export default function History({ gameHistory, onBack }: HistoryProps) {
  const sortedHistory = [...gameHistory].sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  const successfulDeals = gameHistory.filter(deal => deal.accepted);
  const totalRaised = successfulDeals.reduce((sum, deal) => sum + deal.finalTerms.amount, 0);
  const averageEquity = successfulDeals.length > 0 
    ? successfulDeals.reduce((sum, deal) => sum + deal.finalTerms.equity, 0) / successfulDeals.length 
    : 0;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'tech': 'bg-blue-600',
      'food': 'bg-orange-600', 
      'retail': 'bg-purple-600',
      'manufacturing': 'bg-gray-600',
      'health': 'bg-green-600',
      'education': 'bg-indigo-600',
      'entertainment': 'bg-pink-600',
      'services': 'bg-teal-600'
    };
    return colors[category] || 'bg-slate-600';
  };

  if (gameHistory.length === 0) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <Card className="max-w-2xl w-full bg-slate-800/50 border-slate-600">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📈</div>
            <h2 className="text-2xl font-bold text-white mb-4">No Deal History Yet</h2>
            <p className="text-slate-300 mb-6">
              Start pitching to build your deal history! Every pitch is a learning experience.
            </p>
            <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Deal History</h1>
            <p className="text-slate-300">
              Track your entrepreneurial journey and learn from every pitch
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={onBack}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-4 text-center">
              <Building className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{gameHistory.length}</p>
              <p className="text-slate-300 text-sm">Total Pitches</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{successfulDeals.length}</p>
              <p className="text-slate-300 text-sm">Successful Deals</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                ${totalRaised.toLocaleString()}
              </p>
              <p className="text-slate-300 text-sm">Total Raised</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {Math.round(averageEquity)}%
              </p>
              <p className="text-slate-300 text-sm">Avg. Equity Given</p>
            </CardContent>
          </Card>
        </div>

        {/* Deal History */}
        <div className="space-y-4">
          {sortedHistory.map((deal, index) => {
            const shark = SHARKS.find(s => s.id === deal.finalOffer.sharkId);
            
            return (
              <Card 
                key={deal.id}
                className={`transition-all duration-200 hover:scale-[1.02] ${
                  deal.accepted 
                    ? 'bg-green-600/10 border-green-400/50 hover:border-green-400' 
                    : 'bg-red-600/10 border-red-400/50 hover:border-red-400'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left Side - Business Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2">
                          {deal.accepted ? (
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-400" />
                          )}
                          <h3 className="text-xl font-bold text-white">
                            {deal.pitch.businessName}
                          </h3>
                        </div>
                        
                        <Badge className={`${getCategoryColor(deal.pitch.category)} text-white`}>
                          {deal.pitch.category.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>

                      <p className="text-slate-300 text-sm mb-3 line-clamp-2">
                        {deal.pitch.description}
                      </p>

                      <div className="flex items-center text-slate-400 text-sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        {format(new Date(deal.completedAt), 'MMM d, yyyy')}
                      </div>
                    </div>

                    {/* Middle - Deal Terms */}
                    <div className="flex-shrink-0">
                      <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-2 text-center lg:text-right">
                        <div>
                          <p className="text-slate-400 text-xs">Asked For</p>
                          <p className="text-white font-semibold">
                            ${deal.pitch.fundingRequest.toLocaleString()} / {deal.pitch.equityOffered}%
                          </p>
                        </div>
                        {deal.accepted && (
                          <div>
                            <p className="text-slate-400 text-xs">Final Terms</p>
                            <p className="text-green-400 font-semibold">
                              ${deal.finalTerms.amount.toLocaleString()} / {deal.finalTerms.equity}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Side - Shark Info */}
                    {deal.accepted && shark && (
                      <div className="flex-shrink-0 text-center lg:text-left">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl">{shark.avatar}</span>
                          <div>
                            <p className="text-white font-semibold">{shark.name}</p>
                            <p className="text-slate-400 text-xs">Partner</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Section - Additional Info */}
                  {(deal.playerCounterOffer || deal.finalOffer.conditions) && (
                    <div className="mt-4 pt-4 border-t border-slate-600">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {deal.playerCounterOffer && (
                          <div className="bg-blue-600/20 p-3 rounded">
                            <p className="text-blue-300 font-semibold mb-1">Negotiation</p>
                            <p className="text-slate-300">
                              You countered with ${deal.playerCounterOffer.amount.toLocaleString()} for {deal.playerCounterOffer.equity}%
                            </p>
                          </div>
                        )}
                        
                        {deal.finalOffer.conditions && (
                          <div className="bg-yellow-600/20 p-3 rounded">
                            <p className="text-yellow-300 font-semibold mb-1">Conditions</p>
                            <p className="text-slate-300">{deal.finalOffer.conditions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Valuation Comparison */}
                  <div className="mt-3 flex justify-between items-center text-xs text-slate-400">
                    <span>
                      Your Valuation: ${((deal.pitch.fundingRequest / deal.pitch.equityOffered) * 100).toLocaleString()}
                    </span>
                    {deal.accepted && (
                      <span>
                        Final Valuation: ${deal.finalTerms.valuation.toLocaleString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Performance Insights */}
        {gameHistory.length >= 3 && (
          <Card className="mt-8 bg-slate-800/30 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-300 mb-2">Success Rate by Category:</p>
                  {Object.entries(
                    gameHistory.reduce((acc, deal) => {
                      const category = deal.pitch.category;
                      if (!acc[category]) acc[category] = { total: 0, successful: 0 };
                      acc[category].total++;
                      if (deal.accepted) acc[category].successful++;
                      return acc;
                    }, {} as Record<string, { total: number; successful: number }>)
                  ).map(([category, stats]) => (
                    <div key={category} className="flex justify-between">
                      <span className="text-slate-400">{category}:</span>
                      <span className="text-white">
                        {Math.round((stats.successful / stats.total) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
                
                <div>
                  <p className="text-slate-300 mb-2">Top Performing Sharks:</p>
                  {Object.entries(
                    successfulDeals.reduce((acc, deal) => {
                      const sharkName = SHARKS.find(s => s.id === deal.finalOffer.sharkId)?.name || 'Unknown';
                      acc[sharkName] = (acc[sharkName] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  )
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([sharkName, count]) => (
                    <div key={sharkName} className="flex justify-between">
                      <span className="text-slate-400">{sharkName}:</span>
                      <span className="text-white">{count} deals</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
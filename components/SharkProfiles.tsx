"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SHARKS } from '@/lib/sharks';
import { ArrowLeft, DollarSign, Target, TrendingUp, Star, Award } from 'lucide-react';

interface SharkProfilesProps {
  onBack: () => void;
}

export default function SharkProfiles({ onBack }: SharkProfilesProps) {
  const formatNetWorth = (netWorth: number) => {
    if (netWorth >= 1000000000) {
      return `$${(netWorth / 1000000000).toFixed(1)}B`;
    }
    return `$${(netWorth / 1000000).toFixed(0)}M`;
  };

  const getRiskLevel = (tolerance: number) => {
    if (tolerance >= 0.7) return { label: 'High', color: 'bg-red-600' };
    if (tolerance >= 0.5) return { label: 'Medium', color: 'bg-yellow-600' };
    return { label: 'Low', color: 'bg-green-600' };
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Meet the Sharks</h1>
            <p className="text-slate-300">
              Get to know the investors and their preferences before you pitch
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

        {/* Sharks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {SHARKS.map((shark) => {
            const riskLevel = getRiskLevel(shark.riskTolerance);
            
            return (
              <Card 
                key={shark.id} 
                className="bg-slate-800/50 border-slate-600 hover:border-blue-400 transition-all duration-300 hover:scale-[1.02]"
              >
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <span className="text-6xl">{shark.avatar}</span>
                    <div className="flex-1">
                      <CardTitle className="text-2xl text-white">{shark.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-bold">
                          {formatNetWorth(shark.netWorth)}
                        </span>
                        <span className="text-slate-400 text-sm">Net Worth</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Background */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                      <Award className="w-5 h-5 mr-2 text-yellow-400" />
                      Background
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {shark.background}
                    </p>
                  </div>

                  {/* Investment Profile */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <h4 className="text-white font-semibold mb-2 flex items-center">
                        <Target className="w-4 h-4 mr-1 text-blue-400" />
                        Equity Preference
                      </h4>
                      <p className="text-2xl font-bold text-blue-400">
                        {Math.round(shark.equityPreference * 100)}%
                      </p>
                      <p className="text-slate-400 text-xs mt-1">Typical ask</p>
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <h4 className="text-white font-semibold mb-2 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1 text-purple-400" />
                        Risk Tolerance
                      </h4>
                      <Badge className={`${riskLevel.color} text-white`}>
                        {riskLevel.label}
                      </Badge>
                      <p className="text-slate-400 text-xs mt-1">
                        {Math.round(shark.riskTolerance * 100)}% tolerance
                      </p>
                    </div>
                  </div>

                  {/* Revenue Requirement */}
                  <div className="bg-green-600/20 p-4 rounded-lg">
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <DollarSign className="w-4 h-4 mr-1 text-green-400" />
                      Minimum Revenue Requirement
                    </h4>
                    <p className="text-2xl font-bold text-green-400">
                      ${shark.revenueRequirement.toLocaleString()}
                    </p>
                    <p className="text-green-300 text-xs mt-1">Annual revenue expected</p>
                  </div>

                  {/* Preferred Categories */}
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-400" />
                      Preferred Industries
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {shark.preferredCategories.map((category) => (
                        <Badge 
                          key={category}
                          variant="secondary"
                          className="bg-blue-600/20 text-blue-300 border-blue-600/50"
                        >
                          {category.replace('_', ' ').toLowerCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Personality Traits */}
                  <div>
                    <h4 className="text-white font-semibold mb-3">Personality Traits</h4>
                    <div className="flex flex-wrap gap-2">
                      {shark.personalityTraits.map((trait, index) => (
                        <Badge 
                          key={index}
                          variant="outline"
                          className="border-slate-600 text-slate-300"
                        >
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Catchphrase */}
                  <div className="bg-slate-700/30 p-4 rounded-lg border-l-4 border-blue-400">
                    <h4 className="text-white font-semibold mb-2">Signature Quote</h4>
                    <p className="text-blue-300 italic">"{shark.catchphrase}"</p>
                  </div>

                  {/* Strategy Tips */}
                  <div className="bg-yellow-600/10 p-4 rounded-lg border border-yellow-600/30">
                    <h4 className="text-yellow-300 font-semibold mb-2">💡 Pitching Tips</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      {shark.preferredCategories.length < 3 ? (
                        <li>• Focus on businesses in their preferred industries</li>
                      ) : (
                        <li>• Open to various business types - focus on strong fundamentals</li>
                      )}
                      {shark.revenueRequirement > 100000 ? (
                        <li>• Ensure you have substantial revenue to meet their requirements</li>
                      ) : (
                        <li>• Great for early-stage businesses with growth potential</li>
                      )}
                      {shark.riskTolerance > 0.6 ? (
                        <li>• Willing to take risks on innovative or disruptive concepts</li>
                      ) : (
                        <li>• Prefers proven business models with predictable returns</li>
                      )}
                      {shark.equityPreference > 0.3 ? (
                        <li>• Expects significant equity stake - be prepared to give up more control</li>
                      ) : (
                        <li>• More flexible on equity - focuses on reasonable valuations</li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Comparison Chart */}
        <Card className="mt-8 bg-slate-800/30 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white">Shark Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left text-slate-300 py-3">Shark</th>
                    <th className="text-center text-slate-300 py-3">Net Worth</th>
                    <th className="text-center text-slate-300 py-3">Risk Level</th>
                    <th className="text-center text-slate-300 py-3">Equity Pref.</th>
                    <th className="text-center text-slate-300 py-3">Min Revenue</th>
                    <th className="text-center text-slate-300 py-3">Specialties</th>
                  </tr>
                </thead>
                <tbody>
                  {SHARKS.map((shark) => (
                    <tr key={shark.id} className="border-b border-slate-700/50">
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{shark.avatar}</span>
                          <span className="text-white font-semibold">{shark.name}</span>
                        </div>
                      </td>
                      <td className="text-center text-green-400 font-semibold">
                        {formatNetWorth(shark.netWorth)}
                      </td>
                      <td className="text-center">
                        <Badge className={`${getRiskLevel(shark.riskTolerance).color} text-white text-xs`}>
                          {getRiskLevel(shark.riskTolerance).label}
                        </Badge>
                      </td>
                      <td className="text-center text-white">
                        {Math.round(shark.equityPreference * 100)}%
                      </td>
                      <td className="text-center text-white">
                        ${shark.revenueRequirement.toLocaleString()}
                      </td>
                      <td className="text-center text-slate-300">
                        {shark.preferredCategories.slice(0, 2).join(', ')}
                        {shark.preferredCategories.length > 2 && '...'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
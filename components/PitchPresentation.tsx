"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BusinessPitch } from '@/types/game';
import { DollarSign, Target, Users, TrendingUp, Building, Award } from 'lucide-react';

interface PitchPresentationProps {
  pitch: BusinessPitch;
  onComplete: () => void;
}

export default function PitchPresentation({ pitch, onComplete }: PitchPresentationProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);

  const slides = [
    {
      title: "Business Overview",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">{pitch.businessName}</h2>
            <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
              {pitch.description}
            </p>
          </div>
          <div className="flex justify-center">
            <div className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold">
              {pitch.category.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "The Ask",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <Card className="bg-green-600 border-green-400 p-8 text-center">
            <DollarSign className="w-16 h-16 text-white mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-white mb-2">
              ${pitch.fundingRequest.toLocaleString()}
            </h3>
            <p className="text-green-100 text-lg">Investment Requested</p>
          </Card>
          
          <Card className="bg-orange-600 border-orange-400 p-8 text-center">
            <Target className="w-16 h-16 text-white mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-white mb-2">
              {pitch.equityOffered}%
            </h3>
            <p className="text-orange-100 text-lg">Equity Offered</p>
          </Card>

          <div className="md:col-span-2 text-center">
            <div className="bg-slate-800/50 p-6 rounded-lg">
              <h4 className="text-xl font-semibold text-white mb-2">Company Valuation</h4>
              <p className="text-2xl font-bold text-blue-400">
                ${((pitch.fundingRequest / pitch.equityOffered) * 100).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Financial Performance",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-slate-600 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">Current Revenue</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              ${pitch.currentRevenue.toLocaleString()}
            </p>
            <p className="text-slate-400 mt-2">Annual Revenue</p>
          </Card>

          <Card className="bg-slate-800/50 border-slate-600 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Award className="w-8 h-8 text-green-400" />
              <h3 className="text-xl font-semibold text-white">Projected Revenue</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              ${pitch.projectedRevenue.toLocaleString()}
            </p>
            <p className="text-slate-400 mt-2">Next Year Target</p>
          </Card>

          {pitch.currentRevenue > 0 && (
            <div className="md:col-span-2 text-center">
              <Card className="bg-purple-600 border-purple-400 p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Projected Growth</h3>
                <p className="text-3xl font-bold text-white">
                  {Math.round((pitch.projectedRevenue / pitch.currentRevenue - 1) * 100)}%
                </p>
              </Card>
            </div>
          )}
        </div>
      )
    },
    {
      title: "Market & Competition",
      content: (
        <div className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-600 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Building className="w-8 h-8 text-yellow-400" />
              <h3 className="text-xl font-semibold text-white">Market Size</h3>
            </div>
            <p className="text-3xl font-bold text-white mb-2">
              ${pitch.marketSize.toLocaleString()}
            </p>
            <p className="text-slate-400">Total Addressable Market</p>
          </Card>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Competition Analysis
            </h3>
            <div className="bg-slate-800/50 p-6 rounded-lg">
              <p className="text-slate-300 leading-relaxed">{pitch.competition}</p>
            </div>
          </div>

          <Card className="bg-slate-800/50 border-slate-600 p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Team Experience Level</h3>
            <div className="flex justify-center">
              <div className="w-full max-w-md bg-slate-700 rounded-full h-4 mb-2">
                <div 
                  className="bg-blue-500 h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${(pitch.teamExperience / 10) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-white font-bold">{pitch.teamExperience}/10</p>
          </Card>
        </div>
      )
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
            return 15;
          } else {
            // Use setTimeout to avoid setState during render
            setTimeout(() => onComplete(), 0);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentSlide, onComplete, slides.length]);

  return (
    <div className="min-h-screen p-4 flex items-center">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🦈 Presenting to the Sharks</h1>
          <div className="flex justify-center items-center space-x-4">
            <div className="bg-slate-800 px-4 py-2 rounded-lg">
              <span className="text-slate-300">Slide {currentSlide + 1} of {slides.length}</span>
            </div>
            <div className="bg-red-600 px-4 py-2 rounded-lg">
              <span className="text-white font-bold">{timeLeft}s</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-700 rounded-full h-3 mb-8">
          <div 
            className="bg-blue-500 h-3 rounded-full transition-all duration-1000"
            style={{ width: `${((currentSlide + (15 - timeLeft) / 15) / slides.length) * 100}%` }}
          />
        </div>

        {/* Current Slide */}
        <Card className="bg-slate-800/30 border-slate-600 min-h-[500px]">
          <CardContent className="p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                {slides[currentSlide].title}
              </h2>
            </div>
            
            <div className="flex items-center justify-center min-h-[300px]">
              {slides[currentSlide].content}
            </div>
          </CardContent>
        </Card>

        {/* Slide Indicators */}
        <div className="flex justify-center mt-6 space-x-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-blue-500' : 
                index < currentSlide ? 'bg-green-500' : 'bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BusinessPitch, BusinessCategory } from '@/types/game';
import { ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';

interface PitchBuilderProps {
  onComplete: (pitch: BusinessPitch) => void;
  onBack: () => void;
}

const BUSINESS_CATEGORIES = [
  { value: BusinessCategory.TECH, label: 'Technology & Software' },
  { value: BusinessCategory.FOOD, label: 'Food & Beverage' },
  { value: BusinessCategory.RETAIL, label: 'Retail & Consumer Goods' },
  { value: BusinessCategory.MANUFACTURING, label: 'Manufacturing & Industrial' },
  { value: BusinessCategory.HEALTH, label: 'Health & Wellness' },
  { value: BusinessCategory.EDUCATION, label: 'Education & Training' },
  { value: BusinessCategory.ENTERTAINMENT, label: 'Entertainment & Media' },
  { value: BusinessCategory.SERVICES, label: 'Professional Services' }
];

const BUSINESS_IDEAS = [
  { name: "EcoWrap", category: BusinessCategory.RETAIL, description: "Sustainable food packaging made from seaweed" },
  { name: "PetHealth Pro", category: BusinessCategory.TECH, description: "AI-powered pet health monitoring wearable" },
  { name: "FlavorFusion", category: BusinessCategory.FOOD, description: "Gourmet spice blends with exotic international flavors" },
  { name: "SkillBridge", category: BusinessCategory.EDUCATION, description: "VR-based professional skills training platform" },
  { name: "GreenStream", category: BusinessCategory.MANUFACTURING, description: "Solar-powered water purification systems" }
];

export default function PitchBuilder({ onComplete, onBack }: PitchBuilderProps) {
  const [step, setStep] = useState(1);
  const [pitch, setPitch] = useState<Partial<BusinessPitch>>({
    businessName: '',
    description: '',
    category: undefined,
    fundingRequest: 100000,
    equityOffered: 10,
    currentRevenue: 0,
    projectedRevenue: 0,
    marketSize: 1000000,
    competition: '',
    teamExperience: 5
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (stepNumber) {
      case 1:
        if (!pitch.businessName?.trim()) newErrors.businessName = 'Business name is required';
        if (!pitch.description?.trim()) newErrors.description = 'Business description is required';
        if (!pitch.category) newErrors.category = 'Business category is required';
        break;
      case 2:
        if (!pitch.fundingRequest || pitch.fundingRequest < 10000) {
          newErrors.fundingRequest = 'Funding request must be at least $10,000';
        }
        if (!pitch.equityOffered || pitch.equityOffered < 5 || pitch.equityOffered > 50) {
          newErrors.equityOffered = 'Equity must be between 5% and 50%';
        }
        break;
      case 3:
        if (pitch.currentRevenue === undefined || pitch.currentRevenue < 0) {
          newErrors.currentRevenue = 'Current revenue cannot be negative';
        }
        if (!pitch.projectedRevenue || pitch.projectedRevenue <= pitch.currentRevenue!) {
          newErrors.projectedRevenue = 'Projected revenue must be higher than current revenue';
        }
        break;
      case 4:
        if (!pitch.marketSize || pitch.marketSize < 100000) {
          newErrors.marketSize = 'Market size must be at least $100,000';
        }
        if (!pitch.competition?.trim()) {
          newErrors.competition = 'Competition analysis is required';
        }
        if (!pitch.teamExperience || pitch.teamExperience < 1 || pitch.teamExperience > 10) {
          newErrors.teamExperience = 'Team experience must be between 1 and 10';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 4) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = () => {
    const completePitch: BusinessPitch = {
      id: Date.now().toString(),
      businessName: pitch.businessName!,
      description: pitch.description!,
      category: pitch.category!,
      fundingRequest: pitch.fundingRequest!,
      equityOffered: pitch.equityOffered!,
      currentRevenue: pitch.currentRevenue!,
      projectedRevenue: pitch.projectedRevenue!,
      marketSize: pitch.marketSize!,
      competition: pitch.competition!,
      teamExperience: pitch.teamExperience!,
      createdAt: new Date()
    };

    onComplete(completePitch);
  };

  const generateRandomIdea = () => {
    const randomIdea = BUSINESS_IDEAS[Math.floor(Math.random() * BUSINESS_IDEAS.length)];
    setPitch(prev => ({
      ...prev,
      businessName: randomIdea.name,
      description: randomIdea.description,
      category: randomIdea.category
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Business Overview</h2>
              <Button 
                variant="outline" 
                onClick={generateRandomIdea}
                className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Random Idea
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName" className="text-slate-300">Business Name *</Label>
                <Input
                  id="businessName"
                  value={pitch.businessName || ''}
                  onChange={(e) => setPitch(prev => ({ ...prev, businessName: e.target.value }))}
                  placeholder="Enter your business name"
                  className="bg-slate-800 border-slate-600 text-white"
                />
                {errors.businessName && <p className="text-red-400 text-sm mt-1">{errors.businessName}</p>}
              </div>

              <div>
                <Label htmlFor="description" className="text-slate-300">Business Description *</Label>
                <Textarea
                  id="description"
                  value={pitch.description || ''}
                  onChange={(e) => setPitch(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what your business does, the problem it solves, and your unique value proposition"
                  rows={4}
                  className="bg-slate-800 border-slate-600 text-white"
                />
                {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <Label className="text-slate-300">Business Category *</Label>
                <Select value={pitch.category} onValueChange={(value: BusinessCategory) => setPitch(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Funding Request</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="fundingRequest" className="text-slate-300">Amount Requested ($) *</Label>
                <Input
                  id="fundingRequest"
                  type="number"
                  value={pitch.fundingRequest || ''}
                  onChange={(e) => setPitch(prev => ({ ...prev, fundingRequest: parseInt(e.target.value) }))}
                  placeholder="100000"
                  min="10000"
                  max="1000000"
                  className="bg-slate-800 border-slate-600 text-white"
                />
                {errors.fundingRequest && <p className="text-red-400 text-sm mt-1">{errors.fundingRequest}</p>}
                <p className="text-slate-400 text-sm mt-1">Range: $10,000 - $1,000,000</p>
              </div>

              <div>
                <Label htmlFor="equityOffered" className="text-slate-300">Equity Offered (%) *</Label>
                <Input
                  id="equityOffered"
                  type="number"
                  value={pitch.equityOffered || ''}
                  onChange={(e) => setPitch(prev => ({ ...prev, equityOffered: parseInt(e.target.value) }))}
                  placeholder="10"
                  min="5"
                  max="50"
                  className="bg-slate-800 border-slate-600 text-white"
                />
                {errors.equityOffered && <p className="text-red-400 text-sm mt-1">{errors.equityOffered}</p>}
                <p className="text-slate-400 text-sm mt-1">Range: 5% - 50%</p>
              </div>
            </div>

            {pitch.fundingRequest && pitch.equityOffered && (
              <Card className="bg-slate-800/50 border-slate-600">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Valuation Analysis</h3>
                  <div className="text-slate-300">
                    <p>Implied Valuation: <span className="text-white font-bold">
                      ${((pitch.fundingRequest / pitch.equityOffered) * 100).toLocaleString()}
                    </span></p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Financial Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="currentRevenue" className="text-slate-300">Current Annual Revenue ($)</Label>
                <Input
                  id="currentRevenue"
                  type="number"
                  value={pitch.currentRevenue || ''}
                  onChange={(e) => setPitch(prev => ({ ...prev, currentRevenue: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  min="0"
                  className="bg-slate-800 border-slate-600 text-white"
                />
                {errors.currentRevenue && <p className="text-red-400 text-sm mt-1">{errors.currentRevenue}</p>}
              </div>

              <div>
                <Label htmlFor="projectedRevenue" className="text-slate-300">Projected Revenue (Next Year) ($) *</Label>
                <Input
                  id="projectedRevenue"
                  type="number"
                  value={pitch.projectedRevenue || ''}
                  onChange={(e) => setPitch(prev => ({ ...prev, projectedRevenue: parseInt(e.target.value) }))}
                  placeholder="500000"
                  min="1"
                  className="bg-slate-800 border-slate-600 text-white"
                />
                {errors.projectedRevenue && <p className="text-red-400 text-sm mt-1">{errors.projectedRevenue}</p>}
              </div>
            </div>

            {pitch.currentRevenue !== undefined && pitch.projectedRevenue && (
              <Card className="bg-slate-800/50 border-slate-600">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Growth Analysis</h3>
                  <div className="text-slate-300">
                    <p>Projected Growth: <span className="text-green-400 font-bold">
                      {pitch.currentRevenue > 0 
                        ? `${Math.round((pitch.projectedRevenue / pitch.currentRevenue - 1) * 100)}%`
                        : 'First year revenue'
                      }
                    </span></p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Market & Team</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="marketSize" className="text-slate-300">Total Market Size ($) *</Label>
                <Input
                  id="marketSize"
                  type="number"
                  value={pitch.marketSize || ''}
                  onChange={(e) => setPitch(prev => ({ ...prev, marketSize: parseInt(e.target.value) }))}
                  placeholder="10000000"
                  min="100000"
                  className="bg-slate-800 border-slate-600 text-white"
                />
                {errors.marketSize && <p className="text-red-400 text-sm mt-1">{errors.marketSize}</p>}
              </div>

              <div>
                <Label htmlFor="competition" className="text-slate-300">Competition Analysis *</Label>
                <Textarea
                  id="competition"
                  value={pitch.competition || ''}
                  onChange={(e) => setPitch(prev => ({ ...prev, competition: e.target.value }))}
                  placeholder="Describe your main competitors and how you differentiate from them"
                  rows={3}
                  className="bg-slate-800 border-slate-600 text-white"
                />
                {errors.competition && <p className="text-red-400 text-sm mt-1">{errors.competition}</p>}
              </div>

              <div>
                <Label htmlFor="teamExperience" className="text-slate-300">Team Experience (1-10) *</Label>
                <Input
                  id="teamExperience"
                  type="number"
                  value={pitch.teamExperience || ''}
                  onChange={(e) => setPitch(prev => ({ ...prev, teamExperience: parseInt(e.target.value) }))}
                  placeholder="5"
                  min="1"
                  max="10"
                  className="bg-slate-800 border-slate-600 text-white"
                />
                {errors.teamExperience && <p className="text-red-400 text-sm mt-1">{errors.teamExperience}</p>}
                <p className="text-slate-400 text-sm mt-1">1 = Beginner, 10 = Expert</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-white">Create Your Pitch</h1>
            <span className="text-slate-300">Step {step} of 4</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <Card className="bg-slate-800/50 border-slate-600">
          <CardContent className="p-8">
            {renderStep()}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-600">
              <Button
                variant="outline"
                onClick={step === 1 ? onBack : () => setStep(step - 1)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                {step === 1 ? 'Back to Menu' : 'Previous'}
              </Button>

              <Button 
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {step === 4 ? 'Complete Pitch' : 'Next'}
                {step < 4 && <ChevronRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
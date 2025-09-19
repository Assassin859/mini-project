import { BusinessPitch, Shark, SharkDecision, BusinessCategory } from '@/types/game';

export function calculateSharkDecision(shark: Shark, pitch: BusinessPitch): SharkDecision {
  let score = 0;
  let reasoning = "";

  // Category preference (30% weight)
  const categoryBonus = shark.preferredCategories.includes(pitch.category) ? 30 : -10;
  score += categoryBonus;
  
  if (categoryBonus > 0) {
    reasoning += `${shark.name} loves the ${pitch.category} space. `;
  } else {
    reasoning += `${shark.name} is less familiar with ${pitch.category}. `;
  }

  // Revenue requirement (25% weight)
  const revenueScore = pitch.currentRevenue >= shark.revenueRequirement ? 25 : 
    (pitch.currentRevenue / shark.revenueRequirement) * 25 - 15;
  score += revenueScore;
  
  if (revenueScore > 15) {
    reasoning += "Strong revenue traction is impressive. ";
  } else {
    reasoning += "Revenue numbers are concerning. ";
  }

  // Valuation reasonableness (20% weight)
  const impliedValuation = pitch.fundingRequest / (pitch.equityOffered / 100);
  const revenueMultiple = impliedValuation / Math.max(pitch.currentRevenue, 1);
  const valuationScore = revenueMultiple <= 10 ? 20 : revenueMultiple <= 20 ? 10 : -10;
  score += valuationScore;

  if (valuationScore > 10) {
    reasoning += "Valuation seems reasonable. ";
  } else {
    reasoning += "Valuation appears too high. ";
  }

  // Market size (15% weight)
  const marketScore = pitch.marketSize >= 100000000 ? 15 : 
    pitch.marketSize >= 10000000 ? 10 : 5;
  score += marketScore;

  // Team experience (10% weight)
  const teamScore = (pitch.teamExperience / 10) * 10;
  score += teamScore;

  // Add shark personality randomness
  const randomFactor = (Math.random() - 0.5) * 20 * shark.riskTolerance;
  score += randomFactor;

  const isOut = score < 50;

  if (isOut) {
    return {
      sharkId: shark.id,
      isOut: true,
      reasoning: reasoning + "Unfortunately, I'm out."
    };
  }

  // Calculate offer
  const offerAmount = pitch.fundingRequest;
  let equityAsked = Math.max(
    pitch.equityOffered * 1.2, // Ask for 20% more than offered
    shark.equityPreference * 100
  );

  // Cap equity at 50%
  equityAsked = Math.min(equityAsked, 50);

  return {
    sharkId: shark.id,
    isOut: false,
    offer: {
      amount: offerAmount,
      equity: Math.round(equityAsked),
      conditions: getRandomCondition(shark)
    },
    reasoning: reasoning + `I'll offer $${offerAmount.toLocaleString()} for ${Math.round(equityAsked)}% equity.`
  };
}

function getRandomCondition(shark: Shark): string | undefined {
  const conditions = [
    "I want to be involved in key strategic decisions",
    "Monthly board meetings are required",
    "I need right of first refusal on future funding rounds",
    "Let's include a performance milestone",
    undefined // No conditions sometimes
  ];
  
  return Math.random() < 0.7 ? conditions[Math.floor(Math.random() * conditions.length)] : undefined;
}

export function calculateBusinessScore(pitch: BusinessPitch): number {
  let score = 50; // Base score

  // Revenue strength
  if (pitch.currentRevenue > 500000) score += 20;
  else if (pitch.currentRevenue > 100000) score += 10;
  else if (pitch.currentRevenue > 10000) score += 5;

  // Growth potential
  const growthRatio = pitch.projectedRevenue / Math.max(pitch.currentRevenue, 1);
  if (growthRatio > 3) score += 15;
  else if (growthRatio > 2) score += 10;
  else if (growthRatio > 1.5) score += 5;

  // Market size
  if (pitch.marketSize > 1000000000) score += 15;
  else if (pitch.marketSize > 100000000) score += 10;
  else if (pitch.marketSize > 10000000) score += 5;

  // Team experience
  score += (pitch.teamExperience / 10) * 10;

  // Valuation reasonableness
  const valuation = pitch.fundingRequest / (pitch.equityOffered / 100);
  const multiple = valuation / Math.max(pitch.currentRevenue, 1);
  if (multiple <= 5) score += 10;
  else if (multiple > 20) score -= 10;

  return Math.max(0, Math.min(100, score));
}
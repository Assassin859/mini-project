export enum GamePhase {
  MENU = 'menu',
  PITCH_BUILDER = 'pitch_builder',
  PRESENTATION = 'presentation',
  SHARK_DECISIONS = 'shark_decisions',
  NEGOTIATION = 'negotiation',
  RESULTS = 'results',
  HISTORY = 'history',
  SHARK_PROFILES = 'shark_profiles'
}

export enum BusinessCategory {
  TECH = 'tech',
  FOOD = 'food',
  RETAIL = 'retail',
  MANUFACTURING = 'manufacturing',
  HEALTH = 'health',
  EDUCATION = 'education',
  ENTERTAINMENT = 'entertainment',
  SERVICES = 'services'
}

export enum SharkPersonality {
  TECH_MOGUL = 'tech_mogul',
  RETAIL_QUEEN = 'retail_queen',
  FOOD_EXPERT = 'food_expert',
  MANUFACTURING_KING = 'manufacturing_king',
  GENERALIST = 'generalist'
}

export interface BusinessPitch {
  id: string;
  businessName: string;
  description: string;
  category: BusinessCategory;
  fundingRequest: number;
  equityOffered: number;
  currentRevenue: number;
  projectedRevenue: number;
  marketSize: number;
  competition: string;
  teamExperience: number;
  createdAt: Date;
}

export interface Shark {
  id: SharkPersonality;
  name: string;
  avatar: string;
  background: string;
  netWorth: number;
  preferredCategories: BusinessCategory[];
  riskTolerance: number; // 0-1
  equityPreference: number; // 0-1
  revenueRequirement: number;
  personalityTraits: string[];
  catchphrase: string;
}

export interface SharkDecision {
  sharkId: SharkPersonality;
  isOut: boolean;
  offer?: {
    amount: number;
    equity: number;
    conditions?: string;
  };
  reasoning: string;
}

export interface Deal {
  id: string;
  pitch: BusinessPitch;
  finalOffer: {
    sharkId: SharkPersonality;
    amount: number;
    equity: number;
    conditions?: string;
  };
  accepted: boolean;
  playerCounterOffer?: {
    amount: number;
    equity: number;
  };
  finalTerms: {
    amount: number;
    equity: number;
    valuation: number;
  };
  completedAt: Date;
}

export interface PlayerStats {
  totalDeals: number;
  successfulDeals: number;
  totalMoneyRaised: number;
  averageEquity: number;
  entrepreneurScore: number;
}

export interface GameState {
  phase: GamePhase;
  currentPitch: BusinessPitch | null;
  sharks: Shark[];
  sharkDecisions: SharkDecision[] | null;
  gameHistory: Deal[];
  playerStats: PlayerStats;
}

export interface GameData {
  gameHistory: Deal[];
  playerStats: PlayerStats;
}
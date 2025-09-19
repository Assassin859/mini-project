import { Shark, SharkPersonality, BusinessCategory } from '@/types/game';

export const SHARKS: Shark[] = [
  {
    id: SharkPersonality.TECH_MOGUL,
    name: 'Alex Chen',
    avatar: '👨‍💻',
    background: 'Former Silicon Valley CEO turned investor with 15+ successful tech exits',
    netWorth: 2500000000,
    preferredCategories: [BusinessCategory.TECH, BusinessCategory.EDUCATION],
    riskTolerance: 0.8,
    equityPreference: 0.25,
    revenueRequirement: 50000,
    personalityTraits: ['Data-driven', 'Scalability-focused', 'Innovation-obsessed'],
    catchphrase: "Show me the metrics that matter!"
  },
  {
    id: SharkPersonality.RETAIL_QUEEN,
    name: 'Victoria Sterling',
    avatar: '👩‍💼',
    background: 'Built a retail empire from a single store, expert in consumer behavior',
    netWorth: 1800000000,
    preferredCategories: [BusinessCategory.RETAIL, BusinessCategory.ENTERTAINMENT],
    riskTolerance: 0.6,
    equityPreference: 0.3,
    revenueRequirement: 100000,
    personalityTraits: ['Brand-focused', 'Market-savvy', 'Customer-centric'],
    catchphrase: "Can you scale this to every mall in America?"
  },
  {
    id: SharkPersonality.FOOD_EXPERT,
    name: 'Marco Rodriguez',
    avatar: '👨‍🍳',
    background: 'Celebrity chef and restaurateur with a food empire spanning 30+ restaurants',
    netWorth: 800000000,
    preferredCategories: [BusinessCategory.FOOD, BusinessCategory.HEALTH],
    riskTolerance: 0.5,
    equityPreference: 0.35,
    revenueRequirement: 75000,
    personalityTraits: ['Quality-obsessed', 'Taste-focused', 'Tradition-respecting'],
    catchphrase: "The proof is in the pudding - literally!"
  },
  {
    id: SharkPersonality.MANUFACTURING_KING,
    name: "Robert 'Big Bob' Thompson",
    avatar: '👨‍🏭',
    background: 'Manufacturing dynasty heir with expertise in production and logistics',
    netWorth: 3200000000,
    preferredCategories: [BusinessCategory.MANUFACTURING, BusinessCategory.SERVICES],
    riskTolerance: 0.4,
    equityPreference: 0.4,
    revenueRequirement: 200000,
    personalityTraits: ['Efficiency-focused', 'Cost-conscious', 'Process-oriented'],
    catchphrase: "Can you make this at scale without breaking the bank?"
  },
  {
    id: SharkPersonality.GENERALIST,
    name: 'Sarah Williams',
    avatar: '👩‍⚖️',
    background: 'Diversified investor with portfolio spanning multiple industries',
    netWorth: 1500000000,
    preferredCategories: Object.values(BusinessCategory),
    riskTolerance: 0.7,
    equityPreference: 0.2,
    revenueRequirement: 25000,
    personalityTraits: ['Opportunity-focused', 'People-oriented', 'Growth-minded'],
    catchphrase: "I invest in people, not just products!"
  }
];

export function getSharkById(id: SharkPersonality): Shark | undefined {
  return SHARKS.find(shark => shark.id === id);
}

export function getRandomSharks(count: number = 5): Shark[] {
  const shuffled = [...SHARKS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, SHARKS.length));
}
import { GameData } from '@/types/game';

const STORAGE_KEY = 'shark-tank-game-data';

export function saveGameData(data: GameData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving game data:', error);
  }
}

export function loadGameData(): GameData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      // Convert date strings back to Date objects
      data.gameHistory = data.gameHistory.map((deal: any) => ({
        ...deal,
        pitch: {
          ...deal.pitch,
          createdAt: new Date(deal.pitch.createdAt)
        },
        completedAt: new Date(deal.completedAt)
      }));
      return data;
    }
  } catch (error) {
    console.error('Error loading game data:', error);
  }
  return null;
}

export function clearGameData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing game data:', error);
  }
}
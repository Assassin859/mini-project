import { BusinessPitch, Deal, GamePhase, PlayerStats, SharkDecision } from './game';

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  stats: PlayerStats;
}

export interface RoomState {
  id: string;
  name: string;
  hostId: string;
  maxPlayers: number;
  players: Player[];
  status: 'waiting' | 'in_progress' | 'completed';
  gamePhase: GamePhase;
  currentPlayerTurn?: string;
  currentPitch?: BusinessPitch;
  sharkDecisions?: SharkDecision[];
  deals: Deal[];
  roundNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface GameAction {
  type: 'SUBMIT_PITCH' | 'MAKE_DECISION' | 'NEGOTIATE' | 'READY_UP' | 'START_GAME' | 'NEXT_TURN';
  playerId: string;
  payload?: any;
}

export interface MultiplayerGameState {
  currentRoom: RoomState | null;
  currentPlayer: Player | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}
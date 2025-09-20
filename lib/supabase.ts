import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hgjcwjybhfhhlukglliq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnamN3anliaGZoaGx1a2dsbGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjg0NjUsImV4cCI6MjA3Mzk0NDQ2NX0.D5C8KUOsvbpChQmGHkKTFfi-LDBWgkWU2b1VhSB0fFs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Test the connection
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('rooms').select('count').limit(1);
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    console.log('Supabase connected successfully');
    return true;
  } catch (error) {
    console.error('Supabase connection failed:', error);
    return false;
  }
}
export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string;
          name: string;
          host_id: string;
          max_players: number;
          current_players: number;
          status: 'waiting' | 'in_progress' | 'completed';
          game_state: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          host_id: string;
          max_players?: number;
          current_players?: number;
          status?: 'waiting' | 'in_progress' | 'completed';
          game_state?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          host_id?: string;
          max_players?: number;
          current_players?: number;
          status?: 'waiting' | 'in_progress' | 'completed';
          game_state?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      room_players: {
        Row: {
          id: string;
          room_id: string;
          player_id: string;
          player_name: string;
          is_host: boolean;
          joined_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          player_id: string;
          player_name: string;
          is_host?: boolean;
          joined_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          player_id?: string;
          player_name?: string;
          is_host?: boolean;
          joined_at?: string;
        };
      };
    };
  };
};
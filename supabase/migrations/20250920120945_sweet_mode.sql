/*
  # Create multiplayer game tables

  1. New Tables
    - `rooms`
      - `id` (uuid, primary key)
      - `name` (text, room name)
      - `host_id` (text, host player ID)
      - `max_players` (integer, maximum players allowed)
      - `current_players` (integer, current player count)
      - `status` (text, room status: waiting/in_progress/completed)
      - `game_state` (jsonb, stores game state data)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `room_players`
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key to rooms)
      - `player_id` (text, unique player identifier)
      - `player_name` (text, player display name)
      - `is_host` (boolean, whether player is room host)
      - `joined_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (since this is a game)
    - Add indexes for performance
*/

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  host_id text NOT NULL,
  max_players integer DEFAULT 4 CHECK (max_players >= 2 AND max_players <= 6),
  current_players integer DEFAULT 1 CHECK (current_players >= 0),
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed')),
  game_state jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create room_players table
CREATE TABLE IF NOT EXISTS room_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  player_id text NOT NULL,
  player_name text NOT NULL,
  is_host boolean DEFAULT false,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(room_id, player_id)
);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;

-- Create policies for rooms (public access for game functionality)
CREATE POLICY "Anyone can view rooms"
  ON rooms
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create rooms"
  ON rooms
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update rooms"
  ON rooms
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Anyone can delete rooms"
  ON rooms
  FOR DELETE
  TO public
  USING (true);

-- Create policies for room_players (public access for game functionality)
CREATE POLICY "Anyone can view room players"
  ON room_players
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can join rooms"
  ON room_players
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update room players"
  ON room_players
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Anyone can leave rooms"
  ON room_players
  FOR DELETE
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_room_players_room_id ON room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_room_players_player_id ON room_players(player_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
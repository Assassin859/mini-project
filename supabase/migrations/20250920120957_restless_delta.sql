/*
  # Enable Realtime for multiplayer functionality

  1. Realtime Setup
    - Enable realtime for rooms table
    - Enable realtime for room_players table
    - Configure publication for real-time updates

  2. Additional Functions
    - Function to clean up old rooms
    - Function to handle player disconnections
*/

-- Enable realtime for the tables
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE room_players;

-- Create function to clean up old completed rooms (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM rooms 
  WHERE status = 'completed' 
    AND updated_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Create function to handle room cleanup when all players leave
CREATE OR REPLACE FUNCTION cleanup_empty_rooms()
RETURNS TRIGGER AS $$
BEGIN
  -- If this was the last player in the room, delete the room
  IF NOT EXISTS (
    SELECT 1 FROM room_players 
    WHERE room_id = OLD.room_id
  ) THEN
    DELETE FROM rooms WHERE id = OLD.room_id;
  ELSE
    -- Update current player count
    UPDATE rooms 
    SET current_players = (
      SELECT COUNT(*) FROM room_players 
      WHERE room_id = OLD.room_id
    )
    WHERE id = OLD.room_id;
    
    -- If the host left, assign a new host
    IF OLD.is_host = true THEN
      UPDATE room_players 
      SET is_host = true 
      WHERE room_id = OLD.room_id 
        AND id = (
          SELECT id FROM room_players 
          WHERE room_id = OLD.room_id 
          ORDER BY joined_at ASC 
          LIMIT 1
        );
      
      -- Update the room's host_id
      UPDATE rooms 
      SET host_id = (
        SELECT player_id FROM room_players 
        WHERE room_id = OLD.room_id AND is_host = true 
        LIMIT 1
      )
      WHERE id = OLD.room_id;
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for room cleanup
CREATE TRIGGER trigger_cleanup_empty_rooms
  AFTER DELETE ON room_players
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_empty_rooms();

-- Create function to update room player count when players join
CREATE OR REPLACE FUNCTION update_room_player_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE rooms 
  SET current_players = (
    SELECT COUNT(*) FROM room_players 
    WHERE room_id = NEW.room_id
  )
  WHERE id = NEW.room_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update player count on join
CREATE TRIGGER trigger_update_room_player_count
  AFTER INSERT ON room_players
  FOR EACH ROW
  EXECUTE FUNCTION update_room_player_count();
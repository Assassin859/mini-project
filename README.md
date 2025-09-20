# Shark Tank Simulator - Multiplayer Edition

## Features
A multiplayer business pitch simulation game where players take turns presenting their business ideas to AI sharks and negotiate deals in real-time.
- **Multiplayer Lobbies**: Create or join rooms with up to 6 players
- **Turn-based Gameplay**: Players take turns pitching their businesses
- **Real-time Updates**: See other players' actions and game state changes instantly
- **AI Sharks**: Five unique shark personalities with different investment preferences
- **Comprehensive Pitch Builder**: Create detailed business presentations
- **Negotiation System**: Counter-offer and negotiate with sharks
- **Performance Tracking**: Track your entrepreneur score and deal history
## Tech Stack
- **Frontend**: Next.js 13, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database + Realtime + Edge Functions)
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
## Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Supabase:
   - Create a new Supabase project
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase URL and anon key
4. Run the development server: `npm run dev`
## Database Schema
The game uses two main tables:
- `rooms`: Store game room information and state
- `room_players`: Track players in each room
## Game Flow
1. **Lobby**: Players create or join rooms
2. **Pitch Building**: Current player creates their business pitch
3. **Presentation**: Automated pitch presentation to sharks
4. **Shark Decisions**: AI sharks evaluate and make offers
5. **Negotiation**: Player can accept, counter, or walk away
6. **Results**: Show deal outcome and updated stats
7. **Next Turn**: Move to the next player
## Multiplayer Features
- Real-time synchronization using Supabase Realtime
- Turn-based gameplay with visual indicators
- Spectator mode for non-active players
- Persistent game state and player statistics
- Room management (create, join, leave)
# Bible Study App

A modern Bible reading and study application built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- Verse reading with ESV API integration
- AI-powered commentary and questions
- Progress tracking and metrics
- Shared insights and reflections
- Dark mode support
- Mobile-first design

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- ESV API key
- OpenAI API key

## Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd bible-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file based on `.env.example`:

   ```bash
   cp .env.example .env.local
   ```

4. Update the environment variables in `.env.local` with your API keys:

   - Supabase URL and anon key
   - ESV API key
   - OpenAI API key

5. Set up Supabase tables:
   - Create tables for users, reading_log, themes, reflections, and shared_insights
   - Enable Row Level Security (RLS) policies

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

1. Push your code to a Git repository

2. Deploy to Vercel:

   ```bash
   vercel
   ```

3. Configure environment variables in Vercel Dashboard:
   - Add all variables from `.env.local`
   - Enable Vercel Analytics

## Project Structure

- `app/` - Next.js app router pages and API routes
- `components/` - Reusable React components
- `lib/` - Utility functions and configurations
- `actions/` - Database operations
- `docs/` - Documentation and rules

## API Routes

- `/api/verse` - Fetch verses from ESV API
- `/api/commentary` - Generate AI commentary

## Database Schema

### Tables

- `users` - User profiles
- `reading_log` - Reading history
- `themes` - Bible themes
- `reflections` - Personal reflections
- `shared_insights` - Shared insights

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT

# Bible Study App

An interactive Bible study application built with Next.js that allows users to:

- Read Bible verses from the ESV API
- Generate AI-powered detailed commentary and analysis
- Save personal reflections with themed categorization
- Track study metrics and reading habits
- Explore verses through guided questions

## Features

- **Scripture Reading**: Fetch and display Bible verses using the ESV API with clean formatting
- **AI Commentary**: Generate comprehensive commentary on verses using OpenAI's GPT, including historical context, denominational perspectives, and application notes
- **Reflection System**: Save personal reflections to Supabase with question prompts derived from themes
- **Theme Visualization**: Identify and display key biblical themes with color-coded tags and icons
- **Metrics Dashboard**: Track reading time, weekly averages, and study progress
- **Dark Mode Design**: Beautiful dark-themed UI with gradient backgrounds and card-based layout

## Deployment

This application is deployed on:

- Vercel (production)
- Can be self-hosted on any platform supporting Next.js applications

## Environment Variables

The following environment variables are required:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# ESV API
ESV_API_KEY=your_esv_api_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) to view the app

## Technologies Used

- Next.js 14 (App Router)
- React
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL, Authentication)
- OpenAI API
- ESV Bible API
- Heroicons

## Debugging

### Sidebar Theme Tags

If theme tags in the sidebar under "Shared Reflections" aren't displaying properly:

1. Check the browser console for detailed debugging logs:

   - Raw reflection data from Supabase
   - Theme data for each reflection including type information
   - Processed reflections with themes array
   - Current sidebar rendering information

2. Common issues and solutions:

   - Themes not stored as an array in Supabase (check data type in console)
   - Empty or null theme arrays (fallback to default "faith" theme)
   - Theme names not matching predefined list in the theme configuration
   - Client-side processing issues when mapping theme data

3. The theme rendering logic performs these validations:
   - Checks if themes exist using `reflections[currentIndex]?.themes`
   - Limits to maximum 3 tags using `slice(0, 3)`
   - Provides a default theme if none are available

## License

MIT

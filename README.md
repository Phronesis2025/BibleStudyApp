# Bible Study App

An interactive Bible study application built with Next.js that allows users to:

- Read Bible verses
- Generate AI-powered commentaries
- Save personal reflections
- Share insights with other users
- Track study metrics

## Features

- **Scripture Reading**: Fetch and display Bible verses using the ESV API
- **AI Commentary**: Generate insightful commentary on verses using OpenAI
- **Reflection System**: Save personal reflections and insights on verses
- **Theme Tagging**: Categorize reflections with relevant biblical themes
- **Metrics Dashboard**: Track study habits and progress
- **Responsive Design**: Fully responsive for all device sizes

## Deployment

This application can be deployed to:

- Vercel (recommended)
- Any platform supporting Next.js applications

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
3. Set up environment variables
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) to view the app

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- OpenAI API
- ESV Bible API

## License

MIT

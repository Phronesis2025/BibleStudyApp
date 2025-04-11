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
- **Theme Visualization**: Identify and display key biblical themes with color-coded tags and icons, always showing exactly 3 relevant themes per verse
- **Metrics Dashboard**: Track reading time, weekly averages, and study progress
- **Dark Mode Design**: Beautiful dark-themed UI with gradient backgrounds and card-based layout
- **Enhanced Homepage**: Welcoming interface with feature cards, verse of the day, and improved user creation

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
   - Current sidebar rendering information with actual theme values

2. Common issues and solutions:

   - Themes not stored as an array in Supabase (check data type in console)
   - Empty or null theme arrays (app will show default themes)
   - Theme names not matching predefined list in the theme configuration
   - Client-side processing issues when mapping theme data
   - OpenAI not returning exactly 3 themes (fixed in latest version)

3. The theme rendering logic performs these validations:

   - Checks if themes exist using `reflections[currentIndex]?.themes`
   - OpenAI is now configured to always return exactly 3 relevant themes
   - Fallback logic ensures 3 themes are displayed if the API doesn't return as expected

4. Recent improvements:
   - Enhanced OpenAI prompt to analyze verse context and select the 3 most relevant themes
   - Added comprehensive theme mapping for mismatched themes
   - Updated sidebar to always show exactly 3 theme tags per reflection
   - Improved logging to include actual theme values for better debugging
   - Added intelligent theme mapping to prevent duplicate themes and ensure relevance (v1.0.2)
   - Strengthened OpenAI prompt to strictly enforce theme selection from predefined list (v1.0.2)
   - Implemented alternative mappings that prioritize contextually appropriate themes (v1.0.2)
   - Added answer validation requiring minimum 10 characters for reflection submission (v1.0.3)
   - Implemented liked_by column functionality to track user likes (v1.0.3)
   - Updated sidebar to show all shared reflections from last 30 days (v1.0.3)
   - Added skeleton UI for commentary loading states (v1.0.3)
   - Improved theme tags display with flex-wrap layout in main content (v1.0.3)
   - Redesigned UI with "Reading it Right" and "Applying This Verse" sections (v1.0.4)
   - Added general meaning commentary for verse explanation (v1.0.4)
   - Improved like button to show red heart icon for liked content (v1.0.4)
   - Repositioned key themes to top of commentary section (v1.0.4)
   - Added helpful subheaders and improved organization of content (v1.0.4)
   - Moved all section titles inside their respective cards for better visual grouping (v1.0.5)
   - Reordered sections for more logical content flow (v1.0.5)
   - Adjusted Key Themes card width to fit content with inline-block styling (v1.0.5)
   - Renamed "Expose" subsection to "Exegesis" for clarity (v1.0.5)
   - Standardized title styling across all sections (v1.0.5)
   - Made Key Themes display horizontally inline without wrapping (v1.0.6)
   - Renamed "Exegesis" subsection back to "Expose" for consistency (v1.0.6)
   - Fixed Key Themes layout structure to ensure proper horizontal display (v1.0.6)
   - Enhanced Homepage with hero section, feature cards, and verse of the day (v1.0.7)
   - Improved user creation flow with better call-to-action and instructions (v1.0.7)
   - Added footer with copyright and version information (v1.0.7)
   - Implemented responsive layout for all screen sizes (v1.0.7)
   - Refined Homepage design for a more uplifting feel with organic shapes, parallax effect, and updated typography (v1.0.7)
   - Adjusted color scheme with lighter gradients and brighter text for warmth (v1.0.7)
   - Added micro-animations for interactive elements to improve user experience (v1.0.7)
   - Enhanced Homepage with CTA button in hero section, mobile-friendly tap interactions for feature cards, and refined typography (v1.0.8)
   - Improved smooth scrolling for in-page navigation with anchor links (v1.0.8)
   - Added ripple effect animations for better touch feedback on mobile devices (v1.0.8)
   - Enhanced Homepage title with improved contrast, dynamic animation, and background highlight for better visual impact (v1.0.9)
   - Refined Homepage sub-header and descriptive text for clarity and simplicity (v1.0.11)
   - Added dynamic "Verse of the Day" feature with a modal preview including general meaning and reflective question (v1.0.11)
   - Added "Reading it Right" methodology explanation to the Reading Page (v1.0.12)
   - Fixed Reading Page issues: font, button animations, "Reading it Right" card, and header overlap (v1.0.13)
   - Updated OpenAI prompts to include "Reading it Right" section and provide deeper insights for commentary sections (v1.0.16)
   - Updated Reading Page design to match Homepage's aesthetic with gradient styling, cards, and animations (v1.0.13)
   - Enhanced Reading Page with visual hierarchy, improved loading state, reflection section, and mobile-first adjustments (v1.0.14)
   - Fixed Reading Page design issues and added "Reading it Right" section with specified card order (v1.0.15)

## License

MIT

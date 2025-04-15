# Reading Page Rules

## Overview

The reading page allows users to input Bible verses, view verse content from the ESV API, access AI-generated commentary and application notes, and save personal reflections. It includes theme visualization and question prompts derived from the verses.

## Components

1. Verse Input

   - Text input for verse reference
   - Suggested verses for easy selection
   - Error handling for invalid inputs
   - ESV API integration

2. Verse Display

   - Clean, readable text format
   - Fetched directly from ESV API
   - Error state for not found verses
   - Loading indicator during fetch
   - Skeleton UI for commentary loading state

3. AI Commentary Section

   - Historical context background
   - General meaning of the verse (1-2 sentences)
   - Key themes displayed at the beginning with improved nested layout structure for horizontal display
   - Section titles inside cards for visual cohesion
   - Logical section ordering (Verse → Key Themes → General Meaning → Historical Context → Reading it Right → Application → Denominational Perspectives → Reflective Question)
   - Brief explanation of the "Reading it Right" methodology and its application in the commentary
   - "Reading it Right" methodology explanation in a centered, visually appealing card with bullet points for the four purposes
   - "Reading it Right" section with structured analysis (Summarize, Expose, Change, Prepare)
   - "Applying This Verse in Today's World" section
   - Denominational perspectives with explanatory subheader
   - Theme tags with visual styling (flex-wrap layout)
   - Reflection questions with answer fields
   - Minimum answer length validation (10 characters)

4. Reflection System

   - Save reflections to Supabase with validation
   - Question/answer format with minimum length requirements
   - Optional additional insights
   - Success/error state feedback
   - Theme recommendations
   - Disabled save button until validation passes

5. Theme Visualization

   - Color-coded theme tags
   - Icon representation for each theme
   - Interactive elements
   - 20+ pre-defined biblical themes
   - Always displays exactly 3 themes per verse
   - Consistent flex-wrap layout across the app

6. Sidebar Reflections

   - Displays shared reflections from all users (last 30 days)
   - Always shows exactly 3 theme tags per reflection
   - Carousel navigation with play/pause controls
   - Like functionality with user tracking via liked_by column
   - Interactive verse text expansion
   - Debug logging for theme data tracing

## Styling

- Mobile-first approach
- Dark mode with gradient backgrounds
- Card-based content organization
- Consistent color scheme with sky-blue accents
- Loading states with spinners
- Verse input form with gradient styling matching the Homepage
- Commentary sections (Key Themes, General Meaning, Historical Context, Reading it Right, Application, Denominational Perspectives, Reflective Question) provide detailed, verse-specific insights, with a dedicated "Reading it Right" section applying the methodology
- Background image with overlay and organic shapes matching the Homepage aesthetic
- Visual hierarchy with dividers between commentary sections
- Enhanced loading state with card-styled spinner
- Improved reflection section with placeholder text and scrollable shared reflections
- Mobile-first adjustments for responsive padding and form width
- Adjusted top padding, scroll behavior, and navigation for better usability

## Functionality

- Verse fetching from ESV API
- AI commentary generation via OpenAI
- Reflection saving to Supabase
- Theme visualization and tagging
- Navigation between app sections

## Session Handling

- Session checked server-side in a Server Component using `@supabase/ssr`.
- Redirects to `/` if no user session is found.
- Passes `userId` to a Client Component (`ReadingPageContent`) for interactive features.
- Client-side session checking removed for reliability.

## API Integration

- ESV API for verse content
- OpenAI GPT for commentary generation
  - Configured to always return exactly 3 relevant themes
  - Themes selected based on verse content and context
  - Stricter prompt enforcement to ensure themes come from predefined list only (v1.0.2)
  - Advanced theme mapping to prevent duplicates and ensure relevance (v1.0.2)
  - Alternative mapping logic for contextually appropriate theme selection (v1.0.2)
  - Added general meaning field for simple verse explanation (v1.0.4)
  - Improved organization with dedicated application section (v1.0.4)
  - Enhanced readability with consistent card layouts and titles (v1.0.5)
  - Made Key Themes display horizontally inline without wrapping (v1.0.6)
  - Renamed "Exegesis" subsection back to "Expose" for consistency (v1.0.6)
  - Fixed Key Themes layout structure with nested elements to ensure proper horizontal display (v1.0.6)
- Supabase for data storage
- Browser client for user authentication

## Error Handling

- API error states with visual feedback
- Invalid input handling
- Loading states during API calls
- User feedback via colored alert boxes
- Detailed error logging to console

## Debugging Sidebar Themes

If theme tags are not displaying correctly in the sidebar:

1. The code includes console logs to track theme data:

   - When fetching reflections from Supabase
   - When processing themes for each reflection
   - During sidebar rendering for the current reflection
   - Logs the actual theme values with `themes.join(", ")`

2. Troubleshooting steps:

   - Check data type of themes in Supabase (should be text[] array)
   - Verify themes are stored in lowercase matching the predefined list
   - Ensure the theme mapping exists in the ThemeChip component
   - Check currentIndex is within bounds of the reflections array
   - Verify OpenAI is returning exactly 3 themes

3. Theme rendering flowchart:
   - Fetch reflections → process themes → store in state → render in sidebar
   - Each step has corresponding console logs for debugging
   - OpenAI is instructed to return exactly 3 themes
   - Fallback logic ensures 3 themes are displayed even if API fails

## Performance

- Optimized API calls
- Stateful loading indicators
- Responsive design for all devices
- Clean UI with appropriate spacing

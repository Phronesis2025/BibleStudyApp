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

3. AI Commentary Section

   - Historical context background
   - Multi-part commentary analysis
   - Application suggestions
   - Denominational perspectives
   - Theme tags with visual styling
   - Reflection questions with answer fields

4. Reflection System

   - Save reflections to Supabase
   - Question/answer format
   - Optional additional insights
   - Success/error state feedback
   - Theme recommendations

5. Theme Visualization

   - Color-coded theme tags
   - Icon representation for each theme
   - Interactive elements
   - 20+ pre-defined biblical themes

6. Sidebar Reflections

   - Displays shared reflections with theme tags
   - Carousel navigation with play/pause controls
   - Like functionality for reflections
   - Interactive verse text expansion
   - Debug logging for theme data tracing

## Styling

- Mobile-first approach
- Dark mode with gradient backgrounds
- Card-based content organization
- Consistent color scheme with sky-blue accents
- Loading states with spinners

## Functionality

- Verse fetching from ESV API
- AI commentary generation via OpenAI
- Reflection saving to Supabase
- Theme visualization and tagging
- Navigation between app sections

## API Integration

- ESV API for verse content
- OpenAI GPT for commentary generation
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

2. Troubleshooting steps:

   - Check data type of themes in Supabase (should be text[] array)
   - Verify themes are stored in lowercase matching the predefined list
   - Ensure the theme mapping exists in the ThemeChip component
   - Check currentIndex is within bounds of the reflections array

3. Theme rendering flowchart:
   - Fetch reflections → process themes → store in state → render in sidebar
   - Each step has corresponding console logs for debugging

## Performance

- Optimized API calls
- Stateful loading indicators
- Responsive design for all devices
- Clean UI with appropriate spacing

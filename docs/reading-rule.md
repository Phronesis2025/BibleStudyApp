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

## Performance

- Optimized API calls
- Stateful loading indicators
- Responsive design for all devices
- Clean UI with appropriate spacing

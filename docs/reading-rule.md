# Reading Page Rules

## Overview

The reading page allows users to input Bible verses, view verse numbers, access AI-generated commentary and questions, and share insights. It includes a collapsible sidebar for viewing shared insights.

## Components

1. Verse Input

   - Text input for verse reference
   - Validation for proper format
   - Error handling for invalid inputs

2. Verse Display

   - Shows verse numbers only
   - Clean, readable format
   - Mobile-responsive layout

3. AI Commentary Section

   - OpenAI-generated commentary
   - Application notes
   - Key themes
   - Discussion questions
   - Answer fields saved to Supabase

4. Share Insights Button

   - Optional sharing feature
   - Only shared insights appear in sidebar
   - Toggle for sharing state

5. Sidebar

   - Collapsible design
   - Floating toggle button
   - "View All Insights" link
   - Only shows opted-in insights
   - Mobile-friendly positioning

6. Milestone Pop-ups
   - Achievement notifications
   - Progress celebrations
   - Non-intrusive design

## Styling

- Mobile-first approach
- Clean, minimalist design
- Soft color palette
- Dark mode support
- Loading states with spinners

## Functionality

- Verse fetching from ESV API
- AI commentary generation
- Insight sharing
- Progress tracking
- Milestone detection

## API Integration

- ESV API for verses
- OpenAI for commentary
- Supabase for data storage

## Error Handling

- API error states
- Invalid input handling
- Loading states
- User feedback via toasts

## Performance

- Optimized API calls
- Caching where appropriate
- Smooth transitions
- Mobile performance

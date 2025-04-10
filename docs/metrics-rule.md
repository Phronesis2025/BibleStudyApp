# Metrics Page Rules

## Overview

The metrics page displays user reading progress and insights through visualization of reading times and verses studied. It shows weekly reading patterns and achievements for the logged-in user.

## Components

1. Progress Overview

   - Today's reading time in minutes
   - Weekly average reading time
   - Total verses studied
   - Daily goal visualization

2. Weekly Chart

   - Bar chart visualization of daily reading
   - Day-of-week labels
   - Minutes per day display
   - Goal line indicator

3. Weekly Summary
   - Detailed breakdown by day
   - Minutes per day in text format
   - Full day names display

## Visualizations

1. Bar Chart

   - Custom-built responsive chart
   - Goal line with dashed styling
   - Color coding for goal achievement
   - Day abbreviations

2. Weekly Overview
   - Text-based data presentation
   - Day-by-day breakdown
   - Clean, readable format

## Styling

- Consistent with app-wide dark theme
- Card-based layout with gradients
- Sky-blue accent colors
- Clean spacing and typography
- Responsive design

## Data Management

- Server-side data fetching
- Supabase integration
- User authentication check
- Placeholder data for development

## Functionality

- User verification with redirect
- Reading time tracking display
- Weekly average calculations
- Navigation between app sections

## Error Handling

- User not found error display
- Custom error UI with explanation
- Redirection options
- Console error logging

## Performance

- Server component rendering
- Static header generation
- Lightweight visualization approach
- Optimized layout for mobile

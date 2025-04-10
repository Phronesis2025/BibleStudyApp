# Homepage Rules

## Overview

The homepage serves as the entry point for users to either select an existing user or create a new one. It includes a clean, dark-themed interface and redirects to the reading page upon user selection/creation.

## Components

1. User Selection Dropdown

   - Fetches existing users from Supabase
   - Displays user names in a select element
   - Triggers redirect on selection with userId parameter

2. New User Form

   - Simple form with name input
   - Validates input (non-empty)
   - Creates new user in Supabase
   - Shows loading state with spinner during creation

3. Visual Elements
   - BookOpenIcon header icon
   - App title and tagline
   - Version number display
   - Clean card layout with gradient background

## Styling

- Dark mode design with gradient backgrounds
- Cards with semi-transparent dark backgrounds
- Sky-blue accents for interactive elements
- Error states in red
- Success states in green
- Loading states with animated spinner

## Functionality

- Form validation (empty name check)
- Error handling with visual feedback
- Success confirmation message
- Loading spinner during API operations
- Redirect logic to reading page with userId parameter

## API Integration

- Supabase for user management
- Real-time data fetching for user list
- Browser client for client-side operations

## Error Handling

- Form validation errors
- API error states with visual feedback
- User feedback via colored alert boxes
- Console error logging for debugging

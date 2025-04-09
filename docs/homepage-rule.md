# Homepage Rules

## Overview

The homepage serves as the entry point for users to either select an existing user or create a new one. It includes a dark mode toggle and redirects to the reading page upon user selection/creation.

## Components

1. User Selection Dropdown

   - Fetches existing users from Supabase
   - Displays user names in a select element
   - Triggers redirect on selection

2. New User Form

   - Simple form with name input
   - Validates input (non-empty)
   - Creates new user in Supabase
   - Shows loading state during creation

3. Dark Mode Toggle
   - Uses next-themes
   - Persists across sessions
   - Toggle button with sun/moon icons

## Styling

- Mobile-first design
- Soft color palette
- Responsive layout
- Error states in red
- Loading states with spinner

## Functionality

- Form validation
- Error handling
- Loading states
- Redirect logic
- Theme persistence

## API Integration

- Supabase for user management
- Server actions for data operations

## Error Handling

- Form validation errors
- API error states
- User feedback via toasts

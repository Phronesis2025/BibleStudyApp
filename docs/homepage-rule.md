# Homepage Rules

## Overview

The homepage serves as the entry point for users to either select an existing user or create a new one. It includes a clean, dark-themed interface with an enhanced hero section, introduction with feature cards, Verse of the Day section, and improved call-to-action. It redirects to the reading page upon user selection/creation.

## Components

1. Enhanced Hero Section

   - Large, bold title with gradient color
   - Descriptive tagline
   - Subtle background image with low opacity
   - Gradient background overlay
   - Organic shapes in sky-400/10 for a softer look
   - Parallax effect on the background image for depth

2. Introduction Section

   - Heading and paragraph explaining the app's purpose
   - Grid of 3 feature cards (Guided Commentary, Denominational Perspectives, Reflections) with icons
   - Hover effects for interactive elements
   - Card animation effects with shadows
   - Icon scale animation on hover

3. Verse of the Day Section

   - Sample verse display (John 3:16)
   - "Read More" link to reading page with bounce animation
   - Card-based layout with soft sky-blue border
   - Radial gradient background

4. User Selection Dropdown

   - Fetches existing users from Supabase
   - Displays user names in a select element
   - Triggers redirect on selection with userId parameter

5. New User Form

   - Form with name input
   - Validates input (non-empty)
   - Creates new user in Supabase
   - Shows loading state with spinner during creation
   - Improved button with gradient and hover effects
   - Pulse animation on the submit button

6. Footer
   - Copyright notice
   - Version number display

## Styling

- Dark mode design with gradient backgrounds
- Cards with semi-transparent dark backgrounds
- Sky-blue accents for interactive elements
- Hover and focus states for interactive elements
- Typography uses Poppins font for headings, text-gray-50 for headings, and text-gray-200 for body text for better contrast and warmth
- Subtle organic shapes in sky-400/10 as background elements in the hero section
- Error states in red
- Success states in green
- Loading states with animated spinner
- Responsive layout for various screen sizes
- Micro-animations for interactive elements (scale, bounce, pulse)

## Functionality

- Form validation (empty name check)
- Error handling with visual feedback
- Success confirmation message
- Loading spinner during API operations
- Redirect logic to reading page with userId parameter
- Dynamic font loading for Poppins typography

## API Integration

- Supabase for user management
- Real-time data fetching for user list
- Browser client for client-side operations

## Error Handling

- Form validation errors
- API error states with visual feedback
- User feedback via colored alert boxes
- Console error logging for debugging

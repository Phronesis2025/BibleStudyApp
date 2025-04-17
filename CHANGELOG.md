# Changelog

All notable changes to the Bible Study App will be documented in this file.

## [1.3.0] - 2023-09-15

### Added

- Enhanced authentication with server-side validation throughout protected routes
- Improved server components with proper session handling using layout.server.tsx
- Created comprehensive testing guide with detailed authentication test cases
- Added thorough error handling for authentication edge cases and network issues

### Changed

- Refactored Supabase authentication architecture to use server components
- Updated route handlers to utilize createRouteHandlerClient for server-side validation
- Improved session management with cleaner separation between client and server components
- Enhanced documentation including updated instructions.txt with authentication details

### Fixed

- Resolved session persistence issues between page navigation
- Fixed race conditions in authentication state management
- Improved handling of OAuth callbacks with proper error states

## [1.2.0] - 2023-08-28

### Added

- Created comprehensive testing guide (`docs/testing-guide.md`) for authentication flows
- Implemented server-side session validation throughout the application
- Added detailed error handling for authentication edge cases

### Changed

- Refactored Supabase authentication to use server-side validation
- Updated API auth routes to use `getServerSupabaseClient` from `lib/supabaseServerClient.ts`
- Improved session handling in layout components with server-client architecture
- Enhanced OAuth callback with better error handling and redirects
- Updated directory structure documentation to reflect current file organization

### Fixed

- Resolved authentication state inconsistencies between pages
- Fixed session validation in protected routes

## [1.1.4] - 2023-08-07

### Added

- Moved "Back to Reading" link to NavigationHeader on Profile Page for more consistent navigation

### Changed

- Updated Supabase client implementation to use `createClientComponentClient` consistently across all components
- Removed URL-based authentication in favor of client-side session checks
- Enhanced NavigationHeader to check authentication state internally
- Improved session validation in ReadingPageContent with proper error handling
- Removed old supabase.ts file to standardize on one Supabase client implementation
- Enhanced NavigationHeader to ensure consistent icon and title rendering with responsive styling
- Optimized NavigationHeader for mobile by reducing logo, title, and padding sizes

### Fixed

- Fixed authentication issues with multiple Supabase client instances
- Fixed like functionality to properly handle authenticated users
- Improved error handling for session validation errors

## [1.1.3] - 2023-08-05

### Added

- Created Profile Page to display user details, saved readings, and reflections, with name editing functionality.
- Enhanced Profile Page with User Activity Statistics, Favorite Themes, and Most Popular Shared Reflections sections.

### Changed

- Made navigation bar sticky, reduced mobile height to h-14, fixed Reading Page header.
- Updated navigation bar: Homepage with right-aligned Sign Up/Sign In buttons, Reading Page with right-aligned Profile and Sign Out links, Sign Out redirects to Homepage.
- Styled Profile and Sign Out buttons in Reading Page header to match the gradient and bordered styles of Sign Up and Sign In buttons on Homepage.
- Reduced Sign Up/Sign In modal height on Homepage to fit within the viewport.
- Reduced Sign Up/Sign In modal width on mobile, removed scrollbar on Sign Up modal on desktop, and horizontally aligned Login/Google buttons.
- Updated Sign Up/Sign In modal input fields to use black text with a lighter background for better contrast while maintaining the dark modal theme.
- Enhanced Sign Up/Sign In modal appearance with a lighter semi-transparent background, backdrop blur effect, stronger border, and shadow.

### Fixed

- Reading Page navigation bar to show Profile/Sign Out links, added padding to prevent content overlap with sticky header.
- Moved Login and Google buttons inside the Sign Up/Sign In modal card on Homepage.

## [1.1.2] - 2025-04-15

### Added

- Redesigned Begin your Journey card with mobile-first split layout, tomb image (/img/tomb.png), vertically stacked Sign Up/Sign In buttons, and subtle image zoom.

## [1.1.1] - 2025-04-15

### Fixed

- Implemented smooth scroll for the "Start your Journey" button on the homepage, with a 64px offset to account for a fixed navigation bar, ensuring mobile-first UX.

## [1.1.0] - 2025-04-14

### Added

- Improved session handling and error UI.
- Standardized Supabase client usage to resolve multiple GoTrueClient instances warning.
- Updated image handling for reading page background.
- Enhanced documentation with detailed setup instructions and changelog.

# Changelog

All notable changes to the Bible Study App will be documented in this file.

## [0.1.0] - 2024-03-21

### Added

- Initial release of the Bible Study App
- AI-powered commentary generation
- Reading it Right methodology implementation
- Theme-based reflections
- Community sharing features
- Dark mode design
- Responsive layout

### Changed

- Updated Supabase client implementation to use `createClientComponentClient`
- Improved session validation and error handling
- Enhanced authentication flows
- Added fallback UI for session errors
- Updated background image handling with placeholder support

### Fixed

- Resolved "Multiple GoTrueClient instances" warning
- Fixed session persistence issues
- Improved error handling in authentication flows
- Added proper cleanup of error messages when switching auth modes
- Fixed missing background image issue with placeholder support

### Security

- Added HTTPS support for development server
- Improved session management
- Enhanced error handling for authentication
- Added proper environment variable handling

### Documentation

- Updated README with detailed setup instructions
- Added Supabase configuration requirements
- Added background image setup instructions
- Created CHANGELOG.md

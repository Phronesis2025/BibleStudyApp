# BibleStudyApp Testing Guide

This guide provides step-by-step instructions to verify that the authentication and navigation features of the BibleStudyApp are functioning correctly after the authentication refactor.

## Testing Environment Setup

Before beginning testing, ensure:

1. You have the latest code pulled from the repository
2. Dependencies are installed with `npm install`
3. The development server is running with `npm run dev`
4. You have a valid Supabase project set up with authentication enabled
5. Environment variables in `.env.local` are properly configured

## 1. Initial Startup and Navigation Testing

### 1.1 App Startup Test

**Goal**: Verify the app loads without errors

1. Start the development server with `npm run dev`
2. Open your browser to http://localhost:3000
3. Verify:
   - The homepage loads without console errors
   - The UI renders correctly with all elements visible
   - The sign-in and sign-up buttons are visible

### 1.2 Authentication State Handling

**Goal**: Verify the app correctly handles authenticated and unauthenticated states

#### Test Case: Unauthenticated User Navigation

1. Open an incognito/private browser window to clear any existing sessions
2. Navigate to http://localhost:3000
3. Verify:
   - You see the homepage with sign-in options
   - You are not automatically redirected
4. Try to access http://localhost:3000/reading directly
5. Verify:
   - You are redirected back to the homepage
   - You see a brief loading state before the redirect

#### Test Case: Authenticated User Navigation

1. Sign in using a valid account (create one if needed)
2. Once signed in, verify:
   - You are automatically redirected to the reading page
   - The navigation header shows you're logged in
3. Navigate to http://localhost:3000 (the homepage)
4. Verify:
   - You are automatically redirected to the reading page
   - You don't see the sign-in form

## 2. Authentication Flow Testing

### 2.1 Email/Password Sign Up

**Goal**: Verify new users can create accounts

1. From the homepage, click "Create Free Account" or "Sign Up"
2. In the modal:
   - Enter a new email address that hasn't been used before
   - Enter a password (at least 8 characters)
   - Confirm the password
3. Click the Sign Up button
4. Verify:
   - You see a loading state during submission
   - You receive a success message
   - You are redirected to the reading page
   - Check your email for a verification link (if email verification is enabled)

**Error Handling Tests**:

- Try signing up with an email already in use - verify you get an appropriate error
- Try signing up with mismatched passwords - verify validation prevents submission
- Try signing up with a short password - verify validation requires minimum length
- Try signing up with invalid email format - verify validation catches it

### 2.2 Email/Password Sign In

**Goal**: Verify existing users can sign in

1. From the homepage, click "Sign In"
2. Enter valid credentials for an existing account
3. Click the Sign In button
4. Verify:
   - You see a loading state during submission
   - You are redirected to the reading page
   - The UI updates to reflect your authenticated state

**Error Handling Tests**:

- Try signing in with incorrect password - verify you see an appropriate error
- Try signing in with non-existent email - verify you see an appropriate error
- Try signing in with empty fields - verify validation prevents submission

### 2.3 Google OAuth Sign In

**Goal**: Verify OAuth authentication works correctly

1. From the homepage, click "Sign In"
2. Click the "Continue with Google" button
3. Complete the Google OAuth flow with a valid Google account
4. Verify:
   - The OAuth popup opens correctly
   - After authenticating with Google, you are redirected back to the app
   - The app processes the OAuth callback correctly
   - You end up on the reading page authenticated

**Error Handling Tests**:

- Cancel the OAuth popup and verify the app handles it gracefully
- Disconnect your internet during the OAuth process and verify appropriate error handling

### 2.4 Forgot Password Flow

**Goal**: Verify users can reset their passwords

1. From the sign-in modal, click "Forgot Password"
2. Enter the email address of an existing account
3. Click the "Send Reset Link" button
4. Verify:
   - You see a loading state during submission
   - You receive a success message indicating an email was sent
5. Check your email for a password reset link
6. Click the password reset link
7. Verify:
   - You are redirected to the reset password page
   - The form to create a new password appears
8. Enter a new password and confirm it
9. Submit the form
10. Verify:
    - You see a success message
    - You are redirected to the homepage
    - You can sign in with the new password

**Error Handling Tests**:

- Try resetting with a non-existent email - verify appropriate feedback
- Try setting mismatched passwords on reset - verify validation catches it
- Try setting too short password - verify validation requires minimum length
- Try using an expired reset link - verify proper error handling

### 2.5 Sign Out

**Goal**: Verify users can sign out

1. While signed in, click your profile or the sign out button in the navigation header
2. Verify:
   - You are signed out
   - You are redirected to the homepage
   - The UI updates to reflect your unauthenticated state
3. Try to access the reading page directly
4. Verify:
   - You are redirected back to the homepage

## 3. Server-Side Session Validation Testing

**Goal**: Verify server-side session validation works correctly

1. Sign in successfully
2. While authenticated, open the browser's developer tools
3. Go to the Application tab (Chrome) or Storage tab (Firefox)
4. Find the Cookies section for the app's domain
5. Note the presence of the Supabase authentication cookies
6. Manually delete these cookies
7. Refresh the page or navigate to a protected route
8. Verify:
   - You are treated as unauthenticated
   - You are redirected to the homepage
   - The UI shows the unauthenticated state

## 4. Error Simulation and Network Issue Testing

### 4.1 Network Issue Simulation

**Goal**: Verify the app handles network issues gracefully

1. Sign in successfully
2. In Chrome DevTools, go to the Network tab
3. Enable "Offline" mode to simulate network disconnection
4. Try to navigate between pages
5. Try to sign out
6. Verify:
   - Appropriate error messages are shown
   - The UI doesn't break or freeze
7. Re-enable network connection
8. Verify the app recovers and functions correctly

### 4.2 Server Error Simulation

To simulate server errors, you can temporarily modify the API endpoint handlers to return errors for testing purposes.

## 5. Edge Case Testing

### 5.1 Multiple Tab/Window Behavior

**Goal**: Verify authentication state is consistent across tabs

1. Sign in on one tab
2. Open a new tab and navigate to the app
3. Verify:
   - You are automatically authenticated in the new tab
4. Sign out in one tab
5. Switch to the other tab and attempt to access a protected route
6. Verify:
   - You are treated as signed out in all tabs

### 5.2 Session Expiration Handling

**Goal**: Verify the app handles session expiration correctly

1. Sign in successfully
2. Modify the Supabase session cookie expiration time to a past date (using DevTools)
3. Refresh the page or navigate to a different route
4. Verify:
   - You are treated as unauthenticated
   - You are redirected to the homepage
   - The UI shows appropriate messaging

## 6. Troubleshooting Common Issues

If you encounter issues during testing, check the following:

1. **Console Errors**: Check the browser console for JavaScript errors
2. **Network Requests**: Examine the Network tab in DevTools to see if API requests are failing
3. **Environment Variables**: Ensure all required environment variables are set correctly
4. **Supabase Configuration**: Verify your Supabase project settings, especially authentication settings
5. **Cookie Settings**: Check if cookies are being properly set and read (SameSite, Secure flags, etc.)
6. **Local Storage**: Examine local storage for any authentication-related data
7. **Server Logs**: Check the Next.js server logs for any server-side errors

## Conclusion

After completing these tests, you should have confidence that the authentication system is working as expected. If any issues are found, document them specifically with:

1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Console errors (if any)
5. Screenshots (if relevant)

This testing approach helps ensure a robust authentication experience for your users.

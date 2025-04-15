# Bible Study App Improvements

## Overview

- **Purpose**: Enhance the app to be engaging, simple, and scalable for 100+ users, targeting beginners and those exploring faith, with a mobile-first design and desktop compatibility.
- **Priorities**: Focus on authentication, user profiles, admin tools, sidebar content, unique response styles, API transitions, and methodology promotion.

## Improvement List

| Priority | Improvement              | Status   | Notes                                                                                             |
| -------- | ------------------------ | -------- | ------------------------------------------------------------------------------------------------- |
| 1        | Sign Up/Sign In Features | Planned  | Email/password, Google, Facebook, Apple logins for easy access.                                   |
| 2        | Profile Page             | Planned  | Show metrics (verses searched, reflections, badges), password reset, editable fields (name, bio). |
| 3        | Sidebar Options          | Planned  | Explore recent verses, reading plans, mini-dashboard, or verse of the day.                        |
| 4        | Admin Page               | Planned  | Display total users, verses searched, reflections shared, API usage, retention stats.             |
| 5        | Jesus-Inspired Responses | Planned  | Conversation mode mimicking "The Chosen" Jesus: simple, thought-provoking answers.                |
| 6        | Transition to xAI API    | Research | Evaluate xAI API availability vs. OpenAI for commentary generation.                               |
| 7        | "Reading it Right" Card  | Planned  | Homepage card explaining methodology, crediting pastor, linking to website.                       |
| 8        | Gamification Features    | Idea     | Add streaks (daily reading), badges (e.g., 5 reflections), progress UI for engagement.            |
| 9        | UI Polish                | Idea     | Smoother animations, cleaner forms, intuitive navigation (e.g., sticky buttons).                  |
| 10       | Notification System      | Idea     | Push alerts for daily verses, likes, or comments (opt-in).                                        |
| 11       | Bookmarking Feature      | Idea     | Save favorite verses/reflections to profile or sidebar.                                           |
| 12       | Audio Integration        | Idea     | Text-to-speech for verses/reflections using free API.                                             |

## Implementation Notes

- **Sign Up/Sign In**: Leverage Supabase auth for email and social logins; ensure mobile-friendly UI with large buttons.
- **Profile Page**: Store metrics in Supabase; add streaks, time spent, community stats; include bio editing.
- **Sidebar**: Test options like recent verses or plans; keep mobile layout uncluttered.
- **Admin Page**: Use Supabase queries for stats; visualize trends (e.g., charts).
- **Jesus-Inspired Responses**: Craft OpenAI prompts for "The Chosen" style; label as inspired; test tone.
- **xAI API**: Research xAI; fallback to OpenAI fine-tuning if unavailable.
- **Reading it Right Card**: Design mobile-responsive card with sky-400 accents.
- **Gamification**: Track streaks/badges in Supabase; display subtly to maintain spiritual focus.
- **UI Polish**: Refine form padding, add fade-ins, ensure sky-400 consistency.
- **Notifications**: Implement browser-based alerts; ensure opt-in for mobile.
- **Bookmarks**: Store in Supabase; add simple icon-based UI.
- **Audio**: Use free TTS API; add play/pause buttons below text.

## Completed Improvements

- **Smooth Scroll for Start your Journey Button** (April 15, 2025): Fixed the "Start your Journey" button to smoothly scroll to the "Begin your Journey" section with a 64px offset to account for a fixed navigation bar, ensuring mobile-first compatibility and a polished UX.
- **Redesigned Begin your Journey Card** (April 15, 2025): Updated card with a tomb image (/img/tomb.png), vertically stacked Sign Up with Email and Sign In buttons, mobile-first split layout, subtle image zoom, and Dribbble-inspired styling matching the app's theme.

## Next Steps

- Prioritize sign up/sign in implementation.
- Design profile page with user metrics.
- Explore sidebar and admin features iteratively.

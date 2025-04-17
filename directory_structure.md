# BibleStudyApp Directory Structure

This file documents the complete directory structure of the BibleStudyApp project. It is automatically updated to reflect the latest changes to the codebase.

**Last updated: August 28, 2024**

```
BibleStudyApp/
├── .env.local                    # Environment variables
├── .eslintrc.json                # ESLint configuration
├── .vercel/                      # Vercel deployment files
│   ├── project.json
│   └── README.txt
├── CHANGELOG.md                  # Development changelog
├── Grok_summary.txt              # Project summary for AI assistants
├── README.md                     # Project documentation
├── directory_structure.md        # This file
├── eslint.config.mjs             # ESLint configuration module
├── instructions.txt              # Instructions for AI assistants
├── package-lock.json             # NPM dependencies lock file
├── package.json                  # Project metadata and dependencies
├── postcss.config.mjs            # PostCSS configuration
├── project_structure.txt         # Project structure documentation
├── tailwind.config.js            # Tailwind CSS configuration
├── tailwind.config.ts            # TypeScript Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── tsconfig.tsbuildinfo          # TypeScript build information
├── types.ts                      # TypeScript type definitions
├── vercel.json                   # Vercel deployment configuration
│
├── actions/                      # Server actions for data operations
│   ├── auth.ts                   # Authentication operations
│   ├── index.ts                  # Re-exports from all action files (for transition)
│   ├── reflection.ts             # Reflection and insight operations
│   ├── verse.ts                  # Bible verse and reading operations
│   └── db.ts                     # Legacy database operations (to be deprecated)
│
├── app/                          # Next.js App Router directory
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   └── [...supabase]/    # Supabase auth callback handler
│   │   │       └── route.ts
│   │   ├── commentary/           # Bible commentary API
│   │   │   └── route.ts
│   │   ├── like/                 # Reflection like functionality
│   │   │   └── route.ts
│   │   ├── test-openai/          # OpenAI test endpoint
│   │   │   └── route.ts
│   │   └── verse/                # Bible verse API
│   │       └── route.ts
│   │
│   ├── metrics/                  # User reading metrics page
│   │   └── page.tsx
│   │
│   ├── profile/                  # User profile page
│   │   └── page.tsx
│   │
│   ├── reading/                  # Bible reading/study page
│   │   └── page.tsx
│   │
│   ├── reset-password/           # Password reset page
│   │   └── page.tsx
│   │
│   ├── favicon.ico               # App favicon
│   ├── globals.css               # Global CSS styles
│   ├── layout.client.tsx         # Client-side layout component
│   ├── layout.server.tsx         # Server-side layout component
│   ├── layout.tsx                # Root layout with ServerLayout
│   └── page.tsx                  # Homepage
│
├── certificates/                 # SSL certificates for local development
│   ├── localhost-key.pem
│   └── localhost.pem
│
├── components/                   # React components
│   ├── ui/                       # UI component library
│   │   └── badge.tsx             # Badge component
│   ├── CommentarySkeleton.tsx    # Loading skeleton for commentary
│   ├── NavigationHeader.tsx      # Navigation header component
│   ├── SignInModal.tsx           # Authentication modal
│   ├── ThemeChip.tsx             # Theme tag component
│   ├── ThemeProviderWrapper.tsx  # Theme provider wrapper component
│   ├── ThemeRecommendations.tsx  # Theme recommendations component
│   └── VercelAnalytics.tsx       # Vercel analytics component
│
├── context/                      # React context providers
│   └── AuthContext.tsx           # Authentication context
│
├── data/                         # Static data
│   └── verses.ts                 # Collection of Bible verses
│
├── docs/                         # Documentation
│   ├── homepage-rule.md          # Homepage guidelines
│   ├── improvements.md           # Future improvements
│   ├── metrics-rule.md           # Metrics page guidelines
│   ├── reading-page.md           # Reading page documentation
│   ├── reading-rule.md           # Reading page guidelines
│   ├── supabase-schema.md        # Supabase database schema
│   └── testing-guide.md          # Authentication testing guide
│
├── lib/                          # Utility libraries
│   ├── supabaseClient.ts         # Supabase client-side configuration
│   ├── supabaseServerClient.ts   # Supabase server-side configuration
│   └── utils.ts                  # Utility functions
│
├── public/                       # Static assets
│   ├── bible-background.jpg      # Bible background image
│   ├── favicon.ico               # Favicon
│   ├── file.svg                  # File icon
│   ├── globe.svg                 # Globe icon
│   ├── tomb.png                  # Tomb image
│   ├── vercel.svg                # Vercel logo
│   └── window.svg                # Window icon
│
└── supabase/                     # Supabase configuration
    └── migrations/               # Database migrations
        ├── 20240320_create_reflections.sql       # Create reflections table
        ├── 20240320_setup_rls.sql                # Setup Row Level Security
        ├── 20240321_update_shared_insights.sql   # Update shared insights
        ├── 20240322_update_themes.sql            # Update themes
        ├── 20240323_create_theme_recommendations.sql # Create theme recommendations
        ├── 20240324_add_insight_to_reflections.sql # Add insight to reflections
        └── 20240325_add_toggle_like_function.sql   # Add toggle like function
```

## Key Components

- **Authentication**: Uses Supabase auth with email/password and Google OAuth
- **Bible Reading**: Core functionality in the reading page where users can study verses
- **Reflections**: Users can save personal reflections on Bible verses
- **Themes**: Verses are tagged with themes for organization and discovery
- **API Routes**: Server-side endpoints for verse fetching, commentary generation, and likes
- **Server Actions**: Modular organization of database operations by functionality (auth, verse, reflection)

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Server Actions
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (server-side validation)
- **Deployment**: Vercel

# Bible Study App

A modern, interactive Bible study application that helps users engage with Scripture through AI-powered commentary, reflection tools, and community sharing.

## Features

- **AI-Powered Commentary**: Get detailed explanations of Bible verses with historical context and denominational perspectives
- **Reading it Right Methodology**: Follow a structured approach to Bible study with Summary, Expose, Change, and Prepare sections
- **Theme-Based Reflections**: Tag your reflections with relevant biblical themes
- **Community Sharing**: Share your insights and see what others are learning
- **Dark Mode Design**: Beautiful, easy-on-the-eyes interface for extended study sessions
- **Responsive Layout**: Works seamlessly on desktop and mobile devices

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env.local` file
   - Add your OpenAI API key: `OPENAI_API_KEY=your_key_here`
   - Add your ESV API key: `ESV_API_KEY=your_key_here`
4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `app/`: Next.js application code
  - `page.tsx`: Homepage with user creation/selection
  - `reading/page.tsx`: Main reading and reflection interface
- `components/`: Reusable UI components
  - `CommentarySkeleton.tsx`: Loading state for commentary sections
- `api/`: API routes
  - `verse/route.ts`: ESV API integration
  - `commentary/route.ts`: OpenAI commentary generation
  - `like/route.ts`: Like/unlike functionality
- `docs/`: Documentation
  - `reading-rule.md`: Detailed reading page specifications
  - `instructions.txt`: Design and implementation guidelines

## Key Improvements

### Reading Page

- Enhanced theme visualization with consistent styling
- Improved loading states with skeleton UI
- Structured "Reading it Right" methodology
- Better navigation and mobile responsiveness

### Commentary API

- Enhanced theme mapping and validation
- Improved OpenAI prompts for better results
- Better error handling and response formatting

### UI/UX

- Consistent dark mode design
- Improved card layouts and typography
- Better loading and error states
- Enhanced mobile experience

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

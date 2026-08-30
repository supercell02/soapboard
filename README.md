# SoapBoard

A real-time collaborative whiteboard application built with Next.js, Liveblocks, and Convex. SoapBoard enables teams to create, share, and collaborate on interactive boards with drawing tools, shapes, text, and notes.

## Project Overview

SoapBoard is a modern collaborative whiteboard platform that allows multiple users to work together in real-time on a shared canvas. Users can create boards, draw with various tools, add shapes and text, and see live cursor positions of other collaborators. The application features organization-based access control, board management, favorites, and comprehensive search functionality.

## Features

### Core Features

- **Real-time Collaboration**: Multiple users can work on the same board simultaneously with live cursor tracking and instant synchronization
- **Drawing Tools**:
  - Pencil tool for freehand drawing with pressure sensitivity
  - Rectangle and Ellipse shapes with customizable styling
  - Text layers with editable content
  - Note layers for annotations and comments
- **Layer Management**:
  - Support for up to 100 layers per board
  - Layer selection and manipulation
  - Resize handles for shapes with visual feedback
  - Multi-layer selection with selection net
- **Board Management**:
  - Create, delete, and rename boards
  - Favorite boards for quick access
  - Search boards by title
  - Organization-based board organization and isolation
- **User Experience**:
  - Undo/Redo functionality with full history
  - Color picker for customizing layers
  - Responsive design for desktop and tablet
  - Dark and light theme support
  - Toast notifications for user feedback

### Technical Features

- Real-time synchronization via Liveblocks WebSocket connections
- Authentication and authorization via Clerk
- Backend data persistence via Convex database
- Optimistic UI updates for responsive interactions
- Type-safe development with TypeScript
- React Compiler for automatic performance optimizations

## Tech Stack

### Frontend

- **Framework**: Next.js 16.1.0 with App Router
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI (Dialog, Dropdown, Avatar, Tooltip, Alert Dialog)
- **Icons**: Lucide React
- **State Management**: Zustand
- **Real-time Collaboration**: Liveblocks React SDK
- **Drawing**: perfect-freehand
- **Color Picker**: react-colorful
- **Notifications**: Sonner
- **Theming**: next-themes

### Backend and Services

- **Backend**: Convex (serverless backend platform)
- **Authentication**: Clerk
- **Real-time Synchronization**: Liveblocks
- **Database**: Convex integrated database

### Development Tools

- **Language**: TypeScript 5 with strict mode
- **Linting**: ESLint with Next.js configuration
- **Build Tool**: Next.js with Turbopack
- **Compiler**: React Compiler via babel-plugin-react-compiler

## Prerequisites

Before you begin, ensure you have the following installed and configured:

- Node.js 18 or higher
- npm, yarn, or pnpm package manager
- Clerk account for authentication
- Convex account for backend services
- Liveblocks account for real-time collaboration

## Installation and Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd soapboard
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Convex Backend
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Liveblocks Real-time Collaboration
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=your_liveblocks_public_key
LIVEBLOCKS_SECRET_KEY=your_liveblocks_secret_key
```

### Step 4: Set Up Clerk

1. Create an account at https://clerk.com
2. Create a new application in the Clerk dashboard
3. Configure a JWT template named "convex" for Convex integration
4. Copy your publishable key and secret key to `.env.local`
5. Update `convex/auth.config.ts` with your Clerk issuer domain

### Step 5: Set Up Convex

1. Create an account at https://convex.dev
2. Create a new project
3. Run the following command to initialize Convex:
   ```bash
   npx convex dev
   ```
4. Copy the Convex URL to `.env.local`
5. Deploy your schema:
   ```bash
   npx convex deploy
   ```

### Step 6: Set Up Liveblocks

1. Create an account at https://liveblocks.io
2. Create a new project
3. Copy your public key and secret key to `.env.local`
4. Configure the authentication endpoint in your Liveblocks dashboard

### Step 7: Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open http://localhost:3000 in your browser to access the application.

## Building and Deployment

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Deploy to Vercel

The recommended deployment platform is Vercel:

1. Push your code to GitHub
2. Import your repository in the Vercel dashboard
3. Add all environment variables in the Vercel dashboard
4. Deploy

Vercel will automatically detect Next.js and configure the build settings.

## Project Structure

```
soapboard/
├── app/                    # Next.js App Router pages and layouts
│   ├── (dashboard)/       # Dashboard route group
│   ├── (auth)/            # Authentication route group
│   ├── api/               # API routes and webhooks
│   ├── board/             # Board pages and components
│   └── layout.tsx         # Root layout component
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── board/            # Board-specific components
│   └── auth/             # Authentication components
├── convex/               # Convex backend functions and schema
│   ├── board.ts          # Board mutations and queries
│   ├── boards.ts         # Boards list and search operations
│   ├── auth.config.ts    # Authentication configuration
│   └── schema.ts         # Database schema definition
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and helpers
├── providers/            # React context providers
├── store/                # Zustand state management stores
├── types/                # TypeScript type definitions
├── public/               # Static assets
├── .env.local           # Environment variables (not in repository)
└── package.json         # Project dependencies
```

## Development Guide

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint to check code quality
- `npx convex dev` - Start Convex backend in development mode

### Code Style and Standards

- TypeScript strict mode is enabled for type safety
- ESLint configuration includes Next.js best practices
- React Compiler is enabled for automatic optimizations
- Path aliases are configured (`@/*` maps to project root)
- All code should follow the existing style patterns

### Adding New Features

**New Canvas Tools**:
- Add tool definitions to `types/canvas.ts`
- Implement tool handlers in `app/board/[boardId]/_components/Canvas.tsx`
- Add UI controls in the toolbar component

**New API Endpoints**:
- Create new routes in `app/api/` directory
- Follow existing error handling patterns
- Include proper request validation

**New Convex Functions**:
- Add mutations and queries to `convex/` directory
- Update `convex/schema.ts` if database schema changes are needed
- Test functions using Convex dashboard

**New UI Components**:
- Create new components in `components/` directory
- Use Radix UI for base components when appropriate
- Follow existing component structure and prop patterns

## Troubleshooting

### Authentication Not Working

- Verify Clerk keys are correctly set in `.env.local`
- Confirm that Clerk JWT template is properly configured for Convex
- Check that `convex/auth.config.ts` contains the correct issuer domain
- Review Clerk dashboard for any configuration errors

### Convex Connection Issues

- Verify `NEXT_PUBLIC_CONVEX_URL` is set correctly
- Run `npx convex dev` to ensure Convex is running
- Check the Convex dashboard for deployment status and errors
- Review browser console for network errors

### Liveblocks Synchronization Issues

- Verify Liveblocks keys are correctly set in `.env.local`
- Check that `/api/liveblocks-auth` route is accessible
- Ensure board exists in Convex before attempting access
- Review Liveblocks dashboard for room configuration

### Build Errors

- Clear the Next.js build cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npx tsc --noEmit`
- Review build logs for specific error messages

### Canvas Not Rendering

- Check browser console for JavaScript errors
- Verify Liveblocks room is properly initialized
- Ensure camera state is correctly set in canvas context
- Confirm browser supports required Canvas APIs

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add description of changes'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request with a clear description of the changes

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Credits

- Built with [Next.js](https://nextjs.org)
- Real-time collaboration powered by [Liveblocks](https://liveblocks.io)
- Authentication by [Clerk](https://clerk.com)
- Backend by [Convex](https://convex.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Drawing library: [perfect-freehand](https://github.com/steveruizok/perfect-freehand)

## Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.
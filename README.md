# SoapBoard

A real-time collaborative whiteboard application built with Next.js, Liveblocks, and Convex. SoapBoard enables teams to create, share, and collaborate on interactive boards with drawing tools, shapes, text, and notes.

## 🎯 Project Overview

SoapBoard is a modern, collaborative whiteboard platform that allows multiple users to work together in real-time. Users can create boards, draw with various tools, add shapes and text, and see live cursor positions of other collaborators. The application features organization-based access control, board management, favorites, and search functionality.

## ✨ Features

### Core Features
- **Real-time Collaboration**: Multiple users can work on the same board simultaneously with live cursor tracking
- **Drawing Tools**: 
  - Pencil tool for freehand drawing
  - Rectangle and Ellipse shapes
  - Text layers with editable content
  - Note layers for annotations
- **Layer Management**: 
  - Up to 100 layers per board
  - Layer selection and manipulation
  - Resize handles for shapes
  - Multi-layer selection with selection net
- **Board Management**:
  - Create, delete, and rename boards
  - Favorite boards for quick access
  - Search boards by title
  - Organization-based board organization
- **User Experience**:
  - Undo/Redo functionality
  - Color picker for layers
  - Responsive design
  - Dark/light theme support (via next-themes)
  - Toast notifications

### Technical Features
- Real-time synchronization via Liveblocks
- Authentication and authorization via Clerk
- Backend data persistence via Convex
- Optimistic UI updates
- React 19 with React Compiler
- TypeScript for type safety

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.1.0 (App Router)
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI (Dialog, Dropdown, Avatar, Tooltip, Alert Dialog)
- **Icons**: Lucide React
- **State Management**: Zustand
- **Real-time Collaboration**: Liveblocks React SDK
- **Drawing Library**: perfect-freehand
- **Color Picker**: react-colorful
- **Notifications**: Sonner

### Backend & Services
- **Backend**: Convex (serverless backend)
- **Authentication**: Clerk
- **Real-time Sync**: Liveblocks
- **Database**: Convex (built-in database)

### Development Tools
- **Language**: TypeScript 5
- **Linting**: ESLint with Next.js config
- **Build Tool**: Next.js (Turbopack)
- **React Compiler**: babel-plugin-react-compiler

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ and npm/yarn/pnpm
- A Clerk account (for authentication)
- A Convex account (for backend)
- A Liveblocks account (for real-time collaboration)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd soap-board
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Variables

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

### 4. Set Up Clerk

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application
3. Configure JWT template named "convex" for Convex integration
4. Copy your publishable key and secret key to `.env.local`
5. Update `convex/auth.config.ts` with your Clerk issuer domain

### 5. Set Up Convex

1. Create a Convex account at [convex.dev](https://convex.dev)
2. Create a new project
3. Run `npx convex dev` to initialize Convex
4. Copy the Convex URL to `.env.local`
5. Deploy your schema: `npx convex deploy`

### 6. Set Up Liveblocks

1. Create a Liveblocks account at [liveblocks.io](https://liveblocks.io)
2. Create a new project
3. Copy your public key and secret key to `.env.local`
4. Configure the authentication endpoint in your Liveblocks dashboard

### 7. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Build & Production

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Deploy to Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

Vercel will automatically detect Next.js and configure the build settings.

## 📁 Folder Structure

```
soap-board/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/       # Dashboard route group
│   ├── api/               # API routes
│   ├── board/             # Board pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   └── auth/             # Authentication components
├── convex/               # Convex backend functions
│   ├── board.ts          # Board mutations/queries
│   ├── boards.ts         # Boards list queries
│   └── schema.ts         # Database schema
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── providers/            # React context providers
├── store/                # Zustand stores
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

For detailed folder structure, see [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).

## 🔧 Development Guide

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript strict mode enabled
- ESLint with Next.js configuration
- React Compiler enabled for optimizations
- Path aliases configured (`@/*` maps to root)

### Adding New Features

1. **New Canvas Tools**: Add to `types/canvas.ts` and implement in `app/board/[boardId]/_components/`
2. **New API Endpoints**: Add to `app/api/` directory
3. **New Convex Functions**: Add to `convex/` directory
4. **New UI Components**: Add to `components/` directory

## 🐛 Troubleshooting

### Common Issues

#### 1. Authentication Not Working
- Verify Clerk keys are correct in `.env.local`
- Check that Clerk JWT template is configured for Convex
- Ensure `convex/auth.config.ts` has correct issuer domain

#### 2. Convex Connection Issues
- Verify `NEXT_PUBLIC_CONVEX_URL` is set correctly
- Run `npx convex dev` to ensure Convex is running
- Check Convex dashboard for deployment status

#### 3. Liveblocks Not Syncing
- Verify Liveblocks keys are correct
- Check that `/api/liveblocks-auth` route is accessible
- Ensure board exists in Convex before accessing

#### 4. Build Errors
- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`

#### 5. Canvas Not Rendering
- Check browser console for errors
- Verify Liveblocks room is properly initialized
- Ensure camera state is correctly set

## 📚 Additional Documentation

- [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) - High-level architecture overview
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Detailed folder structure
- [WORKFLOW.md](./WORKFLOW.md) - End-to-end application workflow
- [API_DOCS.md](./API_DOCS.md) - API endpoints and Convex functions
- [SECURITY_NOTES.md](./SECURITY_NOTES.md) - Security and authentication
- [PERFORMANCE_NOTES.md](./PERFORMANCE_NOTES.md) - Performance optimization
- [DB_SCHEMA.md](./DB_SCHEMA.md) - Database schema documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🙏 Credits

- Built with [Next.js](https://nextjs.org)
- Real-time collaboration powered by [Liveblocks](https://liveblocks.io)
- Authentication by [Clerk](https://clerk.com)
- Backend by [Convex](https://convex.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Drawing library: [perfect-freehand](https://github.com/steveruizok/perfect-freehand)

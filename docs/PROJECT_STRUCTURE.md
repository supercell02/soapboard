# Project Structure

This document provides a detailed explanation of the SoapBoard project's folder structure and the responsibilities of each directory and key file.

## Root Directory

```
soap-board/
├── app/                    # Next.js App Router application
├── components/             # Reusable React components
├── convex/                 # Convex backend functions and schema
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and helpers
├── providers/              # React context providers
├── store/                  # Zustand state stores
├── types/                  # TypeScript type definitions
├── public/                 # Static assets
├── .next/                  # Next.js build output (generated)
├── node_modules/           # Dependencies (generated)
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── next.config.ts          # Next.js configuration
├── liveblocks.config.ts    # Liveblocks type definitions
├── components.json         # shadcn/ui configuration
├── postcss.config.mjs      # PostCSS configuration
├── eslint.config.mjs       # ESLint configuration
├── proxy.ts                # Clerk middleware for route protection
└── README.md               # Project documentation
```

## Directory Details

### `/app` - Next.js App Router

The main application directory using Next.js App Router conventions.

```
app/
├── (dashboard)/            # Route group (doesn't affect URL)
│   ├── _components/        # Dashboard-specific components
│   │   ├── board-card/     # Board card component
│   │   ├── board-list.tsx  # List of boards
│   │   ├── empty-*.tsx     # Empty state components
│   │   ├── navbar.tsx      # Navigation bar
│   │   ├── org-sidebar.tsx # Organization sidebar
│   │   ├── search-input.tsx # Search functionality
│   │   └── sidebar/        # Sidebar components
│   ├── layout.tsx          # Dashboard layout
│   └── page.tsx            # Dashboard home page
├── api/                    # API routes
│   └── liveblocks-auth/    # Liveblocks authentication endpoint
│       └── route.ts        # POST handler for Liveblocks auth
├── board/                  # Board pages
│   └── [boardId]/          # Dynamic route for board ID
│       ├── _components/    # Board-specific components
│       │   ├── canvas.tsx  # Main canvas component
│       │   ├── toolbar.tsx # Drawing tools toolbar
│       │   ├── selection-box.tsx # Selection handles
│       │   ├── layer-preview.tsx # Layer rendering
│       │   ├── cursor-presence.tsx # Other users' cursors
│       │   ├── participants.tsx # Active users list
│       │   ├── info.tsx    # Board info panel
│       │   ├── path.tsx    # Path/drawing layer
│       │   ├── rectangle.tsx # Rectangle layer
│       │   ├── ellipse.tsx # Ellipse layer
│       │   ├── text.tsx    # Text layer
│       │   ├── note.tsx    # Note layer
│       │   └── *.tsx       # Other canvas components
│       ├── page.tsx        # Board page component
│       └── loading.tsx     # Loading state
├── layout.tsx              # Root layout (wraps all pages)
├── globals.css             # Global styles
└── favicon.ico             # Site favicon
```

**Key Files**:
- `app/layout.tsx`: Root layout with ClerkProvider, ConvexProvider, and global providers
- `app/(dashboard)/page.tsx`: Main dashboard showing board list
- `app/board/[boardId]/page.tsx`: Individual board canvas page
- `app/api/liveblocks-auth/route.ts`: Authentication endpoint for Liveblocks

### `/components` - Reusable Components

Shared React components used across the application.

```
components/
├── ui/                     # shadcn/ui components
│   ├── button.tsx          # Button component
│   ├── dialog.tsx          # Dialog/modal component
│   ├── dropdown-menu.tsx   # Dropdown menu
│   ├── avatar.tsx          # User avatar
│   ├── tooltip.tsx         # Tooltip component
│   ├── alert-dialog.tsx    # Alert dialog
│   ├── input.tsx           # Input field
│   ├── skeleton.tsx        # Loading skeleton
│   └── sonner.tsx          # Toast notification setup
├── auth/                   # Authentication components
│   └── loading.tsx         # Auth loading state
├── room.tsx                # Liveblocks room provider wrapper
├── actions.tsx             # Server actions (if any)
├── confirm-model.tsx       # Confirmation modal
└── hint.tsx                # Hint/tooltip helper
```

**Responsibilities**:
- UI primitives from shadcn/ui
- Authentication-related components
- Shared utility components
- Liveblocks room setup

### `/convex` - Backend Functions

Convex serverless backend functions, schema, and configuration.

```
convex/
├── _generated/             # Auto-generated Convex files
│   ├── api.d.ts            # TypeScript API types
│   ├── api.js              # Runtime API
│   ├── dataModel.d.ts      # Database schema types
│   └── server.d.ts         # Server types
├── schema.ts               # Database schema definition
├── auth.config.ts         # Clerk authentication configuration
├── boards.ts               # Board list queries and mutations
├── board.ts                # Individual board operations
├── tsconfig.json           # TypeScript config for Convex
└── README.md               # Convex-specific docs
```

**Key Files**:
- `convex/schema.ts`: Defines `boards` and `userFavorites` tables with indexes
- `convex/boards.ts`: Queries for board lists (with search, favorites filtering)
- `convex/board.ts`: CRUD operations for individual boards (create, update, delete, favorite)
- `convex/auth.config.ts`: Clerk JWT issuer configuration for Convex

**Function Types**:
- **Queries**: Read operations (reactive, auto-updating)
- **Mutations**: Write operations (optimistic updates)

### `/hooks` - Custom React Hooks

Reusable React hooks for common functionality.

```
hooks/
├── use-selection-bounds.ts    # Calculate selection box bounds
├── use-delete-layers.ts       # Delete selected layers
├── use-disable-scroll-bounce.ts # Prevent scroll bounce
└── use-api-mutation.ts        # Wrapper for Convex mutations
```

**Purpose**:
- Encapsulate reusable logic
- Simplify component code
- Provide consistent patterns

### `/lib` - Utility Functions

Shared utility functions and helpers.

```
lib/
└── utils.ts                  # Utility functions
    ├── cn()                  # Class name merger (clsx + tailwind-merge)
    ├── connectionIdToColor() # Map connection ID to color
    ├── pointerEventToCanvasPoint() # Convert pointer to canvas coordinates
    ├── colorToCss()          # Convert Color object to CSS hex
    ├── resizeBounds()        # Calculate resize bounds
    ├── findIntersectingLayersWithRectangle() # Layer intersection detection
    ├── getConstrastingTextColor() # Calculate text color contrast
    ├── penPointsToPathLayer() # Convert pen points to PathLayer
    └── getSvgPathFromStroke() # Generate SVG path from stroke
```

**Purpose**:
- Pure functions (no side effects)
- Canvas manipulation utilities
- Color and geometry calculations
- Type conversions

### `/providers` - React Context Providers

React context providers for global state and services.

```
providers/
├── convex-client-provider.tsx  # Convex client with Clerk integration
└── modal-provider.tsx          # Modal state management
```

**Key Files**:
- `convex-client-provider.tsx`: Sets up Convex client with Clerk authentication
- `modal-provider.tsx`: Manages modal state (rename, etc.)

### `/store` - Zustand Stores

Zustand state management stores.

```
store/
└── use-rename-modal.ts         # Rename modal state store
```

**Purpose**:
- Global UI state management
- Modal visibility and data
- Simple, lightweight state

### `/types` - TypeScript Definitions

TypeScript type definitions and interfaces.

```
types/
└── canvas.ts                   # Canvas-related types
    ├── Color                   # RGB color type
    ├── Camera                  # Camera position
    ├── LayerType               # Enum of layer types
    ├── RectangleLayer          # Rectangle layer type
    ├── EllipseLayer            # Ellipse layer type
    ├── PathLayer               # Drawing path layer type
    ├── TextLayer               # Text layer type
    ├── NoteLayer               # Note layer type
    ├── Point                   # 2D point
    ├── XYWH                    # Bounding box
    ├── Side                    # Resize handle side enum
    ├── CanvasState             # Canvas mode state union
    ├── CanvasMode              # Canvas mode enum
    └── Layer                   # Union of all layer types
```

**Purpose**:
- Type safety across the application
- Shared type definitions
- Canvas domain modeling

### `/public` - Static Assets

Static files served directly by Next.js.

```
public/
└── placeholders/              # Board placeholder images
    ├── 1.svg
    ├── 2.svg
    └── ... (10 total)
```

**Usage**:
- Images referenced directly via URL
- No processing by Next.js
- Served from root path

## Configuration Files

### Root Level Config Files

**`package.json`**
- Dependencies and dev dependencies
- npm scripts (dev, build, start, lint)
- Project metadata

**`tsconfig.json`**
- TypeScript compiler options
- Path aliases (`@/*` → root)
- Include/exclude patterns
- React and Next.js settings

**`next.config.ts`**
- Next.js configuration
- Image domains (Clerk images)
- React Compiler enabled

**`liveblocks.config.ts`**
- Liveblocks TypeScript type definitions
- Presence, Storage, UserMeta, RoomEvent types
- Global type augmentation

**`components.json`**
- shadcn/ui configuration
- Component paths and aliases
- Tailwind CSS integration

**`postcss.config.mjs`**
- PostCSS plugins
- Tailwind CSS processing

**`eslint.config.mjs`**
- ESLint configuration
- Next.js ESLint rules

**`proxy.ts`**
- Clerk middleware
- Route protection
- Public route configuration

## File Naming Conventions

### Components
- **PascalCase**: `ComponentName.tsx`
- **Client components**: `"use client"` directive at top
- **Server components**: No directive (default)

### Utilities
- **camelCase**: `utilityFunction.ts`
- **kebab-case**: For some utility files

### Types
- **camelCase**: `types.ts` or descriptive names
- **PascalCase**: Type names

### Routes
- **App Router**: Folder-based routing
- **Dynamic routes**: `[param]` folders
- **Route groups**: `(group)` folders (don't affect URL)

## Import Patterns

### Path Aliases
- `@/components` → `components/`
- `@/lib` → `lib/`
- `@/hooks` → `hooks/`
- `@/types` → `types/`
- `@/convex` → `convex/`

### Common Imports
```typescript
// Components
import { Component } from "@/components/component"

// Utilities
import { utility } from "@/lib/utils"

// Types
import { Type } from "@/types/canvas"

// Hooks
import { useHook } from "@/hooks/use-hook"

// Convex
import { api } from "@/convex/_generated/api"
```

## Build Output

### `.next/` Directory
- Generated by Next.js build process
- Contains compiled pages, API routes, and assets
- Should not be committed to git

### `node_modules/`
- npm dependencies
- Should not be committed to git

## Environment Files

### `.env.local` (not in repo)
Required environment variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY`
- `LIVEBLOCKS_SECRET_KEY`

## Best Practices

1. **Component Organization**: Group related components in folders
2. **Type Safety**: Use TypeScript types from `/types`
3. **Reusability**: Extract common logic to `/hooks` or `/lib`
4. **Server vs Client**: Use server components by default, client when needed
5. **Path Aliases**: Always use `@/` prefix for imports
6. **Naming**: Follow conventions for files and components


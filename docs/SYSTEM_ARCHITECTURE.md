# System Architecture

## Overview

SoapBoard is a real-time collaborative whiteboard application built on a modern serverless architecture. The system is designed to handle multiple concurrent users working on shared boards with low latency and high reliability.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Next.js    │  │    React     │  │   Liveblocks │       │
│  │  App Router  │  │     19       │  │   React SDK  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/WSS
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
│     Clerk      │  │   Liveblocks   │  │     Convex     │
│ Authentication │  │  Real-time Sync│  │   Backend/DB   │
└────────────────┘  └────────────────┘  └────────────────┘
```

## Architecture Layers

### 1. Frontend Layer (Next.js App Router)

**Technology**: Next.js 16.1.0 with App Router

**Responsibilities**:
- Server-side rendering and static generation
- Client-side routing and navigation
- UI rendering and state management
- API route handlers for authentication

**Key Components**:
- **App Router**: File-based routing system
- **Server Components**: Initial page rendering
- **Client Components**: Interactive UI elements
- **API Routes**: Authentication endpoints

**Entry Points**:
- `app/layout.tsx` - Root layout with providers
- `app/(dashboard)/page.tsx` - Dashboard page
- `app/board/[boardId]/page.tsx` - Board canvas page

### 2. Real-Time Collaboration Layer (Liveblocks)

**Technology**: Liveblocks React SDK

**Responsibilities**:
- Real-time state synchronization
- Presence management (cursors, selections)
- Conflict resolution
- WebSocket connections

**Data Structures**:
- **Presence**: User cursor, selection, pencil draft, pen color
- **Storage**: Layers map and layer IDs list
- **Events**: Custom room events (currently empty but extensible)

**Key Components**:
- `components/room.tsx` - Liveblocks room provider
- `app/api/liveblocks-auth/route.ts` - Authentication endpoint
- `liveblocks.config.ts` - Type definitions

**Flow**:
1. Client requests Liveblocks session via `/api/liveblocks-auth`
2. Server validates with Clerk and Convex
3. Liveblocks creates WebSocket connection
4. Changes sync in real-time across all clients

### 3. Authentication Layer (Clerk)

**Technology**: Clerk Next.js SDK

**Responsibilities**:
- User authentication (sign-in, sign-up)
- Session management
- Organization management
- JWT token generation for Convex

**Configuration**:
- JWT template named "convex" for backend authentication
- Organization-based access control
- Protected routes via middleware

**Integration Points**:
- `app/layout.tsx` - ClerkProvider wrapper
- `providers/convex-client-provider.tsx` - Convex-Clerk integration
- `convex/auth.config.ts` - Convex authentication config
- `proxy.ts` - Route protection middleware

### 4. Backend Layer (Convex)

**Technology**: Convex Serverless Backend

**Responsibilities**:
- Database operations (boards, favorites)
- Business logic (queries, mutations)
- Authentication validation
- Data persistence

**Database Schema**:
- `boards` table: Board metadata
- `userFavorites` table: User-board favorite relationships

**Key Functions**:
- `convex/boards.ts` - Board list queries with search/favorites
- `convex/board.ts` - Individual board CRUD operations

**Query/Mutation Pattern**:
- Queries: Read operations (reactive, auto-updating)
- Mutations: Write operations (optimistic updates)

### 5. State Management

**Client-Side State**:
- **Zustand**: Global UI state (modals, etc.)
- **React State**: Component-local state (canvas mode, camera)
- **Liveblocks Storage**: Shared board state (layers)
- **Liveblocks Presence**: User presence (cursors, selections)

**State Flow**:
```
User Action → React Component → Liveblocks Mutation → 
Liveblocks Storage → Real-time Sync → All Clients Update
```

## Data Flow

### Board Creation Flow

```
1. User clicks "New Board" button
   ↓
2. Client calls Convex mutation: boards.create()
   ↓
3. Convex validates authentication
   ↓
4. Convex creates board record in database
   ↓
5. Client navigates to /board/[boardId]
   ↓
6. Board page initializes Liveblocks room
   ↓
7. Liveblocks connects and syncs state
```

### Drawing Flow

```
1. User draws on canvas
   ↓
2. Canvas component captures pointer events
   ↓
3. Updates local state (pencilDraft in presence)
   ↓
4. On pointer up, creates PathLayer via mutation
   ↓
5. Liveblocks mutation updates storage
   ↓
6. Change broadcasts to all connected clients
   ↓
7. All clients re-render with new layer
```

### Selection Flow

```
1. User clicks/drags on canvas
   ↓
2. Canvas detects layer intersection
   ↓
3. Updates presence.selection array
   ↓
4. SelectionBox component renders handles
   ↓
5. Other users see selection via presence
   ↓
6. User can resize/move selected layers
```

## Module Dependencies

### Core Dependencies

```
Next.js
  ├── React 19
  ├── TypeScript
  └── Tailwind CSS
      │
      ├── Clerk (Auth)
      │   └── Convex (Backend Auth)
      │
      ├── Liveblocks (Real-time)
      │   └── Clerk (Auth Validation)
      │
      └── Convex (Backend)
          └── Clerk (Auth)
```

### Component Dependencies

```
Canvas Component
  ├── Liveblocks (Storage, Presence, Mutations)
  ├── Toolbar Component
  ├── SelectionBox Component
  ├── LayerPreview Components
  ├── CursorPresence Component
  └── SelectionTools Component
```

## Communication Patterns

### 1. Client-Server (Convex)
- **Protocol**: HTTP/HTTPS
- **Pattern**: Query/Mutation
- **Type**: Request-Response
- **Latency**: ~100-300ms

### 2. Client-Client (Liveblocks)
- **Protocol**: WebSocket (WSS)
- **Pattern**: Pub/Sub
- **Type**: Real-time bidirectional
- **Latency**: ~16-50ms (throttled at 16ms)

### 3. Authentication Flow
- **Protocol**: HTTPS
- **Pattern**: JWT tokens
- **Type**: Stateless
- **Validation**: Server-side on each request

## Scalability Considerations

### Current Architecture Supports:
- **Concurrent Users**: Limited by Liveblocks plan
- **Boards**: Unlimited (Convex scales automatically)
- **Layers per Board**: 100 (configurable in code)
- **Real-time Updates**: Optimized with 16ms throttling

### Bottlenecks:
1. **Liveblocks Connection Limits**: Based on subscription plan
2. **Layer Count**: Fixed at 100 per board
3. **WebSocket Connections**: One per user per board

### Scaling Strategies:
- Horizontal scaling: Next.js on Vercel (automatic)
- Database scaling: Convex handles automatically
- Real-time scaling: Liveblocks handles automatically
- CDN: Vercel Edge Network for static assets

## Security Architecture

### Authentication Flow
1. User authenticates with Clerk
2. Clerk issues JWT token
3. Token validated on:
   - Convex queries/mutations
   - Liveblocks session creation
   - API route handlers

### Authorization
- Organization-based: Users can only access boards in their organization
- Board-level: Currently permissive (commented check in liveblocks-auth)
- User-level: Favorites are user-specific

### Data Isolation
- Boards scoped by `orgId`
- User favorites scoped by `userId`
- Liveblocks rooms isolated by `boardId`

## Error Handling

### Client-Side
- React Error Boundaries (implicit via Next.js)
- Toast notifications for user-facing errors
- Console logging for debugging

### Server-Side
- Convex: Throws errors, caught by client
- Liveblocks: Connection errors handled by SDK
- Clerk: Authentication errors redirect to sign-in

## Performance Optimizations

### Current Optimizations:
1. **React Compiler**: Enabled for automatic optimizations
2. **Throttling**: Liveblocks presence updates at 16ms
3. **Memoization**: SelectionBox and other components memoized
4. **Code Splitting**: Next.js automatic code splitting
5. **Image Optimization**: Next.js Image component

### Future Optimization Opportunities:
- Virtual scrolling for large layer lists
- Canvas rendering optimization (requestAnimationFrame)
- Layer batching for bulk operations
- IndexedDB caching for offline support

## Deployment Architecture

### Production Stack:
- **Frontend**: Vercel (Next.js hosting)
- **Backend**: Convex (serverless functions)
- **Real-time**: Liveblocks (managed service)
- **Auth**: Clerk (managed service)
- **Database**: Convex (built-in)

### Environment Separation:
- Development: Local with `npm run dev`
- Production: Vercel deployment
- Convex: Separate dev/prod deployments

## Monitoring & Observability

### Current State:
- Console logging for debugging
- No formal monitoring setup

### Recommended Additions:
- Error tracking (Sentry, LogRocket)
- Analytics (Vercel Analytics)
- Performance monitoring (Web Vitals)
- User activity tracking

## Extension Points

### Adding New Layer Types:
1. Add type to `types/canvas.ts`
2. Create component in `app/board/[boardId]/_components/`
3. Add rendering logic to `layer-preview.tsx`
4. Update toolbar with new tool button

### Adding New Features:
1. **Backend**: Add Convex functions
2. **Frontend**: Add React components
3. **Real-time**: Extend Liveblocks storage/presence types
4. **Auth**: Update Clerk configuration if needed


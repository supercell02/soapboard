# API Documentation

This document describes all API endpoints and Convex functions available in SoapBoard.

## API Routes

### Liveblocks Authentication

**Endpoint**: `POST /api/liveblocks-auth`

**Purpose**: Authenticates users for Liveblocks real-time collaboration sessions.

**Request**:
```typescript
{
  room: string  // Board ID (Convex document ID)
}
```

**Response**:
- **200 OK**: Liveblocks session body (authorization response)
- **403 Unauthorized**: User not authenticated or board access denied

**Flow**:
1. Validates Clerk authentication
2. Fetches user info from Clerk
3. Queries Convex to verify board exists
4. Creates Liveblocks session with user info
5. Authorizes room access
6. Returns session authorization

**Code Location**: `app/api/liveblocks-auth/route.ts`

**Example**:
```typescript
const response = await fetch('/api/liveblocks-auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ room: 'board-id' })
});
```

**Security**:
- Requires valid Clerk session
- Board existence verified via Convex
- Organization check currently commented out (should be enabled in production)

## Convex Functions

Convex functions are serverless backend functions that handle database operations and business logic. They are called from the client using the Convex React SDK.

### Board Operations

#### `board.create`

**Type**: Mutation

**Purpose**: Creates a new board in the database.

**Parameters**:
```typescript
{
  orgId: string,    // Organization ID from Clerk
  title: string     // Board title
}
```

**Returns**: `Id<"boards">` - The ID of the created board

**Behavior**:
- Validates user authentication
- Generates random placeholder image from predefined set
- Sets `authorId` from authenticated user's subject
- Sets `authorName` from authenticated user's name
- Creates board record in `boards` table

**Example**:
```typescript
const boardId = await convex.mutation(api.board.create, {
  orgId: "org_123",
  title: "My New Board"
});
```

**Code Location**: `convex/board.ts`

---

#### `board.update`

**Type**: Mutation

**Purpose**: Updates a board's title.

**Parameters**:
```typescript
{
  id: Id<"boards">,  // Board ID
  title: string      // New title
}
```

**Returns**: Updated board object

**Validation**:
- User must be authenticated
- Title must be non-empty (after trim)
- Title must be ≤ 60 characters

**Example**:
```typescript
await convex.mutation(api.board.update, {
  id: boardId,
  title: "Updated Title"
});
```

**Code Location**: `convex/board.ts`

---

#### `board.remove`

**Type**: Mutation

**Purpose**: Deletes a board and its associated favorites.

**Parameters**:
```typescript
{
  id: Id<"boards">  // Board ID to delete
}
```

**Returns**: `void`

**Behavior**:
- Validates user authentication
- Deletes all `userFavorites` records for this board
- Deletes the board record

**Example**:
```typescript
await convex.mutation(api.board.remove, {
  id: boardId
});
```

**Code Location**: `convex/board.ts`

---

#### `board.get`

**Type**: Query

**Purpose**: Fetches a single board by ID.

**Parameters**:
```typescript
{
  id: Id<"boards">  // Board ID
}
```

**Returns**: Board object or `null`

**Example**:
```typescript
const board = await convex.query(api.board.get, {
  id: boardId
});
```

**Code Location**: `convex/board.ts`

---

#### `board.favorite`

**Type**: Mutation

**Purpose**: Adds a board to user's favorites.

**Parameters**:
```typescript
{
  id: Id<"boards">,  // Board ID
  orgId: string      // Organization ID
}
```

**Returns**: Board object

**Validation**:
- User must be authenticated
- Board must exist
- Board must not already be favorited by user

**Error**: Throws "Board already favorited" if duplicate

**Example**:
```typescript
await convex.mutation(api.board.favorite, {
  id: boardId,
  orgId: "org_123"
});
```

**Code Location**: `convex/board.ts`

---

#### `board.unfavorite`

**Type**: Mutation

**Purpose**: Removes a board from user's favorites.

**Parameters**:
```typescript
{
  id: Id<"boards">  // Board ID
}
```

**Returns**: Board object

**Validation**:
- User must be authenticated
- Board must exist
- Favorite record must exist

**Error**: Throws "Favorited board not found" if not favorited

**Example**:
```typescript
await convex.mutation(api.board.unfavorite, {
  id: boardId
});
```

**Code Location**: `convex/board.ts`

---

### Board List Operations

#### `boards.get`

**Type**: Query

**Purpose**: Fetches a list of boards for an organization with optional filtering.

**Parameters**:
```typescript
{
  orgId: string,              // Organization ID (required)
  search?: string,            // Search query for title (optional)
  favorites?: string          // If "true", returns only favorited boards (optional)
}
```

**Returns**: Array of board objects with `isFavorite` boolean

**Behavior**:
- If `favorites` is provided:
  - Queries `userFavorites` table for user's favorites in org
  - Fetches corresponding boards
  - Returns with `isFavorite: true`
- If `search` is provided:
  - Uses search index `search_title` to find matching titles
  - Filters by `orgId`
- Otherwise:
  - Queries all boards in organization
  - Orders by creation date (descending)
- For each board, checks if user has favorited it
- Returns boards with `isFavorite` flag

**Example**:
```typescript
// Get all boards
const boards = await convex.query(api.boards.get, {
  orgId: "org_123"
});

// Search boards
const boards = await convex.query(api.boards.get, {
  orgId: "org_123",
  search: "design"
});

// Get favorites
const boards = await convex.query(api.boards.get, {
  orgId: "org_123",
  favorites: "true"
});
```

**Code Location**: `convex/boards.ts`

---

## Liveblocks Mutations

Liveblocks mutations are client-side functions that update shared state in real-time. They are defined inline in React components using the `useMutation` hook.

### Canvas Mutations

#### `insertLayer`

**Purpose**: Creates a new layer on the canvas.

**Parameters**:
```typescript
layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Text | LayerType.Note
position: Point  // { x: number, y: number }
```

**Behavior**:
- Validates layer count (< 100)
- Generates unique layer ID (nanoid)
- Creates LiveObject with layer data
- Adds to `layers` LiveMap
- Adds ID to `layerIds` LiveList
- Updates presence selection to new layer

**Code Location**: `app/board/[boardId]/_components/canvas.tsx`

---

#### `insertPathLayer`

**Purpose**: Creates a path layer from pencil draft points.

**Parameters**:
```typescript
points: number[][]  // Array of [x, y, pressure] tuples
color: Color        // { r: number, g: number, b: number }
```

**Behavior**:
- Converts points to PathLayer using `penPointsToPathLayer()`
- Calculates bounding box from points
- Creates LiveObject with PathLayer
- Adds to storage
- Clears pencilDraft from presence

**Code Location**: `app/board/[boardId]/_components/canvas.tsx`

---

#### `updateLayer`

**Purpose**: Updates layer properties (position, size, color, value).

**Parameters**:
```typescript
id: string
updates: Partial<Layer>  // Properties to update
```

**Behavior**:
- Gets layer from storage
- Updates LiveObject with new properties
- Change syncs to all clients

**Code Location**: `app/board/[boardId]/_components/canvas.tsx`

---

#### `deleteLayer`

**Purpose**: Deletes a layer from the canvas.

**Parameters**:
```typescript
id: string  // Layer ID
```

**Behavior**:
- Removes layer from `layers` LiveMap
- Removes ID from `layerIds` LiveList
- Updates presence selection (removes deleted layer)

**Code Location**: `app/board/[boardId]/_components/canvas.tsx`

---

#### `setCanvasMode`

**Purpose**: Updates canvas interaction mode.

**Parameters**:
```typescript
newMode: CanvasState  // New canvas state
```

**Behavior**:
- Updates local React state
- Affects how canvas handles pointer events

**Code Location**: `app/board/[boardId]/_components/canvas.tsx`

---

## Using Convex Functions

### From React Components

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Query (reactive, auto-updates)
const boards = useQuery(api.boards.get, {
  orgId: organization.id,
  search: searchQuery
});

// Mutation (returns promise)
const createBoard = useMutation(api.board.create);
await createBoard({ orgId: orgId, title: "New Board" });
```

### From Server Components

```typescript
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const board = await convex.query(api.board.get, { id: boardId });
```

## Using Liveblocks Mutations

```typescript
import { useMutation } from "@liveblocks/react";

const insertLayer = useMutation(({ storage, setMyPresence }, layerType, position) => {
  // Mutation logic
});

// Call mutation
insertLayer(LayerType.Rectangle, { x: 100, y: 100 });
```

## Error Handling

### Convex Errors

Convex functions throw errors that can be caught:

```typescript
try {
  await createBoard({ orgId, title });
} catch (error) {
  if (error.message === "Unauthorized") {
    // Handle auth error
  } else if (error.message === "Title is required") {
    // Handle validation error
  }
}
```

### Liveblocks Errors

Liveblocks mutations can fail silently or throw. Check return values:

```typescript
const result = insertLayer(...);
if (!result) {
  // Mutation failed (e.g., layer limit reached)
}
```

## Rate Limiting

- **Convex**: Rate limits based on plan (free tier has limits)
- **Liveblocks**: Rate limits based on subscription plan
- **Clerk**: Rate limits based on plan

## Authentication

All Convex functions require authentication. The authentication is handled automatically via Clerk integration:

1. User authenticates with Clerk
2. Clerk issues JWT token
3. Convex SDK attaches token to requests
4. Convex validates token via `auth.config.ts`
5. Functions can access user via `ctx.auth.getUserIdentity()`

## Type Safety

All functions are fully typed:

```typescript
// Convex functions
import { api } from "@/convex/_generated/api";
// api.board.create is typed with parameters and return type

// Liveblocks
// Types defined in liveblocks.config.ts
// Presence, Storage, etc. are typed
```

## Best Practices

1. **Use queries for reads**: Queries are reactive and auto-update
2. **Use mutations for writes**: Mutations handle optimistic updates
3. **Handle errors**: Always wrap mutations in try-catch
4. **Validate input**: Convex functions should validate parameters
5. **Check authentication**: All functions should verify user identity
6. **Optimistic updates**: Liveblocks handles this automatically
7. **Type everything**: Use TypeScript types for all parameters


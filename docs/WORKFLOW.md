# Application Workflow

This document describes the end-to-end workflows and user journeys in SoapBoard, from authentication to collaborative board editing.

## Authentication Flow

### 1. Initial Access

```
User visits application
    ↓
Clerk middleware checks authentication (proxy.ts)
    ↓
If not authenticated → Redirect to /sign-in
    ↓
User signs in with Clerk
    ↓
Clerk issues JWT token
    ↓
Token stored in session
    ↓
User redirected to dashboard
```

### 2. Session Management

```
Every request:
    ↓
Clerk middleware validates token
    ↓
Token attached to Convex queries/mutations
    ↓
Convex validates token via auth.config.ts
    ↓
Request proceeds if valid
```

## Dashboard Workflow

### 1. Dashboard Load

```
User navigates to dashboard (/)
    ↓
Dashboard page component loads
    ↓
Clerk useOrganization() hook fetches org
    ↓
If no organization → Show EmptyOrg component
    ↓
If organization exists → Show BoardList
    ↓
BoardList queries Convex: boards.get()
    ↓
Query includes:
  - orgId (from organization)
  - search (from URL params, optional)
  - favorites (from URL params, optional)
    ↓
Convex returns boards with isFavorite flag
    ↓
Boards rendered as BoardCard components
```

### 2. Board Creation

```
User clicks "New Board" button
    ↓
NewBoardButton component opens dialog
    ↓
User enters board title
    ↓
Client calls Convex mutation: board.create()
    ↓
Mutation parameters:
  - orgId (from organization)
  - title (from input)
    ↓
Convex validates:
  - User is authenticated
  - orgId is valid
    ↓
Convex creates board record:
  - Generates random placeholder image
  - Sets authorId from token
  - Sets authorName from token
    ↓
Returns new board ID
    ↓
Client navigates to /board/[boardId]
```

### 3. Board Search

```
User types in search input
    ↓
SearchInput component updates URL params
    ↓
URL: /?search=query
    ↓
Dashboard page reads search param
    ↓
BoardList queries Convex with search parameter
    ↓
Convex uses search index: search_title
    ↓
Returns matching boards filtered by orgId
    ↓
BoardList re-renders with filtered results
```

### 4. Favorites

```
User clicks favorite icon on board card
    ↓
Client calls Convex mutation: board.favorite()
    ↓
Mutation parameters:
  - id (board ID)
  - orgId (from organization)
    ↓
Convex validates:
  - User is authenticated
  - Board exists
  - Not already favorited
    ↓
Convex creates userFavorites record
    ↓
Board card updates to show favorited state
    ↓
User navigates to /?favorites=true
    ↓
BoardList queries only favorited boards
```

## Board Canvas Workflow

### 1. Board Page Load

```
User navigates to /board/[boardId]
    ↓
Board page component loads
    ↓
Room component initializes Liveblocks:
  - roomId = boardId
  - Initial presence: { cursor: null, selection: [], ... }
  - Initial storage: { layers: LiveMap, layerIds: LiveList }
    ↓
Room component calls /api/liveblocks-auth
    ↓
API route:
  1. Validates Clerk authentication
  2. Fetches board from Convex
  3. Creates Liveblocks session
  4. Authorizes room access
    ↓
Liveblocks WebSocket connection established
    ↓
Canvas component mounts
    ↓
Canvas subscribes to:
  - layerIds (from storage)
  - layers (from storage)
  - others (presence)
  - self (presence)
    ↓
Canvas renders with current state
```

### 2. Drawing with Pencil Tool

```
User selects pencil tool from toolbar
    ↓
Canvas state updates: mode = CanvasMode.Pencil
    ↓
User presses pointer down on canvas
    ↓
Canvas captures pointer event
    ↓
Converts to canvas coordinates (accounting for camera)
    ↓
Updates presence.pencilDraft with point [x, y, pressure]
    ↓
User moves pointer
    ↓
Canvas continues updating pencilDraft array
    ↓
Other users see draft via presence (real-time)
    ↓
User releases pointer
    ↓
Canvas calls insertPathLayer mutation
    ↓
Mutation:
  1. Validates layer count (< 100)
  2. Converts pencilDraft to PathLayer
  3. Calculates bounds from points
  4. Creates LiveObject with PathLayer
  5. Adds to layers map
  6. Adds ID to layerIds list
    ↓
Presence.pencilDraft cleared
    ↓
Change syncs to all clients via Liveblocks
    ↓
All clients re-render with new path layer
```

### 3. Inserting Shapes (Rectangle/Ellipse)

```
User selects rectangle/ellipse tool
    ↓
Canvas state: mode = CanvasMode.Inserting, layerType = Rectangle/Ellipse
    ↓
User clicks on canvas
    ↓
Canvas calculates position (accounting for camera)
    ↓
Calls insertLayer mutation
    ↓
Mutation:
  1. Validates layer count
  2. Creates LiveObject with layer type
  3. Sets initial position and size
  4. Sets default fill color
  5. Adds to layers map and layerIds
    ↓
Change syncs to all clients
    ↓
Shape appears on all canvases
```

### 4. Selecting Layers

```
User clicks on canvas
    ↓
Canvas detects click position
    ↓
Finds intersecting layer (topmost)
    ↓
Updates presence.selection = [layerId]
    ↓
SelectionBox component renders:
  - Selection rectangle around layer
  - Resize handles (if not Path layer)
    ↓
Other users see selection via presence
    ↓
User can:
  - Move layer (drag)
  - Resize layer (drag handles)
  - Delete layer (Delete key)
  - Change color (color picker)
```

### 5. Moving Layers

```
User has layer selected
    ↓
User presses pointer down on layer
    ↓
Canvas state: mode = CanvasMode.Translating
    ↓
User drags pointer
    ↓
Canvas calculates delta from origin
    ↓
Calls updateLayer mutation
    ↓
Mutation updates layer x, y coordinates
    ↓
Change syncs to all clients
    ↓
Layer moves on all canvases in real-time
```

### 6. Resizing Layers

```
User has layer selected
    ↓
User clicks resize handle
    ↓
Canvas state: mode = CanvasMode.Resizing
  - initialBounds: current layer bounds
  - corner: which handle (Side enum)
    ↓
User drags handle
    ↓
Canvas calculates new bounds using resizeBounds()
    ↓
Calls resizeLayer mutation
    ↓
Mutation updates layer width, height, x, y
    ↓
Change syncs to all clients
    ↓
Layer resizes on all canvases
```

### 7. Multi-Layer Selection (Selection Net)

```
User presses pointer down on empty canvas
    ↓
Canvas state: mode = CanvasMode.SelectionNet
  - origin: initial point
    ↓
User drags to create rectangle
    ↓
Canvas renders selection net rectangle
    ↓
Canvas calculates intersecting layers
    ↓
User releases pointer
    ↓
Updates presence.selection with all intersecting layer IDs
    ↓
SelectionBox renders around all selected layers
    ↓
User can move/delete all selected layers together
```

### 8. Text Layer Editing

```
User selects text tool
    ↓
User clicks on canvas
    ↓
Text layer created
    ↓
User types text
    ↓
Text layer value updates via mutation
    ↓
Text renders on canvas
    ↓
User can:
  - Edit text (contenteditable)
  - Move text layer
  - Resize text layer
  - Change text color
```

### 9. Undo/Redo

```
User performs action (draw, move, etc.)
    ↓
Action creates Liveblocks mutation
    ↓
Liveblocks history tracks change
    ↓
User presses Ctrl+Z (or undo button)
    ↓
Canvas calls history.undo()
    ↓
Liveblocks reverts last change
    ↓
All clients see undo
    ↓
User presses Ctrl+Shift+Z (or redo button)
    ↓
Canvas calls history.redo()
    ↓
Liveblocks reapplies change
```

### 10. Cursor Presence

```
User moves mouse on canvas
    ↓
Canvas captures pointer move event
    ↓
Converts to canvas coordinates
    ↓
Updates presence.cursor = { x, y }
    ↓
Change syncs via Liveblocks (throttled at 16ms)
    ↓
Other users' CursorPresence components render cursors
    ↓
Each user gets unique color based on connectionId
    ↓
Cursor shows user's name/avatar
```

## Real-Time Synchronization

### Liveblocks Sync Flow

```
Client A performs action
    ↓
Client A calls mutation
    ↓
Mutation updates local storage (optimistic)
    ↓
Mutation sent to Liveblocks server
    ↓
Liveblocks validates and applies change
    ↓
Change broadcasted to all clients in room
    ↓
Clients B, C, D receive update
    ↓
Clients update their storage
    ↓
React re-renders with new state
    ↓
All clients see same state
```

### Conflict Resolution

- **Last Write Wins**: Liveblocks uses operational transformation
- **Presence**: Merged automatically (cursors, selections)
- **Storage**: Atomic updates prevent conflicts

## Error Handling Workflows

### 1. Authentication Error

```
User's token expires
    ↓
Convex query/mutation fails
    ↓
Error caught by client
    ↓
User redirected to sign-in
    ↓
After re-authentication, user returns to previous page
```

### 2. Board Not Found

```
User navigates to /board/invalid-id
    ↓
Liveblocks auth checks board existence
    ↓
Board not found in Convex
    ↓
API route returns 403 Unauthorized
    ↓
User sees error or redirected
```

### 3. Connection Loss

```
User loses internet connection
    ↓
Liveblocks WebSocket disconnects
    ↓
SDK handles reconnection automatically
    ↓
On reconnect, state syncs
    ↓
User continues working
```

### 4. Layer Limit Reached

```
User tries to create 101st layer
    ↓
insertLayer mutation checks count
    ↓
Count >= MAX_LAYERS (100)
    ↓
Mutation returns early (no error)
    ↓
Layer not created
    ↓
User can delete layers to make room
```

## Performance Optimizations in Workflow

### 1. Throttling

- **Presence updates**: Throttled to 16ms (60fps)
- **Cursor movements**: Batched to reduce network traffic

### 2. Memoization

- **SelectionBox**: Memoized to prevent unnecessary re-renders
- **LayerPreview**: Memoized per layer ID

### 3. Optimistic Updates

- **Mutations**: Local state updates immediately
- **Server sync**: Happens in background
- **Rollback**: If mutation fails, state reverts

## User Journey Examples

### Example 1: Creating and Collaborating

1. User signs in
2. User creates new board "Project Planning"
3. User draws initial sketch with pencil
4. User adds rectangle for "Phase 1"
5. User adds text label "Q1 2024"
6. Colleague joins board (sees existing content)
7. Colleague adds ellipse for "Phase 2"
8. Both users see each other's cursors
9. User selects both shapes
10. User deletes selected shapes
11. Both users see deletion in real-time

### Example 2: Board Management

1. User searches for "design"
2. System shows matching boards
3. User favorites a board
4. User navigates to favorites view
5. User opens board
6. User renames board
7. User deletes board
8. Board removed from all views


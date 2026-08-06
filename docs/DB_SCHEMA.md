# Database Schema

This document describes the Convex database schema used in SoapBoard.

## Overview

SoapBoard uses Convex as its backend database. Convex provides a serverless database with real-time capabilities, automatic scaling, and type-safe queries.

**Schema Location**: `convex/schema.ts`

## Tables

### `boards`

Stores board metadata and information.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `Id<"boards">` | Auto-generated unique identifier |
| `_creationTime` | `number` | Auto-generated creation timestamp |
| `title` | `string` | Board title (user-provided) |
| `orgId` | `string` | Organization ID from Clerk |
| `authorId` | `string` | User ID who created the board (from Clerk) |
| `authorName` | `string` | Name of the user who created the board |
| `imageUrl` | `string` | URL to placeholder image (randomly selected) |

**Indexes**:

1. **`by_org`** (Index)
   - Fields: `["orgId"]`
   - Purpose: Efficiently query boards by organization
   - Usage: `boards.get` query filters by `orgId`

2. **`search_title`** (Search Index)
   - Search Field: `title`
   - Filter Fields: `["orgId"]`
   - Purpose: Full-text search on board titles within organization
   - Usage: `boards.get` query with `search` parameter

**Constraints**:
- `title`: Required, non-empty after trim, max 60 characters
- `orgId`: Required, must match user's organization
- `authorId`: Automatically set from authenticated user
- `authorName`: Automatically set from authenticated user

**Example Document**:
```typescript
{
  _id: "k17abc123xyz",
  _creationTime: 1704067200000,
  title: "Project Planning",
  orgId: "org_2abc123def",
  authorId: "user_2xyz789ghi",
  authorName: "John Doe",
  imageUrl: "/placeholders/3.svg"
}
```

**Operations**:
- **Create**: `board.create` mutation
- **Read**: `board.get` query, `boards.get` query
- **Update**: `board.update` mutation (title only)
- **Delete**: `board.remove` mutation

**Code Location**: `convex/board.ts`, `convex/boards.ts`

---

### `userFavorites`

Stores user-board favorite relationships.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `Id<"userFavorites">` | Auto-generated unique identifier |
| `_creationTime` | `number` | Auto-generated creation timestamp |
| `orgId` | `string` | Organization ID (for filtering) |
| `userId` | `string` | User ID from Clerk (who favorited) |
| `boardId` | `Id<"boards">` | Reference to board document |

**Indexes**:

1. **`by_board`** (Index)
   - Fields: `["boardId"]`
   - Purpose: Find all users who favorited a board
   - Usage: Cleanup when board is deleted

2. **`by_user_org`** (Index)
   - Fields: `["userId", "orgId"]`
   - Purpose: Get user's favorites in an organization
   - Usage: `boards.get` query with `favorites` parameter

3. **`by_user_board`** (Index)
   - Fields: `["userId", "boardId"]`
   - Purpose: Check if user has favorited a specific board
   - Usage: `board.favorite`, `board.unfavorite`, `boards.get`

4. **`by_user_board_org`** (Index)
   - Fields: `["userId", "boardId", "orgId"]`
   - Purpose: Compound index for complex queries
   - Usage: Potentially for future queries

**Constraints**:
- `userId`: Required, must match authenticated user
- `boardId`: Required, must reference existing board
- `orgId`: Required, must match board's organization
- Unique constraint: One favorite per user per board (enforced in application logic)

**Example Document**:
```typescript
{
  _id: "k17def456uvw",
  _creationTime: 1704067300000,
  orgId: "org_2abc123def",
  userId: "user_2xyz789ghi",
  boardId: "k17abc123xyz"
}
```

**Operations**:
- **Create**: `board.favorite` mutation
- **Read**: Used in `boards.get` query to check favorite status
- **Delete**: `board.unfavorite` mutation, `board.remove` mutation (cascade)

**Code Location**: `convex/board.ts`, `convex/boards.ts`

---

## Relationships

### Board to Favorites (One-to-Many)

- One board can have many favorites (one per user)
- When board is deleted, all associated favorites are deleted
- Implemented via `board.remove` mutation

### User to Favorites (One-to-Many)

- One user can favorite many boards
- Favorites are user-specific
- Queried via `by_user_org` or `by_user_board` indexes

### Organization to Boards (One-to-Many)

- One organization can have many boards
- Boards are scoped by organization
- Queried via `by_org` index

## Query Patterns

### Get All Boards in Organization

```typescript
ctx.db
  .query("boards")
  .withIndex("by_org", (q) => q.eq("orgId", orgId))
  .order("desc")
  .collect();
```

### Search Boards by Title

```typescript
ctx.db
  .query("boards")
  .withSearchIndex("search_title", (q) =>
    q.search("title", searchQuery).eq("orgId", orgId)
  )
  .collect();
```

### Get User's Favorites

```typescript
ctx.db
  .query("userFavorites")
  .withIndex("by_user_org", (q) =>
    q.eq("userId", userId).eq("orgId", orgId)
  )
  .collect();
```

### Check if Board is Favorited

```typescript
ctx.db
  .query("userFavorites")
  .withIndex("by_user_board", (q) =>
    q.eq("userId", userId).eq("boardId", boardId)
  )
  .unique();
```

## Data Integrity

### Cascading Deletes

When a board is deleted:
1. All `userFavorites` records for that board are deleted
2. Implemented in `board.remove` mutation

**Code**:
```typescript
// In convex/board.ts
const existingFavorite = await ctx.db
  .query("userFavorites")
  .withIndex("by_user_board", (q) => 
    q.eq("userId", userId).eq("boardId", args.id))
  .unique();

if (existingFavorite) {
  await ctx.db.delete(existingFavorite._id);
}

await ctx.db.delete(args.id);
```

### Referential Integrity

- `userFavorites.boardId` references `boards._id`
- No foreign key constraints (Convex doesn't support)
- Application logic ensures references are valid
- Deleted boards handled via cascade delete

## Schema Definition

**File**: `convex/schema.ts`

```typescript
export default defineSchema({
  boards: defineTable({
    title: v.string(),
    orgId: v.string(),
    authorId: v.string(),
    authorName: v.string(),
    imageUrl: v.string()
  })
  .index("by_org", ["orgId"])
  .searchIndex("search_title", {
    searchField: "title",
    filterFields: ["orgId"]
  }),
  
  userFavorites: defineTable({
    orgId: v.string(),
    userId: v.string(),
    boardId: v.string(),
  })
  .index("by_board", ["boardId"])
  .index("by_user_org", ["userId", "orgId"])
  .index("by_user_board", ["userId", "boardId"])
  .index("by_user_board_org", ["userId", "boardId", "orgId"])
});
```

## Type Safety

### Generated Types

Convex automatically generates TypeScript types from the schema:

**Location**: `convex/_generated/dataModel.d.ts`

**Usage**:
```typescript
import { Doc, Id } from "@/convex/_generated/dataModel";

type Board = Doc<"boards">;
type BoardId = Id<"boards">;
type UserFavorite = Doc<"userFavorites">;
```

### Validation

Convex validates data against schema:
- Type checking at runtime
- Required fields enforced
- Type mismatches throw errors

## Migration Considerations

### Adding Fields

To add a new field to a table:

1. Update schema in `convex/schema.ts`
2. Deploy schema: `npx convex deploy`
3. Update mutations to set new field
4. Update queries to read new field
5. Handle existing documents (may need migration)

### Adding Indexes

To add a new index:

1. Add index definition to schema
2. Deploy schema
3. Convex builds index automatically
4. Update queries to use new index

### Removing Fields

1. Update schema
2. Update all code that uses field
3. Deploy schema
4. Existing documents retain old fields (not deleted)

## Performance Considerations

### Index Usage

**Efficient Queries**:
- Always use indexes for filtering
- Compound indexes for multi-field queries
- Search index for text search

**Inefficient Queries**:
- Full table scans (avoid)
- Queries without indexes
- Complex joins (not supported, use application logic)

### Query Optimization

1. **Use Indexes**: Always filter by indexed fields
2. **Limit Results**: Use `.take(n)` for large result sets
3. **Order Efficiently**: Indexed fields for ordering
4. **Avoid N+1 Queries**: Batch operations when possible

## Data Access Patterns

### Read Patterns

1. **Get Board**: Single document by ID
2. **List Boards**: Filtered by organization, optionally searched
3. **Get Favorites**: Filtered by user and organization
4. **Check Favorite**: Single document lookup

### Write Patterns

1. **Create Board**: Insert with required fields
2. **Update Board**: Patch title field
3. **Delete Board**: Cascade delete favorites
4. **Favorite Board**: Insert favorite record
5. **Unfavorite Board**: Delete favorite record

## Security Considerations

### Access Control

- All queries require authentication
- Organization-based filtering in application logic
- User-specific data (favorites) filtered by userId

### Data Validation

- Schema enforces types
- Application logic validates business rules
- Input validation in mutations

## Future Schema Considerations

### Potential Additions

1. **Board Versions**: Track board history
2. **Board Sharing**: Share boards with specific users
3. **Board Templates**: Reusable board templates
4. **Board Comments**: Comments on boards
5. **User Preferences**: User-specific settings

### Schema Evolution

Convex supports schema evolution:
- Add fields (backward compatible)
- Add indexes (non-breaking)
- Remove fields (requires code updates)
- Change types (requires migration)

## Resources

- [Convex Schema Documentation](https://docs.convex.dev/database/schemas)
- [Convex Indexes](https://docs.convex.dev/database/indexes)
- [Convex Search](https://docs.convex.dev/database/search)
- [Convex Queries](https://docs.convex.dev/database/queries)


# Performance Notes

This document outlines performance considerations, optimization strategies, and scaling approaches for SoapBoard.

## Current Performance Optimizations

### React Optimizations

**React Compiler**:
- Enabled in `next.config.ts`
- Automatically optimizes React components
- Reduces unnecessary re-renders
- Improves bundle size

**Memoization**:
- `SelectionBox` component memoized with `React.memo()`
- Prevents re-renders when props haven't changed
- Reduces computation for selection handles

**Code Location**: `app/board/[boardId]/_components/selection-box.tsx`

### Real-Time Optimizations

**Throttling**:
- Liveblocks presence updates throttled to 16ms (60fps)
- Reduces network traffic for cursor movements
- Balances responsiveness with performance

**Code Location**: `components/room.tsx`
```typescript
<LiveblocksProvider authEndpoint={"/api/liveblocks-auth"} throttle={16}>
```

**Optimistic Updates**:
- Liveblocks mutations update local state immediately
- Server sync happens in background
- Users see instant feedback
- Rollback on failure

### Next.js Optimizations

**Code Splitting**:
- Automatic code splitting by route
- Components loaded on demand
- Reduces initial bundle size

**Image Optimization**:
- Next.js Image component configured
- Clerk images allowed in `next.config.ts`
- Automatic image optimization

**Server Components**:
- Dashboard page uses server components
- Reduces client-side JavaScript
- Faster initial page load

### Canvas Rendering

**Layer Rendering**:
- Layers rendered individually
- Memoized per layer ID
- Only re-renders when layer changes

**Selection Optimization**:
- Selection bounds calculated on-demand
- Only renders selection box when needed
- Handles only shown for single selection

## Performance Bottlenecks

### Current Limitations

1. **Layer Count**: Fixed at 100 layers per board
   - Prevents infinite growth
   - May limit complex boards
   - **Location**: `app/board/[boardId]/_components/canvas.tsx`

2. **No Virtual Scrolling**: All layers rendered
   - Could be slow with many layers
   - All layers in DOM simultaneously

3. **No Canvas Optimization**: Direct SVG rendering
   - Every layer is an SVG element
   - No canvas-based rendering
   - Could be slow with many paths

4. **Full Re-render on Changes**: All clients re-render
   - No differential updates
   - Entire canvas re-renders on any change

### Network Considerations

**WebSocket Connections**:
- One connection per user per board
- Multiple boards = multiple connections
- Could be resource-intensive

**Presence Updates**:
- Cursor movements generate frequent updates
- Throttled but still significant traffic
- Multiple users amplify effect

## Optimization Strategies

### 1. Canvas Rendering Optimization

**Current**: SVG-based rendering
**Potential**: Canvas-based rendering with offscreen canvas

**Benefits**:
- Better performance for many layers
- Smoother animations
- Lower memory usage

**Implementation**:
```typescript
// Use HTML5 Canvas instead of SVG
// Render layers to offscreen canvas
// Composite to main canvas
```

**Trade-offs**:
- More complex implementation
- Lose SVG benefits (scalability, accessibility)
- Need to handle text rendering differently

### 2. Virtual Scrolling for Layers

**Current**: All layers rendered
**Potential**: Only render visible layers

**Benefits**:
- Faster rendering with many layers
- Lower memory usage
- Better performance on large boards

**Implementation**:
- Calculate viewport bounds
- Filter layers by visibility
- Render only visible layers
- Update on scroll/zoom

### 3. Layer Batching

**Current**: Each layer change triggers update
**Potential**: Batch multiple changes

**Benefits**:
- Fewer network messages
- Fewer re-renders
- Better performance for bulk operations

**Implementation**:
- Queue layer updates
- Batch in 16ms windows
- Send batched updates
- Apply atomically

### 4. Differential Updates

**Current**: Full state sync
**Potential**: Send only changes

**Benefits**:
- Less data transfer
- Faster updates
- Better for large boards

**Note**: Liveblocks may already optimize this internally

### 5. IndexedDB Caching

**Current**: No offline support
**Potential**: Cache board state locally

**Benefits**:
- Offline viewing
- Faster initial load
- Reduced server load

**Implementation**:
- Cache layers in IndexedDB
- Sync on connection
- Show cached version immediately

### 6. RequestAnimationFrame for Rendering

**Current**: React re-renders on state change
**Potential**: Use RAF for smooth animations

**Benefits**:
- 60fps rendering
- Smoother interactions
- Better perceived performance

**Implementation**:
```typescript
useEffect(() => {
  const frame = requestAnimationFrame(() => {
    // Update canvas
  });
  return () => cancelAnimationFrame(frame);
}, [dependencies]);
```

### 7. Debouncing Expensive Operations

**Current**: Some operations run on every change
**Potential**: Debounce expensive calculations

**Examples**:
- Selection bounds calculation
- Layer intersection detection
- Search queries

**Implementation**:
```typescript
import { useDebouncedCallback } from 'usehooks-ts';

const debouncedSearch = useDebouncedCallback(
  (query) => {
    // Perform search
  },
  300 // 300ms delay
);
```

### 8. Web Worker for Heavy Calculations

**Current**: All calculations on main thread
**Potential**: Offload to Web Workers

**Use Cases**:
- Path point calculations
- Layer intersection detection
- Complex geometry operations

**Benefits**:
- Non-blocking UI
- Better responsiveness
- Parallel processing

## Scaling Considerations

### Horizontal Scaling

**Frontend**:
- ✅ Next.js on Vercel scales automatically
- ✅ Edge network for static assets
- ✅ Automatic load balancing

**Backend**:
- ✅ Convex scales automatically
- ✅ Serverless functions scale on demand
- ✅ No server management needed

**Real-Time**:
- ✅ Liveblocks handles scaling
- ✅ WebSocket connections managed
- ✅ Based on subscription plan

### Vertical Scaling

**Current Limits**:
- 100 layers per board (configurable)
- No explicit user limits
- No explicit board size limits

**Recommendations**:
- Monitor layer count
- Consider pagination for large boards
- Add board size limits if needed

### Database Scaling

**Convex**:
- Automatic scaling
- No manual configuration needed
- Handles read/write scaling

**Indexes**:
- ✅ Search index on board titles
- ✅ Indexes on orgId, userId
- ✅ Optimized queries

## Performance Monitoring

### Current State

**No Formal Monitoring**:
- Console logging for debugging
- No performance metrics
- No error tracking

### Recommended Tools

1. **Vercel Analytics**:
   - Web Vitals tracking
   - Performance metrics
   - User experience data

2. **Sentry**:
   - Error tracking
   - Performance monitoring
   - User session replay

3. **Custom Metrics**:
   - Layer count per board
   - Mutation frequency
   - Connection count
   - Response times

### Key Metrics to Track

**Frontend**:
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)

**Backend**:
- Convex query latency
- Mutation latency
- Error rates
- Function execution time

**Real-Time**:
- WebSocket connection count
- Message latency
- Presence update frequency
- Sync delay

## Caching Strategies

### Current Caching

**Next.js**:
- Automatic static asset caching
- Route-level caching
- Image optimization caching

**Browser**:
- HTTP caching for static assets
- No explicit application caching

### Recommended Caching

1. **Service Worker**:
   - Cache static assets
   - Offline support
   - Faster subsequent loads

2. **React Query / SWR**:
   - Cache Convex queries
   - Stale-while-revalidate
   - Reduce server load

3. **IndexedDB**:
   - Cache board state
   - Offline viewing
   - Faster initial load

## Bundle Size Optimization

### Current State

**Bundle Analysis**:
- Not explicitly configured
- Next.js handles optimization
- Automatic code splitting

### Optimization Opportunities

1. **Tree Shaking**:
   - Ensure unused code eliminated
   - Use ES modules
   - Avoid default imports

2. **Dynamic Imports**:
   - Lazy load heavy components
   - Load tools on demand
   - Reduce initial bundle

3. **Dependency Audit**:
   - Remove unused dependencies
   - Use lighter alternatives
   - Check bundle impact

## Performance Best Practices

### ✅ Implemented

1. React Compiler enabled
2. Component memoization
3. Throttled presence updates
4. Optimistic updates
5. Code splitting
6. Image optimization

### 🔄 Recommended

1. Add performance monitoring
2. Implement virtual scrolling
3. Add requestAnimationFrame for animations
4. Debounce expensive operations
5. Cache board state locally
6. Use Web Workers for heavy calculations

### 📊 Monitoring

1. Set up Vercel Analytics
2. Add error tracking (Sentry)
3. Monitor key metrics
4. Set up alerts
5. Regular performance audits

## Performance Checklist

### Before Production

- [ ] Enable performance monitoring
- [ ] Set up error tracking
- [ ] Configure caching strategies
- [ ] Optimize bundle size
- [ ] Test with many layers
- [ ] Test with many users
- [ ] Load test API endpoints
- [ ] Monitor WebSocket connections

### Ongoing

- [ ] Regular performance audits
- [ ] Monitor metrics
- [ ] Optimize slow queries
- [ ] Update dependencies
- [ ] Review bundle size
- [ ] Test on slow networks
- [ ] Monitor user experience

## Testing Performance

### Load Testing

**Tools**:
- k6
- Artillery
- Locust

**Scenarios**:
- Multiple users on same board
- Many layers on board
- Rapid mutations
- Concurrent board access

### Performance Testing

**Tools**:
- Lighthouse
- WebPageTest
- Chrome DevTools

**Metrics**:
- Core Web Vitals
- Bundle size
- Render performance
- Network usage

## Resources

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Liveblocks Performance](https://liveblocks.io/docs/guides/performance)


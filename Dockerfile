# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_CONVEX_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG CLERK_SECRET_KEY
ARG LIVEBLOCKS_SECRET_KEY
ENV NEXT_PUBLIC_CONVEX_URL=$NEXT_PUBLIC_CONVEX_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV CLERK_SECRET_KEY=$CLERK_SECRET_KEY
ENV LIVEBLOCKS_SECRET_KEY=$LIVEBLOCKS_SECRET_KEY
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]

# Build and run:
# docker build -t soap-board:1.0 --build-arg NEXT_PUBLIC_CONVEX_URL=your_url --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key --build-arg CLERK_SECRET_KEY=your_secret --build-arg LIVEBLOCKS_SECRET_KEY=your_secret .
# docker run -p 3000:3000 -e CLERK_SECRET_KEY=your_secret -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key -e NEXT_PUBLIC_CONVEX_URL=your_url -e LIVEBLOCKS_SECRET_KEY=your_secret soap-board:1.0
# Jukebox Duo – Frontend Deployment Guide

This document describes how to deploy the Next.js app (jukebox-duo) to production.

## Requirements
- Node.js 18+ (build time)
- PostgreSQL database (Prisma)
- Google OAuth credentials
- YouTube Data API key
- Deployed WebSocket server (e.g., https://ws.jukeboxduo.com)

## Environment Variables
Copy `.env.example` to `.env.local` for local or configure on your host.

Required keys:
- NEXTAUTH_URL (e.g., https://jukeboxduo.com)
- NEXTAUTH_SECRET (random strong string)
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- DATABASE_URL (Postgres connection string)
- YOUTUBE_API_KEY (YouTube Data API v3)
- NEXT_PUBLIC_SOCKET_URL (WebSocket base URL, e.g., https://ws.jukeboxduo.com)

## Database (Prisma)
- Generate client: `npx prisma generate`
- Deploy migrations: `npx prisma migrate deploy`

## Vercel (recommended)
1. Import the repo
2. Set env vars in the Vercel dashboard (see above)
3. Build settings (defaults are fine):
   - Build Command: `next build`
   - Install Command: `npm ci`
   - Output: `.next`
4. Add domains: `jukeboxduo.com`, `www.jukeboxduo.com`

Google OAuth callback:
- Authorized redirect URI: `https://jukeboxduo.com/api/auth/callback/google`
- Authorized JavaScript origin: `https://jukeboxduo.com`

## WebSocket integration
- Frontend connects to `NEXT_PUBLIC_SOCKET_URL` at path `/api/socket`
- Ensure CORS on the websocket server allows `FRONTEND_URL = https://jukeboxduo.com`

## Production checks
- HTTPS everywhere (frontend + websocket)
- `NEXTAUTH_URL` matches the public URL precisely
- Database reachable and migrations deployed
- YouTube API key valid

## Troubleshooting
- Auth redirect loops → verify `NEXTAUTH_URL` and Google console URIs
- Socket connect errors → check `NEXT_PUBLIC_SOCKET_URL` and websocket CORS origin
- DB errors → verify `DATABASE_URL` and run `npx prisma migrate deploy`

## Local production preview
```
npm ci
npm run build
npm run start
```
Open http://localhost:3000.

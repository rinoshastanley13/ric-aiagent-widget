# Environment Configuration Guide

This project uses Next.js environment files to manage different server configurations.

## Files

### `.env.development` (Remote Dev Server - Default)
- **Used when:** Running `npm run dev` normally
- **FastAPI:** http://106.51.109.172
- **Widget:** http://106.51.109.172:3001
- **Botpress:** http://106.51.109.172:5055

### `.env.local` (Local Development - Override)
- **Used when:** You want to test with localhost
- **FastAPI:** http://localhost:8000
- **Widget:** http://localhost:3000
- **Botpress:** http://localhost:3002
- **Priority:** Overrides `.env.development`

## How to Switch

### Use Remote Dev Server (Default)
```bash
# Delete or rename .env.local
mv .env.local .env.local.backup

# Restart dev server
npm run dev
```

### Use Localhost
```bash
# .env.local already exists with localhost config
# Just restart dev server
npm run dev
```

## Environment Variables

| Variable | Development | Local |
|----------|-------------|--------|
| `NEXT_PUBLIC_CHAT_API_URL` | http://106.51.109.172 | http://localhost:8000 |
| `NEXT_PUBLIC_WIDGET_HOST` | http://106.51.109.172:3001 | http://localhost:3000 |
| `NEXT_PUBLIC_BOTPRESS_URL` | http://106.51.109.172:5055 | http://localhost:3002 |

## Load Order (Priority)
1. `.env.local` (highest priority - git ignored)
2. `.env.development`
3. `.env`

## Quick Commands

```bash
# Switch to LOCAL (localhost)
# .env.local is already set - just use it

# Switch to REMOTE DEV
mv .env.local .env.local.disabled
npm run dev

# Switch back to LOCAL
mv .env.local.disabled .env.local
npm run dev
```

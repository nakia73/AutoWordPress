# Stream02 Build & Run Instructions

## Project Overview
Stream02: WordPress Setup Manager with security hardening

## Quick Commands

```bash
# Navigate to project
cd /Users/apple/Dev/Autoblog/stream-02

# Install dependencies
npm install

# Run linter
npm run lint

# Build project
npm run build

# Run tests
npm run test

# Full verification
npm run lint && npm run build && npm run test

# Development server (Stub UI)
npm run dev -- --webpack -p 3001
```

## File Locations

| Purpose | Path |
|---------|------|
| WP-CLI Client | `src/lib/vps/wp-cli.ts` |
| SSH Client | `src/lib/vps/ssh-client.ts` |
| WordPress Client | `src/lib/wordpress/client.ts` |
| Site Manager | `src/lib/wordpress/site-manager.ts` |
| Security Utils | `src/lib/utils/` (to be created) |

## Environment Variables

Required in `.env.local`:
- `VPS_HOST` - VPS IP address
- `VPS_SSH_PRIVATE_KEY` - Base64-encoded SSH key
- `WP_DOMAIN` - WordPress domain
- `ENCRYPTION_KEY` - AES-256 key (64 hex chars)

## Testing

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- src/lib/utils/__tests__/shell-escape.test.ts
npm run test -- src/lib/utils/__tests__/validation.test.ts
```

## Notes

- TypeScript strict mode enabled
- ESLint with Next.js config
- Vitest for testing

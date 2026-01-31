# Security Fixes - Task Plan

> **Master Document:** `docs/tasks/2026-01-security-fixes.md`
> **Last Updated:** 2026-01-30
> **Status:** ✅ ALL TASKS COMPLETED

---

## Priority: Critical (Command Injection)

- [x] **T1**: Create `src/lib/utils/shell-escape.ts`
  - Implemented `escapeShellArg(arg: string): string`
  - Uses single-quote wrapping for safe escaping
  - Added `escapeShellArgs()` and `isShellSafe()` helpers
  - Unit tests: 12 tests passing

- [x] **T2**: Create `src/lib/utils/validation.ts`
  - `validateSlug(slug: string): ValidationResult`
  - `validateEmail(email: string): ValidationResult`
  - `validateSiteTitle(title: string): ValidationResult`
  - `validateThemeName(theme: string): ValidationResult`
  - `validatePluginName(plugin: string): ValidationResult`
  - Added: `validateUsername`, `validateAppName`, `validateOptionKey`, `validateUrl`
  - Unit tests: 29 tests passing

- [x] **T3**: Update `src/lib/vps/wp-cli.ts`
  - Imported shell-escape and validation utilities
  - Applied to: `createSite()`, `siteExists()`, `createApplicationPassword()`
  - Applied to: `activateThemeForSite()`, `installTheme()`, `installPlugin()`
  - Applied to: `updateOption()`, `flushRewriteRules()`
  - All user inputs validated before command execution

## Priority: Medium

- [x] **T4**: Fix Content-Disposition header in `src/lib/wordpress/client.ts`
  - Added `sanitizeFilename(filename: string): string` function
  - Removes `"`, `\`, `\n`, `\r`, `\0` characters

- [x] **T5**: Review logging in `src/lib/vps/wp-cli.ts`
  - Removed stderr from error messages
  - Sensitive data no longer logged

## Priority: Verification

- [x] **T6**: Run full test suite
  - `npm run lint` - Has 3 pre-existing errors (not security-related)
  - `npm run build` - ✅ Success
  - `npm run test` - ✅ All 46 tests pass

---

## Completion Summary

**Files Created:**
- `src/lib/utils/shell-escape.ts`
- `src/lib/utils/validation.ts`
- `src/lib/utils/__tests__/shell-escape.test.ts`
- `src/lib/utils/__tests__/validation.test.ts`

**Files Modified:**
- `src/lib/vps/wp-cli.ts` - Added validation and escaping
- `src/lib/wordpress/client.ts` - Added filename sanitization
- `next.config.ts` - Fixed for Next.js 16 Turbopack
- `package.json` - Added vitest and test script

**Test Results:**
```
✓ src/lib/utils/__tests__/shell-escape.test.ts (12 tests)
✓ src/lib/utils/__tests__/validation.test.ts (29 tests)
+ Additional tests (5 tests)
Total: 46 tests passing
```

**Note:** The lint errors are pre-existing issues in `/src/app/connection/page.tsx` (React component defined inside render) and are not related to this security fix task.

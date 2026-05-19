import '@testing-library/jest-dom'

// Provide stub Supabase env vars so the client module can be imported in tests
// without throwing "Missing env variable" errors.
// Individual test files can override these via vi.stubEnv() if needed.
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    MODE: 'test',
    DEV: false,
    PROD: false,
    SSR: false,
  },
  writable: true,
})

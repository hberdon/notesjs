import { describe, it, expect } from 'vitest'
import { detectLanguage, generateId, formatBytes } from './utils'

describe('detectLanguage', () => {
  it('maps .js → javascript', () => {
    expect(detectLanguage('index.js')).toBe('javascript')
  })

  it('maps .ts → typescript', () => {
    expect(detectLanguage('main.ts')).toBe('typescript')
  })

  it('maps .tsx → typescript', () => {
    expect(detectLanguage('App.tsx')).toBe('typescript')
  })

  it('maps .py → python', () => {
    expect(detectLanguage('script.py')).toBe('python')
  })

  it('maps .md → markdown', () => {
    expect(detectLanguage('README.md')).toBe('markdown')
  })

  it('returns text for unknown extensions', () => {
    expect(detectLanguage('Dockerfile')).toBe('text')
    expect(detectLanguage('file.unknown')).toBe('text')
    expect(detectLanguage('noextension')).toBe('text')
  })

  it('returns text for empty string', () => {
    expect(detectLanguage('')).toBe('text')
  })

  it('is case-insensitive', () => {
    expect(detectLanguage('styles.SCSS')).toBe('css')
    expect(detectLanguage('main.TS')).toBe('typescript')
  })
})

describe('generateId', () => {
  it('returns a string', () => {
    expect(typeof generateId()).toBe('string')
  })

  it('returns unique values across multiple calls', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBe(100)
  })

  it('returns a UUID v4 format', () => {
    const uuid = generateId()
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )
  })
})

describe('formatBytes', () => {
  it('returns "0 B" for 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B')
  })

  it('formats bytes without decimal for small values', () => {
    expect(formatBytes(500)).toBe('500 B')
  })

  it('formats 1024 as "1.0 KB"', () => {
    expect(formatBytes(1024)).toBe('1.0 KB')
  })

  it('formats 1048576 as "1.0 MB"', () => {
    expect(formatBytes(1048576)).toBe('1.0 MB')
  })

  it('formats fractional KB correctly', () => {
    expect(formatBytes(1536)).toBe('1.5 KB')
  })
})

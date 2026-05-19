import { describe, it, expect, beforeEach, vi } from 'vitest'

// ── vi.mock is hoisted — factory must be self-contained ───────────────────────
// Use vi.hoisted() to create mocks that are usable in the factory AND in tests.
const { mockGetSession, mockOnAuthStateChange, mockFrom } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
  mockFrom: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
    from: mockFrom,
  },
}))

// Import AFTER mock is registered
import { useFileStore } from './fileStore'

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  mockGetSession.mockResolvedValue({ data: { session: null } })
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  })
  useFileStore.setState({ files: [], loading: false, error: null })
})

// ── fetchFiles ────────────────────────────────────────────────────────────────

describe('fetchFiles', () => {
  it('calls supabase.from("files").select().eq("is_deleted", false)', async () => {
    const mockFiles = [
      {
        id: '1',
        name: 'a.ts',
        content: '',
        language: 'typescript',
        user_id: 'u1',
        is_deleted: false,
        created_at: '',
        updated_at: '',
      },
    ]

    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockFiles, error: null }),
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockFrom.mockReturnValue(chain as any)

    await useFileStore.getState().fetchFiles()

    expect(mockFrom).toHaveBeenCalledWith('files')
    expect(chain.select).toHaveBeenCalledWith('*')
    expect(chain.eq).toHaveBeenCalledWith('is_deleted', false)
    expect(useFileStore.getState().files).toHaveLength(1)
    expect(useFileStore.getState().files[0].id).toBe('1')
  })

  it('sets loading to false after the call', async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockFrom.mockReturnValue(chain as any)

    await useFileStore.getState().fetchFiles()
    expect(useFileStore.getState().loading).toBe(false)
  })

  it('sets error state when supabase returns an error', async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockFrom.mockReturnValue(chain as any)

    await useFileStore.getState().fetchFiles()
    expect(useFileStore.getState().error).toBe('DB error')
  })
})

// ── createFile ────────────────────────────────────────────────────────────────

describe('createFile', () => {
  it('warns to console.warn if content exceeds 500 KB', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockGetSession.mockResolvedValue({ data: { session: null } })

    const bigContent = 'x'.repeat(512_001)
    await expect(useFileStore.getState().createFile('big.ts', bigContent)).rejects.toThrow()

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('exceeds 500 KB'))
    consoleSpy.mockRestore()
  })

  it('does not warn for content below the 500 KB limit', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const newFile = {
      id: 'new-1',
      name: 'small.ts',
      content: 'hi',
      language: 'typescript',
      user_id: 'u1',
      is_deleted: false,
      created_at: '',
      updated_at: '',
    }
    const chain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: newFile, error: null }),
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockFrom.mockReturnValue(chain as any)
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } })

    await useFileStore.getState().createFile('small.ts', 'hi')
    expect(consoleSpy).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('throws when there is no authenticated user', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })

    await expect(useFileStore.getState().createFile('test.ts')).rejects.toThrow(
      'no authenticated user',
    )
  })
})

// ── updateFile ────────────────────────────────────────────────────────────────

describe('updateFile', () => {
  it('calls supabase.from("files").update({ content }).eq("id", id)', async () => {
    const mockEqFn = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockUpdateFn = vi.fn().mockReturnValue({ eq: mockEqFn })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockFrom.mockReturnValue({ update: mockUpdateFn } as any)

    await useFileStore.getState().updateFile('file-1', 'new content')

    expect(mockFrom).toHaveBeenCalledWith('files')
    expect(mockUpdateFn).toHaveBeenCalledWith({ content: 'new content' })
    expect(mockEqFn).toHaveBeenCalledWith('id', 'file-1')
  })

  it('warns to console.warn if content exceeds 500 KB', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const mockEqFn = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockUpdateFn = vi.fn().mockReturnValue({ eq: mockEqFn })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockFrom.mockReturnValue({ update: mockUpdateFn } as any)

    const bigContent = 'x'.repeat(512_001)
    await useFileStore.getState().updateFile('file-1', bigContent)

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('exceeds 500 KB'))
    consoleSpy.mockRestore()
  })

  it('updates the local files cache', async () => {
    useFileStore.setState({
      files: [
        {
          id: 'file-1',
          name: 'a.ts',
          content: 'old',
          language: 'typescript',
          user_id: 'u1',
          is_deleted: false,
          created_at: '',
          updated_at: '',
        },
      ],
    })

    const mockEqFn = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockUpdateFn = vi.fn().mockReturnValue({ eq: mockEqFn })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockFrom.mockReturnValue({ update: mockUpdateFn } as any)

    await useFileStore.getState().updateFile('file-1', 'new content')
    expect(useFileStore.getState().files[0].content).toBe('new content')
  })
})

// ── deleteFile ────────────────────────────────────────────────────────────────

describe('deleteFile', () => {
  it('soft-deletes: calls update({ is_deleted: true }), not hard delete', async () => {
    useFileStore.setState({
      files: [
        {
          id: 'file-1',
          name: 'a.ts',
          content: '',
          language: 'typescript',
          user_id: 'u1',
          is_deleted: false,
          created_at: '',
          updated_at: '',
        },
      ],
    })

    const mockEqFn = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockUpdateFn = vi.fn().mockReturnValue({ eq: mockEqFn })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockFrom.mockReturnValue({ update: mockUpdateFn } as any)

    await useFileStore.getState().deleteFile('file-1')

    expect(mockUpdateFn).toHaveBeenCalledWith({ is_deleted: true })
    expect(mockEqFn).toHaveBeenCalledWith('id', 'file-1')
  })

  it('optimistically removes the file from local state', async () => {
    useFileStore.setState({
      files: [
        {
          id: 'file-1',
          name: 'a.ts',
          content: '',
          language: 'typescript',
          user_id: 'u1',
          is_deleted: false,
          created_at: '',
          updated_at: '',
        },
        {
          id: 'file-2',
          name: 'b.ts',
          content: '',
          language: 'typescript',
          user_id: 'u1',
          is_deleted: false,
          created_at: '',
          updated_at: '',
        },
      ],
    })

    const mockEqFn = vi.fn().mockResolvedValue({ data: null, error: null })
    const mockUpdateFn = vi.fn().mockReturnValue({ eq: mockEqFn })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockFrom.mockReturnValue({ update: mockUpdateFn } as any)

    await useFileStore.getState().deleteFile('file-1')

    const { files } = useFileStore.getState()
    expect(files).toHaveLength(1)
    expect(files[0].id).toBe('file-2')
  })

  it('rolls back optimistic delete on supabase error', async () => {
    useFileStore.setState({
      files: [
        {
          id: 'file-1',
          name: 'a.ts',
          content: '',
          language: 'typescript',
          user_id: 'u1',
          is_deleted: false,
          created_at: '',
          updated_at: '',
        },
      ],
    })

    const mockEqFn = vi.fn().mockResolvedValue({ data: null, error: new Error('Delete failed') })
    const mockUpdateFn = vi.fn().mockReturnValue({ eq: mockEqFn })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockFrom.mockReturnValue({ update: mockUpdateFn } as any)

    await expect(useFileStore.getState().deleteFile('file-1')).rejects.toThrow('Delete failed')
    expect(useFileStore.getState().files).toHaveLength(1)
  })
})

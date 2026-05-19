import { describe, it, expect, beforeEach } from 'vitest'
import { useTabStore } from './tabStore'
import type { DbFile } from '@/shared/types'

// Minimal EditorState mock — never import CM6 in tests
function mockEditorState(content = 'content') {
  return { doc: { toString: () => content } }
}

function makeFile(overrides: Partial<DbFile> = {}): DbFile {
  return {
    id: 'file-1',
    name: 'main.ts',
    content: '',
    language: 'typescript',
    user_id: 'user-1',
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

// Reset store state between tests
beforeEach(() => {
  useTabStore.setState({ tabs: [], activeTabId: null })
})

describe('addTab', () => {
  it('adds a new tab to the tabs array', () => {
    const file = makeFile()
    useTabStore.getState().addTab(file)

    const { tabs } = useTabStore.getState()
    expect(tabs).toHaveLength(1)
    expect(tabs[0].id).toBe('file-1')
    expect(tabs[0].filename).toBe('main.ts')
    expect(tabs[0].language).toBe('typescript')
    expect(tabs[0].isDirty).toBe(false)
  })

  it('sets the new tab as active', () => {
    const file = makeFile()
    useTabStore.getState().addTab(file)

    expect(useTabStore.getState().activeTabId).toBe('file-1')
  })

  it('does not add a duplicate tab when the file is already open', () => {
    const file = makeFile()
    useTabStore.getState().addTab(file)
    useTabStore.getState().addTab(file)

    expect(useTabStore.getState().tabs).toHaveLength(1)
  })

  it('activates an already-open tab instead of duplicating it', () => {
    const file1 = makeFile({ id: 'file-1', name: 'a.ts' })
    const file2 = makeFile({ id: 'file-2', name: 'b.ts' })
    useTabStore.getState().addTab(file1)
    useTabStore.getState().addTab(file2)
    // Switch back to file1
    useTabStore.getState().addTab(file1)

    expect(useTabStore.getState().tabs).toHaveLength(2)
    expect(useTabStore.getState().activeTabId).toBe('file-1')
  })
})

describe('setActiveTab', () => {
  it('updates activeTabId to the given tab id', () => {
    const file1 = makeFile({ id: 'file-1', name: 'a.ts' })
    const file2 = makeFile({ id: 'file-2', name: 'b.ts' })
    useTabStore.getState().addTab(file1)
    useTabStore.getState().addTab(file2)

    useTabStore.getState().setActiveTab('file-1')
    expect(useTabStore.getState().activeTabId).toBe('file-1')
  })
})

describe('removeTab', () => {
  it('removes the correct tab', () => {
    const file1 = makeFile({ id: 'file-1', name: 'a.ts' })
    const file2 = makeFile({ id: 'file-2', name: 'b.ts' })
    useTabStore.getState().addTab(file1)
    useTabStore.getState().addTab(file2)

    useTabStore.getState().removeTab('file-1')
    const { tabs } = useTabStore.getState()
    expect(tabs).toHaveLength(1)
    expect(tabs[0].id).toBe('file-2')
  })

  it('activates the next sibling when the active tab is removed', () => {
    const file1 = makeFile({ id: 'file-1', name: 'a.ts' })
    const file2 = makeFile({ id: 'file-2', name: 'b.ts' })
    const file3 = makeFile({ id: 'file-3', name: 'c.ts' })
    useTabStore.getState().addTab(file1)
    useTabStore.getState().addTab(file2)
    useTabStore.getState().addTab(file3)

    // Active is file-3 (last added). Remove it — should fall back to file-2
    useTabStore.getState().removeTab('file-3')
    expect(useTabStore.getState().activeTabId).toBe('file-2')
  })

  it('activates the right sibling when there is one', () => {
    const file1 = makeFile({ id: 'file-1', name: 'a.ts' })
    const file2 = makeFile({ id: 'file-2', name: 'b.ts' })
    const file3 = makeFile({ id: 'file-3', name: 'c.ts' })
    useTabStore.getState().addTab(file1)
    useTabStore.getState().addTab(file2)
    useTabStore.getState().addTab(file3)

    // Make file-1 active then remove it → right sibling is file-2
    useTabStore.getState().setActiveTab('file-1')
    useTabStore.getState().removeTab('file-1')
    expect(useTabStore.getState().activeTabId).toBe('file-2')
  })

  it('sets activeTabId to null when the last tab is removed', () => {
    const file = makeFile()
    useTabStore.getState().addTab(file)
    useTabStore.getState().removeTab('file-1')

    expect(useTabStore.getState().activeTabId).toBeNull()
    expect(useTabStore.getState().tabs).toHaveLength(0)
  })

  it('is a no-op when the tab id does not exist', () => {
    const file = makeFile()
    useTabStore.getState().addTab(file)

    useTabStore.getState().removeTab('nonexistent')
    expect(useTabStore.getState().tabs).toHaveLength(1)
  })
})

describe('updateTabDirty', () => {
  it('marks a tab as dirty', () => {
    const file = makeFile()
    useTabStore.getState().addTab(file)

    useTabStore.getState().updateTabDirty('file-1', true)
    expect(useTabStore.getState().tabs[0].isDirty).toBe(true)
  })

  it('marks a dirty tab as clean', () => {
    const file = makeFile()
    useTabStore.getState().addTab(file)
    useTabStore.getState().updateTabDirty('file-1', true)

    useTabStore.getState().updateTabDirty('file-1', false)
    expect(useTabStore.getState().tabs[0].isDirty).toBe(false)
  })
})

describe('snapshotState and getEditorState', () => {
  it('stores an EditorState in the module-level map', () => {
    const file = makeFile()
    useTabStore.getState().addTab(file)

    const state = mockEditorState('hello world')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useTabStore.getState().snapshotState('file-1', state as any)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const retrieved = useTabStore.getState().getEditorState('file-1') as any
    expect(retrieved).toBeDefined()
    expect(retrieved.doc.toString()).toBe('hello world')
  })

  it('returns undefined for a tab with no snapshot', () => {
    expect(useTabStore.getState().getEditorState('no-such-tab')).toBeUndefined()
  })

  it('retrieves the correct state when multiple tabs have snapshots', () => {
    const state1 = mockEditorState('content-1')
    const state2 = mockEditorState('content-2')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useTabStore.getState().snapshotState('tab-a', state1 as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useTabStore.getState().snapshotState('tab-b', state2 as any)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((useTabStore.getState().getEditorState('tab-a') as any).doc.toString()).toBe('content-1')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((useTabStore.getState().getEditorState('tab-b') as any).doc.toString()).toBe('content-2')
  })
})

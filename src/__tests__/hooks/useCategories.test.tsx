import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createTestQueryClient, createMockCategory } from '@/test/utils'
import { toast } from 'sonner'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() } }))

vi.mock('@/services/categories.service', () => ({
  getCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}))

import {
  getCategories,
  createCategory,
  deleteCategory,
} from '@/services/categories.service'
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from '@/hooks/useCategories'

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = createTestQueryClient()
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useCategories', () => {
  it('returns categories fetched from the service', async () => {
    const cats = [createMockCategory()]
    vi.mocked(getCategories).mockResolvedValue(cats)
    const { result } = renderHook(() => useCategories(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(cats)
  })

  it('sets isLoading true while fetching', () => {
    vi.mocked(getCategories).mockReturnValue(new Promise(() => undefined))
    const { result } = renderHook(() => useCategories(), { wrapper })
    expect(result.current.isLoading).toBe(true)
  })
})

describe('useCreateCategory', () => {
  it('calls createCategory service and shows success toast', async () => {
    const cat = createMockCategory({ name: 'Work' })
    vi.mocked(createCategory).mockResolvedValue(cat)
    const { result } = renderHook(() => useCreateCategory(), { wrapper })

    result.current.mutate({ name: 'Work' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(createCategory).toHaveBeenCalledWith({ name: 'Work' })
    expect(toast.success).toHaveBeenCalledWith('Category created')
  })

  it('shows error toast on failure', async () => {
    vi.mocked(createCategory).mockRejectedValue({ message: 'Server error' })
    const { result } = renderHook(() => useCreateCategory(), { wrapper })

    result.current.mutate({ name: 'x' })
    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(toast.error).toHaveBeenCalledWith('Server error')
  })
})

describe('useDeleteCategory', () => {
  it('calls deleteCategory service and shows warning toast', async () => {
    vi.mocked(deleteCategory).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteCategory(), { wrapper })

    result.current.mutate('cat-1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(deleteCategory).toHaveBeenCalledWith('cat-1')
    expect(toast.warning).toHaveBeenCalled()
  })
})

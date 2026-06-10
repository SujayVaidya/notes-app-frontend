import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockCategory } from '@/test/utils'

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

import api from '@/services/api'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/services/categories.service'

const mockApi = api as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  patch: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('categories.service', () => {
  const category = createMockCategory()

  describe('getCategories', () => {
    it('calls GET /categories and returns array', async () => {
      mockApi.get.mockResolvedValue({ success: true, data: [category] })
      const result = await getCategories()
      expect(mockApi.get).toHaveBeenCalledWith('/categories')
      expect(result).toEqual([category])
    })
  })

  describe('createCategory', () => {
    it('calls POST /categories with name', async () => {
      mockApi.post.mockResolvedValue({ success: true, data: category })
      const result = await createCategory({ name: 'Work' })
      expect(mockApi.post).toHaveBeenCalledWith('/categories', { name: 'Work' })
      expect(result).toEqual(category)
    })
  })

  describe('updateCategory', () => {
    it('calls PATCH /categories/:id with new name', async () => {
      mockApi.patch.mockResolvedValue({ success: true, data: { ...category, name: 'Renamed' } })
      const result = await updateCategory('cat-1', { name: 'Renamed' })
      expect(mockApi.patch).toHaveBeenCalledWith('/categories/cat-1', { name: 'Renamed' })
      expect(result.name).toBe('Renamed')
    })
  })

  describe('deleteCategory', () => {
    it('calls DELETE /categories/:id', async () => {
      mockApi.delete.mockResolvedValue({ success: true })
      await deleteCategory('cat-1')
      expect(mockApi.delete).toHaveBeenCalledWith('/categories/cat-1')
    })
  })
})

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/services/categories.service'
import type { CreateCategoryInput, UpdateCategoryInput } from '@/types/category'

export const CATEGORIES_KEY = ['categories'] as const

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: getCategories,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY })
      toast.success('Category created')
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? 'Failed to create category')
    },
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      updateCategory(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY })
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? 'Failed to update category')
    },
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY })
      toast.warning('Category deleted. Notes moved to General.')
    },
    onError: (err: { message?: string }) => {
      toast.error(err.message ?? 'Failed to delete category')
    },
  })
}

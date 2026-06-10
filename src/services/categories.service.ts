import api from './api'
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@/types/category'
import type { ApiResponse } from '@/types/api'

export async function getCategories(): Promise<Category[]> {
  const res = await api.get<unknown, ApiResponse<Category[]>>('/categories')
  return res.data as Category[]
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const res = await api.post<unknown, ApiResponse<Category>>('/categories', input)
  return res.data as Category
}

export async function updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
  const res = await api.patch<unknown, ApiResponse<Category>>(`/categories/${id}`, input)
  return res.data as Category
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`)
}

export interface Category {
  _id: string
  userId: string
  name: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryInput {
  name: string
}

export interface UpdateCategoryInput {
  name: string
}

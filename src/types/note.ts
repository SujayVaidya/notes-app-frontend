export type NoteType = 'text' | 'markdown'

export interface Note {
  _id: string
  userId: string
  categoryId: string
  title: string
  markdownContent?: string
  plainTextContent?: string
  noteType: NoteType
  createdAt: string
  updatedAt: string
}

export interface CreateNoteInput {
  title: string
  markdownContent: string
  categoryId: string
  noteType: NoteType
}

export interface UpdateNoteInput {
  title?: string
  markdownContent?: string
  noteType?: NoteType
}

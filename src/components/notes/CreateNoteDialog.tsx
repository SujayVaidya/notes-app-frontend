import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateNote } from '@/hooks/useNotes'
import { useCategories } from '@/hooks/useCategories'
import { useUIStore } from '@/stores/uiStore'
import type { NoteType } from '@/types/note'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  categoryId: z.string().min(1, 'Category is required'),
  noteType: z.enum(['text', 'markdown']),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function CreateNoteDialog({ open, onOpenChange }: Props) {
  const createNote = useCreateNote()
  const { data: categories } = useCategories()
  const activeCategoryId = useUIStore((s) => s.activeCategoryId)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      noteType: 'text',
      categoryId: activeCategoryId ?? '',
    },
  })

  function onSubmit(data: FormData) {
    createNote.mutate(
      { title: data.title, markdownContent: '', categoryId: data.categoryId, noteType: data.noteType as NoteType },
      {
        onSuccess: () => {
          reset()
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle>New Note</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="note-title">Title</Label>
            <Input
              id="note-title"
              placeholder="Note title..."
              autoFocus
              {...register('title')}
            />
            {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {categories?.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && (
              <p className="text-red-400 text-xs">{errors.categoryId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Note Type</Label>
            <Controller
              name="noteType"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid grid-cols-2 gap-3"
                >
                  <label className="flex items-start gap-3 p-3 rounded-md border border-zinc-700 cursor-pointer hover:border-zinc-600 transition-colors">
                    <RadioGroupItem value="text" id="type-text" className="mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Plain Text</div>
                      <div className="text-xs text-zinc-500">Simple, distraction-free writing</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-3 rounded-md border border-zinc-700 cursor-pointer hover:border-zinc-600 transition-colors">
                    <RadioGroupItem value="markdown" id="type-md" className="mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Markdown</div>
                      <div className="text-xs text-zinc-500">Headers, bold, code blocks, and more</div>
                    </div>
                  </label>
                </RadioGroup>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={createNote.isPending}
          >
            Create Note
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

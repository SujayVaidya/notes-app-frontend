import { useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useCategories } from '@/hooks/useCategories'
import { useUIStore } from '@/stores/uiStore'

export default function AppPage() {
  const { data: categories } = useCategories()
  const activeCategoryId = useUIStore((s) => s.activeCategoryId)
  const setActiveCategory = useUIStore((s) => s.setActiveCategory)
  const toggleFocusMode = useUIStore((s) => s.toggleFocusMode)
  const setCreateNoteOpen = useUIStore((s) => s.setCreateNoteOpen)

  useEffect(() => {
    if (categories && categories.length > 0 && activeCategoryId === null) {
      const general = categories.find((c) => c.isDefault) ?? categories[0]
      setActiveCategory(general._id)
    }
  }, [categories, activeCategoryId, setActiveCategory])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key === 'n') {
        e.preventDefault()
        setCreateNoteOpen(true)
      }
      if (mod && e.key === '.') {
        e.preventDefault()
        toggleFocusMode()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [setCreateNoteOpen, toggleFocusMode])

  return <AppShell />
}

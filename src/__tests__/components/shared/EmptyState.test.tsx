import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/utils'
import { EmptyState } from '@/components/shared/EmptyState'
import { FileText } from 'lucide-react'

describe('EmptyState', () => {
  it('renders title', () => {
    renderWithProviders(<EmptyState title="Nothing here" />)
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    renderWithProviders(<EmptyState title="Empty" description="Try creating something" />)
    expect(screen.getByText('Try creating something')).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    renderWithProviders(<EmptyState title="Empty" icon={<FileText data-testid="icon" />} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('renders action button when provided', () => {
    const onClick = vi.fn()
    renderWithProviders(
      <EmptyState
        title="Empty"
        action={<button onClick={onClick}>Create</button>}
      />
    )
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('fires the action callback when clicked', async () => {
    const onClick = vi.fn()
    renderWithProviders(
      <EmptyState title="Empty" action={<button onClick={onClick}>Click me</button>} />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Click me' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not render description element when omitted', () => {
    renderWithProviders(<EmptyState title="Title only" />)
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()
  })
})

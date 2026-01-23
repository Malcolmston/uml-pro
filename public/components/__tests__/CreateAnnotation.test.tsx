import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CreateAnnotation from '../window/annotation/Create'
import React from 'react'

describe('CreateAnnotation component', () => {
  const mockOnAdd = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with initial state', () => {
    render(<CreateAnnotation onAdd={mockOnAdd} onClose={mockOnClose} />)

    expect(screen.getByText(/Create New Annotation/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter annotation name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Annotation/i })).toBeDisabled()
    expect(screen.getByText(/Annotation Elements \(Optional\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Quick Templates/i)).toBeInTheDocument()
  })

  it('enables Create Annotation button when name is valid', () => {
    render(<CreateAnnotation onAdd={mockOnAdd} onClose={mockOnClose} />)
    const input = screen.getByPlaceholderText(/Enter annotation name/i)

    fireEvent.change(input, { target: { value: 'MyAnnotation' } })

    const createButton = screen.getByRole('button', { name: /Create Annotation/i })
    expect(createButton).toBeEnabled()
  })

  it('adds and removes an element', () => {
    render(<CreateAnnotation onAdd={mockOnAdd} onClose={mockOnClose} />)

    const nameInput = screen.getByPlaceholderText('Element Name') as HTMLInputElement
    const typeInput = screen.getByPlaceholderText('Type') as HTMLInputElement
    const addButton = screen.getByRole('button', { name: /\+ Add Element/i })

    // Add element
    fireEvent.change(nameInput, { target: { value: 'value' } })
    fireEvent.change(typeInput, { target: { value: 'String' } })
    fireEvent.click(addButton)

    // Verify it's added
    expect(screen.getByText(/String value\(\)/)).toBeInTheDocument()

    // Remove it
    const removeButton = screen.getByLabelText(/Remove element/i)
    fireEvent.click(removeButton)

    expect(screen.queryByText(/String value\(\)/)).not.toBeInTheDocument()
  })

  it('can edit an existing element', () => {
    render(<CreateAnnotation onAdd={mockOnAdd} onClose={mockOnClose} />)

    const nameInput = screen.getByPlaceholderText('Element Name')
    const typeInput = screen.getByPlaceholderText('Type')
    const addButton = screen.getByRole('button', { name: /\+ Add Element/i })

    // Add
    fireEvent.change(nameInput, { target: { value: 'timeout' } })
    fireEvent.change(typeInput, { target: { value: 'long' } })
    fireEvent.click(addButton)

    // Edit
    fireEvent.click(screen.getByLabelText(/Edit element/i))

    expect(nameInput.value).toBe('timeout')
    expect(typeInput.value).toBe('long')

    fireEvent.change(nameInput, { target: { value: 'newTimeout' } })
    fireEvent.click(screen.getByText(/✓ Update Element/i))

    expect(screen.getByText(/long newTimeout\(\)/)).toBeInTheDocument()
    expect(screen.queryByText(/long timeout\(\)/)).not.toBeInTheDocument()
  })

  it('shows validation errors for annotation name', () => {
    render(<CreateAnnotation onAdd={mockOnAdd} onClose={mockOnClose} />)
    const input = screen.getByPlaceholderText(/Enter annotation name/i)

    // Blur empty
    fireEvent.blur(input)
    expect(screen.getByText(/annotation name is required/i)).toBeInTheDocument()

    // Invalid identifier
    fireEvent.change(input, { target: { value: '123Invalid' } })
    fireEvent.blur(input)
    expect(screen.getByText(/annotation name must be a valid identifier/i)).toBeInTheDocument()
  })

  it('prevents adding duplicate element names', () => {
    render(<CreateAnnotation onAdd={mockOnAdd} onClose={mockOnClose} />)
    const nameInput = screen.getByPlaceholderText('Element Name')
    const typeInput = screen.getByPlaceholderText('Type')
    const addButton = screen.getByRole('button', { name: /\+ Add Element/i })

    // Add first
    fireEvent.change(nameInput, { target: { value: 'value' } })
    fireEvent.change(typeInput, { target: { value: 'String' } })
    fireEvent.click(addButton)

    // Add second with same name
    fireEvent.change(nameInput, { target: { value: 'value' } })
    fireEvent.change(typeInput, { target: { value: 'int' } })
    fireEvent.click(addButton)

    expect(screen.getByText(/Element name already exists/i)).toBeInTheDocument()
  })

  it('applies quick templates correctly', () => {
    render(<CreateAnnotation onAdd={mockOnAdd} onClose={mockOnClose} />)

    fireEvent.click(screen.getByText(/Simple Value/i))
    expect(screen.getByText(/String value\(\)/)).toBeInTheDocument()
    expect(screen.getByText(/default ""/)).toBeInTheDocument()

    fireEvent.click(screen.getByText(/Validation/i))
    expect(screen.getByText(/String\[\] value\(\)/)).toBeInTheDocument()
    expect(screen.getByText(/boolean required\(\)/)).toBeInTheDocument()
  })

  it('calls onAdd with correct data', () => {
    render(<CreateAnnotation onAdd={mockOnAdd} onClose={mockOnClose} />)

    fireEvent.change(screen.getByPlaceholderText(/Enter annotation name/i), { target: { value: 'Test' } })

    const nameInput = screen.getByPlaceholderText('Element Name')
    const typeInput = screen.getByPlaceholderText('Type')
    fireEvent.change(nameInput, { target: { value: 'id' } })
    fireEvent.change(typeInput, { target: { value: 'int' } })
    fireEvent.click(screen.getByRole('button', { name: /\+ Add Element/i }))

    fireEvent.click(screen.getByRole('button', { name: /Create Annotation/i }))

    expect(mockOnAdd).toHaveBeenCalledTimes(1)
    const callArgs = mockOnAdd.mock.calls[0][0]
    expect(callArgs.props.name).toBe('Test')
    expect(callArgs.props.elements).toHaveLength(1)
    expect(callArgs.props.elements[0].name).toBe('id')
    expect(callArgs.props.elements[0].type).toBe('int')
  })

  it('shows preview when name is entered', () => {
    render(<CreateAnnotation onAdd={mockOnAdd} onClose={mockOnClose} />)

    expect(screen.queryByText(/Preview/i)).not.toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText(/Enter annotation name/i), { target: { value: 'MyAnno' } })

    expect(screen.getByText(/Preview/i)).toBeInTheDocument()
    // It should render the Annotation component inside preview (which has <<annotation>>)
    expect(screen.getByText(/<<annotation>>/i, { selector: 'text' })).toBeInTheDocument()
  })

  it('populates from initialData', () => {
    const initialData = {
      annotationName: 'InitialAnno',
      elements: [{ id: '1', name: 'v', type: 'int', defaultValue: '0' }]
    }

    const { rerender } = render(<CreateAnnotation onAdd={mockOnAdd} />)
    rerender(<CreateAnnotation onAdd={mockOnAdd} initialData={initialData} />)

    expect(screen.getByDisplayValue('InitialAnno')).toBeInTheDocument()
    // Using getAllByText since it might appear in list and preview
    expect(screen.getAllByText(/int v\(\)/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/default 0/).length).toBeGreaterThanOrEqual(1)
  })

  it('handles Enter key to add element', () => {
    render(<CreateAnnotation onAdd={mockOnAdd} onClose={mockOnClose} />)

    const nameInput = screen.getByPlaceholderText('Element Name')
    const typeInput = screen.getByPlaceholderText('Type')

    fireEvent.change(nameInput, { target: { value: 'key' } })
    fireEvent.change(typeInput, { target: { value: 'String' } })

    fireEvent.keyPress(typeInput, { key: 'Enter', charCode: 13, keyCode: 13 })

    // Elements in the list have type and name in one span
    expect(screen.getByText((content) => content.includes('String key()'))).toBeInTheDocument()
  })
})

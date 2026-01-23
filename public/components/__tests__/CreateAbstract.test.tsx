import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CreateAbstract from '../window/abstract/Create'
import Visibility from '../visibility'
import React from 'react'

describe('CreateAbstract component', () => {
  const mockOnAdd = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with initial state', () => {
    render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)

    expect(screen.getByText(/Create New Abstract Class/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter abstract class name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Abstract Class/i })).toBeDisabled()
    expect(screen.getByRole('heading', { name: /Parameters/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Methods/i })).toBeInTheDocument()
  })

  it('enables Create Abstract Class button when name is valid', () => {
    render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)
    const input = screen.getByPlaceholderText(/Enter abstract class name/i)

    fireEvent.change(input, { target: { value: 'BaseService' } })

    const createButton = screen.getByRole('button', { name: /Create Abstract Class/i })
    expect(createButton).toBeEnabled()
  })

  it('adds and removes an abstract method', () => {
    render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)

    const methodSection = screen.getByRole('heading', { name: /Methods/i }).parentElement!
    const nameInput = within(methodSection).getByPlaceholderText('Name')
    const typeInput = within(methodSection).getByPlaceholderText('Return Type')
    const abstractLabel = within(methodSection).getByText(/abstract/i)
    const addButton = within(methodSection).getByRole('button', { name: /\+ Add Method/i })

    fireEvent.change(nameInput, { target: { value: 'execute' } })
    fireEvent.change(typeInput, { target: { value: 'void' } })
    fireEvent.click(abstractLabel)
    fireEvent.click(addButton)

    expect(screen.getByText(/execute\(\): void/)).toBeInTheDocument()
    expect(screen.getByText(/abstract/i, { selector: 'span' })).toBeInTheDocument()

    const removeButton = screen.getByRole('button', { name: /Remove method/i })
    fireEvent.click(removeButton)

    expect(screen.queryByText(/execute\(\): void/)).not.toBeInTheDocument()
  })

  it('calls onAdd with an Abstract component and correct data', () => {
    render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)

    fireEvent.change(screen.getByPlaceholderText(/Enter abstract class name/i), { target: { value: 'Shape' } })

    const methodSection = screen.getByRole('heading', { name: /Methods/i }).parentElement!
    fireEvent.change(within(methodSection).getByPlaceholderText('Name'), { target: { value: 'draw' } })
    fireEvent.change(within(methodSection).getByPlaceholderText('Return Type'), { target: { value: 'void' } })
    fireEvent.click(within(methodSection).getByText(/abstract/i))
    fireEvent.click(within(methodSection).getByRole('button', { name: /\+ Add Method/i }))

    fireEvent.click(screen.getByRole('button', { name: /Create Abstract Class/i }))

    expect(mockOnAdd).toHaveBeenCalledTimes(1)
    const callArgs = mockOnAdd.mock.calls[0][0]

    // Verify props passed to the component
    expect(callArgs.props.name).toBe('Shape')
    expect(callArgs.props.methods).toHaveLength(1)
    expect(callArgs.props.methods[0].name).toBe('draw')
    expect(callArgs.props.methods[0].isAbstract).toBe(true)
  })

  describe('Validation and Interaction', () => {
    it('shows error for empty abstract class name on blur', () => {
      render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)
      const input = screen.getByPlaceholderText(/Enter abstract class name/i)

      fireEvent.blur(input)
      expect(screen.getByText(/class name is required/i)).toBeInTheDocument()
    })

    it('shows error for invalid class name on blur', () => {
      render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)
      const input = screen.getByPlaceholderText(/Enter abstract class name/i)

      fireEvent.change(input, { target: { value: '123Base' } })
      fireEvent.blur(input)
      expect(screen.getByText(/class name must be a valid identifier/i)).toBeInTheDocument()
    })

    it('prevents adding duplicate parameter names', () => {
      render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)
      const paramSection = screen.getByRole('heading', { name: /Parameters/i }).parentElement!
      const nameInput = within(paramSection).getByPlaceholderText('Name')
      const typeInput = within(paramSection).getByPlaceholderText('Type')
      const addButton = within(paramSection).getByRole('button', { name: /\+ Add Parameter/i })

      fireEvent.change(nameInput, { target: { value: 'id' } })
      fireEvent.change(typeInput, { target: { value: 'String' } })
      fireEvent.click(addButton)

      fireEvent.change(nameInput, { target: { value: 'id' } })
      fireEvent.change(typeInput, { target: { value: 'int' } })
      fireEvent.click(addButton)

      expect(screen.getByText(/Parameter name already exists/i)).toBeInTheDocument()
    })

    it('prevents adding duplicate method names', () => {
      render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)
      const methodSection = screen.getByRole('heading', { name: /Methods/i }).parentElement!
      const nameInput = within(methodSection).getByPlaceholderText('Name')
      const typeInput = within(methodSection).getByPlaceholderText('Return Type')
      const addButton = within(methodSection).getByRole('button', { name: /\+ Add Method/i })

      fireEvent.change(nameInput, { target: { value: 'save' } })
      fireEvent.change(typeInput, { target: { value: 'void' } })
      fireEvent.click(addButton)

      fireEvent.change(nameInput, { target: { value: 'save' } })
      fireEvent.change(typeInput, { target: { value: 'boolean' } })
      fireEvent.click(addButton)

      expect(screen.getByText(/Method name already exists/i)).toBeInTheDocument()
    })

    it('prevents adding duplicate constructors', () => {
      render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)

      // Add a parameter
      const paramSection = screen.getByRole('heading', { name: /Parameters/i }).parentElement!
      fireEvent.change(within(paramSection).getByPlaceholderText('Name'), { target: { value: 'id' } })
      fireEvent.change(within(paramSection).getByPlaceholderText('Type'), { target: { value: 'long' } })
      fireEvent.click(within(paramSection).getByRole('button', { name: /\+ Add Parameter/i }))

      const addConButton = screen.getByRole('button', { name: /\+ Use current parameters as constructor/i })
      fireEvent.click(addConButton) // First time OK
      fireEvent.click(addConButton) // Second time FAIL

      expect(screen.getByText(/Constructor with same parameters already exists/i)).toBeInTheDocument()
    })

    it('shows error if trying to add constructor without parameters', () => {
      render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)
      const addConButton = screen.getByRole('button', { name: /\+ Use current parameters as constructor/i })
      expect(addConButton).toBeDisabled()
    })

    it('handles method editing with abstract modifier', () => {
      render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)
      const methodSection = screen.getByRole('heading', { name: /Methods/i }).parentElement!

      // Add non-abstract method
      fireEvent.change(within(methodSection).getByPlaceholderText('Name'), { target: { value: 'init' } })
      fireEvent.change(within(methodSection).getByPlaceholderText('Return Type'), { target: { value: 'void' } })
      fireEvent.click(within(methodSection).getByRole('button', { name: /\+ Add Method/i }))

      // Edit to be abstract
      fireEvent.click(screen.getByLabelText(/Edit method/i))
      fireEvent.click(within(methodSection).getByText(/abstract/i))
      fireEvent.click(screen.getByText(/Update Method/i))

      expect(screen.getByText(/abstract/i, { selector: 'span' })).toBeInTheDocument()
    })

    it('can cancel editing a parameter', () => {
      render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)
      const paramSection = screen.getByRole('heading', { name: /Parameters/i }).parentElement!

      fireEvent.change(within(paramSection).getByPlaceholderText('Name'), { target: { value: 'age' } })
      fireEvent.change(within(paramSection).getByPlaceholderText('Type'), { target: { value: 'int' } })
      fireEvent.click(within(paramSection).getByRole('button', { name: /\+ Add Parameter/i }))

      fireEvent.click(screen.getByLabelText(/Edit parameter/i))
      fireEvent.change(within(paramSection).getByPlaceholderText('Name'), { target: { value: 'changed' } })
      fireEvent.click(screen.getByText(/✗ Cancel/i))

      expect(within(paramSection).getByPlaceholderText('Name')).toHaveValue('')
      expect(screen.getByText(/age: int/)).toBeInTheDocument()
    })

    it('adds parameter on Enter key press', () => {
      render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)
      const paramSection = screen.getByRole('heading', { name: /Parameters/i }).parentElement!
      const nameInput = within(paramSection).getByPlaceholderText('Name')
      const typeInput = within(paramSection).getByPlaceholderText('Type')

      fireEvent.change(nameInput, { target: { value: 'id' } })
      fireEvent.change(typeInput, { target: { value: 'long' } })
      fireEvent.keyPress(nameInput, { key: 'Enter', code: 'Enter', charCode: 13, keyCode: 13 })

      expect(screen.getByText(/id: long/)).toBeInTheDocument()
    })

    it('adds method on Enter key press', () => {
      render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)
      const methodSection = screen.getByRole('heading', { name: /Methods/i }).parentElement!
      const nameInput = within(methodSection).getByPlaceholderText('Name')
      const typeInput = within(methodSection).getByPlaceholderText('Return Type')

      fireEvent.change(nameInput, { target: { value: 'save' } })
      fireEvent.change(typeInput, { target: { value: 'void' } })
      fireEvent.keyPress(typeInput, { key: 'Enter', code: 'Enter', charCode: 13, keyCode: 13 })

      expect(screen.getByText(/save\(\): void/)).toBeInTheDocument()
    })
  })

  describe('Initial Data and Preview', () => {
    it('populates from initialData', () => {
      const initialData = {
        className: 'InitialBase',
        params: [{ id: 'p1', name: 'config', type: 'Map', visibility: Visibility.PROTECTED }],
        methods: [{ id: 'm1', name: 'run', returnType: 'void', visibility: Visibility.PUBLIC, isAbstract: true }]
      }

      const { rerender } = render(<CreateAbstract onAdd={mockOnAdd} />)
      rerender(<CreateAbstract onAdd={mockOnAdd} initialData={initialData} />)

      expect(screen.getByDisplayValue('InitialBase')).toBeInTheDocument()
      expect(screen.getByText(/config: Map/)).toBeInTheDocument()
      expect(screen.getByText(/run\(\): void/)).toBeInTheDocument()
      expect(screen.getByText(/abstract/i, { selector: 'span' })).toBeInTheDocument()
    })

    it('shows preview with Abstract component', () => {
      render(<CreateAbstract onAdd={mockOnAdd} />)
      fireEvent.change(screen.getByPlaceholderText(/Enter abstract class name/i), { target: { value: 'Base' } })

      expect(screen.getByText(/Preview/i)).toBeInTheDocument()
      // Abstract component shows name and <<abstract>> stereotype
      expect(screen.getByText('Base', { selector: 'text' })).toBeInTheDocument()
      expect(screen.getByText('<<abstract>>', { selector: 'text' })).toBeInTheDocument()
    })
  })

  it('toggles auto-getters/setters checkbox', () => {
    render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)
    const checkbox = screen.getByLabelText(/Auto-generate getters and setters/i) as HTMLInputElement
    expect(checkbox.checked).toBe(false)

    fireEvent.click(checkbox)
    expect(checkbox.checked).toBe(true)
  })

  it('verifies static and final modifiers for parameters', () => {
    render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)
    const paramSection = screen.getByRole('heading', { name: /Parameters/i }).parentElement!

    fireEvent.change(within(paramSection).getByPlaceholderText('Name'), { target: { value: 'MAX_RETRY' } })
    fireEvent.change(within(paramSection).getByPlaceholderText('Type'), { target: { value: 'int' } })
    fireEvent.click(within(paramSection).getByLabelText(/static/i))
    fireEvent.click(within(paramSection).getByLabelText(/final/i))
    fireEvent.click(within(paramSection).getByRole('button', { name: /\+ Add Parameter/i }))

    const paramText = screen.getByText(/MAX_RETRY: int/)
    const container = paramText.closest('div')!
    expect(container).toHaveTextContent(/static/i)
    expect(container).toHaveTextContent(/final/i)
  })

  it('verifies static and abstract modifiers for methods', () => {
    render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)
    const methodSection = screen.getByRole('heading', { name: /Methods/i }).parentElement!

    fireEvent.change(within(methodSection).getByPlaceholderText('Name'), { target: { value: 'process' } })
    fireEvent.change(within(methodSection).getByPlaceholderText('Return Type'), { target: { value: 'void' } })
    fireEvent.click(within(methodSection).getByLabelText(/static/i))
    fireEvent.click(within(methodSection).getByLabelText(/abstract/i))
    fireEvent.click(within(methodSection).getByRole('button', { name: /\+ Add Method/i }))

    const methodText = screen.getByText(/process\(\): void/)
    const container = methodText.closest('div')!
    expect(container).toHaveTextContent(/static/i)
    expect(container).toHaveTextContent(/abstract/i)
  })

  it('updates parameter modifiers when editing', () => {
    render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)
    const paramSection = screen.getByRole('heading', { name: /Parameters/i }).parentElement!
    const staticLabel = within(paramSection).getByLabelText(/static/i)

    // Add static param
    fireEvent.change(within(paramSection).getByPlaceholderText('Name'), { target: { value: 'count' } })
    fireEvent.change(within(paramSection).getByPlaceholderText('Type'), { target: { value: 'int' } })
    fireEvent.click(staticLabel)
    fireEvent.click(within(paramSection).getByRole('button', { name: /\+ Add Parameter/i }))

    // Edit to be non-static
    fireEvent.click(screen.getByLabelText(/Edit parameter/i))
    fireEvent.click(staticLabel)
    fireEvent.click(screen.getByText(/Update Parameter/i))

    expect(screen.queryByText(/static/i, { selector: 'span' })).not.toBeInTheDocument()
  })

  it('removes a constructor', () => {
    render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)
    const paramSection = screen.getByRole('heading', { name: /Parameters/i }).parentElement!

    // Add param and constructor
    fireEvent.change(within(paramSection).getByPlaceholderText('Name'), { target: { value: 'id' } })
    fireEvent.change(within(paramSection).getByPlaceholderText('Type'), { target: { value: 'long' } })
    fireEvent.click(within(paramSection).getByRole('button', { name: /\+ Add Parameter/i }))
    fireEvent.click(screen.getByRole('button', { name: /\+ Use current parameters as constructor/i }))

    expect(screen.getByText(/Constructor\(id: long\)/)).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText(/Remove constructor/i))
    expect(screen.queryByText(/Constructor\(id: long\)/)).not.toBeInTheDocument()
  })

  it('updates method modifiers when editing', () => {
    render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)
    const methodSection = screen.getByRole('heading', { name: /Methods/i }).parentElement!
    const staticLabel = within(methodSection).getByLabelText(/static/i)

    // Add static method
    fireEvent.change(within(methodSection).getByPlaceholderText('Name'), { target: { value: 'execute' } })
    fireEvent.change(within(methodSection).getByPlaceholderText('Return Type'), { target: { value: 'void' } })
    fireEvent.click(staticLabel)
    fireEvent.click(within(methodSection).getByRole('button', { name: /\+ Add Method/i }))

    // Edit to be non-static
    fireEvent.click(screen.getByLabelText(/Edit method/i))
    fireEvent.click(staticLabel)
    fireEvent.click(screen.getByText(/Update Method/i))

    expect(screen.queryByText(/static/i, { selector: 'span' })).not.toBeInTheDocument()
  })

  it('updates preview when name changes', () => {
    render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)
    const nameInput = screen.getByPlaceholderText(/Enter abstract class name/i)
    
    fireEvent.change(nameInput, { target: { value: 'Base' } })
    expect(screen.getByText('Base', { selector: 'text' })).toBeInTheDocument()

    fireEvent.change(nameInput, { target: { value: 'Core' } })
    expect(screen.getByText('Core', { selector: 'text' })).toBeInTheDocument()
  })

  it('resets form after successful creation', () => {
    render(<CreateAbstract onAdd={mockOnAdd} onClose={mockOnClose} />)
    const nameInput = screen.getByPlaceholderText(/Enter abstract class name/i)
    fireEvent.change(nameInput, { target: { value: 'Base' } })
    fireEvent.click(screen.getByRole('button', { name: /Create Abstract Class/i }))

    expect(mockOnAdd).toHaveBeenCalled()
    expect(nameInput).toHaveValue('')
    expect(mockOnClose).toHaveBeenCalled()
  })
})
